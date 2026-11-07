#pragma once
#include <unordered_map>
#include <string>
#include <shared_mutex>
#include <mutex>

struct InventoryItem {
    std::string product_id;
    int quantity;
    int reserved;
    int threshold;
    double price;
};

class InventoryManager {
private:
    std::unordered_map<std::string, InventoryItem> inventory;
    mutable std::shared_mutex mutex;
public:
    void add_item(const std::string& product_id, int quantity, double price, int threshold);
    bool reserve_item(const std::string& product_id, int quantity);
    bool release_reservation(const std::string& product_id, int quantity);
    bool deduct_item(const std::string& product_id, int quantity);
    int get_available(const std::string& product_id) const;
    void restock_item(const std::string& product_id, int quantity);
};
