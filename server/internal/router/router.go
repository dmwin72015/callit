package router

import (
	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/server/internal/handler"
	"github.com/rdd/cnalias/server/internal/middleware"
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
			admin.GET("/aliases/review-queue", adminHandler.GetReviewQueue)
			admin.POST("/aliases/:id/approve", adminHandler.ApproveAlias)
			admin.POST("/aliases/:id/reject", adminHandler.RejectAlias)
			admin.GET("/aliases", adminHandler.AdminListAliases)
			admin.GET("/aliases/:id", adminHandler.AdminGetAlias)
			admin.POST("/aliases", adminHandler.AdminCreateAlias)
			admin.PUT("/aliases/:id", adminHandler.AdminUpdateAlias)
			admin.DELETE("/aliases/:id", adminHandler.AdminDeleteAlias)
			admin.GET("/stats", adminHandler.GetStats)

			// 物品管理
			admin.GET("/items", adminHandler.AdminListItems)
			admin.GET("/items/:id", adminHandler.AdminGetItem)
			admin.POST("/items", adminHandler.AdminCreateItem)
			admin.PUT("/items/:id", adminHandler.AdminUpdateItem)
			admin.DELETE("/items/:id", adminHandler.AdminDeleteItem)

			// 分类管理
			admin.GET("/categories", adminHandler.AdminListCategories)
			admin.GET("/categories/:id", adminHandler.AdminGetCategory)
			admin.POST("/categories", adminHandler.AdminCreateCategory)
			admin.PUT("/categories/:id", adminHandler.AdminUpdateCategory)
			admin.DELETE("/categories/:id", adminHandler.AdminDeleteCategory)

			// 地区管理
			admin.GET("/regions", adminHandler.AdminListRegions)
			admin.GET("/regions/:id", adminHandler.AdminGetRegion)
			admin.POST("/regions", adminHandler.AdminCreateRegion)
			admin.PUT("/regions/:id", adminHandler.AdminUpdateRegion)
			admin.DELETE("/regions/:id", adminHandler.AdminDeleteRegion)

			// 标签管理
			admin.GET("/tags", adminHandler.AdminListTags)
			admin.GET("/tags/:id", adminHandler.AdminGetTag)
			admin.POST("/tags", adminHandler.AdminCreateTag)
			admin.PUT("/tags/:id", adminHandler.AdminUpdateTag)
			admin.DELETE("/tags/:id", adminHandler.AdminDeleteTag)

			// 用户管理
			admin.GET("/users", adminHandler.AdminListUsers)
			admin.GET("/users/:id", adminHandler.AdminGetUser)
			admin.PUT("/users/:id", adminHandler.AdminUpdateUser)
			admin.DELETE("/users/:id", adminHandler.AdminDeleteUser)

			// 审计日志
			admin.GET("/audit-logs", adminHandler.AdminListAuditLogs)
		}
	}

	return router
}
