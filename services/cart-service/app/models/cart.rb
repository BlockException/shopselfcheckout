require 'singleton'

class Cart
  include Mongoid::Document
  include Mongoid::Timestamps

  field :terminal_id, type: String
  field :customer_id, type: String
  field :status, type: String, default: 'active'
  field :total_amount, type: Float, default: 0.0
  field :total_tax, type: Float, default: 0.0
  field :discount_amount, type: Float, default: 0.0

  embeds_many :cart_items

  after_save :notify_observers
  after_destroy :notify_observers

  private

  def notify_observers
    CartObserver.instance.update(self)
  end
end

class CartItem
  include Mongoid::Document
  embedded_in :cart

  field :product_id, type: String
  field :ean, type: String
  field :name, type: String
  field :quantity, type: Integer, default: 1
  field :unit_price, type: Float
  field :tax_rate, type: Float
  field :discount_amount, type: Float, default: 0.0
end

class CartObserver
  include Singleton

  def initialize
    @observers = []
  end

  def add_observer(observer)
    @observers << observer
  end

  def remove_observer(observer)
    @observers.delete(observer)
  end

  def update(cart)
    @observers.each { |observer| observer.update(cart) }
  end
end
