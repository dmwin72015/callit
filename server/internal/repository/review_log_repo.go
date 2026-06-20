package repository

import (
	"github.com/rdd/cnalias/server/internal/model"
	"gorm.io/gorm"
)

// ReviewLogRepository 审核日志Repository接口
type ReviewLogRepository interface {
	BaseRepository[model.ReviewLog]
}

type reviewLogGORMRepository struct {
	*BaseGORMRepository[model.ReviewLog]
	db *gorm.DB
}

func NewReviewLogRepository(db *gorm.DB) ReviewLogRepository {
	return &reviewLogGORMRepository{
		BaseGORMRepository: NewBaseGORMRepository[model.ReviewLog](db),
		db:                 db,
	}
}
