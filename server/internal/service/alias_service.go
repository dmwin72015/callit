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
	AdminList(ctx context.Context, page, pageSize int, status *model.AliasStatus) ([]model.AliasResponse, int64, error)
	AdminGet(ctx context.Context, id int64) (*model.AliasResponse, error)
	AdminCreate(ctx context.Context, req *model.AdminAliasCreateRequest) (*model.AliasResponse, error)
	AdminUpdate(ctx context.Context, id int64, req *model.AdminAliasUpdateRequest) (*model.AliasResponse, error)
	AdminDelete(ctx context.Context, id int64) error
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
	limit := 50
	aliases, err := s.aliasRepo.Search(ctx, query, regionID, limit)
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	responses := make([]model.AliasResponse, len(aliases))
	for i, alias := range aliases {
		responses[i] = *alias.ToResponse()
	}

	return responses, nil
}

func (s *aliasService) AdminList(ctx context.Context, page, pageSize int, status *model.AliasStatus) ([]model.AliasResponse, int64, error) {
	offset := (page - 1) * pageSize
	aliases, total, err := s.aliasRepo.List(ctx, status, offset, pageSize)
	if err != nil {
		return nil, 0, err
	}
	responses := make([]model.AliasResponse, len(aliases))
	for i, a := range aliases {
		responses[i] = *a.ToResponse()
	}
	return responses, total, nil
}

func (s *aliasService) AdminGet(ctx context.Context, id int64) (*model.AliasResponse, error) {
	alias, err := s.aliasRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return alias.ToResponse(), nil
}

func (s *aliasService) AdminCreate(ctx context.Context, req *model.AdminAliasCreateRequest) (*model.AliasResponse, error) {
	_, err := s.itemRepo.GetByID(ctx, req.ItemID)
	if err != nil {
		return nil, errors.New("item not found")
	}

	alias := &model.Alias{
		ItemID:     req.ItemID,
		RegionID:   req.RegionID,
		AliasName:  req.AliasName,
		NameType:   req.NameType,
		Status:     model.AliasStatus(req.Status),
		VotesCount: req.VotesCount,
	}
	if req.SubmittedBy != nil {
		alias.SubmittedBy = req.SubmittedBy
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

func (s *aliasService) AdminUpdate(ctx context.Context, id int64, req *model.AdminAliasUpdateRequest) (*model.AliasResponse, error) {
	alias, err := s.aliasRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("alias not found")
	}

	if err := s.aliasRepo.GetDB().WithContext(ctx).Model(alias).Updates(map[string]interface{}{
		"item_id":     req.ItemID,
		"region_id":   req.RegionID,
		"alias_name":  req.AliasName,
		"name_type":   req.NameType,
		"status":      model.AliasStatus(req.Status),
		"votes_count": req.VotesCount,
	}).Error; err != nil {
		return nil, err
	}

	updated, err := s.aliasRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return updated.ToResponse(), nil
}

func (s *aliasService) AdminDelete(ctx context.Context, id int64) error {
	return s.aliasRepo.Delete(ctx, id)
}
