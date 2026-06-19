package service

import (
	"context"
	"github.com/rdd/cnalias/internal/model"
	"github.com/rdd/cnalias/internal/repository"
)

type ItemService interface {
	List(ctx context.Context, opts model.ItemListOptions) ([]model.ItemResponse, error)
	GetByID(ctx context.Context, id int64) (*model.ItemResponse, error)
}

type itemService struct {
	itemRepo repository.ItemRepository
}

func NewItemService(itemRepo repository.ItemRepository) ItemService {
	return &itemService{itemRepo: itemRepo}
}

func (s *itemService) List(ctx context.Context, opts model.ItemListOptions) ([]model.ItemResponse, error) {
	items, _, err := s.itemRepo.ListWithFilters(ctx, opts)
	if err != nil {
		return nil, err
	}

	var result []model.ItemResponse
	for _, item := range items {
		result = append(result, *item.ToResponse())
	}
	return result, nil
}

func (s *itemService) GetByID(ctx context.Context, id int64) (*model.ItemResponse, error) {
	return s.itemRepo.FindWithAliases(ctx, id)
}
