#include "inventory_manager.h"

void InventoryManager::add_item(const std::string& product_id, int quantity, double price, int threshold) {
    std::unique_lock lock(mutex);
    inventory[product_id] = {product_id, quantity, 0, threshold, price};
}

bool InventoryManager::reserve_item(const std::string& product_id, int quantity) {
    std::unique_lock lock(mutex);
    auto it = inventory.find(product_id);
    if (it == inventory.end()) return false;
    if (it->second.quantity - it->second.reserved < quantity) return false;
    it->second.reserved += quantity;
    return true;
}

bool InventoryManager::release_reservation(const std::string& product_id, int quantity) {
    std::unique_lock lock(mutex);
    auto it = inventory.find(product_id);
    if (it == inventory.end()) return false;
    if (it->second.reserved < quantity) return false;
    it->second.reserved -= quantity;
    return true;
}

bool InventoryManager::deduct_item(const std::string& product_id, int quantity) {
    std::unique_lock lock(mutex);
    auto it = inventory.find(product_id);
    if (it == inventory.end()) return false;
    if (it->second.quantity < quantity) return false;
    it->second.quantity -= quantity;
    it->second.reserved -= quantity;
    return true;
}

int InventoryManager::get_available(const std::string& product_id) const {
    std::shared_lock lock(mutex);
    auto it = inventory.find(product_id);
    if (it == inventory.end()) return 0;
    return it->second.quantity - it->second.reserved;
}

void InventoryManager::restock_item(const std::string& product_id, int quantity) {
    std::unique_lock lock(mutex);
    auto it = inventory.find(product_id);
    if (it == inventory.end()) return;
    it->second.quantity += quantity;
}
