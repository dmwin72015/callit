package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/internal/service"
)

// TagHandler 标签处理器
type TagHandler struct {
	tagService service.TagService
}

func NewTagHandler(tagService service.TagService) *TagHandler {
	return &TagHandler{tagService: tagService}
}

// ListTags godoc
// @Summary      List tags
// @Description  Get list of all tags
// @Tags         tags
// @Accept       json
// @Produce      json
// @Success      200 {object} Response{data=[]map[string]interface{}}
// @Failure      500 {object} Response
// @Router       /tags [get]
func (h *TagHandler) List(c *gin.Context) {
	tags, err := h.tagService.List(c.Request.Context())
	if err != nil {
		InternalError(c, "failed to fetch tags")
		return
	}

	Success(c, tags)
}

// GetTagByID godoc
// @Summary      Get tag by ID
// @Description  Get detailed information about a specific tag
// @Tags         tags
// @Accept       json
// @Produce      json
// @Param        id   path      int64  true  "Tag ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} Response
// @Failure      404 {object} Response
// @Router       /tags/{id} [get]
func (h *TagHandler) GetByID(c *gin.Context) {
	// Simplified for now
	Success(c, gin.H{"message": "not implemented"})
}

// SearchTags godoc
// @Summary      Search tags
// @Description  Search tags by keyword
// @Tags         tags
// @Accept       json
// @Produce      json
// @Param        q   query      string  true  "Search keyword"
// @Success      200 {object} Response{data=[]map[string]interface{}}
// @Failure      400 {object} Response
// @Router       /tags/search [get]
func (h *TagHandler) Search(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		BadRequest(c, "query parameter 'q' is required")
		return
	}

	tags, err := h.tagService.Search(c.Request.Context(), q)
	if err != nil {
		InternalError(c, "search failed")
		return
	}

	Success(c, tags)
}
