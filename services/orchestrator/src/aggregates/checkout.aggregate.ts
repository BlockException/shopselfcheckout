import { AggregateRoot, EventPublisher } from '@nestjs/cqrs';
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
    this.apply(
      new CheckoutInitializedEvent(
        this.checkoutId,
        terminalId,
        customerId,
        new Date()
      )
    );
  }

  scanItem(item: CartItem): void {
    this.apply(
      new ItemScannedEvent(
        this.checkoutId,
        item,
        new Date()
      )
    );
  }

  removeItem(productId: string, quantity: number): void {
    this.apply(
      new ItemRemovedEvent(
        this.checkoutId,
        productId,
        quantity,
        new Date()
      )
    );
  }

  initiatePayment(paymentMethod: string): void {
    this.apply(
      new PaymentInitiatedEvent(
        this.checkoutId,
        paymentMethod,
        this.totalAmount,
        new Date()
      )
    );
  }

  completePayment(transactionId: string): void {
    this.apply(
      new PaymentCompletedEvent(
        this.checkoutId,
        transactionId,
        new Date()
      )
    );
  }

  failPayment(errorCode: string, errorMessage: string): void {
    this.apply(
      new PaymentFailedEvent(
        this.checkoutId,
        errorCode,
        errorMessage,
        new Date()
      )
    );
  }

  completeCheckout(): void {
    this.apply(
      new CheckoutCompletedEvent(
        this.checkoutId,
        new Date()
      )
    );
  }

  cancelCheckout(reason: string): void {
    this.apply(
      new CheckoutCancelledEvent(
        this.checkoutId,
        reason,
        new Date()
      )
    );
  }

  private onCheckoutInitializedEvent(event: CheckoutInitializedEvent): void {
    this.checkoutId = event.checkoutId;
    this.terminalId = event.terminalId;
    this.customerId = event.customerId;
    this.status = CheckoutStatus.SCANNING;
    this.createdAt = event.timestamp;
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private onItemScannedEvent(event: ItemScannedEvent): void {
    const existingItem = this.items.find(i => i.productId === event.item.productId);
    if (existingItem) {
      existingItem.quantity += event.item.quantity;
    } else {
      this.items.push({ ...event.item });
    }
    this.recalculateTotals();
    this.updatedAt = event.timestamp;
    this.version++;
  }

  private onItemRemovedEvent(event: ItemRemovedEvent): void {
    const itemIndex = this.items.findIndex(i => i.productId === event.productId);
    if (itemIndex !== -1) {
      if (this.items[itemIndex].quantity > event.quantity) {
        this.items[itemIndex].quantity -= event.quantity;
      } else {
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
