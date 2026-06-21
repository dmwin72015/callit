package repository

import (
	"context"
	"fmt"

	"github.com/rdd/cnalias/server/internal/model"
	"gorm.io/gorm"
)

// RegionRepository 地区Repository接口
type RegionRepository interface {
	BaseRepository[model.Region]
	FindByType(ctx context.Context, regionType model.RegionType) ([]model.Region, error)
	FindChildren(ctx context.Context, parentID int64) ([]model.Region, error)
	FindByTypeAndParent(ctx context.Context, regionType model.RegionType, parentID int64) ([]model.Region, error)
	FindByCode(ctx context.Context, code string) (*model.Region, error)
	SearchByName(ctx context.Context, keyword string, limit int) ([]model.Region, error)
	Paginate(ctx context.Context, regionType *model.RegionType, parentID *int64, page, pageSize int) ([]model.Region, int64, error)
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
		Order("sort_order ASC, code ASC").
		Find(&regions).Error
	return regions, err
}

func (r *regionGORMRepository) FindChildren(ctx context.Context, parentID int64) ([]model.Region, error) {
	var regions []model.Region
	err := r.db.WithContext(ctx).
		Where("parent_id = ?", parentID).
		Order("sort_order ASC, code ASC").
		Find(&regions).Error
	return regions, err
}

func (r *regionGORMRepository) FindByTypeAndParent(ctx context.Context, regionType model.RegionType, parentID int64) ([]model.Region, error) {
	var regions []model.Region
	err := r.db.WithContext(ctx).
		Where("region_type = ? AND parent_id = ?", regionType, parentID).
		Order("sort_order ASC, code ASC").
		Find(&regions).Error
	return regions, err
}

func (r *regionGORMRepository) FindByCode(ctx context.Context, code string) (*model.Region, error) {
	var region model.Region
	err := r.db.WithContext(ctx).
		Where("code = ?", code).
		First(&region).Error
	if err != nil {
		return nil, err
	}
	return &region, nil
}

func (r *regionGORMRepository) SearchByName(ctx context.Context, keyword string, limit int) ([]model.Region, error) {
	var regions []model.Region
	err := r.db.WithContext(ctx).
		Where("name ILIKE ?", "%"+keyword+"%").
		Limit(limit).
		Order("sort_order ASC, code ASC").
		Find(&regions).Error
	return regions, err
}

func (r *regionGORMRepository) Paginate(ctx context.Context, regionType *model.RegionType, parentID *int64, page, pageSize int) ([]model.Region, int64, error) {
	query := r.db.WithContext(ctx).Model(&model.Region{})

	if regionType != nil {
		query = query.Where("region_type = ?", *regionType)
	}
	if parentID != nil {
		query = query.Where("parent_id = ?", *parentID)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("count regions: %w", err)
	}

	var regions []model.Region
	offset := (page - 1) * pageSize
	err := query.
		Order("sort_order ASC, code ASC").
		Offset(offset).
		Limit(pageSize).
		Find(&regions).Error

	if err != nil {
		return nil, 0, fmt.Errorf("paginate regions: %w", err)
	}

	return regions, total, nil
}
