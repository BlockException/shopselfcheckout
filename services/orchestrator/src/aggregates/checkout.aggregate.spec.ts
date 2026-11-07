import { CheckoutAggregate, CheckoutStatus } from './checkout.aggregate';

describe('CheckoutAggregate', () => {
  it('initializes a checkout and moves it to scanning', () => {
    const aggregate = new CheckoutAggregate('checkout-123');

    aggregate.initialize('terminal-9', 'customer-7');

    expect(aggregate.checkoutId).toBe('checkout-123');
    expect(aggregate.terminalId).toBe('terminal-9');
    expect(aggregate.customerId).toBe('customer-7');
    expect(aggregate.status).toBe(CheckoutStatus.SCANNING);
    expect(aggregate.version).toBe(1);
  });
});