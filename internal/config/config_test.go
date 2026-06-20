package config

import (
	"os"
	"testing"
	"github.com/stretchr/testify/assert"
	"github.com/spf13/viper"
)

func TestLoad(t *testing.T) {
	// 重置viper以确保干净状态
	viper.Reset()

	// 设置测试环境变量
	os.Setenv("APP_ENV", "test")
	os.Setenv("DB_HOST", "testhost")
	os.Setenv("DB_PORT", "5433")

	cfg, err := Load()
	assert.NoError(t, err)

	assert.Equal(t, "test", cfg.App.Environment)
	assert.Equal(t, "testhost", cfg.Database.Host)
	assert.Equal(t, 5433, cfg.Database.Port)

	// 清理
	os.Unsetenv("APP_ENV")
	os.Unsetenv("DB_HOST")
	os.Unsetenv("DB_PORT")
}

func TestLoadDefaults(t *testing.T) {
	// 重置viper以确保干净状态
	viper.Reset()

	// 清除可能影响测试的环境变量
	os.Unsetenv("APP_ENV")
	os.Unsetenv("DB_HOST")
	os.Unsetenv("SERVER_PORT")

	cfg, err := Load()
	assert.NoError(t, err)

	assert.Equal(t, "8081", cfg.Server.Port)
	assert.Equal(t, "development", cfg.App.Environment)
}
