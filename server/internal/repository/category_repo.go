package repository

import (
	"context"
	"github.com/rdd/cnalias/server/internal/model"
	"gorm.io/gorm"
)

// CategoryRepository 分类Repository接口
type CategoryRepository interface {
	BaseRepository[model.Category]
	FindByParentID(ctx context.Context, parentID *int64) ([]model.Category, error)
	FindWithChildren(ctx context.Context, id int64) (*model.CategoryResponse, error)
}

type categoryGORMRepository struct {
	*BaseGORMRepository[model.Category]
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryGORMRepository{
		BaseGORMRepository: NewBaseGORMRepository[model.Category](db),
		db:                 db,
	}
}

func (r *categoryGORMRepository) FindByParentID(ctx context.Context, parentID *int64) ([]model.Category, error) {
	var categories []model.Category
	query := r.db.WithContext(ctx)

	if parentID == nil {
		query = query.Where("parent_id IS NULL")
	} else {
		query = query.Where("parent_id = ?", *parentID)
	}

	err := query.Order("sort_order ASC, name ASC").Find(&categories).Error
	return categories, err
}

func (r *categoryGORMRepository) FindWithChildren(ctx context.Context, id int64) (*model.CategoryResponse, error) {
	var category model.Category
	err := r.db.WithContext(ctx).
		Preload("Children").
		First(&category, id).Error
	if err != nil {
		return nil, err
	}

	// 构建响应（包含子分类）
	response := category.ToResponse()
	if len(category.Children) > 0 {
		response.Children = make([]model.CategoryResponse, len(category.Children))
		for i, child := range category.Children {
			response.Children[i] = *child.ToResponse()
		}
	}

	return response, nil
}
