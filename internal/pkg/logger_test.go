package pkg

import (
	"testing"
)

func TestInitLogger(t *testing.T) {
	err := InitLogger("development", "debug")
	if err != nil {
		t.Fatalf("InitLogger() error = %v", err)
	}

	if Logger == nil {
		t.Error("Logger is nil")
	}

	Sync()
}

func TestInitLogger_Production(t *testing.T) {
	err := InitLogger("production", "info")
	if err != nil {
		t.Fatalf("InitLogger() error = %v", err)
	}

	if Logger == nil {
		t.Error("Logger is nil")
	}

	Sync()
}
