package middleware

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/server/internal/cache"
	"github.com/rdd/cnalias/server/internal/handler"
)

func RateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		key := c.ClientIP()
		limitKey := fmt.Sprintf("rate_limit:%s", key)

		count, err := cache.RedisClient.Incr(cache.Ctx, limitKey).Result()
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			cache.RedisClient.Expire(cache.Ctx, limitKey, time.Minute)
		}

		if count > 60 {
			handler.TooManyRequests(c, "too many requests")
			c.Abort()
			return
		}

		c.Header("X-RateLimit-Limit", "60")
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", 60-count))

		c.Next()
	}
}
