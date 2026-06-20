package repository

import (
	"context"
	"github.com/rdd/cnalias/internal/model"
	"gorm.io/gorm"
)

// RegionRepository 地区Repository接口
type RegionRepository interface {
	BaseRepository[model.Region]
	FindByType(ctx context.Context, regionType model.RegionType) ([]model.Region, error)
	FindChildren(ctx context.Context, parentID int64) ([]model.Region, error)
}

type regionGORMRepository struct {
	*BaseGORMRepository[model.Region]
	db *gorm.DB
}

func NewRegionRepository(db *gorm.DB) RegionRepository {
	return &regionGORMRepository{
		BaseGORMRepository: NewBaseGORMRepository[model.Region](db),
		db:                 db,
	}
}

func (r *regionGORMRepository) FindByType(ctx context.Context, regionType model.RegionType) ([]model.Region, error) {
	var regions []model.Region
	err := r.db.WithContext(ctx).
		Where("region_type = ?", regionType).
		Order("sort_order ASC, name ASC").
		Find(&regions).Error
	return regions, err
}

func (r *regionGORMRepository) FindChildren(ctx context.Context, parentID int64) ([]model.Region, error) {
	var regions []model.Region
	err := r.db.WithContext(ctx).
		Where("parent_id = ?", parentID).
		Order("sort_order ASC, name ASC").
		Find(&regions).Error
	return regions, err
}
