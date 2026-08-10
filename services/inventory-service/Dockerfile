FROM gcc:16 AS builder
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y cmake libcpprest-dev
RUN cmake -B build && cmake --build build

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libcpprest2.10
WORKDIR /app
COPY --from=builder /app/build/inventory_service .
EXPOSE 8082
CMD ["./inventory_service"]
