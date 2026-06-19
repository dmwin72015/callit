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

// ListItems godoc
// @Summary      List items
// @Description  Get paginated list of items with optional filters
// @Tags         items
// @Accept       json
// @Produce      json
// @Param        page        query   int    false "Page number"    default(1)
// @Param        page_size   query   int    false "Page size"       default(20)
// @Param        category_id query   int64  false "Category ID"
// @Param        search      query   string false "Search keyword"
// @Param        order_by    query   string false "Order by field"   default(name)
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      500 {object} Response
// @Router       /items [get]
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

// GetItemByID godoc
// @Summary      Get item by ID
// @Description  Get detailed information about a specific item including all aliases
// @Tags         items
// @Accept       json
// @Produce      json
// @Param        id   path      int64  true  "Item ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      404 {object} Response
// @Router       /items/{id} [get]
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
