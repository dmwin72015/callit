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
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"go.uber.org/zap"

	"github.com/joho/godotenv"
	"github.com/rdd/cnalias/server/internal/cache"
	"github.com/rdd/cnalias/server/internal/config"
	"github.com/rdd/cnalias/server/internal/handler"
	"github.com/rdd/cnalias/server/internal/pkg"
	"github.com/rdd/cnalias/server/internal/repository"
	"github.com/rdd/cnalias/server/internal/router"
	"github.com/rdd/cnalias/server/internal/service"
	_ "github.com/rdd/cnalias/docs"
)

func main() {
	_ = godotenv.Load("../.env")

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := pkg.InitLogger(cfg.App.Environment, cfg.App.LogLevel); err != nil {
		log.Fatalf("Failed to init logger: %v", err)
	}
	defer pkg.Sync()

	pkg.Logger.Info("Starting application",
		zap.String("env", cfg.App.Environment),
		zap.String("version", "1.0.0"),
	)

	db, err := pkg.NewDB(&cfg.Database, cfg.App.Environment)
	if err != nil {
		pkg.Logger.Fatal("Failed to connect database", zap.Error(err))
	}

	if err := cache.InitRedis(&cfg.Redis); err != nil {
		pkg.Logger.Fatal("Failed to connect redis", zap.Error(err))
	}
	defer cache.Close()

	pkg.InitJWT(&cfg.JWT)

	userRepo := repository.NewUserRepository(db)
	itemRepo := repository.NewItemRepository(db)
	aliasRepo := repository.NewAliasRepository(db)
	regionRepo := repository.NewRegionRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	tagRepo := repository.NewTagRepository(db)

	if cfg.App.Environment == "development" {
		if err := initDefaultAdmin(context.Background(), userRepo); err != nil {
			pkg.Logger.Warn("Failed to initialize default admin", zap.Error(err))
		}
	}

	userService := service.NewUserService(userRepo)
	itemService := service.NewItemService(itemRepo)
	aliasService := service.NewAliasService(aliasRepo, itemRepo)
	regionService := service.NewRegionService(regionRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	tagService := service.NewTagService(tagRepo)

	authHandler := handler.NewAuthHandler(userService)
	itemHandler := handler.NewItemHandler(itemService)
	aliasHandler := handler.NewAliasHandler(aliasService)
	adminHandler := handler.NewAdminHandler(nil, itemService, categoryService, regionService, tagService, userService, aliasService)
	regionHandler := handler.NewRegionHandler(regionService)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	tagHandler := handler.NewTagHandler(tagService)

	router := router.SetupRouter(
		authHandler,
		itemHandler,
		aliasHandler,
		adminHandler,
		regionHandler,
		categoryHandler,
		tagHandler,
	)

	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	pkg.Logger.Info("Server starting", zap.String("addr", addr))

	if err := router.Run(addr); err != nil {
		pkg.Logger.Fatal("Failed to start server", zap.Error(err))
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	pkg.Logger.Info("Shutting down server...")
}
