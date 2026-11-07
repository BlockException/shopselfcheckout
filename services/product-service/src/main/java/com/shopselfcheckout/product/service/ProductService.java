package com.shopselfcheckout.product.service;

import com.shopselfcheckout.product.model.Product;
import com.shopselfcheckout.product.repository.ProductRepository;
import com.shopselfcheckout.product.strategy.PricingStrategyFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final PricingStrategyFactory pricingStrategyFactory;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ProductService(ProductRepository productRepository, PricingStrategyFactory pricingStrategyFactory,
                          KafkaTemplate<String, Object> kafkaTemplate) {
        this.productRepository = productRepository;
        this.pricingStrategyFactory = pricingStrategyFactory;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Cacheable(value = "products", key = "#id")
    public Optional<Product> getProductById(String id) {
        log.debug("Fetching product by ID: {}", id);
        return productRepository.findById(id);
    }

    @Cacheable(value = "products-by-ean", key = "#ean")
    public Optional<Product> getProductByEan(String ean) {
        log.debug("Fetching product by EAN: {}", ean);
        return productRepository.findByEan(ean);
    }

    @Cacheable(value = "active-products")
    public List<Product> getAllActiveProducts() {
        log.debug("Fetching all active products");
        return productRepository.findByIsActiveTrue();
    }

    public List<Product> getProductsByCategory(String category) {
        log.debug("Fetching products by category: {}", category);
        return productRepository.findByCategoriesContaining(category);
    }

    public List<Product> searchProducts(String query) {
        log.debug("Searching products with query: {}", query);
        return productRepository.searchProducts(query);
    }

    public BigDecimal calculatePrice(String productId, int quantity, String... pricingStrategies) {
        log.debug("Calculating price for product: {}, quantity: {}, strategies: {}", 
            productId, quantity, pricingStrategies);
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        if (pricingStrategies.length > 0) {
            var strategy = pricingStrategyFactory.getCombinedStrategy(pricingStrategies);
            return strategy.calculatePrice(product, quantity);
        } else {
            var strategy = pricingStrategyFactory.getStrategy("BASE");
            return strategy.calculatePrice(product, quantity);
        }
    }

    @Transactional
    @CacheEvict(value = {"products", "products-by-ean", "active-products"}, allEntries = true)
    public Product createProduct(Product product) {
        log.info("Creating new product: {}", product.getName());
        Product savedProduct = productRepository.save(product);
        kafkaTemplate.send("product-events", "PRODUCT_CREATED", savedProduct);
        return savedProduct;
    }

    @Transactional
    @CacheEvict(value = {"products", "products-by-ean", "active-products"}, allEntries = true)
    public Product updateProduct(String id, Product productDetails) {
        log.info("Updating product: {}", id);
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setBasePrice(productDetails.getBasePrice());
        product.setTaxRate(productDetails.getTaxRate());
        product.setCategories(productDetails.getCategories());
        product.setIsActive(productDetails.getIsActive());
        product.setStockQuantity(productDetails.getStockQuantity());

        Product updatedProduct = productRepository.save(product);
        kafkaTemplate.send("product-events", "PRODUCT_UPDATED", updatedProduct);
        return updatedProduct;
    }

    @Transactional
    @CacheEvict(value = {"products", "products-by-ean", "active-products"}, allEntries = true)
    public void deleteProduct(String id) {
        log.info("Deleting product: {}", id);
        productRepository.deleteById(id);
        kafkaTemplate.send("product-events", "PRODUCT_DELETED", id);
    }
}
