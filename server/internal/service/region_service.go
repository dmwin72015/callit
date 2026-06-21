package service

import (
	"context"
	"fmt"

	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/repository"
)

// RegionService 地区服务接口
type RegionService interface {
	List(ctx context.Context, regionType *model.RegionType, parentID *int64, page, pageSize int) ([]model.RegionResponse, int64, error)
	GetByID(ctx context.Context, id int64) (*model.RegionResponse, error)
	GetTree(ctx context.Context, rootID *int64, rootType *model.RegionType, maxDepth int) ([]model.RegionResponse, error)
	SearchByCode(ctx context.Context, code string) (*model.RegionResponse, error)
	SearchByName(ctx context.Context, keyword string, limit int) ([]model.RegionResponse, error)
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

func (s *regionService) List(ctx context.Context, regionType *model.RegionType, parentID *int64, page, pageSize int) ([]model.RegionResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	regions, total, err := s.regionRepo.Paginate(ctx, regionType, parentID, page, pageSize)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list regions: %w", err)
	}

	responses := make([]model.RegionResponse, len(regions))
	for i, region := range regions {
		responses[i] = *region.ToResponse()
	}
	return responses, total, nil
}

func (s *regionService) GetByID(ctx context.Context, id int64) (*model.RegionResponse, error) {
	region, err := s.regionRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("region not found: %w", err)
	}
	return region.ToResponse(), nil
}

func (s *regionService) GetTree(ctx context.Context, rootID *int64, rootType *model.RegionType, maxDepth int) ([]model.RegionResponse, error) {
	return s.GetTreeWithDepth(ctx, rootID, rootType, maxDepth)
}

func (s *regionService) GetTreeWithDepth(ctx context.Context, rootID *int64, rootType *model.RegionType, maxDepth int) ([]model.RegionResponse, error) {
	nodes, err := s.regionRepo.FindTree(ctx, rootID, rootType, maxDepth)
	if err != nil {
		return nil, err
	}

	if len(nodes) == 0 {
		return []model.RegionResponse{}, nil
	}

	return s.assembleTree(nodes), nil
}

func (s *regionService) assembleTree(nodes []model.RegionTreeNode) []model.RegionResponse {
	byParent := make(map[int64][]model.RegionTreeNode)
	var roots []model.RegionTreeNode

	for i := range nodes {
		node := &nodes[i]
		if node.Depth == 1 {
			roots = append(roots, *node)
		} else if node.ParentID != nil {
			byParent[*node.ParentID] = append(byParent[*node.ParentID], *node)
		}
	}

	return s.buildResponses(roots, byParent)
}

func (s *regionService) buildResponses(nodes []model.RegionTreeNode, byParent map[int64][]model.RegionTreeNode) []model.RegionResponse {
	result := make([]model.RegionResponse, 0, len(nodes))
	for _, node := range nodes {
		resp := model.RegionResponse{
			ID:         node.ID,
			Name:       node.Name,
			ParentID:   node.ParentID,
			RegionType: node.RegionType,
			Code:       node.Code,
			SortOrder:  node.SortOrder,
			Latitude:   node.Latitude,
			Longitude:  node.Longitude,
			PostalCode: node.PostalCode,
			AreaCode:   node.AreaCode,
		}
		children := byParent[node.ID]
		if len(children) > 0 {
			resp.Children = s.buildResponses(children, byParent)
		}
		result = append(result, resp)
	}
	return result
}

func (s *regionService) SearchByCode(ctx context.Context, code string) (*model.RegionResponse, error) {
	region, err := s.regionRepo.FindByCode(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("region not found: %w", err)
	}
	return region.ToResponse(), nil
}

func (s *regionService) SearchByName(ctx context.Context, keyword string, limit int) ([]model.RegionResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	regions, err := s.regionRepo.SearchByName(ctx, keyword, limit)
	if err != nil {
		return nil, fmt.Errorf("search regions: %w", err)
	}

	responses := make([]model.RegionResponse, len(regions))
	for i, r := range regions {
		responses[i] = *r.ToResponse()
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
		Latitude:   req.Latitude,
		Longitude:  req.Longitude,
		PostalCode: req.PostalCode,
		AreaCode:   req.AreaCode,
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
	if req.Latitude != nil {
		region.Latitude = req.Latitude
	}
	if req.Longitude != nil {
		region.Longitude = req.Longitude
	}
	if req.PostalCode != nil {
		region.PostalCode = req.PostalCode
	}
	if req.AreaCode != nil {
		region.AreaCode = req.AreaCode
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
