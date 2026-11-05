package models

import (
	"regexp"
	"testing"
)

func TestGenerateUUIDCreatesDistinctRFC4122Identifiers(t *testing.T) {
	first, err := generateUUID()
	if err != nil {
		t.Fatal(err)
	}
	second, err := generateUUID()
	if err != nil {
		t.Fatal(err)
	}

	if !regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`).MatchString(first) {
		t.Fatalf("generated UUID has invalid format: %q", first)
	}
	if first == second {
		t.Fatal("generated UUIDs should be unique")
	}
}
