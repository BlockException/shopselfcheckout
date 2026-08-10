FROM rust:1.75 AS builder
WORKDIR /app
COPY Cargo.toml .
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/shopselfcheckout_fraud_service .
EXPOSE 8083
CMD ["./shopselfcheckout_fraud_service"]
