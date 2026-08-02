# Aldi Selbstbediener Kassentechnik - Enterprise Microservice Architektur

![CI/CD](https://github.com/BlockException/aldiselfcheckout/actions/workflows/ci-cd.yml/badge.svg)

Eine komplexe, multi-language Microservice-Architektur für eine Aldi Selbstbediener Kasse.

---

## Systemübersicht

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       Observability Stack                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │     Prometheus   │  │     Grafana      │  │      Jaeger      │  │      Consul      │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                          │
                                                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     Orchestrator (NestJS)                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  • CQRS Pattern                                                                           │ │
│  │  • Event Sourcing                                                                         │ │
│  │  • Saga Pattern                                                                           │ │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                          │
                    ┌───────────────────────────────────────────────────────────────┐
                    │                                                               │
                    ▼                                                               ▼
┌──────────────────────────────────────────────┐   ┌───────────────────────────────────────────┐
│          Product Service (Java/Spring)       │   │          Cart Service (Ruby/Rails)        │
│  • JPA + PostgreSQL                          │   │  • MongoDB + Mongoid                     │
│  • Redis Caching                             │   │  • Observer Pattern                       │
│  • Strategy Pattern (Pricing)                │   │  • Decorator Pattern                      │
└──────────────────────────────────────────────┘   └───────────────────────────────────────────┘
                    │                                                               │
                    │                                                               │
                    └───────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     Payment Service (Go)                                       │
│  • Gin Web Framework                                                                          │
│  • Factory Pattern (Payment Processors)                                                       │
│  • Repository Pattern                                                                         │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Inventory Service (C++)                                      │
│  • High-Performance Shared-Lock                                                               │
│  • cpprestsdk (Casablanca)                                                                    │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Fraud Service (Rust)                                        │
│  • Actix-Web                                                                                  │
│  • Unit of Work Pattern                                                                       │
│  • Rule-Based Fraud Detection                                                                 │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                Discount Engine (Python/FastAPI)                                │
│  • Rule Engine (Discount Rules)                                                               │
│  • Complex Discount Logic                                                                     │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  Audit Service (Kotlin/Spring)                                │
│  • Kafka Streams                                                                              │
│  • Event Auditing                                                                             │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         Event Stack                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │     Kafka        │  │     RabbitMQ     │  │    PostgreSQL    │  │    MongoDB       │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Kategorie               | Technologien                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| Programmiersprachen     | TypeScript, Java, Kotlin, Ruby, Go, C++, Rust, Python                      |
| Frameworks              | NestJS, Spring Boot, Ruby on Rails, Gin, cpprestsdk, Actix-Web, FastAPI   |
| Datenbanken             | PostgreSQL, MongoDB, Redis                                                  |
| Event-Streaming         | Kafka, RabbitMQ                                                            |
| Observability           | Prometheus, Grafana, Jaeger, OpenTelemetry                                 |
| Orchestrierung          | Docker Compose, Kubernetes, Consul (Service Discovery)                     |
| IaC                     | Terraform                                                                   |
| CI/CD                   | GitHub Actions                                                              |
| Design Patterns         | CQRS, Event Sourcing, Saga, Strategy, Factory, Repository, Observer, Decorator, Unit of Work |

---

## CI/CD

Die Pipeline (`.github/workflows/ci-cd.yml`) baut und prüft jeden Service einzeln, plus einen
abschließenden Gate-Job:

| Job                       | Was passiert                                                        |
|----------------------------|----------------------------------------------------------------------|
| `build-orchestrator`       | `npm install`, `npm run build` (tsc), `npm run lint` (ESLint)        |
| `build-product-service`    | `mvn clean package` (Java/Spring)                                    |
| `build-payment-service`    | `go mod tidy`, `go build ./...`, `go vet ./...`                      |
| `build-discount-engine`    | `pip install`, Import-Check der FastAPI-App                         |
| `build-fraud-service`      | `cargo build --release`, `cargo clippy`                              |
| `build-audit-service`      | `mvn clean package` (Kotlin/Spring)                                  |
| `build-inventory-service`  | CMake-Configure + Build (C++)                                        |
| `build-cart-service`       | `bundle install`, Zeitwerk-Autoload-Check (Rails)                    |
| `all-checks-passed`        | Sammel-Gate über alle obigen Jobs, für Branch Protection             |

`build-inventory-service` und `build-cart-service` fehlten bis zu diesem Fix vollständig in der
Pipeline, obwohl die Services im Repo existierten - sie wurden nie gebaut oder geprüft.

### Zuletzt behobene Fehler

- **orchestrator**: falsche Import-Pfade in `checkout.aggregate.ts` (7 Events aus nicht
  existierenden Dateien importiert), fehlende ESLint-Konfiguration, `npm ci` ohne Lockfile
- **product-service**: ungültiges XML (`&` statt `&amp;`) in `pom.xml`; 6 `public`-Klassen in
  einer Java-Datei (unzulässig)
- **audit-service**: `kotlin-maven-plugin` ohne Version/Executions - Kotlin-Quellen wurden nie
  kompiliert
- **payment-service**: fehlendes `go.sum` (CI ergänzt jetzt `go mod tidy`)
- **inventory-service**: Referenz auf nicht existierende `kafka_producer.cpp` in `CMakeLists.txt`,
  nicht kopierbares `std::atomic`-Feld in einem Struct, das per Zuweisung kopiert wird, fehlende
  Includes (`<mutex>`, `<iostream>`)
- **cart-service**: fehlende `ApplicationController`-Klasse, fehlendes `require 'singleton'`,
  komplett fehlendes Rails-Grundgerüst (`config/application.rb` etc.)

---

```
aldiselfcheckout/
├── docker-compose.yml                  # Alle Services + Infrastruktur
├── README.md                           # Diese Datei
├── .github\workflows\
│   └── ci-cd.yml                       # GitHub Actions CI/CD Pipeline
├── services\
│   ├── orchestrator\                   # NestJS Orchestrator (CQRS/Event Sourcing)
│   ├── product-service\                # Java/Spring Boot Product Service
│   ├── cart-service\                   # Ruby/Rails Cart Service
│   ├── payment-service\                # Go Payment Service
│   ├── inventory-service\              # C++ Inventory Service
│   ├── fraud-service\                  # Rust Fraud Detection Service
│   ├── discount-engine\                # Python Discount Engine
│   └── audit-service\                  # Kotlin/Spring Audit Log Service
├── shared\
│   └── protos\                         # gRPC/Protobuf Definitions
├── k8s\                                # Kubernetes Manifeste
│   └── orchestrator-deployment.yml
├── terraform\                          # Terraform Infrastruktur-Code
│   └── main.tf
└── monitoring\
    └── prometheus.yml                  # Prometheus Konfiguration
```

---

## Lokale Ausführung (Docker Compose)

### Voraussetzungen
- Docker & Docker Compose installiert

### Ausführen
```bash
git clone https://github.com/BlockException/aldiselfcheckout.git
cd aldiselfcheckout
docker-compose up -d
```

### Verfügbare Endpoints
| Service                     | URL                                  |
|-----------------------------|--------------------------------------|
| Orchestrator REST API       | http://localhost:3000/api/v1/checkouts |
| Orchestrator Swagger        | http://localhost:3000/api             |
| Product Service             | http://localhost:8080/api/v1/products |
| Cart Service                | http://localhost:3001/api/v1/carts     |
| Payment Service             | http://localhost:8081/api/v1/payments |
| Inventory Service           | http://localhost:8082/api/v1/inventory |
| Fraud Service               | http://localhost:8083/api/v1/fraud/check |
| Discount Engine             | http://localhost:5000/api/v1/discounts/calculate |
| Audit Service               | http://localhost:8084/api/v1/audit     |
| Grafana                     | http://localhost:3002                  |
| Prometheus                  | http://localhost:9090                  |
| Jaeger                      | http://localhost:16686                 |
| Consul                      | http://localhost:8500                  |

---

## Dokumentation

- [gRPC Protobuf Definitions](shared/protos/)
- [Kubernetes Manifeste](k8s/)
- [Terraform Code](terraform/)

---

## Über das Projekt

Diese Architektur wurde entwickelt, um eine skalierbare und robuste Lösung für Selbstbedienerkassen zu bieten.

- 8 Programmiersprachen
- 10+ Design Patterns
- Enterprise-grade Infrastruktur
- Observability from Day 1
