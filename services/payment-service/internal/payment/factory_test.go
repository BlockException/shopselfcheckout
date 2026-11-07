package payment

import "testing"

func TestNewPaymentProcessorRejectsUnknownMethod(t *testing.T) {
	if processor, err := NewPaymentProcessor("unknown"); err == nil || processor != nil {
		t.Fatal("expected unknown payment method to be rejected")
	}
}

func TestNewPaymentProcessorSupportsMethods(t *testing.T) {
	for _, method := range []string{"credit_card", "paypal", "cash", "gift_card", "apple_pay", "google_pay"} {
		if processor, err := NewPaymentProcessor(method); err != nil || processor == nil {
			t.Errorf("expected %q to have a processor, got processor=%v err=%v", method, processor, err)
		}
	}
}
