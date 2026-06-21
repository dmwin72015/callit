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
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/service"
)

type AdminHandler struct {
	reviewService   service.ReviewService
	itemService     service.ItemService
	categoryService service.CategoryService
	regionService   service.RegionService
	tagService     service.TagService
	userService    service.UserService
	aliasService   service.AliasService
}

func NewAdminHandler(
	reviewService service.ReviewService,
	itemService service.ItemService,
	categoryService service.CategoryService,
	regionService service.RegionService,
	tagService service.TagService,
	userService service.UserService,
	aliasService service.AliasService,
) *AdminHandler {
	return &AdminHandler{
		reviewService:   reviewService,
		itemService:     itemService,
		categoryService: categoryService,
		regionService:   regionService,
		tagService:     tagService,
		userService:    userService,
		aliasService:    aliasService,
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
		"totalItems":     0,
		"totalAliases":   0,
		"pendingReviews": 0,
		"totalUsers":     0,
	})
}

// ========== 别名管理 ==========

// AdminListAliases godoc
// @Summary      Admin list aliases
// @Description  Get paginated list of aliases (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        status   query   string false "Filter by status" Enums(PENDING, APPROVED, REJECTED)
// @Param        page     query   int    false "Page number"    default(1)
// @Param        page_size query  int    false "Page size"       default(20)
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/aliases [get]
func (h *AdminHandler) AdminListAliases(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	statusStr := c.Query("status")

	var status *model.AliasStatus
	if statusStr != "" {
		s := model.AliasStatus(statusStr)
		status = &s
	}

	aliases, total, err := h.aliasService.AdminList(c.Request.Context(), page, pageSize, status)
	if err != nil {
		InternalError(c, "failed to fetch aliases")
		return
	}

	Success(c, gin.H{
		"items":        aliases,
		"page":        page,
		"pageSize":   pageSize,
		"total":       total,
	})
}

// AdminGetAlias godoc
// @Summary      Admin get alias by ID
// @Description  Get alias details (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Alias ID"
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/aliases/{id} [get]
func (h *AdminHandler) AdminGetAlias(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid alias id")
		return
	}

	alias, err := h.aliasService.AdminGet(c.Request.Context(), id)
	if err != nil {
		NotFound(c, "alias not found")
		return
	}

	Success(c, alias)
}

// AdminCreateAlias godoc
// @Summary      Admin create alias
// @Description  Create a new alias (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body model.AdminAliasCreateRequest true "Alias data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/aliases [post]
func (h *AdminHandler) AdminCreateAlias(c *gin.Context) {
	var req model.AdminAliasCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	alias, err := h.aliasService.AdminCreate(c.Request.Context(), &req)
	if err != nil {
		InternalError(c, "failed to create alias: "+err.Error())
		return
	}

	Created(c, alias)
}

// AdminUpdateAlias godoc
// @Summary      Admin update alias
// @Description  Update an existing alias (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path      int64                true  "Alias ID"
// @Param        request body model.AdminAliasUpdateRequest true "Alias data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/aliases/{id} [put]
func (h *AdminHandler) AdminUpdateAlias(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid alias id")
		return
	}

	var req model.AdminAliasUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	alias, err := h.aliasService.AdminUpdate(c.Request.Context(), id, &req)
	if err != nil {
		InternalError(c, "failed to update alias: "+err.Error())
		return
	}

	Success(c, alias)
}

// AdminDeleteAlias godoc
// @Summary      Admin delete alias
// @Description  Delete an alias (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Alias ID"
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/aliases/{id} [delete]
func (h *AdminHandler) AdminDeleteAlias(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid alias id")
		return
	}

	if err := h.aliasService.AdminDelete(c.Request.Context(), id); err != nil {
		InternalError(c, "failed to delete alias")
		return
	}

	Success(c, gin.H{"message": "deleted"})
}

// ========== 物品管理 ==========

