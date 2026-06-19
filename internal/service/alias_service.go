package service

import (
	"context"
	"errors"
	"github.com/rdd/cnalias/internal/model"
	"github.com/rdd/cnalias/internal/repository"
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
	// TODO: 实现查询用户提交记录
	return nil, nil
}

func (s *aliasService) Search(ctx context.Context, query string, regionID *int64) ([]model.AliasResponse, error) {
	// TODO: 实现搜索功能
	return nil, nil
}
