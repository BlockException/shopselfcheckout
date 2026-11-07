import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckoutAggregate } from '../aggregates/checkout.aggregate';
import { BaseEvent } from '../events/base.event';
import {
  CheckoutCancelledEvent,
  CheckoutCompletedEvent,
  CheckoutInitializedEvent,
  ItemRemovedEvent,
  ItemScannedEvent,
  PaymentCompletedEvent,
  PaymentFailedEvent,
  PaymentInitiatedEvent
} from '../events/checkout-initialized.event';
import { Event } from '../schemas/event.schema';

@Injectable()
export class CheckoutRepository {
  private readonly logger = new Logger(CheckoutRepository.name);

  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
  ) {}

  async findById(checkoutId: string): Promise<CheckoutAggregate> {
    this.logger.debug(`Loading aggregate for checkout: ${checkoutId}`);

    const events = await this.eventModel.find({
      aggregateId: checkoutId,
      aggregateType: 'CheckoutAggregate'
    }).sort({ version: 1, _id: 1 });

    if (events.length === 0) {
      throw new Error(`Checkout not found: ${checkoutId}`);
    }

    const aggregate = new CheckoutAggregate(checkoutId);

    for (const eventDoc of events) {
      const event = this.hydrateEvent(eventDoc);
      this.applyEvent(aggregate, event);
    }

    return aggregate;
  }

  async save(aggregate: CheckoutAggregate): Promise<void> {
    this.logger.debug(`Saving aggregate for checkout: ${aggregate.checkoutId}`);

    const uncommittedEvents = aggregate.getUncommittedEvents() as BaseEvent[];

    for (const event of uncommittedEvents) {
      const eventDoc = new this.eventModel({
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        timestamp: event.timestamp,
        version: event.version,
        metadata: event.metadata,
        payload: { ...event }
      });

      await eventDoc.save();
    }
  }

  private hydrateEvent(eventDoc: Event): BaseEvent {
    const eventType = eventDoc.eventType;
    const payload = eventDoc.payload;
    const eventData: Record<string, unknown> = {
      ...payload,
      eventId: eventDoc.eventId,
      aggregateId: eventDoc.aggregateId,
      aggregateType: eventDoc.aggregateType,
      eventType,
      timestamp: eventDoc.timestamp,
      version: eventDoc.version,
      metadata: eventDoc.metadata ?? payload.metadata
    };

    switch (eventType) {
      case 'CheckoutInitializedEvent':
        return Object.assign(Object.create(CheckoutInitializedEvent.prototype), eventData);
      case 'ItemScannedEvent':
        return Object.assign(Object.create(ItemScannedEvent.prototype), eventData);
      case 'ItemRemovedEvent':
        return Object.assign(Object.create(ItemRemovedEvent.prototype), eventData);
      case 'PaymentInitiatedEvent':
        return Object.assign(Object.create(PaymentInitiatedEvent.prototype), eventData);
      case 'PaymentCompletedEvent':
        return Object.assign(Object.create(PaymentCompletedEvent.prototype), eventData);
      case 'PaymentFailedEvent':
        return Object.assign(Object.create(PaymentFailedEvent.prototype), eventData);
      case 'CheckoutCompletedEvent':
        return Object.assign(Object.create(CheckoutCompletedEvent.prototype), eventData);
      case 'CheckoutCancelledEvent':
        return Object.assign(Object.create(CheckoutCancelledEvent.prototype), eventData);
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }
  }

  private applyEvent(aggregate: CheckoutAggregate, event: BaseEvent): void {
    const eventHandlerName = `on${event.constructor.name}`;
    const handler = (aggregate as unknown as Record<string, (value: BaseEvent) => void>)[eventHandlerName];

    if (typeof handler === 'function') {
      handler.call(aggregate, event);
    } else {
      throw new Error(`No aggregate handler found for event: ${event.eventType}`);
    }
  }
}
