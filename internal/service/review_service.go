package service

import (
	"context"
	"github.com/rdd/cnalias/internal/model"
	"github.com/rdd/cnalias/internal/repository"
)

type ReviewService interface {
	GetReviewQueue(ctx context.Context, page, pageSize int) ([]model.Alias, int64, error)
	Approve(ctx context.Context, id int64, reviewerID int64, note string) error
	Reject(ctx context.Context, id int64, reviewerID int64, note string) error
}

type reviewService struct {
	aliasRepo   repository.AliasRepository
	reviewRepo  repository.ReviewLogRepository
}

func NewReviewService(aliasRepo repository.AliasRepository, reviewRepo repository.ReviewLogRepository) ReviewService {
	return &reviewService{
		aliasRepo:  aliasRepo,
		reviewRepo: reviewRepo,
	}
}

func (s *reviewService) GetReviewQueue(ctx context.Context, page, pageSize int) ([]model.Alias, int64, error) {
	offset := (page - 1) * pageSize
	aliases, err := s.aliasRepo.FindPending(ctx, offset, pageSize)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.aliasRepo.GetPendingCount(ctx)
	if err != nil {
		return nil, 0, err
	}

	return aliases, total, nil
}

func (s *reviewService) Approve(ctx context.Context, id int64, reviewerID int64, note string) error {
	err := s.aliasRepo.UpdateStatus(ctx, id, model.AliasStatusApproved, reviewerID, note)
	if err != nil {
		return err
	}

	// 记录审核日志
	log := &model.ReviewLog{
		AliasID:    id,
		ReviewerID: reviewerID,
		Action:    model.ReviewActionApprove,
		Note:      note,
	}
	return s.reviewRepo.Create(ctx, log)
}

func (s *reviewService) Reject(ctx context.Context, id int64, reviewerID int64, note string) error {
	err := s.aliasRepo.UpdateStatus(ctx, id, model.AliasStatusRejected, reviewerID, note)
	if err != nil {
		return err
	}

	log := &model.ReviewLog{
		AliasID:    id,
		ReviewerID: reviewerID,
		Action:    model.ReviewActionReject,
		Note:      note,
	}
	return s.reviewRepo.Create(ctx, log)
}
