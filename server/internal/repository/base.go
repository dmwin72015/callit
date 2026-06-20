package repository

import (
	"context"
	"gorm.io/gorm"
)

// BaseRepository 基础Repository接口
type BaseRepository[T any] interface {
	Create(ctx context.Context, entity *T) error
	Update(ctx context.Context, entity *T) error
	Delete(ctx context.Context, id int64) error
	GetByID(ctx context.Context, id int64) (*T, error)
	GetAll(ctx context.Context) ([]T, error)
}

// BaseGORMRepository GORM基础实现
type BaseGORMRepository[T any] struct {
	db *gorm.DB
}

func NewBaseGORMRepository[T any](db *gorm.DB) *BaseGORMRepository[T] {
	return &BaseGORMRepository[T]{db: db}
}

func (r *BaseGORMRepository[T]) Create(ctx context.Context, entity *T) error {
	return r.db.WithContext(ctx).Create(entity).Error
}

func (r *BaseGORMRepository[T]) Update(ctx context.Context, entity *T) error {
	return r.db.WithContext(ctx).Save(entity).Error
}

func (r *BaseGORMRepository[T]) Delete(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(new(T), id).Error
}

func (r *BaseGORMRepository[T]) GetByID(ctx context.Context, id int64) (*T, error) {
	var entity T
	err := r.db.WithContext(ctx).First(&entity, id).Error
	if err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *BaseGORMRepository[T]) GetAll(ctx context.Context) ([]T, error) {
	var entities []T
	err := r.db.WithContext(ctx).Find(&entities).Error
	return entities, err
}

// WithDB 设置db实例（用于测试）
func (r *BaseGORMRepository[T]) WithDB(db *gorm.DB) {
	r.db = db
}
