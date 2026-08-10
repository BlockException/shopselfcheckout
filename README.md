# Self-Checkout Backend Platform

![Scope](https://img.shields.io/badge/Scope-Backend%20Only-0A7E8C)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-1F6FEB)
![Stack](https://img.shields.io/badge/Stack-Polyglot-2EA043)
![Orchestrator](https://img.shields.io/badge/Orchestrator-NestJS-e0234e)
![License](https://img.shields.io/badge/License-MIT-4C1)

Backend-only, polyglot self-checkout platform with an event-driven orchestrator and domain-focused microservices.

## Architecture Overview

- Orchestrator: NestJS with CQRS, event sourcing, sagas, and MongoDB persistence
- Product Service: Java and Spring Boot
- Cart Service: Ruby on Rails and Mongoid
- Payment Service: Go
- Inventory Service: C++
- Fraud Service: Rust
- Discount Engine: Python
- Audit Service: Kotlin and Spring Boot

Supporting infrastructure:

- Kafka and RabbitMQ
- PostgreSQL, MongoDB, Redis
- Consul
- Prometheus, Grafana, Jaeger
- Docker Compose, Kubernetes, Terraform

## Repository Layout

```text
.
├── docker-compose.yml
├── services/
│   ├── orchestrator/
│   ├── product-service/
│   ├── cart-service/
│   ├── payment-service/
│   ├── inventory-service/
│   ├── fraud-service/
│   ├── discount-engine/
│   └── audit-service/
├── shared/
│   └── protos/
├── k8s/
├── monitoring/
└── terraform/
```

## Local Run

```bash
git clone <repository-url>
cd <repository-folder>
docker compose up -d
```

## Main Endpoints

| Service | URL |
| --- | --- |
| Orchestrator REST API | http://localhost:3000/api/v1/checkouts |
| Orchestrator Swagger | http://localhost:3000/api |
| Product Service | http://localhost:8080/api/v1/products |
| Cart Service | http://localhost:3001/api/v1/carts |
| Payment Service | http://localhost:8081/api/v1/payments |
| Inventory Service | http://localhost:8082/api/v1/inventory |
| Fraud Service | http://localhost:8083/api/v1/fraud/check |
| Discount Engine | http://localhost:5000/api/v1/discounts/calculate |
| Audit Service | http://localhost:8084/api/v1/audit |
| Grafana | http://localhost:3002 |
| Prometheus | http://localhost:9090 |
| Jaeger | http://localhost:16686 |
| Consul | http://localhost:8500 |

## Development Notes

- Backend-only repository
- Generated artifacts and local caches are excluded via the root `.gitignore`

## Documentation

- [shared/protos](shared/protos/)
- [k8s](k8s/)
- [terraform](terraform/)
