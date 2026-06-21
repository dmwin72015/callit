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

// ListRegions godoc
// @Summary      List regions
// @Description  Get list of regions with optional filters
// @Tags         regions
// @Accept       json
// @Produce      json
// @Param        region_type query   string false "Filter by region type" Enums(PROVINCE, CITY, DISTRICT, CUSTOM)
// @Param        parent_id   query   int64  false "Filter by parent region ID"
// @Success      200 {object} Response{data=[]model.RegionResponse}
// @Failure      400 {object} Response
// @Failure      500 {object} Response
// @Router       /regions [get]
func (h *RegionHandler) List(c *gin.Context) {
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

	regions, err := h.regionService.List(c.Request.Context(), regionType, parentID)
	if err != nil {
		InternalError(c, "failed to fetch regions")
		return
	}

	Success(c, regions)
}

// GetRegionByID godoc
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

// GetRegionTree godoc
// @Summary      Get region tree
// @Description  Get hierarchical region tree structure
// @Tags         regions
// @Accept       json
// @Produce      json
// @Param        root_id query int64 false "Root region ID (optional)"
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
