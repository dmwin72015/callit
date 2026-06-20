package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/repository"
)

type AliasService interface {
	Submit(ctx context.Context, req *model.AliasRequest, userID *int64) (*model.AliasResponse, error)
	SubmitAnonymous(ctx context.Context, req *model.AnonymousAliasRequest) (*model.AliasResponse, error)
	GetUserSubmissions(ctx context.Context, userID int64) ([]model.AliasResponse, error)
	Search(ctx context.Context, query string, regionID *int64) ([]model.AliasResponse, error)
}

type aliasService struct {
	aliasRepo repository.AliasRepository
	itemRepo  repository.ItemRepository
}

func NewAliasService(aliasRepo repository.AliasRepository, itemRepo repository.ItemRepository) AliasService {
	return &aliasService{
		aliasRepo: aliasRepo,
		itemRepo:  itemRepo,
	}
}

func (s *aliasService) Submit(ctx context.Context, req *model.AliasRequest, userID *int64) (*model.AliasResponse, error) {
	// 验证物品是否存在
	_, err := s.itemRepo.GetByID(ctx, req.ItemID)
	if err != nil {
		return nil, errors.New("item not found")
	}

	alias := &model.Alias{
		ItemID:    req.ItemID,
		RegionID:  req.RegionID,
		AliasName: req.AliasName,
		NameType:  req.NameType,
		Status:    model.AliasStatusPending,
		SubmittedBy: userID,
	}

	created, err := s.aliasRepo.CreateWithCheck(ctx, alias)
	if err != nil {
		if err == repository.ErrDuplicateAlias {
			return nil, errors.New("alias already exists")
		}
		return nil, err
	}

	return created.ToResponse(), nil
}

func (s *aliasService) SubmitAnonymous(ctx context.Context, req *model.AnonymousAliasRequest) (*model.AliasResponse, error) {
	_, err := s.itemRepo.GetByID(ctx, req.ItemID)
	if err != nil {
		return nil, errors.New("item not found")
	}

	alias := &model.Alias{
		ItemID:    req.ItemID,
		RegionID:  req.RegionID,
		AliasName: req.AliasName,
		NameType:  req.NameType,
		Status:    model.AliasStatusPending,
	}

	created, err := s.aliasRepo.CreateWithCheck(ctx, alias)
	if err != nil {
		if err == repository.ErrDuplicateAlias {
			return nil, errors.New("alias already exists")
		}
		return nil, err
	}

	return created.ToResponse(), nil
}

func (s *aliasService) GetUserSubmissions(ctx context.Context, userID int64) ([]model.AliasResponse, error) {
	aliases, err := s.aliasRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user submissions: %w", err)
	}

	// 转换为响应格式
	responses := make([]model.AliasResponse, len(aliases))
	for i, alias := range aliases {
		responses[i] = *alias.ToResponse()
	}

	return responses, nil
}

func (s *aliasService) Search(ctx context.Context, query string, regionID *int64) ([]model.AliasResponse, error) {
	// 搜索已审核通过的别名
	limit := 50
	aliases, err := s.aliasRepo.Search(ctx, query, regionID, limit)
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	// 转换为响应格式
	responses := make([]model.AliasResponse, len(aliases))
	for i, alias := range aliases {
		responses[i] = *alias.ToResponse()
	}

	return responses, nil
}
