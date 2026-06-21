package model

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// Category 分类模型
type Category struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null;size:50" json:"name" validate:"required,min=1,max=50"`
	ParentID  *int64   `json:"parentId"`
	Icon      string    `gorm:"size:50" json:"icon"`
	SortOrder int       `gorm:"not null;default:0" json:"sortOrder"`
	Children  []Category `gorm:"-" json:"children,omitempty"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

func (Category) TableName() string {
	return "categories"
}

// ToResponse 转换为响应格式
func (c *Category) ToResponse() *CategoryResponse {
	resp := &CategoryResponse{
		ID:        c.ID,
		Name:      c.Name,
		ParentID:  c.ParentID,
		Icon:      c.Icon,
		SortOrder: c.SortOrder,
		Children:  []CategoryResponse{},
	}
	return resp
}

// CategoryRequest 分类请求（保留向后兼容）
type CategoryRequest struct {
	Name      string `json:"name" validate:"required,min=1,max=50"`
	ParentID  *int64 `json:"parentId"`
	Icon      string `json:"icon"`
	SortOrder int    `json:"sortOrder"`
}

// CategoryCreateRequest 创建分类请求
type CategoryCreateRequest struct {
	Name      string `json:"name" validate:"required,min=1,max=50"`
	ParentID  *int64 `json:"parentId"`
	Icon      string `json:"icon"`
	SortOrder int    `json:"sortOrder"`
}

// CategoryUpdateRequest 更新分类请求
type CategoryUpdateRequest struct {
	Name      *string `json:"name" validate:"required,min=1,max=50"`
	ParentID  *int64  `json:"parentId"`
	Icon      *string `json:"icon"`
	SortOrder *int    `json:"sortOrder"`
}

// CategoryResponse 分类响应
type CategoryResponse struct {
	ID        int64            `json:"id"`
	Name      string           `json:"name"`
	ParentID  *int64           `json:"parentId"`
	Icon      string           `json:"icon"`
	SortOrder int              `json:"sortOrder"`
	Children  []CategoryResponse `json:"children,omitempty"`
}

// Scan implements sql.Scanner interface
func (c *Category) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	return nil
}

// Value implements driver.Valuer interface
func (c Category) Value() (driver.Value, error) {
	return fmt.Sprintf("%d", c.ID), nil
}
