#include <cpprest/http_listener.h>
#include <cpprest/json.h>
#include <iostream>
#include "inventory_manager.h"

using namespace web;
using namespace web::http;
using namespace web::http::experimental::listener;

InventoryManager manager;

void handle_post(http_request request) {
    auto path = request.relative_uri().path();
    if (path == "/api/v1/inventory/reserve") {
        request.extract_json().then([request](json::value body) {
            auto product_id = body["product_id"].as_string();
            auto quantity = body["quantity"].as_integer();
            bool success = manager.reserve_item(product_id, quantity);
            json::value response;
            response["success"] = json::value::boolean(success);
            request.reply(status_codes::OK, response);
        });
    } else if (path == "/api/v1/inventory/deduct") {
        request.extract_json().then([request](json::value body) {
            auto product_id = body["product_id"].as_string();
            auto quantity = body["quantity"].as_integer();
            bool success = manager.deduct_item(product_id, quantity);
            json::value response;
            response["success"] = json::value::boolean(success);
            request.reply(status_codes::OK, response);
        });
    }
}

void handle_get(http_request request) {
    auto path = request.relative_uri().path();
    if (path.find("/api/v1/inventory/") == 0) {
        auto product_id = path.substr(17);
        int available = manager.get_available(product_id);
        json::value response;
        response["product_id"] = json::value::string(product_id);
        response["available"] = json::value::number(available);
        request.reply(status_codes::OK, response);
    }
}

int main() {
    http_listener listener(U("http://0.0.0.0:8082"));
    listener.support(methods::POST, handle_post);
    listener.support(methods::GET, handle_get);

    manager.add_item("p1", 100, 2.99, 10);
    manager.add_item("p2", 50, 1.49, 5);

    listener.open().then([&listener]() {
        std::cout << "Inventory service listening on 8082" << std::endl;
    }).wait();

    std::string line;
    std::getline(std::cin, line);
    return 0;
}
