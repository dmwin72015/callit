package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/service"
)

// RegionHandler 地区处理器
type RegionHandler struct {
	regionService service.RegionService
}

func NewRegionHandler(regionService service.RegionService) *RegionHandler {
	return &RegionHandler{regionService: regionService}
}

// List godoc
// @Summary      List regions
// @Description  Get paginated list of regions with optional filters
// @Tags         regions
// @Accept       json
// @Produce      json
// @Param        region_type query   string false "Filter by region type" Enums(PROVINCE, CITY, DISTRICT, STREET, CUSTOM)
// @Param        parent_id   query   int64  false "Filter by parent region ID"
// @Param        page        query   int    false "Page number"            default(1)
// @Param        page_size   query   int    false "Page size (max 100)"    default(20)
// @Success      200 {object} Response{data=[]model.RegionResponse,total=int64}
// @Failure      400 {object} Response
// @Failure      500 {object} Response
// @Router       /regions [get]
func (h *RegionHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var regionType *model.RegionType
	if rt := c.Query("region_type"); rt != "" {
		rt := model.RegionType(rt)
		regionType = &rt
	}

	var parentID *int64
	if pid := c.Query("parent_id"); pid != "" {
		id, err := strconv.ParseInt(pid, 10, 64)
		if err != nil {
			BadRequest(c, "invalid parent_id")
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
		"data":      regions,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetByID godoc
// @Summary      Get region by ID
// @Description  Get detailed information about a specific region
// @Tags         regions
// @Accept       json
// @Produce      json
// @Param        id   path      int64  true  "Region ID"
// @Success      200 {object} Response{data=model.RegionResponse}
// @Failure      400 {object} Response
// @Failure      404 {object} Response
// @Router       /regions/{id} [get]
func (h *RegionHandler) GetByID(c *gin.Context) {
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

// GetTree godoc
// @Summary      Get region tree
// @Description  Get hierarchical region tree structure (recursive)
// @Tags         regions
// @Accept       json
// @Produce      json
// @Param        root_id query int64 false "Root region ID (optional, default: top-level regions)"
// @Success      200 {object} Response{data=[]model.RegionResponse}
// @Failure      500 {object} Response
// @Router       /regions/tree [get]
func (h *RegionHandler) GetTree(c *gin.Context) {
	var rootID *int64
	if rid := c.Query("root_id"); rid != "" {
		id, err := strconv.ParseInt(rid, 10, 64)
		if err != nil {
			BadRequest(c, "invalid root_id")
			return
		}
		rootID = &id
	}

	tree, err := h.regionService.GetTree(c.Request.Context(), rootID)
	if err != nil {
		InternalError(c, "failed to get region tree")
		return
	}

	Success(c, tree)
}

// SearchByCode godoc
// @Summary      Search region by code
// @Description  Look up a region by its administrative code
// @Tags         regions
// @Accept       json
// @Produce      json
// @Param        code query string true "Region code (e.g. 110101, 4403)"
// @Success      200 {object} Response{data=model.RegionResponse}
// @Failure      400 {object} Response
// @Failure      404 {object} Response
// @Router       /regions/search [get]
func (h *RegionHandler) SearchByCode(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		BadRequest(c, "code is required")
		return
	}

	region, err := h.regionService.SearchByCode(c.Request.Context(), code)
	if err != nil {
		NotFound(c, "region not found")
		return
	}

	Success(c, region)
}

// SearchByName godoc
// @Summary      Search regions by name
// @Description  Fuzzy search regions by name keyword
// @Tags         regions
// @Accept       json
// @Produce      json
// @Param        q       query string true  "Search keyword"
// @Param        limit   query int    false "Max results (default 20, max 50)" default(20)
// @Success      200 {object} Response{data=[]model.RegionResponse}
// @Failure      400 {object} Response
// @Router       /regions/search/name [get]
func (h *RegionHandler) SearchByName(c *gin.Context) {
	keyword := c.Query("q")
	if keyword == "" {
		BadRequest(c, "q is required")
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	regions, err := h.regionService.SearchByName(c.Request.Context(), keyword, limit)
	if err != nil {
		InternalError(c, "failed to search regions")
		return
	}

	Success(c, regions)
}
