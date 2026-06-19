package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/internal/model"
	"github.com/rdd/cnalias/internal/service"
)

type ItemHandler struct {
	itemService service.ItemService
}

func NewItemHandler(itemService service.ItemService) *ItemHandler {
	return &ItemHandler{itemService: itemService}
}

func (h *ItemHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	categoryIDStr := c.Query("category_id")
	search := c.Query("search")

	var categoryID *int64
	if categoryIDStr != "" {
		id, err := strconv.ParseInt(categoryIDStr, 10, 64)
		if err != nil {
			BadRequest(c, "invalid category_id")
			return
		}
		categoryID = &id
	}

	opts := model.ItemListOptions{
		Page:       page,
		PageSize:   pageSize,
		CategoryID: categoryID,
		Search:     search,
		OrderBy:    c.DefaultQuery("order_by", "name"),
	}

	items, err := h.itemService.List(c.Request.Context(), opts)
	if err != nil {
		InternalError(c, "failed to fetch items")
		return
	}

	Success(c, gin.H{
		"items": items,
		"page":  page,
		"page_size": pageSize,
	})
}

func (h *ItemHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
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
