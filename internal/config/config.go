package config

import (
	"os"
	"strconv"
	"time"
)

// Config 应用配置
type Config struct {
	App      AppConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Server   ServerConfig
}

type AppConfig struct {
	Name        string
	Environment string
	LogLevel    string
}

type DatabaseConfig struct {
	Host            string
	Port            int
	User            string
	Password        string
	DBName          string
	SSLMode         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type RedisConfig struct {
	Host         string
	Port         int
	Password     string
	DB           int
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type JWTConfig struct {
	Secret           string
	AccessTokenTTL   time.Duration
	RefreshTokenTTL  time.Duration
}

type ServerConfig struct {
	Port            string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
}

// getEnv 获取环境变量，如果不存在则使用默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

// Load 从环境变量加载配置
func Load() (*Config, error) {
	// 默认值
	appName := getEnv("APP_NAME", "cnalias")
	appEnv := getEnv("APP_ENV", "development")
	logLevel := getEnv("LOG_LEVEL", "info")

	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnvAsInt("DB_PORT", 5432)
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "cnalias")
	dbSSLMode := getEnv("DB_SSLMODE", "disable")

	redisHost := getEnv("REDIS_HOST", "localhost")
	redisPort := getEnvAsInt("REDIS_PORT", 6379)
	redisPassword := getEnv("REDIS_PASSWORD", "")
	redisDB := getEnvAsInt("REDIS_DB", 0)

	jwtSecret := getEnv("JWT_SECRET", "your-secret-key-change-in-production")

	serverPort := getEnv("SERVER_PORT", "8080")

	// 解析时间duration
	accessTokenTTL, err := time.ParseDuration(getEnv("JWT_ACCESS_TOKEN_TTL", "15m"))
	if err != nil {
		return nil, err
	}

	refreshTokenTTL, err := time.ParseDuration(getEnv("JWT_REFRESH_TOKEN_TTL", "168h"))
	if err != nil {
		return nil, err
	}

	dbConnMaxLifetime, err := time.ParseDuration(getEnv("DB_CONN_MAX_LIFETIME", "5m"))
	if err != nil {
		return nil, err
	}

	redisDialTimeout, err := time.ParseDuration(getEnv("REDIS_DIAL_TIMEOUT", "10s"))
	if err != nil {
		return nil, err
	}

	redisReadTimeout, err := time.ParseDuration(getEnv("REDIS_READ_TIMEOUT", "3s"))
	if err != nil {
		return nil, err
	}

	redisWriteTimeout, err := time.ParseDuration(getEnv("REDIS_WRITE_TIMEOUT", "3s"))
	if err != nil {
		return nil, err
	}

	serverReadTimeout, err := time.ParseDuration(getEnv("SERVER_READ_TIMEOUT", "10s"))
	if err != nil {
		return nil, err
	}

	serverWriteTimeout, err := time.ParseDuration(getEnv("SERVER_WRITE_TIMEOUT", "10s"))
	if err != nil {
		return nil, err
	}

	serverIdleTimeout, err := time.ParseDuration(getEnv("SERVER_IDLE_TIMEOUT", "60s"))
	if err != nil {
		return nil, err
	}

	config := &Config{
		App: AppConfig{
			Name:        appName,
			Environment: appEnv,
			LogLevel:    logLevel,
		},
		Database: DatabaseConfig{
			Host:            dbHost,
			Port:            dbPort,
			User:            dbUser,
			Password:        dbPassword,
			DBName:          dbName,
			SSLMode:         dbSSLMode,
			MaxOpenConns:    25,
			MaxIdleConns:    5,
			ConnMaxLifetime: dbConnMaxLifetime,
		},
		Redis: RedisConfig{
			Host:         redisHost,
			Port:         redisPort,
			Password:     redisPassword,
			DB:           redisDB,
			DialTimeout:  redisDialTimeout,
			ReadTimeout:  redisReadTimeout,
			WriteTimeout: redisWriteTimeout,
		},
		JWT: JWTConfig{
			Secret:           jwtSecret,
			AccessTokenTTL:   accessTokenTTL,
			RefreshTokenTTL:  refreshTokenTTL,
		},
		Server: ServerConfig{
			Port:            serverPort,
			ReadTimeout:     serverReadTimeout,
			WriteTimeout:    serverWriteTimeout,
			IdleTimeout:     serverIdleTimeout,
		},
	}

	return config, nil
}
