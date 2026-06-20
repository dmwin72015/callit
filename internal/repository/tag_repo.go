package repository

import (
	"context"
	"github.com/rdd/cnalias/internal/model"
	"gorm.io/gorm"
)

// TagRepository 标签Repository接口
type TagRepository interface {
	BaseRepository[model.Tag]
	FindByName(ctx context.Context, name string) (*model.Tag, error)
	Search(ctx context.Context, query string) ([]model.Tag, error)
}

type tagGORMRepository struct {
	*BaseGORMRepository[model.Tag]
	db *gorm.DB
}

func NewTagRepository(db *gorm.DB) TagRepository {
	return &tagGORMRepository{
		BaseGORMRepository: NewBaseGORMRepository[model.Tag](db),
		db:                 db,
	}
}

func (r *tagGORMRepository) FindByName(ctx context.Context, name string) (*model.Tag, error) {
	var tag model.Tag
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&tag).Error
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagGORMRepository) Search(ctx context.Context, query string) ([]model.Tag, error) {
	var tags []model.Tag
	err := r.db.WithContext(ctx).
		Where("name ILIKE ?", "%"+query+"%").
		Order("name ASC").
		Find(&tags).Error
	return tags, err
}
