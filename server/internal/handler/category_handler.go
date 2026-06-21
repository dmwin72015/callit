package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/service"
)

// CategoryHandler 分类处理器
type CategoryHandler struct {
	categoryService service.CategoryService
}

func NewCategoryHandler(categoryService service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: categoryService}
}

// ListCategories godoc
// @Summary      List categories
// @Description  Get list of categories with optional parent filter
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        parent_id query int64 false "Filter by parent category ID"
// @Success      200 {object} Response{data=[]model.CategoryResponse}
// @Failure      400 {object} Response
// @Failure      500 {object} Response
// @Router       /categories [get]
func (h *CategoryHandler) List(c *gin.Context) {
	var parentID *int64
	if pid := c.Query("parentId"); pid != "" {
		id, err := strconv.ParseInt(pid, 10, 64)
		if err != nil {
			BadRequest(c, "invalid parentId")
			return
		}
		parentID = &id
	}

	categories, err := h.categoryService.List(c.Request.Context(), parentID)
	if err != nil {
		InternalError(c, "failed to fetch categories")
		return
	}

	// 类型断言以确保使用 model.CategoryResponse
	_ = make([]model.CategoryResponse, 0)

	Success(c, categories)
}

// GetCategoryByID godoc
// @Summary      Get category by ID
// @Description  Get detailed information about a specific category
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id   path      int64  true  "Category ID"
// @Success      200 {object} Response{data=model.CategoryResponse}
// @Failure      400 {object} Response
// @Failure      404 {object} Response
// @Router       /categories/{id} [get]
func (h *CategoryHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid category id")
		return
	}

	category, err := h.categoryService.GetByID(c.Request.Context(), id)
	if err != nil {
		NotFound(c, "category not found")
		return
	}

	Success(c, category)
}

// GetCategoryTree godoc
// @Summary      Get category tree
// @Description  Get hierarchical category tree structure
// @Tags         categories
// @Accept       json
// @Produce      json
// @Success      200 {object} Response{data=[]model.CategoryResponse}
// @Failure      500 {object} Response
// @Router       /categories/tree [get]
func (h *CategoryHandler) GetTree(c *gin.Context) {
	tree, err := h.categoryService.GetTree(c.Request.Context())
	if err != nil {
		InternalError(c, "failed to get category tree")
		return
	}

	Success(c, tree)
}
