package handler

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

func (h *AliasHandler) GetMySubmissions(c *gin.Context) {
	userID, _ := c.Get("user_id")
	_ = userID

	InternalError(c, "not implemented")
}

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
