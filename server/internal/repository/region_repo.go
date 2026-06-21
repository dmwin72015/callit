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
	FindTree(ctx context.Context, rootID *int64, rootType *model.RegionType, maxDepth int) ([]model.RegionTreeNode, error)
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

func (r *regionGORMRepository) FindTree(ctx context.Context, rootID *int64, rootType *model.RegionType, maxDepth int) ([]model.RegionTreeNode, error) {
	var args []any
	rootSQL := ""

	switch {
	case rootID != nil:
		rootSQL = "WHERE r.id = ?"
		args = append(args, *rootID)
	case rootType != nil:
		rootSQL = "WHERE r.region_type = ?"
		args = append(args, *rootType)
	default:
		rootSQL = "WHERE r.parent_id IS NULL"
	}

	query := fmt.Sprintf(`
		WITH RECURSIVE tree AS (
			SELECT id, name, parent_id, region_type, code, sort_order,
			       latitude, longitude, postal_code, area_code, 1 AS depth
			FROM regions r
			%s
			UNION ALL
			SELECT r.id, r.name, r.parent_id, r.region_type, r.code, r.sort_order,
			       r.latitude, r.longitude, r.postal_code, r.area_code, t.depth + 1
			FROM regions r
			JOIN tree t ON r.parent_id = t.id
			WHERE t.depth < ?
		)
		SELECT id, name, parent_id, region_type, code, sort_order,
		       latitude, longitude, postal_code, area_code, depth
		FROM tree
		ORDER BY depth, id
	`, rootSQL)

	args = append(args, maxDepth)

	var nodes []model.RegionTreeNode
	if err := r.db.WithContext(ctx).Raw(query, args...).Scan(&nodes).Error; err != nil {
		return nil, fmt.Errorf("find tree: %w", err)
	}

	return nodes, nil
}
