package handlers

import (
	"shopselfcheckout-payment-service/internal/models"
	"shopselfcheckout-payment-service/internal/payment"
	"shopselfcheckout-payment-service/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	repo repository.PaymentRepository
}

func NewPaymentHandler(repo repository.PaymentRepository) *PaymentHandler {
	return &PaymentHandler{repo: repo}
}

func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	var req struct {
		CheckoutID string  `json:"checkout_id" binding:"required"`
		Amount     float64 `json:"amount" binding:"required"`
		Currency   string  `json:"currency"`
		Method     string  `json:"method" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Currency == "" {
		req.Currency = "EUR"
	}

	p := &models.Payment{
		CheckoutID: req.CheckoutID,
		Amount:     req.Amount,
		Currency:   req.Currency,
		Method:     req.Method,
		Status:     "pending",
	}

	processor := payment.NewPaymentProcessor(req.Method)
	txID, err := processor.Process(req.Amount, req.Currency)
	if err != nil {
		p.Status = "failed"
		p.ErrorCode = "PROCESSING_ERROR"
		p.ErrorMessage = err.Error()
	} else {
		p.Status = "completed"
		p.TransactionID = txID
	}

	if err := h.repo.Create(p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, p)
}

func (h *PaymentHandler) GetPayment(c *gin.Context) {
	id := c.Param("id")
	p, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *PaymentHandler) GetPaymentByCheckout(c *gin.Context) {
	checkoutID := c.Param("checkoutId")
	p, err := h.repo.FindByCheckoutID(checkoutID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *PaymentHandler) RefundPayment(c *gin.Context) {
	id := c.Param("id")
	p, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	processor := payment.NewPaymentProcessor(p.Method)
	if err := processor.Refund(p.TransactionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	p.Status = "refunded"
	h.repo.Update(p)
	c.JSON(http.StatusOK, p)
}
