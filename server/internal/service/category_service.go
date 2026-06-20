package service

import (
	"context"
	"fmt"
	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/repository"
)

// CategoryService 分类服务接口
type CategoryService interface {
	List(ctx context.Context, parentID *int64) ([]model.CategoryResponse, error)
	GetByID(ctx context.Context, id int64) (*model.CategoryResponse, error)
	GetTree(ctx context.Context) ([]model.CategoryResponse, error)
	Create(ctx context.Context, req *model.CategoryCreateRequest) (*model.CategoryResponse, error)
	Update(ctx context.Context, id int64, req *model.CategoryUpdateRequest) (*model.CategoryResponse, error)
	Delete(ctx context.Context, id int64) error
}

type categoryService struct {
	categoryRepo repository.CategoryRepository
}

func NewCategoryService(categoryRepo repository.CategoryRepository) CategoryService {
	return &categoryService{categoryRepo: categoryRepo}
}

func (s *categoryService) List(ctx context.Context, parentID *int64) ([]model.CategoryResponse, error) {
	categories, err := s.categoryRepo.FindByParentID(ctx, parentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list categories: %w", err)
	}

	// 转换为响应格式
	responses := make([]model.CategoryResponse, len(categories))
	for i, category := range categories {
		responses[i] = *category.ToResponse()
	}

	return responses, nil
}

func (s *categoryService) GetByID(ctx context.Context, id int64) (*model.CategoryResponse, error) {
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	return category.ToResponse(), nil
}

func (s *categoryService) GetTree(ctx context.Context) ([]model.CategoryResponse, error) {
	// 获取所有顶级分类
	categories, err := s.categoryRepo.FindByParentID(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get category tree: %w", err)
	}

	// 转换为响应格式
	responses := make([]model.CategoryResponse, len(categories))
	for i, category := range categories {
		resp := category.ToResponse()
		// 可以递归加载子分类，这里先设为空
		resp.Children = []model.CategoryResponse{}
		responses[i] = *resp
	}

	return responses, nil
}

func (s *categoryService) Create(ctx context.Context, req *model.CategoryCreateRequest) (*model.CategoryResponse, error) {
	category := &model.Category{
		Name:      req.Name,
		ParentID:  req.ParentID,
		Icon:      req.Icon,
		SortOrder: req.SortOrder,
	}

	err := s.categoryRepo.Create(ctx, category)
	if err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	return category.ToResponse(), nil
}

func (s *categoryService) Update(ctx context.Context, id int64, req *model.CategoryUpdateRequest) (*model.CategoryResponse, error) {
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	if req.Name != nil {
		category.Name = *req.Name
	}
	if req.ParentID != nil {
		category.ParentID = req.ParentID
	}
	if req.Icon != nil {
		category.Icon = *req.Icon
	}
	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}

	err = s.categoryRepo.Update(ctx, category)
	if err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}

	return category.ToResponse(), nil
}

func (s *categoryService) Delete(ctx context.Context, id int64) error {
	_, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("category not found: %w", err)
	}

	return s.categoryRepo.Delete(ctx, id)
}
