package com.aldi.product.strategy;

import com.aldi.product.model.Product;
import java.math.BigDecimal;

public interface PricingStrategy {
    BigDecimal calculatePrice(Product product, int quantity);
    String getStrategyName();
}

class BasePricingStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculatePrice(Product product, int quantity) {
        return product.getBasePrice().multiply(BigDecimal.valueOf(quantity));
    }

    @Override
    public String getStrategyName() {
        return "BASE";
    }
}

class DiscountPricingStrategy implements PricingStrategy {
    private final BigDecimal discountPercentage;

    public DiscountPricingStrategy(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    @Override
    public BigDecimal calculatePrice(Product product, int quantity) {
        BigDecimal baseTotal = product.getBasePrice().multiply(BigDecimal.valueOf(quantity));
        BigDecimal discount = baseTotal.multiply(discountPercentage);
        return baseTotal.subtract(discount);
    }

    @Override
    public String getStrategyName() {
        return "DISCOUNT_" + discountPercentage.multiply(BigDecimal.valueOf(100)).intValue() + "PERCENT";
    }
}

class BulkBuyPricingStrategy implements PricingStrategy {
    private final int bulkThreshold;
    private final BigDecimal bulkDiscount;

    public BulkBuyPricingStrategy(int bulkThreshold, BigDecimal bulkDiscount) {
        this.bulkThreshold = bulkThreshold;
        this.bulkDiscount = bulkDiscount;
    }

    @Override
    public BigDecimal calculatePrice(Product product, int quantity) {
        BigDecimal baseTotal = product.getBasePrice().multiply(BigDecimal.valueOf(quantity));
        if (quantity >= bulkThreshold) {
            return baseTotal.multiply(BigDecimal.ONE.subtract(bulkDiscount));
        }
        return baseTotal;
    }

    @Override
    public String getStrategyName() {
        return "BULK_BUY_" + bulkThreshold;
    }
}

class LoyaltyPricingStrategy implements PricingStrategy {
    private final BigDecimal loyaltyDiscount;

    public LoyaltyPricingStrategy(BigDecimal loyaltyDiscount) {
        this.loyaltyDiscount = loyaltyDiscount;
    }

    @Override
    public BigDecimal calculatePrice(Product product, int quantity) {
        BigDecimal baseTotal = product.getBasePrice().multiply(BigDecimal.valueOf(quantity));
        return baseTotal.multiply(BigDecimal.ONE.subtract(loyaltyDiscount));
    }

    @Override
    public String getStrategyName() {
        return "LOYALTY";
    }
}

class SeasonalPricingStrategy implements PricingStrategy {
    private final BigDecimal seasonalMultiplier;

    public SeasonalPricingStrategy(BigDecimal seasonalMultiplier) {
        this.seasonalMultiplier = seasonalMultiplier;
    }

    @Override
    public BigDecimal calculatePrice(Product product, int quantity) {
        return product.getBasePrice().multiply(seasonalMultiplier).multiply(BigDecimal.valueOf(quantity));
    }

    @Override
    public String getStrategyName() {
        return "SEASONAL";
    }
}
