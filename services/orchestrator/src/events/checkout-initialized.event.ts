import { BaseEvent } from './base.event';
import { CartItem } from '../aggregates/checkout.aggregate';

export class CheckoutInitializedEvent extends BaseEvent {
  public readonly terminalId: string;
  public readonly customerId?: string;

  constructor(
    aggregateId: string,
    terminalId: string,
    customerId: string | undefined,
    timestamp: Date
  ) {
    super(aggregateId, 'CheckoutAggregate', 'CheckoutInitializedEvent', timestamp);
    this.terminalId = terminalId;
    this.customerId = customerId;
  }
}

export class ItemScannedEvent extends BaseEvent {
  public readonly item: CartItem;

  constructor(
    aggregateId: string,
    item: CartItem,
    timestamp: Date
  ) {
    super(aggregateId, 'CheckoutAggregate', 'ItemScannedEvent', timestamp);
    this.item = item;
  }
}

export class ItemRemovedEvent extends BaseEvent {
  public readonly productId: string;
  public readonly quantity: number;

  constructor(
    aggregateId: string,
    productId: string,
    quantity: number,
    timestamp: Date
  ) {
    super(aggregateId, 'CheckoutAggregate', 'ItemRemovedEvent', timestamp);
    this.productId = productId;
    this.quantity = quantity;
  }
}

export class PaymentInitiatedEvent extends BaseEvent {
  public readonly paymentMethod: string;
  public readonly amount: number;

  constructor(
    aggregateId: string,
    paymentMethod: string,
    amount: number,
    timestamp: Date
  ) {
    super(aggregateId, 'CheckoutAggregate', 'PaymentInitiatedEvent', timestamp);
    this.paymentMethod = paymentMethod;
    this.amount = amount;
  }
}

export class PaymentCompletedEvent extends BaseEvent {
  public readonly transactionId: string;

  constructor(
    aggregateId: string,
    transactionId: string,
    timestamp: Date
  ) {
    super(aggregateId, 'CheckoutAggregate', 'PaymentCompletedEvent', timestamp);
    this.transactionId = transactionId;
  }
}

export class PaymentFailedEvent extends BaseEvent {
  public readonly errorCode: string;
  public readonly errorMessage: string;

  constructor(
    aggregateId: string,
    errorCode: string,
    errorMessage: string,
    timestamp: Date
  ) {
    super(aggregateId, 'CheckoutAggregate', 'PaymentFailedEvent', timestamp);
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }
}

export class CheckoutCompletedEvent extends BaseEvent {
  constructor(
    aggregateId: string,
    timestamp: Date
  ) {
    super(aggregateId, 'CheckoutAggregate', 'CheckoutCompletedEvent', timestamp);
  }
}

export class CheckoutCancelledEvent extends BaseEvent {
  public readonly reason: string;

  constructor(
    aggregateId: string,
    reason: string,
    timestamp: Date
  ) {
    super(aggregateId, 'CheckoutAggregate', 'CheckoutCancelledEvent', timestamp);
    this.reason = reason;
  }
}
