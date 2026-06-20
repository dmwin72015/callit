package middleware

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"github.com/rdd/cnalias/server/internal/pkg"
	"github.com/rdd/cnalias/server/internal/handler"
)

func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				pkg.Logger.Error("panic recovered",
					zap.Any("error", err),
					zap.String("path", c.Request.URL.Path),
				)

				handler.InternalError(c, "internal server error")
				c.Abort()
			}
		}()
		c.Next()
	}
}
