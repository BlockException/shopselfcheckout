from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import abc

app = FastAPI(title="ShopSelfCheckout Discount Engine")

class CartItem(BaseModel):
    product_id: str
    ean: str
    name: str
    quantity: int
    unit_price: float
    categories: List[str]

class DiscountRequest(BaseModel):
    items: List[CartItem]
    customer_id: Optional[str] = None
    is_loyalty_member: bool = False

class DiscountResult(BaseModel):
    total_discount: float
    applied_discounts: List[dict]


class DiscountRule(abc.ABC):
    @abc.abstractmethod
    def apply(self, items: List[CartItem], is_loyalty: bool) -> tuple[float, dict]:
        pass


class PercentageDiscountRule(DiscountRule):
    def __init__(self, percentage: float, min_amount: float = 0, category: Optional[str] = None):
        self.percentage = percentage
        self.min_amount = min_amount
        self.category = category

    def apply(self, items: List[CartItem], is_loyalty: bool) -> tuple[float, dict]:
        applicable = []
        for item in items:
            if self.category and self.category not in item.categories:
                continue
            applicable.append(item)
        
        total = sum(i.unit_price * i.quantity for i in applicable)
        if total < self.min_amount:
            return 0.0, {}
        
        discount = total * self.percentage
        return discount, {
            "rule": "percentage",
            "percentage": self.percentage,
            "category": self.category,
            "discount": discount
        }


class BulkDiscountRule(DiscountRule):
    def __init__(self, min_quantity: int, discount_per_item: float):
        self.min_quantity = min_quantity
        self.discount_per_item = discount_per_item

    def apply(self, items: List[CartItem], is_loyalty: bool) -> tuple[float, dict]:
        total_quantity = sum(i.quantity for i in items)
        if total_quantity < self.min_quantity:
            return 0.0, {}
        
        discount = self.discount_per_item * total_quantity
        return discount, {
            "rule": "bulk",
            "min_quantity": self.min_quantity,
            "discount": discount
        }


class LoyaltyDiscountRule(DiscountRule):
    def __init__(self, percentage: float):
        self.percentage = percentage

    def apply(self, items: List[CartItem], is_loyalty: bool) -> tuple[float, dict]:
        if not is_loyalty:
            return 0.0, {}
        
        total = sum(i.unit_price * i.quantity for i in items)
        discount = total * self.percentage
        return discount, {
            "rule": "loyalty",
            "percentage": self.percentage,
            "discount": discount
        }


class BuyXGetYFreeRule(DiscountRule):
    def __init__(self, x: int, y: int, category: Optional[str] = None):
        self.x = x
        self.y = y
        self.category = category

    def apply(self, items: List[CartItem], is_loyalty: bool) -> tuple[float, dict]:
        applicable = []
        for item in items:
            if self.category and self.category not in item.categories:
                continue
            applicable.append(item)
        
        total_qty = sum(i.quantity for i in applicable)
        if total_qty < self.x + self.y:
            return 0.0, {}
        
        free_items = (total_qty // (self.x + self.y)) * self.y
        avg_price = sum(i.unit_price * i.quantity for i in applicable) / total_qty
        discount = free_items * avg_price
        
        return discount, {
            "rule": "buy_x_get_y",
            "x": self.x,
            "y": self.y,
            "discount": discount
        }


class DiscountEngine:
    def __init__(self):
        self.rules: List[DiscountRule] = []

    def add_rule(self, rule: DiscountRule):
        self.rules.append(rule)

    def calculate(self, items: List[CartItem], is_loyalty: bool) -> DiscountResult:
        total_discount = 0.0
        applied = []

        for rule in self.rules:
            discount, info = rule.apply(items, is_loyalty)
            if discount > 0:
                total_discount += discount
                applied.append(info)

        return DiscountResult(
            total_discount=total_discount,
            applied_discounts=applied
        )


engine = DiscountEngine()
engine.add_rule(PercentageDiscountRule(0.05, 50))
engine.add_rule(PercentageDiscountRule(0.10, 100))
engine.add_rule(BulkDiscountRule(10, 0.20))
engine.add_rule(LoyaltyDiscountRule(0.03))
engine.add_rule(BuyXGetYFreeRule(3, 1, "snacks"))


@app.post("/api/v1/discounts/calculate", response_model=DiscountResult)
async def calculate_discounts(request: DiscountRequest):
    return engine.calculate(request.items, request.is_loyalty_member)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
