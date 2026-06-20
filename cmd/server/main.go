package main

// @title           cnalias API
// @version         1.0.0
// @description     中国地区叫法对比平台 API - 记录中国不同地区对同一物品的不同叫法（方言/别名）
// @termsOfService  http://cnalias.com/terms/

// @contact.name   API Support
// @contact.email  support@cnalias.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8081
// @BasePath  /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"go.uber.org/zap"

	"github.com/rdd/cnalias/internal/cache"
	"github.com/rdd/cnalias/internal/config"
	"github.com/rdd/cnalias/internal/handler"
	"github.com/rdd/cnalias/internal/pkg"
	"github.com/rdd/cnalias/internal/repository"
	"github.com/rdd/cnalias/internal/router"
	"github.com/rdd/cnalias/internal/service"
	_ "github.com/rdd/cnalias/docs"
)

func main() {
	// 加载配置
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 初始化日志
	if err := pkg.InitLogger(cfg.App.Environment, cfg.App.LogLevel); err != nil {
		log.Fatalf("Failed to init logger: %v", err)
	}
	defer pkg.Sync()

	pkg.Logger.Info("Starting application",
		zap.String("env", cfg.App.Environment),
		zap.String("version", "1.0.0"),
	)

	// 连接数据库
	db, err := pkg.NewDB(&cfg.Database, cfg.App.Environment)
	if err != nil {
		pkg.Logger.Fatal("Failed to connect database", zap.Error(err))
	}

	// 初始化Redis
	if err := cache.InitRedis(&cfg.Redis); err != nil {
		pkg.Logger.Fatal("Failed to connect redis", zap.Error(err))
	}
	defer cache.Close()

	// 初始化JWT
	pkg.InitJWT(&cfg.JWT)

	// 初始化Repository
	userRepo := repository.NewUserRepository(db)
	itemRepo := repository.NewItemRepository(db)
	aliasRepo := repository.NewAliasRepository(db)
	regionRepo := repository.NewRegionRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	tagRepo := repository.NewTagRepository(db)

	// 初始化Service
	userService := service.NewUserService(userRepo)
	itemService := service.NewItemService(itemRepo)
	aliasService := service.NewAliasService(aliasRepo, itemRepo)
	regionService := service.NewRegionService(regionRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	tagService := service.NewTagService(tagRepo)

	// 初始化Handler
	authHandler := handler.NewAuthHandler(userService)
	itemHandler := handler.NewItemHandler(itemService)
	aliasHandler := handler.NewAliasHandler(aliasService)
	adminHandler := handler.NewAdminHandler(nil, itemService)
	regionHandler := handler.NewRegionHandler(regionService)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	tagHandler := handler.NewTagHandler(tagService)

	// 配置路由
	router := router.SetupRouter(
		authHandler,
		itemHandler,
		aliasHandler,
		adminHandler,
		regionHandler,
		categoryHandler,
		tagHandler,
	)

	// 启动服务
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	pkg.Logger.Info("Server starting", zap.String("addr", addr))

	if err := router.Run(addr); err != nil {
		pkg.Logger.Fatal("Failed to start server", zap.Error(err))
	}

	// 优雅关闭
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	pkg.Logger.Info("Shutting down server...")
}
