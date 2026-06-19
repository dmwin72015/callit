package model

import (
	"database/sql/driver"
	"time"
)

// NameType 名称类型
type NameType string

const (
	NameTypeCommon NameType = "COMMON"
	NameTypeAlias  NameType = "ALIAS"
)

// AliasStatus 别名状态
type AliasStatus string

const (
	AliasStatusPending  AliasStatus = "PENDING"
	AliasStatusApproved AliasStatus = "APPROVED"
	AliasStatusRejected AliasStatus = "REJECTED"
)

// Item 物品模型
type Item struct {
	ID          int64      `gorm:"primaryKey" json:"id"`
	Name        string     `gorm:"not null;size:100" json:"name" validate:"required,min=1,max=100"`
	CategoryID  *int64    `json:"category_id"`
	Description string     `json:"description"`
	CreatedBy   *int64    `json:"created_by"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"-"`
}

func (Item) TableName() string {
	return "items"
}

// ItemRequest 物品请求
type ItemRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=100"`
	CategoryID  *int64 `json:"category_id"`
	Description string `json:"description"`
}

// ItemResponse 物品响应
type ItemResponse struct {
	ID          int64           `json:"id"`
	Name        string          `json:"name"`
	CategoryID  *int64          `json:"category_id"`
	Description string          `json:"description"`
	Aliases     []AliasResponse `json:"aliases,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
}

// ToResponse 转换为响应
func (i *Item) ToResponse() *ItemResponse {
	return &ItemResponse{
		ID:          i.ID,
		Name:        i.Name,
		CategoryID:  i.CategoryID,
		Description: i.Description,
		CreatedAt:   i.CreatedAt,
	}
}

// Scan implements sql.Scanner for flexible query handling
func (i *Item) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	return nil
}

// Value implements driver.Valuer
func (i Item) Value() (driver.Value, error) {
	return i.ID, nil
}
