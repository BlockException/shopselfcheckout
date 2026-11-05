package handlers

import (
	"errors"
	"net/http"
	"shopselfcheckout-payment-service/internal/models"
	"shopselfcheckout-payment-service/internal/payment"
	"shopselfcheckout-payment-service/internal/repository"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
		Amount     float64 `json:"amount" binding:"required,gt=0"`
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
	req.Currency = strings.ToUpper(req.Currency)
	if len(req.Currency) != 3 || strings.IndexFunc(req.Currency, func(r rune) bool {
		return r < 'A' || r > 'Z'
	}) != -1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "currency must be a three-letter code"})
		return
	}

	processor, err := payment.NewPaymentProcessor(req.Method)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	p := &models.Payment{
		CheckoutID: req.CheckoutID,
		Amount:     req.Amount,
		Currency:   req.Currency,
		Method:     req.Method,
		Status:     "pending",
	}

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
		writePaymentLookupError(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *PaymentHandler) GetPaymentByCheckout(c *gin.Context) {
	checkoutID := c.Param("checkoutId")
	p, err := h.repo.FindByCheckoutID(checkoutID)
	if err != nil {
		writePaymentLookupError(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *PaymentHandler) RefundPayment(c *gin.Context) {
	id := c.Param("id")
	p, err := h.repo.FindByID(id)
	if err != nil {
		writePaymentLookupError(c, err)
		return
	}

	if p.Status != "completed" || p.TransactionID == "" {
		c.JSON(http.StatusConflict, gin.H{"error": "only completed payments can be refunded"})
		return
	}

	processor, err := payment.NewPaymentProcessor(p.Method)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := processor.Refund(p.TransactionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	p.Status = "refunded"
	if err := h.repo.Update(p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record refund"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func writePaymentLookupError(c *gin.Context, err error) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve payment"})
}
