package model

import "time"

// RegionType 地区类型
type RegionType string

const (
	RegionTypeProvince RegionType = "PROVINCE"
	RegionTypeCity     RegionType = "CITY"
	RegionTypeDialect  RegionType = "DIALECT"
	RegionTypeCustom   RegionType = "CUSTOM"
)

// Region 地区模型
type Region struct {
	ID          int64      `gorm:"primaryKey" json:"id"`
	Name        string     `gorm:"not null;size:50" json:"name" validate:"required,min=1,max=50"`
	ParentID    *int64    `json:"parent_id"`
	RegionType  RegionType `gorm:"column:region_type;not null;type:varchar(20)" json:"region_type"`
	Code        string     `gorm:"size:20;unique" json:"code"`
	SortOrder   int        `gorm:"not null;default:0" json:"sort_order"`
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
	}
	return resp
}

// RegionRequest 地区请求（保留向后兼容）
type RegionRequest struct {
	Name       string    `json:"name" validate:"required,min=1,max=50"`
	ParentID   *int64    `json:"parent_id"`
	RegionType RegionType `json:"region_type" validate:"required,oneof=PROVINCE CITY DIALECT CUSTOM"`
	Code       string    `json:"code"`
	SortOrder  int       `json:"sort_order"`
}

// RegionCreateRequest 创建地区请求
type RegionCreateRequest struct {
	Name       string    `json:"name" validate:"required,min=1,max=50"`
	ParentID   *int64    `json:"parent_id"`
	RegionType RegionType `json:"region_type" validate:"required,oneof=PROVINCE CITY DIALECT CUSTOM"`
	Code       string    `json:"code"`
	SortOrder  int       `json:"sort_order"`
}

// RegionUpdateRequest 更新地区请求
type RegionUpdateRequest struct {
	Name       *string    `json:"name" validate:"required,min=1,max=50"`
	ParentID   *int64     `json:"parent_id"`
	RegionType *RegionType `json:"region_type" validate:"required,oneof=PROVINCE CITY DIALECT CUSTOM"`
	Code       *string    `json:"code"`
	SortOrder  *int       `json:"sort_order"`
}

// RegionResponse 地区响应
type RegionResponse struct {
	ID          int64        `json:"id"`
	Name        string       `json:"name"`
	ParentID    *int64       `json:"parent_id"`
	RegionType  RegionType   `json:"region_type"`
	Code        string       `json:"code"`
	SortOrder   int          `json:"sort_order"`
	Children    []RegionResponse `json:"children,omitempty"`
}
