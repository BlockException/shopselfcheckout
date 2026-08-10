package com.shopselfcheckout.product.strategy;

import com.shopselfcheckout.product.model.Product;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class PricingStrategyFactory {

    private final Map<String, PricingStrategy> strategies = new HashMap<>();

    public PricingStrategyFactory() {
        strategies.put("BASE", new BasePricingStrategy());
        strategies.put("DISCOUNT_10", new DiscountPricingStrategy(new BigDecimal("0.10")));
        strategies.put("DISCOUNT_20", new DiscountPricingStrategy(new BigDecimal("0.20")));
        strategies.put("DISCOUNT_30", new DiscountPricingStrategy(new BigDecimal("0.30")));
        strategies.put("BULK_BUY_3", new BulkBuyPricingStrategy(3, new BigDecimal("0.05")));
        strategies.put("BULK_BUY_5", new BulkBuyPricingStrategy(5, new BigDecimal("0.10")));
        strategies.put("BULK_BUY_10", new BulkBuyPricingStrategy(10, new BigDecimal("0.15")));
        strategies.put("LOYALTY", new LoyaltyPricingStrategy(new BigDecimal("0.05")));
        strategies.put("SEASONAL", new SeasonalPricingStrategy(new BigDecimal("0.90")));
    }

    public PricingStrategy getStrategy(String strategyName) {
        return strategies.getOrDefault(strategyName.toUpperCase(), new BasePricingStrategy());
    }

    public PricingStrategy getCombinedStrategy(String... strategyNames) {
        return new CombinedPricingStrategy(strategyNames);
    }

    private class CombinedPricingStrategy implements PricingStrategy {
        private final PricingStrategy[] strategies;

        public CombinedPricingStrategy(String... strategyNames) {
            this.strategies = new PricingStrategy[strategyNames.length];
            for (int i = 0; i < strategyNames.length; i++) {
                this.strategies[i] = getStrategy(strategyNames[i]);
            }
        }

        @Override
        public BigDecimal calculatePrice(Product product, int quantity) {
            BigDecimal price = product.getBasePrice().multiply(BigDecimal.valueOf(quantity));
            for (PricingStrategy strategy : strategies) {
                if (!(strategy instanceof BasePricingStrategy)) {
                    BigDecimal strategyPrice = strategy.calculatePrice(product, quantity);
                    if (strategyPrice.compareTo(price) < 0) {
                        price = strategyPrice;
                    }
                }
            }
            return price;
        }

        @Override
        public String getStrategyName() {
            StringBuilder sb = new StringBuilder("COMBINED[");
            for (int i = 0; i < strategies.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(strategies[i].getStrategyName());
            }
            sb.append("]");
            return sb.toString();
        }
    }
}
