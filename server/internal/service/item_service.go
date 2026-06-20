package service

import (
	"context"
	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/repository"
)

type ItemService interface {
	List(ctx context.Context, opts model.ItemListOptions) ([]model.ItemResponse, error)
	GetByID(ctx context.Context, id int64) (*model.ItemResponse, error)
	Create(ctx context.Context, req *model.ItemCreateRequest) (*model.ItemResponse, error)
	Update(ctx context.Context, id int64, req *model.ItemUpdateRequest) (*model.ItemResponse, error)
	Delete(ctx context.Context, id int64) error
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

func (s *itemService) Create(ctx context.Context, req *model.ItemCreateRequest) (*model.ItemResponse, error) {
	item := &model.Item{
		Name:        req.Name,
		CategoryID:  req.CategoryID,
		Description: req.Description,
	}

	err := s.itemRepo.Create(ctx, item)
	if err != nil {
		return nil, err
	}

	return item.ToResponse(), nil
}

func (s *itemService) Update(ctx context.Context, id int64, req *model.ItemUpdateRequest) (*model.ItemResponse, error) {
	item, err := s.itemRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		item.Name = *req.Name
	}
	if req.CategoryID != nil {
		item.CategoryID = req.CategoryID
	}
	if req.Description != nil {
		item.Description = *req.Description
	}

	err = s.itemRepo.Update(ctx, item)
	if err != nil {
		return nil, err
	}

	return item.ToResponse(), nil
}

func (s *itemService) Delete(ctx context.Context, id int64) error {
	return s.itemRepo.Delete(ctx, id)
}
