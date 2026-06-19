package config

import "fmt"

// ToDSN 生成PostgreSQL连接字符串
func (c *DatabaseConfig) ToDSN() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s",
		c.Host, c.User, c.Password, c.DBName, c.Port, c.SSLMode)
}
