package service

import (
	"context"
	"fmt"
	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/repository"
)

// RegionService 地区服务接口
type RegionService interface {
	List(ctx context.Context, regionType *model.RegionType, parentID *int64) ([]model.RegionResponse, error)
	GetByID(ctx context.Context, id int64) (*model.RegionResponse, error)
	GetTree(ctx context.Context, rootID *int64) ([]model.RegionResponse, error)
	Create(ctx context.Context, req *model.RegionCreateRequest) (*model.RegionResponse, error)
	Update(ctx context.Context, id int64, req *model.RegionUpdateRequest) (*model.RegionResponse, error)
	Delete(ctx context.Context, id int64) error
}

type regionService struct {
	regionRepo repository.RegionRepository
}

func NewRegionService(regionRepo repository.RegionRepository) RegionService {
	return &regionService{regionRepo: regionRepo}
}

func (s *regionService) List(ctx context.Context, regionType *model.RegionType, parentID *int64) ([]model.RegionResponse, error) {
	var regions []model.Region
	var err error

	if regionType != nil {
		regions, err = s.regionRepo.FindByType(ctx, *regionType)
	} else if parentID != nil {
		regions, err = s.regionRepo.FindChildren(ctx, *parentID)
	} else {
		regions, err = s.regionRepo.GetAll(ctx)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to list regions: %w", err)
	}

	// 转换为响应格式
	responses := make([]model.RegionResponse, len(regions))
	for i, region := range regions {
		responses[i] = *region.ToResponse()
	}

	return responses, nil
}

func (s *regionService) GetByID(ctx context.Context, id int64) (*model.RegionResponse, error) {
	region, err := s.regionRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("region not found: %w", err)
	}

	return region.ToResponse(), nil
}

func (s *regionService) GetTree(ctx context.Context, rootID *int64) ([]model.RegionResponse, error) {
	var rootRegions []model.Region
	var err error

	if rootID != nil {
		// 获取指定节点的子节点
		rootRegions, err = s.regionRepo.FindChildren(ctx, *rootID)
	} else {
		// 获取所有地区并过滤出顶级节点
		allRegions, err := s.regionRepo.GetAll(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to get regions: %w", err)
		}
		// 过滤出顶级节点
		var topLevel []model.Region
		for _, r := range allRegions {
			if r.ParentID == nil {
				topLevel = append(topLevel, r)
			}
		}
		rootRegions = topLevel
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get region tree: %w", err)
	}

	// 构建树形结构
	responses := make([]model.RegionResponse, 0, len(rootRegions))
	for _, region := range rootRegions {
		resp := region.ToResponse()
		resp.Children = []model.RegionResponse{}
		responses = append(responses, *resp)
	}

	return responses, nil
}

func (s *regionService) Create(ctx context.Context, req *model.RegionCreateRequest) (*model.RegionResponse, error) {
	region := &model.Region{
		Name:       req.Name,
		ParentID:   req.ParentID,
		RegionType: req.RegionType,
		Code:       req.Code,
		SortOrder:  req.SortOrder,
	}

	err := s.regionRepo.Create(ctx, region)
	if err != nil {
		return nil, fmt.Errorf("failed to create region: %w", err)
	}

	return region.ToResponse(), nil
}

func (s *regionService) Update(ctx context.Context, id int64, req *model.RegionUpdateRequest) (*model.RegionResponse, error) {
	region, err := s.regionRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("region not found: %w", err)
	}

	if req.Name != nil {
		region.Name = *req.Name
	}
	if req.ParentID != nil {
		region.ParentID = req.ParentID
	}
	if req.RegionType != nil {
		region.RegionType = *req.RegionType
	}
	if req.Code != nil {
		region.Code = *req.Code
	}
	if req.SortOrder != nil {
		region.SortOrder = *req.SortOrder
	}

	err = s.regionRepo.Update(ctx, region)
	if err != nil {
		return nil, fmt.Errorf("failed to update region: %w", err)
	}

	return region.ToResponse(), nil
}

func (s *regionService) Delete(ctx context.Context, id int64) error {
	_, err := s.regionRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("region not found: %w", err)
	}

	return s.regionRepo.Delete(ctx, id)
}
