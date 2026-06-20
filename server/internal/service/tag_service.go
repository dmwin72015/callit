package service

import (
	"context"
	"fmt"
	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/repository"
)

// TagService 标签服务接口
type TagService interface {
	List(ctx context.Context) ([]model.TagResponse, error)
	GetByID(ctx context.Context, id int64) (*model.TagResponse, error)
	Create(ctx context.Context, req *model.TagRequest) (*model.TagResponse, error)
	Update(ctx context.Context, id int64, req *model.TagRequest) (*model.TagResponse, error)
	Delete(ctx context.Context, id int64) error
	Search(ctx context.Context, query string) ([]model.TagResponse, error)
}

type tagService struct {
	tagRepo repository.TagRepository
}

func NewTagService(tagRepo repository.TagRepository) TagService {
	return &tagService{tagRepo: tagRepo}
}

func (s *tagService) List(ctx context.Context) ([]model.TagResponse, error) {
	tags, err := s.tagRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list tags: %w", err)
	}

	responses := make([]model.TagResponse, len(tags))
	for i, tag := range tags {
		responses[i] = *tag.ToResponse()
	}

	return responses, nil
}

func (s *tagService) GetByID(ctx context.Context, id int64) (*model.TagResponse, error) {
	tag, err := s.tagRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("tag not found: %w", err)
	}

	return tag.ToResponse(), nil
}

func (s *tagService) Create(ctx context.Context, req *model.TagRequest) (*model.TagResponse, error) {
	// 检查名称是否已存在
	_, err := s.tagRepo.FindByName(ctx, req.Name)
	if err == nil {
		return nil, fmt.Errorf("tag with this name already exists")
	}

	tag := &model.Tag{
		Name:  req.Name,
		Color: req.Color,
	}

	if err := s.tagRepo.Create(ctx, tag); err != nil {
		return nil, fmt.Errorf("failed to create tag: %w", err)
	}

	return tag.ToResponse(), nil
}

func (s *tagService) Update(ctx context.Context, id int64, req *model.TagRequest) (*model.TagResponse, error) {
	tag, err := s.tagRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("tag not found: %w", err)
	}

	// 如果名称变更，检查新名称是否已被使用
	if req.Name != tag.Name {
		existing, err := s.tagRepo.FindByName(ctx, req.Name)
		if err == nil && existing.ID != id {
			return nil, fmt.Errorf("tag with this name already exists")
		}
	}

	tag.Name = req.Name
	tag.Color = req.Color

	if err := s.tagRepo.Update(ctx, tag); err != nil {
		return nil, fmt.Errorf("failed to update tag: %w", err)
	}

	return tag.ToResponse(), nil
}

func (s *tagService) Delete(ctx context.Context, id int64) error {
	_, err := s.tagRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("tag not found: %w", err)
	}

	return s.tagRepo.Delete(ctx, id)
}

func (s *tagService) Search(ctx context.Context, query string) ([]model.TagResponse, error) {
	tags, err := s.tagRepo.Search(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	responses := make([]model.TagResponse, len(tags))
	for i, tag := range tags {
		responses[i] = *tag.ToResponse()
	}

	return responses, nil
}
