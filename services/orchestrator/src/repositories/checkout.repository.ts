import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckoutAggregate } from '../aggregates/checkout.aggregate';
import { BaseEvent } from '../events/base.event';
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
    }).sort({ version: 1 });

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
        payload: event
      });
      
      await eventDoc.save();
    }
  }

  private hydrateEvent(eventDoc: any): BaseEvent {
    const eventType = eventDoc.eventType;
    const payload = eventDoc.payload;
    
    switch (eventType) {
      case 'CheckoutInitializedEvent':
        return Object.assign(Object.create(Object.getPrototypeOf(payload)), payload);
      case 'ItemScannedEvent':
        return Object.assign(Object.create(Object.getPrototypeOf(payload)), payload);
      case 'ItemRemovedEvent':
        return Object.assign(Object.create(Object.getPrototypeOf(payload)), payload);
      case 'PaymentInitiatedEvent':
        return Object.assign(Object.create(Object.getPrototypeOf(payload)), payload);
      case 'PaymentCompletedEvent':
        return Object.assign(Object.create(Object.getPrototypeOf(payload)), payload);
      case 'PaymentFailedEvent':
        return Object.assign(Object.create(Object.getPrototypeOf(payload)), payload);
      case 'CheckoutCompletedEvent':
        return Object.assign(Object.create(Object.getPrototypeOf(payload)), payload);
      case 'CheckoutCancelledEvent':
        return Object.assign(Object.create(Object.getPrototypeOf(payload)), payload);
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }
  }

  private applyEvent(aggregate: CheckoutAggregate, event: BaseEvent): void {
    const eventHandlerName = `on${event.constructor.name}`;
    const handler = (aggregate as any)[eventHandlerName];
    
    if (typeof handler === 'function') {
      handler.call(aggregate, event);
    }
  }
}
