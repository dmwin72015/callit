package handler

// @title           cnalias API
// @version         1.0.0
// @description     中国地区叫法对比平台 API
// @termsOfService  http://cnalias.com/terms/

// @contact.name   API Support
// @contact.email  support@cnalias.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

import (
	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/internal/model"
	"github.com/rdd/cnalias/internal/service"
)

// AuthHandler handles authentication-related requests
type AuthHandler struct {
	userService service.UserService
}

func NewAuthHandler(userService service.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

// Register godoc
// @Summary      Register a new user
// @Description  Register a new user account
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body model.UserRegisterRequest true "Registration request"
// @Success      201 {object} Response{data=model.UserResponse}
// @Failure      400 {object} Response
// @Failure      409 {object} Response
// @Router       /auth/register [post]
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

// Login godoc
// @Summary      User login
// @Description  Login with email and password to get access tokens
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body model.UserLoginRequest true "Login credentials"
// @Success      200 {object} Response{data=map[string]string}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Router       /auth/login [post]
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

// Refresh godoc
// @Summary      Refresh access token
// @Description  Get a new access token using refresh token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body object{refresh_token=string} true "Refresh token"
// @Success      200 {object} Response{data=map[string]string}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Router       /auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
	InternalError(c, "not implemented")
}
