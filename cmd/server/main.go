package main

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

	// 初始化Repository
	userRepo := repository.NewUserRepository(db)
	itemRepo := repository.NewItemRepository(db)
	aliasRepo := repository.NewAliasRepository(db)

	// 初始化Service
	userService := service.NewUserService(userRepo)
	itemService := service.NewItemService(itemRepo)
	aliasService := service.NewAliasService(aliasRepo, itemRepo)

	// 初始化Handler
	authHandler := handler.NewAuthHandler(userService)
	itemHandler := handler.NewItemHandler(itemService)
	aliasHandler := handler.NewAliasHandler(aliasService)
	adminHandler := handler.NewAdminHandler(nil, itemService)

	// 配置路由
	router := router.SetupRouter(
		authHandler,
		itemHandler,
		aliasHandler,
		adminHandler,
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
