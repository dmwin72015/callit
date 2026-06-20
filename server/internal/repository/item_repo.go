package repository

import (
	"context"
	"github.com/rdd/cnalias/server/internal/model"
	"gorm.io/gorm"
)

// ItemRepository 物品Repository接口
type ItemRepository interface {
	BaseRepository[model.Item]
	FindByName(ctx context.Context, name string) (*model.Item, error)
	ListWithFilters(ctx context.Context, opts model.ItemListOptions) ([]model.Item, int64, error)
	FindWithAliases(ctx context.Context, itemID int64) (*model.ItemResponse, error)
}

type itemGORMRepository struct {
	*BaseGORMRepository[model.Item]
	db *gorm.DB
}

func NewItemRepository(db *gorm.DB) ItemRepository {
	return &itemGORMRepository{
		BaseGORMRepository: NewBaseGORMRepository[model.Item](db),
		db:                 db,
	}
}

func (r *itemGORMRepository) FindByName(ctx context.Context, name string) (*model.Item, error) {
	var item model.Item
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *itemGORMRepository) ListWithFilters(ctx context.Context, opts model.ItemListOptions) ([]model.Item, int64, error) {
	var items []model.Item
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Item{})

	if opts.CategoryID != nil {
		query = query.Where("category_id = ?", *opts.CategoryID)
	}

	if opts.Search != "" {
		searchPattern := "%" + opts.Search + "%"
		query = query.Where("name ILIKE ? OR description ILIKE ?", searchPattern, searchPattern)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	switch opts.OrderBy {
	case "created_at":
		query = query.Order("created_at DESC")
	default:
		query = query.Order("name ASC")
	}

	if opts.Page > 0 && opts.PageSize > 0 {
		offset := (opts.Page - 1) * opts.PageSize
		query = query.Offset(offset).Limit(opts.PageSize)
	}

	err := query.Find(&items).Error
	return items, total, err
}

func (r *itemGORMRepository) FindWithAliases(ctx context.Context, itemID int64) (*model.ItemResponse, error) {
	var item model.Item
	err := r.db.WithContext(ctx).First(&item, itemID).Error
	if err != nil {
		return nil, err
	}

	var aliases []model.Alias
	if err := r.db.WithContext(ctx).
		Where("item_id = ? AND status = ?", itemID, model.AliasStatusApproved).
		Order("created_at DESC").
		Find(&aliases).Error; err != nil {
		return nil, err
	}

	response := item.ToResponse()
	for _, alias := range aliases {
		response.Aliases = append(response.Aliases, *alias.ToResponse())
	}

	return response, nil
}
