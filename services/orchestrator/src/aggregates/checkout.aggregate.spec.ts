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

  it('only completes checkout after successful payment', () => {
    const aggregate = new CheckoutAggregate('checkout-123');
    aggregate.initialize('terminal-9');
    aggregate.scanItem({
      productId: 'product-1',
      ean: '1234567890123',
      name: 'Item',
      quantity: 2,
      unitPrice: 3,
      discountAmount: 1,
      taxRate: 0.1
    });

    expect(aggregate.subtotal).toBe(6);
    expect(aggregate.totalDiscount).toBe(1);
    expect(aggregate.totalTax).toBeCloseTo(0.5);
    expect(aggregate.totalAmount).toBeCloseTo(5.5);
    expect(() => aggregate.completeCheckout()).toThrow();

    aggregate.initiatePayment('cash');
    aggregate.completePayment('transaction-1');
    aggregate.completeCheckout();

    expect(aggregate.status).toBe(CheckoutStatus.COMPLETED);
    expect(aggregate.version).toBe(5);
  });

  it('rejects invalid quantities and over-removal', () => {
    const aggregate = new CheckoutAggregate('checkout-123');
    aggregate.initialize('terminal-9');
    expect(() => aggregate.scanItem({
      productId: 'product-1',
      ean: '123',
      name: 'Item',
      quantity: 0,
      unitPrice: 3,
      discountAmount: 0,
      taxRate: 0.1
    })).toThrow();
    aggregate.scanItem({
      productId: 'product-1',
      ean: '123',
      name: 'Item',
      quantity: 2,
      unitPrice: 3,
      discountAmount: 0,
      taxRate: 0.1
    });

    expect(() => aggregate.removeItem('product-1', 3)).toThrow();
    expect(aggregate.items[0].quantity).toBe(2);
  });

  it('combines matching scans, accumulates discounts, and removes across price changes', () => {
    const aggregate = new CheckoutAggregate('checkout-123');
    aggregate.initialize('terminal-9');
    const item = {
      productId: 'product-1',
      ean: '123',
      name: 'Item',
      quantity: 1,
      unitPrice: 3,
      discountAmount: 0.5,
      taxRate: 0.1
    };
    aggregate.scanItem(item);
    aggregate.scanItem({ ...item, quantity: 2, discountAmount: 1 });
    aggregate.scanItem({ ...item, unitPrice: 4, discountAmount: 0.2 });

    expect(aggregate.items).toHaveLength(2);
    expect(aggregate.items[0].quantity).toBe(3);
    expect(aggregate.items[0].discountAmount).toBe(1.5);
    expect(aggregate.totalDiscount).toBeCloseTo(1.7);

    aggregate.removeItem('product-1', 3);

    expect(aggregate.items).toHaveLength(1);
    expect(aggregate.items[0].quantity).toBe(1);
    expect(aggregate.items[0].discountAmount).toBe(0.5);
  });
});