import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import {
  CheckoutInitializedEvent,
  ItemScannedEvent,
  ItemRemovedEvent,
  PaymentInitiatedEvent,
  PaymentCompletedEvent,
  PaymentFailedEvent,
  CheckoutCompletedEvent,
  CheckoutCancelledEvent
} from '../events/checkout-initialized.event';

export interface CartItem {
  productId: string;
  ean: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
}

export enum CheckoutStatus {
  INITIALIZED = 'INITIALIZED',
  SCANNING = 'SCANNING',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAYMENT_FAILED = 'PAYMENT_FAILED'
}

export class CheckoutAggregate extends AggregateRoot {
  public checkoutId: string;
  public terminalId: string;
  public customerId?: string;
  public items: CartItem[] = [];
  public status: CheckoutStatus = CheckoutStatus.INITIALIZED;
  public totalAmount: number = 0;
  public totalDiscount: number = 0;
  public totalTax: number = 0;
  public subtotal: number = 0;
  public paymentMethod?: string;
  public transactionId?: string;
  public createdAt: Date;
  public updatedAt: Date;
  public version: number = 0;

  constructor(checkoutId?: string) {
    super();
    this.checkoutId = checkoutId || uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  initialize(terminalId: string, customerId?: string): void {
    if (this.version !== 0 || typeof terminalId !== 'string' || !terminalId.trim()) {
      throw new Error('Checkout can only be initialized once with a terminal ID');
    }

    this.apply(
      new CheckoutInitializedEvent(
        this.checkoutId,
        terminalId,
        customerId,
        new Date(),
        this.version + 1
      )
    );
  }

  scanItem(item: CartItem): void {
    if (this.status !== CheckoutStatus.SCANNING) {
      throw new Error('Items can only be scanned while checkout is scanning');
    }
    if (
      !item ||
      typeof item.productId !== 'string' ||
      !item.productId.trim() ||
      typeof item.ean !== 'string' ||
      !item.ean.trim() ||
      typeof item.name !== 'string' ||
      !item.name.trim() ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0 ||
      !Number.isFinite(item.unitPrice) ||
      item.unitPrice < 0 ||
      !Number.isFinite(item.discountAmount) ||
      item.discountAmount < 0 ||
      item.discountAmount > item.unitPrice * item.quantity ||
      !Number.isFinite(item.taxRate) ||
      item.taxRate < 0 ||
      item.taxRate > 1
    ) {
      throw new Error('Invalid checkout item');
    }

    this.apply(
      new ItemScannedEvent(
        this.checkoutId,
        item,
        new Date(),
        this.version + 1
      )
    );
  }

  removeItem(productId: string, quantity: number): void {
    const availableQuantity = this.items
      .filter(item => item.productId === productId)
      .reduce((total, item) => total + item.quantity, 0);
    if (
      this.status !== CheckoutStatus.SCANNING ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > availableQuantity
    ) {
      throw new Error('Invalid item removal');
    }

    this.apply(
      new ItemRemovedEvent(
        this.checkoutId,
        productId,
        quantity,
        new Date(),
        this.version + 1
      )
    );
  }

  initiatePayment(paymentMethod: string): void {
    if (
      this.status !== CheckoutStatus.SCANNING ||
      this.items.length === 0 ||
      typeof paymentMethod !== 'string' ||
      !paymentMethod.trim() ||
      !Number.isFinite(this.totalAmount) ||
      this.totalAmount < 0
    ) {
      throw new Error('Checkout is not ready for payment');
    }

    this.apply(
      new PaymentInitiatedEvent(
        this.checkoutId,
        paymentMethod,
        this.totalAmount,
        new Date(),
        this.version + 1
      )
    );
  }

  completePayment(transactionId: string): void {
    if (
      this.status !== CheckoutStatus.PAYMENT_INITIATED ||
      typeof transactionId !== 'string' ||
      !transactionId.trim()
    ) {
      throw new Error('No payment is awaiting completion');
    }

    this.apply(
      new PaymentCompletedEvent(
        this.checkoutId,
        transactionId,
        new Date(),
        this.version + 1
      )
    );
  }

  failPayment(errorCode: string, errorMessage: string): void {
    if (this.status !== CheckoutStatus.PAYMENT_INITIATED) {
      throw new Error('No payment is awaiting a result');
    }

    this.apply(
      new PaymentFailedEvent(
        this.checkoutId,
        errorCode,
        errorMessage,
        new Date(),
        this.version + 1
      )
    );
  }

  completeCheckout(): void {
    if (this.status !== CheckoutStatus.PAYMENT_PROCESSING) {
      throw new Error('Checkout can only complete after successful payment');
    }

    this.apply(
      new CheckoutCompletedEvent(
        this.checkoutId,
        new Date(),
        this.version + 1
      )
    );
  }

  cancelCheckout(reason: string): void {
    if (
      this.status === CheckoutStatus.COMPLETED ||
      this.status === CheckoutStatus.CANCELLED ||
      typeof reason !== 'string' ||
      !reason.trim()
    ) {
      throw new Error('Checkout cannot be cancelled');
    }

    this.apply(
      new CheckoutCancelledEvent(
        this.checkoutId,
        reason,
        new Date(),
        this.version + 1
      )
    );
  }

  private onCheckoutInitializedEvent(event: CheckoutInitializedEvent): void {
    this.checkoutId = event.aggregateId;
    this.terminalId = event.terminalId;
    this.customerId = event.customerId;
    this.status = CheckoutStatus.SCANNING;
    this.createdAt = event.timestamp;
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private onItemScannedEvent(event: ItemScannedEvent): void {
    const existingItem = this.items.find(i =>
      i.productId === event.item.productId &&
      i.ean === event.item.ean &&
      i.name === event.item.name &&
      i.unitPrice === event.item.unitPrice &&
      i.taxRate === event.item.taxRate
    );
    if (existingItem) {
      existingItem.quantity += event.item.quantity;
      existingItem.discountAmount += event.item.discountAmount;
    } else {
      this.items.push({ ...event.item });
    }
    this.recalculateTotals();
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private onItemRemovedEvent(event: ItemRemovedEvent): void {
    let remainingQuantity = event.quantity;
    for (let itemIndex = this.items.length - 1; itemIndex >= 0 && remainingQuantity > 0; itemIndex--) {
      const item = this.items[itemIndex];
      if (item.productId !== event.productId) {
        continue;
      }

      const removedQuantity = Math.min(item.quantity, remainingQuantity);
      item.quantity -= removedQuantity;
      item.discountAmount *= item.quantity / (item.quantity + removedQuantity);
      remainingQuantity -= removedQuantity;
      if (item.quantity === 0) {
        this.items.splice(itemIndex, 1);
      }
    }
    this.recalculateTotals();
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private onPaymentInitiatedEvent(event: PaymentInitiatedEvent): void {
    this.status = CheckoutStatus.PAYMENT_INITIATED;
    this.paymentMethod = event.paymentMethod;
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private onPaymentCompletedEvent(event: PaymentCompletedEvent): void {
    this.status = CheckoutStatus.PAYMENT_PROCESSING;
    this.transactionId = event.transactionId;
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private onPaymentFailedEvent(event: PaymentFailedEvent): void {
    this.status = CheckoutStatus.PAYMENT_FAILED;
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private onCheckoutCompletedEvent(event: CheckoutCompletedEvent): void {
    this.status = CheckoutStatus.COMPLETED;
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private onCheckoutCancelledEvent(event: CheckoutCancelledEvent): void {
    this.status = CheckoutStatus.CANCELLED;
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private recalculateTotals(): void {
    this.subtotal = this.items.reduce((sum, item) =>
      sum + (item.unitPrice * item.quantity), 0
    );
    this.totalDiscount = this.items.reduce((sum, item) =>
      sum + item.discountAmount, 0
    );
    this.totalTax = this.items.reduce((sum, item) =>
      sum + ((item.unitPrice * item.quantity - item.discountAmount) * item.taxRate), 0
    );
    this.totalAmount = this.subtotal - this.totalDiscount + this.totalTax;
  }
}
