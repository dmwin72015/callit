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

// GetReviewQueue godoc
// @Summary      Get review queue
// @Description  Get list of pending aliases for review (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        status   query   string false "Filter by status"  Enums(PENDING, APPROVED, REJECTED)
// @Param        page     query   int    false "Page number"        default(1)
// @Param        page_size query  int    false "Page size"           default(20)
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/review-queue [get]
func (h *AdminHandler) GetReviewQueue(c *gin.Context) {
	Success(c, gin.H{"message": "review queue"})
}

// ApproveAlias godoc
// @Summary      Approve an alias submission
// @Description  Approve a pending alias submission (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      int64  true  "Alias ID"
// @Param        request body object{note=string} false "Review note"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/aliases/{id}/approve [post]
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

// RejectAlias godoc
// @Summary      Reject an alias submission
// @Description  Reject a pending alias submission (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      int64  true  "Alias ID"
// @Param        request body object{note=string} false "Rejection reason"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/aliases/{id}/reject [post]
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

// GetStats godoc
// @Summary      Get platform statistics
// @Description  Get overview statistics about the platform (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/stats [get]
func (h *AdminHandler) GetStats(c *gin.Context) {
	Success(c, gin.H{
		"total_items":     0,
		"total_aliases":   0,
		"pending_reviews": 0,
		"total_users":     0,
	})
}
