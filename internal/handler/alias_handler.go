package handler

// @title           cnalias API
// @version         1.0.0
// @description     中国地区叫法对比平台 API
// @termsOfService  http://cnalias.com/terms/

// @contact.name   API Support
// @contact.email  support@cnalias.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8081
// @BasePath  /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/internal/model"
	"github.com/rdd/cnalias/internal/service"
)

type AliasHandler struct {
	aliasService service.AliasService
}

func NewAliasHandler(aliasService service.AliasService) *AliasHandler {
	return &AliasHandler{aliasService: aliasService}
}

// SubmitAlias godoc
// @Summary      Submit a new alias
// @Description  Submit a new regional alias for an item (requires authentication)
// @Tags         aliases
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body model.AliasRequest true "Alias submission"
// @Success      201 {object} Response{data=model.AliasResponse}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      409 {object} Response
// @Router       /aliases [post]
func (h *AliasHandler) Submit(c *gin.Context) {
	var req model.AliasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	userIDAny, _ := c.Get("user_id")
	var userID *int64
	if userIDAny != nil {
		if uid, ok := userIDAny.(int64); ok {
			userID = &uid
		}
	}

	alias, err := h.aliasService.Submit(c.Request.Context(), &req, userID)
	if err != nil {
		if err.Error() == "alias already exists" {
			Conflict(c, err.Error())
			return
		}
		InternalError(c, "submission failed")
		return
	}

	Created(c, alias)
}

// AnonymousSubmitAlias godoc
// @Summary      Submit alias anonymously
// @Description  Submit a new regional alias without authentication (requires review)
// @Tags         aliases
// @Accept       json
// @Produce      json
// @Param        request body model.AnonymousAliasRequest true "Anonymous alias submission"
// @Success      201 {object} Response{data=model.AliasResponse}
// @Failure      400 {object} Response
// @Failure      409 {object} Response
// @Router       /aliases/anonymous [post]
func (h *AliasHandler) AnonymousSubmit(c *gin.Context) {
	var req model.AnonymousAliasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	alias, err := h.aliasService.SubmitAnonymous(c.Request.Context(), &req)
	if err != nil {
		if err.Error() == "alias already exists" {
			Conflict(c, err.Error())
			return
		}
		InternalError(c, "submission failed")
		return
	}

	Created(c, alias)
}

// GetMySubmissions godoc
// @Summary      Get user's submissions
// @Description  Get list of aliases submitted by the current user
// @Tags         aliases
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200 {object} Response{data=[]model.AliasResponse}
// @Failure      401 {object} Response
// @Router       /aliases/my-submissions [get]
func (h *AliasHandler) GetMySubmissions(c *gin.Context) {
	userIDAny, exists := c.Get("user_id")
	if !exists || userIDAny == nil {
		Unauthorized(c, "user not authenticated")
		return
	}

	userID, ok := userIDAny.(int64)
	if !ok {
		InternalError(c, "invalid user id")
		return
	}

	submissions, err := h.aliasService.GetUserSubmissions(c.Request.Context(), userID)
	if err != nil {
		InternalError(c, "failed to get submissions")
		return
	}

	Success(c, submissions)
}

// SearchByAlias godoc
// @Summary      Search aliases
// @Description  Search for items and aliases by keyword
// @Tags         aliases
// @Accept       json
// @Produce      json
// @Param        q         query   string true  "Search keyword"
// @Param        region_id query   int64 false "Filter by region ID"
// @Success      200 {object} []map[string]interface{}
// @Failure      400 {object} Response
// @Router       /aliases/search [get]
func (h *AliasHandler) SearchByAlias(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		BadRequest(c, "query parameter 'q' is required")
		return
	}

	regionIDStr := c.Query("region_id")
	var regionID *int64
	if regionIDStr != "" {
		id, err := strconv.ParseInt(regionIDStr, 10, 64)
		if err != nil {
			BadRequest(c, "invalid region_id")
			return
		}
		regionID = &id
	}

	results, err := h.aliasService.Search(c.Request.Context(), q, regionID)
	if err != nil {
		InternalError(c, "search failed")
		return
	}

	Success(c, results)
}
