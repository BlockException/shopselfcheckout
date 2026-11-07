#include "inventory_manager.h"
#include <cassert>

int main() {
    InventoryManager inventory;
    assert(!inventory.add_item("", 10, 1.0, 0));
    assert(!inventory.add_item("invalid", -1, 1.0, 0));
    assert(inventory.add_item("product-1", 10, 1.0, 2));
    assert(!inventory.add_item("product-1", 20, 1.0, 2));

    assert(!inventory.reserve_item("product-1", 0));
    assert(inventory.reserve_item("product-1", 4));
    assert(inventory.get_available("product-1") == 6);
    assert(!inventory.deduct_item("product-1", 5));
    assert(inventory.deduct_item("product-1", 3));
    assert(inventory.get_available("product-1") == 6);
    assert(inventory.release_reservation("product-1", 1));
    assert(inventory.get_available("product-1") == 7);
    assert(!inventory.release_reservation("product-1", 1));

    return 0;
}
