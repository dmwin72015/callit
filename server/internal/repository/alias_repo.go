package repository

import (
	"context"
	"errors"
	"github.com/rdd/cnalias/server/internal/model"
	"gorm.io/gorm"
)

// AliasRepository 别名Repository接口
type AliasRepository interface {
	BaseRepository[model.Alias]
	CreateWithCheck(ctx context.Context, alias *model.Alias) (*model.Alias, error)
	FindPending(ctx context.Context, offset, limit int) ([]model.Alias, error)
	FindByUserID(ctx context.Context, userID int64) ([]model.Alias, error)
	Search(ctx context.Context, query string, regionID *int64, limit int) ([]model.Alias, error)
	GetPendingCount(ctx context.Context) (int64, error)
	UpdateStatus(ctx context.Context, id int64, status model.AliasStatus, reviewerID int64, note string) error
	List(ctx context.Context, status *model.AliasStatus, offset, limit int) ([]model.Alias, int64, error)
	GetDB() *gorm.DB
}

type aliasGORMRepository struct {
	*BaseGORMRepository[model.Alias]
	db *gorm.DB
}

func NewAliasRepository(db *gorm.DB) AliasRepository {
	return &aliasGORMRepository{
		BaseGORMRepository: NewBaseGORMRepository[model.Alias](db),
		db:                 db,
	}
}

func (r *aliasGORMRepository) CreateWithCheck(ctx context.Context, alias *model.Alias) (*model.Alias, error) {
	var existing model.Alias
	result := r.db.WithContext(ctx).
		Where("item_id = ? AND region_id = ? AND alias_name = ?",
			alias.ItemID, alias.RegionID, alias.AliasName).
		First(&existing)

	if result.Error == nil {
		return nil, ErrDuplicateAlias
	}

	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, result.Error
	}

	if err := r.db.WithContext(ctx).Create(alias).Error; err != nil {
		return nil, err
	}

	return alias, nil
}

func (r *aliasGORMRepository) FindPending(ctx context.Context, offset, limit int) ([]model.Alias, error) {
	var aliases []model.Alias
	err := r.db.WithContext(ctx).
		Where("status = ?", model.AliasStatusPending).
		Order("created_at ASC").
		Offset(offset).
		Limit(limit).
		Find(&aliases).Error
	return aliases, err
}

func (r *aliasGORMRepository) GetPendingCount(ctx context.Context) (int64, error) {
	var count int64
	result := r.db.WithContext(ctx).Model(&model.Alias{}).
		Where("status = ?", model.AliasStatusPending).Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}
	return count, nil
}

func (r *aliasGORMRepository) FindByUserID(ctx context.Context, userID int64) ([]model.Alias, error) {
	var aliases []model.Alias
	err := r.db.WithContext(ctx).
		Where("submitted_by = ?", userID).
		Order("created_at DESC").
		Find(&aliases).Error
	return aliases, err
}

func (r *aliasGORMRepository) Search(ctx context.Context, query string, regionID *int64, limit int) ([]model.Alias, error) {
	var aliases []model.Alias

	searchQuery := r.db.WithContext(ctx).
		Where("alias_name ILIKE ?", "%"+query+"%").
		Where("status = ?", model.AliasStatusApproved).
		Order("votes_count DESC, created_at DESC").
		Limit(limit)

	if regionID != nil {
		searchQuery = searchQuery.Where("region_id = ?", *regionID)
	}

	err := searchQuery.Find(&aliases).Error
	return aliases, err
}

func (r *aliasGORMRepository) UpdateStatus(ctx context.Context, id int64, status model.AliasStatus, reviewerID int64, note string) error {
	return r.db.WithContext(ctx).Model(&model.Alias{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":      status,
			"reviewer_id": reviewerID,
			"reviewed_at": gorm.Expr("NOW()"),
			"review_note": note,
		}).Error
}

// ErrDuplicateAlias 重复别名错误
var ErrDuplicateAlias = errors.New("alias already exists for this item and region")

func (r *aliasGORMRepository) List(ctx context.Context, status *model.AliasStatus, offset, limit int) ([]model.Alias, int64, error) {
	var aliases []model.Alias
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Alias{})
	if status != nil {
		query = query.Where("status = ?", *status)
	}
	query.Count(&total)

	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&aliases).Error; err != nil {
		return nil, 0, err
	}
	return aliases, total, nil
}

func (r *aliasGORMRepository) GetDB() *gorm.DB {
	return r.db
}
