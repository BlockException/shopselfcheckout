import unittest

from app.main import CartItem, DiscountEngine, PercentageDiscountRule


class DiscountEngineTests(unittest.TestCase):
    def test_total_discount_cannot_exceed_cart_subtotal(self):
        engine = DiscountEngine()
        engine.add_rule(PercentageDiscountRule(1.0))
        engine.add_rule(PercentageDiscountRule(1.0))
        items = [CartItem(
            product_id="product-1",
            ean="123",
            name="Item",
            quantity=2,
            unit_price=3.0,
            categories=[],
        )]

        result = engine.calculate(items, is_loyalty=False)

        self.assertEqual(result.total_discount, 6.0)
        self.assertEqual(
            sum(discount["discount"] for discount in result.applied_discounts),
            6.0,
        )

    def test_rejects_non_positive_quantity(self):
        with self.assertRaises(ValueError):
            CartItem(
                product_id="product-1",
                ean="123",
                name="Item",
                quantity=0,
                unit_price=3.0,
                categories=[],
            )

    def test_rejects_non_finite_unit_price(self):
        with self.assertRaises(ValueError):
            CartItem(
                product_id="product-1",
                ean="123",
                name="Item",
                quantity=1,
                unit_price=float("inf"),
                categories=[],
            )


if __name__ == "__main__":
    unittest.main()
