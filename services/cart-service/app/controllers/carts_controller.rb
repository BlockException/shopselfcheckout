class CartsController < ApplicationController
  before_action :set_cart, only: [:show, :update, :destroy, :add_item, :remove_item]

  def index
    @carts = Cart.all
    render json: @carts
  end

  def show
    decorated = LoyaltyPointDecorator.new(DiscountDecorator.new(TaxCalculationDecorator.new(@cart)))
    render json: {
      cart: @cart,
      total_amount: decorated.total_amount,
      total_tax: decorated.total_tax,
      loyalty_points: decorated.loyalty_points
    }
  end

  def create
    @cart = Cart.new(cart_params)
    if @cart.save
      render json: @cart, status: :created
    else
      render json: @cart.errors, status: :unprocessable_entity
    end
  end

  def add_item
    item = @cart.cart_items.new(item_params)
    if item.save
      recalculate_totals
      render json: @cart, status: :ok
    else
      render json: item.errors, status: :unprocessable_entity
    end
  end

  def remove_item
    item = @cart.cart_items.find(params[:item_id])
    item.destroy
    recalculate_totals
    render json: @cart
  end

  private

  def set_cart
    @cart = Cart.find(params[:id])
  end

  def cart_params
    params.require(:cart).permit(:terminal_id, :customer_id, :status)
  end

  def item_params
    params.require(:item).permit(:product_id, :ean, :name, :quantity, :unit_price, :tax_rate, :discount_amount)
  end

  def recalculate_totals
    @cart.total_amount = @cart.cart_items.sum { |item| item.unit_price * item.quantity }
    @cart.total_tax = @cart.cart_items.sum { |item| (item.unit_price * item.quantity) * item.tax_rate }
    @cart.save
  end
end
