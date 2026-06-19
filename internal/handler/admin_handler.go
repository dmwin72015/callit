package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/internal/model"
	"github.com/rdd/cnalias/internal/service"
)

type AdminHandler struct {
	reviewService service.ReviewService
	itemService   service.ItemService
}

func NewAdminHandler(reviewService service.ReviewService, itemService service.ItemService) *AdminHandler {
	return &AdminHandler{
		reviewService: reviewService,
		itemService:   itemService,
	}
}

func (h *AdminHandler) GetReviewQueue(c *gin.Context) {
	Success(c, gin.H{"message": "review queue"})
}

func (h *AdminHandler) ApproveAlias(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	reviewerID, _ := c.Get("user_id")

	var req model.ReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	err := h.reviewService.Approve(c.Request.Context(), id, reviewerID.(int64), req.Note)
	if err != nil {
		InternalError(c, "approval failed")
		return
	}

	Success(c, gin.H{"message": "approved"})
}

func (h *AdminHandler) RejectAlias(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	reviewerID, _ := c.Get("user_id")

	var req model.ReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	err := h.reviewService.Reject(c.Request.Context(), id, reviewerID.(int64), req.Note)
	if err != nil {
		InternalError(c, "rejection failed")
		return
	}

	Success(c, gin.H{"message": "rejected"})
}

func (h *AdminHandler) GetStats(c *gin.Context) {
	Success(c, gin.H{
		"total_items":     0,
		"total_aliases":   0,
		"pending_reviews": 0,
		"total_users":     0,
	})
}