// AdminListItems godoc
// @Summary      Admin list items
// @Description  Get paginated list of items (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page        query   int    false "Page number"    default(1)
// @Param        page_size   query   int    false "Page size"       default(20)
// @Param        category_id query   int64  false "Category ID"
// @Param        search      query   string false "Search keyword"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/items [get]
func (h *AdminHandler) AdminListItems(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	categoryIDStr := c.Query("categoryId")
	search := c.Query("search")

	var categoryID *int64
	if categoryIDStr != "" {
		id, err := strconv.ParseInt(categoryIDStr, 10, 64)
		if err != nil {
			BadRequest(c, "invalid categoryId")
			return
		}
		categoryID = &id
	}

	opts := model.ItemListOptions{
		Page:       page,
		PageSize:   pageSize,
		CategoryID: categoryID,
		Search:     search,
		OrderBy:    c.DefaultQuery("orderBy", "name"),
	}

	items, err := h.itemService.List(c.Request.Context(), opts)
	if err != nil {
		InternalError(c, "failed to fetch items")
		return
	}

	Success(c, gin.H{
		"items":    items,
		"page":     page,
		"pageSize": pageSize,
	})
}

// AdminGetItem godoc
// @Summary      Admin get item by ID
// @Description  Get detailed item information (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Item ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/items/{id} [get]
func (h *AdminHandler) AdminGetItem(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid item id")
		return
	}

	item, err := h.itemService.GetByID(c.Request.Context(), id)
	if err != nil {
		NotFound(c, "item not found")
		return
	}

	Success(c, item)
}

// AdminCreateItem godoc
// @Summary      Admin create item
// @Description  Create a new item (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body model.ItemCreateRequest true "Item data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/items [post]
func (h *AdminHandler) AdminCreateItem(c *gin.Context) {
	var req model.ItemCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	item, err := h.itemService.Create(c.Request.Context(), &req)
	if err != nil {
		InternalError(c, "failed to create item")
		return
	}

	Created(c, item)
}

// AdminUpdateItem godoc
// @Summary      Admin update item
// @Description  Update an existing item (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path      int64                true  "Item ID"
// @Param        request body model.ItemUpdateRequest true "Item data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/items/{id} [put]
func (h *AdminHandler) AdminUpdateItem(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid item id")
		return
	}

	var req model.ItemUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	item, err := h.itemService.Update(c.Request.Context(), id, &req)
	if err != nil {
		InternalError(c, "failed to update item")
		return
	}

	Success(c, item)
}

// AdminDeleteItem godoc
// @Summary      Admin delete item
// @Description  Delete an item (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Item ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/items/{id} [delete]
func (h *AdminHandler) AdminDeleteItem(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid item id")
		return
	}

	err = h.itemService.Delete(c.Request.Context(), id)
	if err != nil {
		InternalError(c, "failed to delete item")
		return
	}

	Success(c, gin.H{
		"message": "deleted"})
}

// ========== 分类管理 ==========

// AdminListCategories godoc
// @Summary      Admin list categories
// @Description  Get paginated list of categories (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page     query   int    false "Page number"    default(1)
// @Param        page_size query  int    false "Page size"       default(20)
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/categories [get]
func (h *AdminHandler) AdminListCategories(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	parentIDStr := c.Query("parentId")
	var parentID *int64
	if parentIDStr != "" {
		id, err := strconv.ParseInt(parentIDStr, 10, 64)
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

	Success(c, gin.H{
		"items":     categories,
		"page":      page,
		"pageSize": pageSize,
	})
}

// AdminGetCategory godoc
// @Summary      Admin get category by ID
// @Description  Get category details (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Category ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/categories/{id} [get]
func (h *AdminHandler) AdminGetCategory(c *gin.Context) {
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

// AdminCreateCategory godoc
// @Summary      Admin create category
// @Description  Create a new category (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body model.CategoryCreateRequest true "Category data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/categories [post]
func (h *AdminHandler) AdminCreateCategory(c *gin.Context) {
	var req model.CategoryCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	category, err := h.categoryService.Create(c.Request.Context(), &req)
	if err != nil {
		InternalError(c, "failed to create category")
		return
	}

	Created(c, category)
}

// AdminUpdateCategory godoc
// @Summary      Admin update category
// @Description  Update an existing category (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path      int64                true  "Category ID"
// @Param        request body model.CategoryUpdateRequest true "Category data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/categories/{id} [put]
func (h *AdminHandler) AdminUpdateCategory(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid category id")
		return
	}

	var req model.CategoryUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	category, err := h.categoryService.Update(c.Request.Context(), id, &req)
	if err != nil {
		InternalError(c, "failed to update category")
		return
	}

	Success(c, category)
}

// AdminDeleteCategory godoc
// @Summary      Admin delete category
// @Description  Delete a category (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Category ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/categories/{id} [delete]
func (h *AdminHandler) AdminDeleteCategory(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid category id")
		return
	}

	err = h.categoryService.Delete(c.Request.Context(), id)
	if err != nil {
		InternalError(c, "failed to delete category")
		return
	}

	Success(c, gin.H{
		"message": "deleted"})
}

