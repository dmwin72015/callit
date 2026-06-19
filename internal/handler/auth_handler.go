package handler

import (

	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/internal/model"
	"github.com/rdd/cnalias/internal/service"
)

type AuthHandler struct {
	userService service.UserService
}

func NewAuthHandler(userService service.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req model.UserRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	user, err := h.userService.Register(c.Request.Context(), &req)
	if err != nil {
		if err.Error() == "username already taken" || err.Error() == "email already registered" {
			Conflict(c, err.Error())
			return
		}
		InternalError(c, "registration failed")
		return
	}

	Created(c, user)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req model.UserLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	accessToken, refreshToken, err := h.userService.Login(c.Request.Context(), &req)
	if err != nil {
		Unauthorized(c, "invalid email or password")
		return
	}

	Success(c, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"expires_in":    900,
	})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	InternalError(c, "not implemented")
}
