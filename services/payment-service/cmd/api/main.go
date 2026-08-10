package main

import (
	"shopselfcheckout-payment-service/internal/handlers"
	"shopselfcheckout-payment-service/internal/repository"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	repo := repository.NewPaymentRepository(db)
	paymentHandler := handlers.NewPaymentHandler(repo)

	r := gin.Default()
	api := r.Group("/api/v1/payments")
	{
		api.POST("", paymentHandler.CreatePayment)
		api.GET("/:id", paymentHandler.GetPayment)
		api.GET("/checkout/:checkoutId", paymentHandler.GetPaymentByCheckout)
		api.POST("/:id/refund", paymentHandler.RefundPayment)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}