// ========== 地区管理 ==========

// AdminListRegions godoc
// @Summary      Admin list regions
// @Description  Get paginated list of regions (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page        query   int    false "Page number"    default(1)
// @Param        page_size   query   int    false "Page size"       default(20)
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/regions [get]
func (h *AdminHandler) AdminListRegions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	regionTypeStr := c.Query("regionType")
	var regionType *model.RegionType
	if regionTypeStr != "" {
		rt := model.RegionType(regionTypeStr)
		regionType = &rt
	}

	parentIDStr := c.Query("parentId")
	var parentID *int64
	if parentIDStr != "" {
		id, err := strconv.ParseInt(parentIDStr, 10, 64)
		if err != nil {
			BadRequest(c, "invalid parentId")
			return
		}
		parentID = &id
	}

	regions, total, err := h.regionService.List(c.Request.Context(), regionType, parentID, page, pageSize)
	if err != nil {
		InternalError(c, "failed to fetch regions")
		return
	}

	Success(c, gin.H{
		"items":      regions,
		"total":     total,
		"page":      page,
		"pageSize": pageSize,
	})
}

// AdminGetRegion godoc
// @Summary      Admin get region by ID
// @Description  Get region details (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Region ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/regions/{id} [get]
func (h *AdminHandler) AdminGetRegion(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid region id")
		return
	}

	region, err := h.regionService.GetByID(c.Request.Context(), id)
	if err != nil {
		NotFound(c, "region not found")
		return
	}

	Success(c, region)
}

// AdminCreateRegion godoc
// @Summary      Admin create region
// @Description  Create a new region (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body model.RegionCreateRequest true "Region data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/regions [post]
func (h *AdminHandler) AdminCreateRegion(c *gin.Context) {
	var req model.RegionCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	region, err := h.regionService.Create(c.Request.Context(), &req)
	if err != nil {
		InternalError(c, "failed to create region")
		return
	}

	Created(c, region)
}

// AdminUpdateRegion godoc
// @Summary      Admin update region
// @Description  Update an existing region (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path      int64                true  "Region ID"
// @Param        request body model.RegionUpdateRequest true "Region data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/regions/{id} [put]
func (h *AdminHandler) AdminUpdateRegion(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid region id")
		return
	}

	var req model.RegionUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	region, err := h.regionService.Update(c.Request.Context(), id, &req)
	if err != nil {
		InternalError(c, "failed to update region")
		return
	}

	Success(c, region)
}

// AdminDeleteRegion godoc
// @Summary      Admin delete region
// @Description  Delete a region (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Region ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/regions/{id} [delete]
func (h *AdminHandler) AdminDeleteRegion(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid region id")
		return
	}

	err = h.regionService.Delete(c.Request.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			NotFound(c, "region not found")
			return
		}
		InternalError(c, "failed to delete region")
		return
	}

	Success(c, gin.H{"message": "deleted"})
}

// ========== 标签管理 ==========

// AdminListTags godoc
// @Summary      Admin list tags
// @Description  Get paginated list of tags (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page     query   int    false "Page number"    default(1)
// @Param        page_size query  int    false "Page size"       default(20)
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/tags [get]
func (h *AdminHandler) AdminListTags(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	tags, err := h.tagService.List(c.Request.Context())
	if err != nil {
		InternalError(c, "failed to fetch tags")
		return
	}

	Success(c, gin.H{
		"items":     tags,
		"page":      page,
		"pageSize": pageSize,
	})
}

