package pkg

import (
	"testing"

	"github.com/rdd/cnalias/internal/config"
)

func TestNewDB_InvalidConfig(t *testing.T) {
	cfg := &config.DatabaseConfig{
		Host:     "invalid_host",
		Port:     5432,
		User:     "invalid",
		Password: "invalid",
		DBName:   "invalid_db",
	}

	_, err := NewDB(cfg, "test")
	// 应该返回错误
	if err == nil {
		t.Error("Expected error for invalid database config")
	}
}
