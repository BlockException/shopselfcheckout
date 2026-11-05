#include "inventory_manager.h"
#include <cmath>
#include <limits>

bool InventoryManager::add_item(const std::string& product_id, int quantity, double price, int threshold) {
    if (product_id.empty() || quantity < 0 || !std::isfinite(price) || price < 0 || threshold < 0) {
        return false;
    }

    std::unique_lock lock(mutex);
    return inventory.emplace(product_id, InventoryItem{product_id, quantity, 0, threshold, price}).second;
}

bool InventoryManager::reserve_item(const std::string& product_id, int quantity) {
    if (quantity <= 0) return false;

    std::unique_lock lock(mutex);
    auto it = inventory.find(product_id);
    if (it == inventory.end()) return false;
    if (it->second.quantity - it->second.reserved < quantity) return false;
    it->second.reserved += quantity;
    return true;
}

bool InventoryManager::release_reservation(const std::string& product_id, int quantity) {
    if (quantity <= 0) return false;

    std::unique_lock lock(mutex);
    auto it = inventory.find(product_id);
    if (it == inventory.end()) return false;
    if (it->second.reserved < quantity) return false;
    it->second.reserved -= quantity;
    return true;
}

bool InventoryManager::deduct_item(const std::string& product_id, int quantity) {
    if (quantity <= 0) return false;

    std::unique_lock lock(mutex);
    auto it = inventory.find(product_id);
    if (it == inventory.end()) return false;
    if (it->second.quantity < quantity || it->second.reserved < quantity) return false;
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
    if (quantity <= 0) return;

    std::unique_lock lock(mutex);
    auto it = inventory.find(product_id);
    if (it == inventory.end()) return;
    if (quantity > std::numeric_limits<int>::max() - it->second.quantity) return;
    it->second.quantity += quantity;
}
