package model

import (
	"time"
)

// Alias 别名模型
type Alias struct {
	ID           int64       `gorm:"primaryKey" json:"id"`
	ItemID       int64       `gorm:"not null" json:"item_id" validate:"required"`
	AliasName    string      `gorm:"not null;size:100" json:"alias_name" validate:"required,min=1,max=100"`
	RegionID     int64       `gorm:"not null" json:"region_id" validate:"required"`
	NameType     NameType    `gorm:"column:name_type;not null;type:varchar(20)" json:"name_type"`
	VotesCount   int         `gorm:"not null;default:0" json:"votes_count"`
	Status       AliasStatus `gorm:"not null;default:'PENDING';type:varchar(20)" json:"status"`
	SubmittedBy  *int64     `json:"submitted_by"`
	ReviewerID   *int64     `json:"reviewer_id"`
	ReviewedAt   *time.Time `json:"reviewed_at"`
	ReviewNote   string     `gorm:"type:text" json:"review_note"`
	CreatedAt    time.Time  `json:"created_at"`
}

func (Alias) TableName() string {
	return "item_aliases"
}

// AliasRequest 提交别名请求
type AliasRequest struct {
	ItemID    int64     `json:"item_id" validate:"required"`
	RegionID  int64     `json:"region_id" validate:"required"`
	AliasName string    `json:"alias_name" validate:"required,min=1,max=100"`
	NameType  NameType  `json:"name_type" validate:"required,oneof=COMMON ALIAS"`
}

// AnonymousAliasRequest 匿名提交别名请求
type AnonymousAliasRequest struct {
	ItemID    int64    `json:"item_id" validate:"required"`
	RegionID  int64    `json:"region_id" validate:"required"`
	AliasName string   `json:"alias_name" validate:"required,min=1,max=100"`
	NameType  NameType `json:"name_type" validate:"required,oneof=COMMON ALIAS"`
	Submitter string   `json:"submitter" validate:"required,min=2,max=100"` // 提交者昵称
}

// AliasResponse 别名响应
type AliasResponse struct {
	ID          int64       `json:"id"`
	ItemID      int64       `json:"item_id"`
	AliasName   string      `json:"alias_name"`
	RegionID    int64       `json:"region_id"`
	NameType    NameType    `json:"name_type"`
	VotesCount  int         `json:"votes_count"`
	Status      AliasStatus `json:"status"`
	SubmittedBy *int64      `json:"submitted_by"`
	ReviewedAt  *time.Time  `json:"reviewed_at"`
	CreatedAt   time.Time   `json:"created_at"`
}

// AliasDetailResponse 别名详情响应（包含物品和地区信息）
type AliasDetailResponse struct {
	ID          int64             `json:"id"`
	AliasName   string            `json:"alias_name"`
	NameType    NameType          `json:"name_type"`
	VotesCount  int               `json:"votes_count"`
	Status      AliasStatus       `json:"status"`
	Item        ItemSimpleResponse `json:"item"`
	Region      RegionSimpleResponse `json:"region"`
	CreatedAt   time.Time         `json:"created_at"`
}

// ItemSimpleResponse 简化物品信息
type ItemSimpleResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

// RegionSimpleResponse 简化地区信息
type RegionSimpleResponse struct {
	ID         int64      `json:"id"`
	Name       string     `json:"name"`
	RegionType RegionType `json:"region_type"`
}

// ToResponse 转换为响应
func (a *Alias) ToResponse() *AliasResponse {
	return &AliasResponse{
		ID:          a.ID,
		ItemID:      a.ItemID,
		AliasName:   a.AliasName,
		RegionID:    a.RegionID,
		NameType:    a.NameType,
		VotesCount:  a.VotesCount,
		Status:      a.Status,
		SubmittedBy: a.SubmittedBy,
		ReviewedAt:  a.ReviewedAt,
		CreatedAt:   a.CreatedAt,
	}
}
