package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/repository"
	"github.com/rdd/cnalias/server/internal/pkg"
)

type UserService interface {
	Register(ctx context.Context, req *model.UserRegisterRequest) (*model.UserResponse, error)
	Login(ctx context.Context, req *model.UserLoginRequest) (string, string, error)
	LoginWithUser(ctx context.Context, req *model.UserLoginRequest) (*model.User, string, string, error)
	RefreshToken(ctx context.Context, refreshToken string) (string, string, error)
	GetByID(ctx context.Context, id int64) (*model.User, error)
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) Register(ctx context.Context, req *model.UserRegisterRequest) (*model.UserResponse, error) {
	exists, _ := s.userRepo.ExistsByUsername(ctx, req.Username)
	if exists {
		return nil, errors.New("username already taken")
	}

	exists, _ = s.userRepo.ExistsByEmail(ctx, req.Email)
	if exists {
		return nil, errors.New("email already registered")
	}

	hash, err := pkg.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &model.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hash,
		Role:         "USER",
		IsVerified:   false,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user.ToResponse(), nil
}

func (s *userService) Login(ctx context.Context, req *model.UserLoginRequest) (string, string, error) {
	_, accessToken, refreshToken, err := s.LoginWithUser(ctx, req)
	return accessToken, refreshToken, err
}

func (s *userService) LoginWithUser(ctx context.Context, req *model.UserLoginRequest) (*model.User, string, string, error) {
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, "", "", errors.New("invalid email or password")
	}

	if err := pkg.ComparePassword(user.PasswordHash, req.Password); err != nil {
		return nil, "", "", errors.New("invalid email or password")
	}

	accessToken, err := pkg.GenerateAccessToken(user)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := pkg.GenerateRefreshToken(user)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return user, accessToken, refreshToken, nil
}

func (s *userService) GetByID(ctx context.Context, id int64) (*model.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

func (s *userService) RefreshToken(ctx context.Context, refreshTokenStr string) (string, string, error) {
	accessToken, newRefreshToken, err := pkg.RefreshToken(refreshTokenStr)
	if err != nil {
		return "", "", fmt.Errorf("failed to refresh token: %w", err)
	}

	return accessToken, newRefreshToken, nil
}
