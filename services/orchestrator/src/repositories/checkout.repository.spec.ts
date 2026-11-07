import { jest } from '@jest/globals';
import { Model } from 'mongoose';
import { CheckoutRepository } from './checkout.repository';
import { CheckoutInitializedEvent, ItemScannedEvent } from '../events/checkout-initialized.event';
import { Event } from '../schemas/event.schema';
import { CheckoutStatus } from '../aggregates/checkout.aggregate';

describe('CheckoutRepository', () => {
  it('rehydrates stored event prototypes and aggregate versions', async () => {
    const initialized = new CheckoutInitializedEvent(
      'checkout-123',
      'terminal-9',
      undefined,
      new Date('2024-01-01T00:00:00.000Z'),
      1
    );
    const scanned = new ItemScannedEvent(
      'checkout-123',
      {
        productId: 'product-1',
        ean: '1234567890123',
        name: 'Item',
        quantity: 2,
        unitPrice: 3,
        discountAmount: 0,
        taxRate: 0.1
      },
      new Date('2024-01-01T00:01:00.000Z'),
      2
    );
    const events = [initialized, scanned].map(event => ({
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      eventType: event.eventType,
      timestamp: event.timestamp,
      version: event.version,
      metadata: event.metadata,
      payload: event
    }));
    const model = {
      find: jest.fn(() => ({
        sort: jest.fn(async () => events)
      }))
    };
    const repository = new CheckoutRepository(model as unknown as Model<Event>);

    const aggregate = await repository.findById('checkout-123');

    expect(aggregate.status).toBe(CheckoutStatus.SCANNING);
    expect(aggregate.version).toBe(2);
    expect(aggregate.items).toHaveLength(1);
    expect(aggregate.totalAmount).toBeCloseTo(6.6);
  });
});