// AdminGetTag godoc
// @Summary      Admin get tag by ID
// @Description  Get tag details (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Tag ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/tags/{id} [get]
func (h *AdminHandler) AdminGetTag(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid tag id")
		return
	}

	tag, err := h.tagService.GetByID(c.Request.Context(), id)
	if err != nil {
		NotFound(c, "tag not found")
		return
	}

	Success(c, tag)
}

// AdminCreateTag godoc
// @Summary      Admin create tag
// @Description  Create a new tag (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body model.TagRequest true "Tag data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/tags [post]
func (h *AdminHandler) AdminCreateTag(c *gin.Context) {
	var req model.TagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	tag, err := h.tagService.Create(c.Request.Context(), &req)
	if err != nil {
		InternalError(c, "failed to create tag")
		return
	}

	Created(c, tag)
}

// AdminUpdateTag godoc
// @Summary      Admin update tag
// @Description  Update an existing tag (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path      int64            true  "Tag ID"
// @Param        request body model.TagRequest true "Tag data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/tags/{id} [put]
func (h *AdminHandler) AdminUpdateTag(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid tag id")
		return
	}

	var req model.TagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	tag, err := h.tagService.Update(c.Request.Context(), id, &req)
	if err != nil {
		InternalError(c, "failed to update tag")
		return
	}

	Success(c, tag)
}

// AdminDeleteTag godoc
// @Summary      Admin delete tag
// @Description  Delete a tag (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "Tag ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/tags/{id} [delete]
func (h *AdminHandler) AdminDeleteTag(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid tag id")
		return
	}

	err = h.tagService.Delete(c.Request.Context(), id)
	if err != nil {
		InternalError(c, "failed to delete tag")
		return
	}

	Success(c, gin.H{
		"message": "deleted"})
}

// ========== 用户管理 ==========

// AdminListUsers godoc
// @Summary      Admin list users
// @Description  Get paginated list of users (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page     query   int    false "Page number"    default(1)
// @Param        page_size query  int    false "Page size"       default(20)
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/users [get]
func (h *AdminHandler) AdminListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	// TODO: Implement user listing with filters
	Success(c, gin.H{
		"items":     []interface{}{},
		"page":      page,
		"pageSize": pageSize,
	})
}

// AdminGetUser godoc
// @Summary      Admin get user by ID
// @Description  Get user details (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "User ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/users/{id} [get]
func (h *AdminHandler) AdminGetUser(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		BadRequest(c, "invalid user id")
		return
	}

	user, err := h.userService.GetByID(c.Request.Context(), id)
	if err != nil {
		NotFound(c, "user not found")
		return
	}

	Success(c, user.ToResponse())
}

// AdminUpdateUser godoc
// @Summary      Admin update user
// @Description  Update user information (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path      int64                true  "User ID"
// @Param        request body object{} true "User data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/users/{id} [put]
func (h *AdminHandler) AdminUpdateUser(c *gin.Context) {
	NotImplemented(c, "user update not implemented")
}

// AdminDeleteUser godoc
// @Summary      Admin delete user
// @Description  Delete a user (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int64  true  "User ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Failure      404 {object} Response
// @Router       /admin/users/{id} [delete]
func (h *AdminHandler) AdminDeleteUser(c *gin.Context) {
	NotImplemented(c, "user deletion not implemented")
}

// ========== 审计日志 ==========

// AdminListAuditLogs godoc
// @Summary      Admin list audit logs
// @Description  Get paginated list of audit logs (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page     query   int    false "Page number"    default(1)
// @Param        page_size query  int    false "Page size"       default(20)
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} Response
// @Failure      403 {object} Response
// @Router       /admin/audit-logs [get]
func (h *AdminHandler) AdminListAuditLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	// TODO: Implement audit log service
	Success(c, gin.H{
		"items":     []interface{}{},
		"page":      page,
		"pageSize": pageSize,
	})
}
