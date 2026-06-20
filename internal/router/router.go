package router

import (
	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/internal/handler"
	"github.com/rdd/cnalias/internal/middleware"
)

func SetupRouter(
	authHandler *handler.AuthHandler,
	itemHandler *handler.ItemHandler,
	aliasHandler *handler.AliasHandler,
	adminHandler *handler.AdminHandler,
	regionHandler *handler.RegionHandler,
	categoryHandler *handler.CategoryHandler,
	tagHandler *handler.TagHandler,
) *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.CORSMiddleware([]string{"*"}))
	router.Use(middleware.RateLimiter())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	v1 := router.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
		}

		v1.GET("/items", itemHandler.List)
		v1.GET("/items/:id", itemHandler.GetByID)

		authenticated := v1.Group("")
		authenticated.Use(middleware.AuthMiddleware())
		{
			authenticated.POST("/aliases", aliasHandler.Submit)
		}

		v1.GET("/regions", regionHandler.List)
		v1.GET("/regions/:id", regionHandler.GetByID)
		v1.GET("/regions/tree", regionHandler.GetTree)

		v1.GET("/categories", categoryHandler.List)
		v1.GET("/categories/:id", categoryHandler.GetByID)
		v1.GET("/categories/tree", categoryHandler.GetTree)

		v1.GET("/tags", tagHandler.List)
		v1.GET("/tags/:id", tagHandler.GetByID)
		v1.GET("/tags/search", tagHandler.Search)

		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.RequireAdmin())
		{
			admin.GET("/review/queue", adminHandler.GetReviewQueue)
			admin.POST("/review/:id/approve", adminHandler.ApproveAlias)
			admin.POST("/review/:id/reject", adminHandler.RejectAlias)
			admin.GET("/stats", adminHandler.GetStats)
		}
	}

	return router
}
