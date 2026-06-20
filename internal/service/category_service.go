package service

import (
	"context"
	"fmt"
	"github.com/rdd/cnalias/internal/model"
	"github.com/rdd/cnalias/internal/repository"
)

// CategoryService 分类服务接口
type CategoryService interface {
	List(ctx context.Context, parentID *int64) ([]model.CategoryResponse, error)
	GetByID(ctx context.Context, id int64) (*model.CategoryResponse, error)
	GetTree(ctx context.Context) ([]model.CategoryResponse, error)
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
