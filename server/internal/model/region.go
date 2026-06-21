package model

import "time"

// RegionType 地区类型
type RegionType string

const (
	RegionTypeMacroRegion RegionType = "MACRO_REGION"
	RegionTypeProvince    RegionType = "PROVINCE"
	RegionTypeCity        RegionType = "CITY"
	RegionTypeDistrict    RegionType = "DISTRICT"
	RegionTypeStreet      RegionType = "STREET"
	RegionTypeCustom      RegionType = "CUSTOM"
)

// Region 地区模型
type Region struct {
	ID          int64      `gorm:"primaryKey" json:"id"`
	Name        string     `gorm:"not null;size:50" json:"name" validate:"required,min=1,max=50"`
	ParentID    *int64     `json:"parentId"`
	RegionType  RegionType `gorm:"column:region_type;not null;type:varchar(20)" json:"regionType"`
	Code        string     `gorm:"size:20;unique" json:"code"`
	SortOrder   int        `gorm:"not null;default:0" json:"sortOrder"`
	Latitude    *float64   `gorm:"type:float8" json:"latitude"`
	Longitude   *float64   `gorm:"type:float8" json:"longitude"`
	PostalCode  *string    `gorm:"size:10" json:"postalCode"`
	AreaCode    *string    `gorm:"size:10" json:"areaCode"`
	Children    []Region   `gorm:"-" json:"children,omitempty"`
	CreatedAt   time.Time  `json:"-"`
}

func (Region) TableName() string {
	return "regions"
}

// ToResponse 转换为响应格式
func (r *Region) ToResponse() *RegionResponse {
	resp := &RegionResponse{
		ID:         r.ID,
		Name:       r.Name,
		ParentID:   r.ParentID,
		RegionType: r.RegionType,
		Code:       r.Code,
		SortOrder:  r.SortOrder,
		Latitude:   r.Latitude,
		Longitude:  r.Longitude,
		PostalCode: r.PostalCode,
		AreaCode:   r.AreaCode,
	}
	return resp
}

// RegionRequest 地区请求（保留向后兼容）
type RegionRequest struct {
	Name       string     `json:"name" validate:"required,min=1,max=50"`
	ParentID   *int64     `json:"parentId"`
	RegionType RegionType `json:"regionType" validate:"required,oneof=MACRO_REGION PROVINCE CITY DISTRICT STREET CUSTOM"`
	Code       string     `json:"code"`
	SortOrder  int        `json:"sortOrder"`
	Latitude   *float64   `json:"latitude"`
	Longitude  *float64   `json:"longitude"`
	PostalCode *string    `json:"postalCode"`
	AreaCode   *string    `json:"areaCode"`
}

// RegionCreateRequest 创建地区请求
type RegionCreateRequest struct {
	Name       string     `json:"name" validate:"required,min=1,max=50"`
	ParentID   *int64     `json:"parentId"`
	RegionType RegionType `json:"regionType" validate:"required,oneof=MACRO_REGION PROVINCE CITY DISTRICT STREET CUSTOM"`
	Code       string     `json:"code"`
	SortOrder  int        `json:"sortOrder"`
	Latitude   *float64   `json:"latitude"`
	Longitude  *float64   `json:"longitude"`
	PostalCode *string    `json:"postalCode"`
	AreaCode   *string    `json:"areaCode"`
}

// RegionUpdateRequest 更新地区请求
type RegionUpdateRequest struct {
	Name       *string     `json:"name" validate:"required,min=1,max=50"`
	ParentID   *int64      `json:"parentId"`
	RegionType *RegionType `json:"regionType" validate:"required,oneof=PROVINCE CITY DISTRICT STREET CUSTOM"`
	Code       *string     `json:"code"`
	SortOrder  *int        `json:"sortOrder"`
	Latitude   *float64    `json:"latitude"`
	Longitude  *float64    `json:"longitude"`
	PostalCode *string     `json:"postalCode"`
	AreaCode   *string     `json:"areaCode"`
}

// RegionTreeNode 递归查询返回的树节点（用于 CTE 结果扫描）
type RegionTreeNode struct {
	ID         int64      `db:"id" json:"id"`
	Name       string     `db:"name" json:"name"`
	ParentID   *int64     `db:"parent_id" json:"parentId"`
	RegionType RegionType `db:"region_type" json:"regionType"`
	Code       string     `db:"code" json:"code"`
	SortOrder  int        `db:"sort_order" json:"sortOrder"`
	Latitude   *float64   `db:"latitude" json:"latitude"`
	Longitude  *float64   `db:"longitude" json:"longitude"`
	PostalCode *string    `db:"postal_code" json:"postalCode"`
	AreaCode   *string    `db:"area_code" json:"areaCode"`
	Depth      int        `db:"depth" json:"-"`
}

// RegionResponse 地区响应
type RegionResponse struct {
	ID          int64         `json:"id"`
	Name        string        `json:"name"`
	ParentID    *int64        `json:"parentId"`
	RegionType  RegionType    `json:"regionType"`
	Code        string        `json:"code"`
	SortOrder   int           `json:"sortOrder"`
	Latitude    *float64      `json:"latitude"`
	Longitude   *float64      `json:"longitude"`
	PostalCode  *string       `json:"postalCode"`
	AreaCode    *string       `json:"areaCode"`
	Children    []RegionResponse `json:"children,omitempty"`
}
