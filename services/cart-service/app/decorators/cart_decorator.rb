class CartDecorator
  def initialize(cart)
    @cart = cart
  end

  def method_missing(method, *args, &block)
    if @cart.respond_to?(method)
      @cart.send(method, *args, &block)
    else
      super
    end
  end

  def respond_to_missing?(method, include_private = false)
    @cart.respond_to?(method, include_private) || super
  end
end

class TaxCalculationDecorator < CartDecorator
  def total_amount
    @cart.total_amount + total_tax
  end

  def total_tax
    @cart.cart_items.sum { |item| (item.unit_price * item.quantity) * item.tax_rate }
  end
end

class DiscountDecorator < CartDecorator
  def total_amount
    base = @cart.total_amount
    discount = calculate_discount
    base - discount
  end

  private

  def calculate_discount
    total = @cart.cart_items.sum { |item| item.unit_price * item.quantity }
    if total > 100
      total * 0.05
    elsif total > 50
      total * 0.02
    else
      0
    end
  end
end

class LoyaltyPointDecorator < CartDecorator
  def loyalty_points
    (@cart.total_amount * 0.1).to_i
  end
end
