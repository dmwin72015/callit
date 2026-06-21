package model

import (
	"time"
)

// Alias 别名模型
type Alias struct {
	ID           int64       `gorm:"primaryKey" json:"id"`
	ItemID       int64       `gorm:"not null" json:"itemId" validate:"required"`
	AliasName    string      `gorm:"not null;size:100" json:"aliasName" validate:"required,min=1,max=100"`
	RegionID     int64       `gorm:"not null" json:"regionId" validate:"required"`
	NameType     NameType    `gorm:"column:name_type;not null;type:varchar(20)" json:"nameType"`
	VotesCount   int         `gorm:"not null;default:0" json:"votesCount"`
	Status       AliasStatus `gorm:"not null;default:'PENDING';type:varchar(20)" json:"status"`
	SubmittedBy  *int64     `json:"submittedBy"`
	ReviewerID   *int64     `json:"reviewerId"`
	ReviewedAt   *time.Time `json:"reviewedAt"`
	ReviewNote   string     `gorm:"type:text" json:"reviewNote"`
	CreatedAt    time.Time  `json:"createdAt"`
}

func (Alias) TableName() string {
	return "item_aliases"
}

// AliasRequest 提交别名请求
type AliasRequest struct {
	ItemID    int64     `json:"itemId" validate:"required"`
	RegionID  int64     `json:"regionId" validate:"required"`
	AliasName string    `json:"aliasName" validate:"required,min=1,max=100"`
	NameType  NameType  `json:"nameType" validate:"required,oneof=COMMON ALIAS"`
}

// AnonymousAliasRequest 匿名提交别名请求
type AnonymousAliasRequest struct {
	ItemID    int64    `json:"itemId" validate:"required"`
	RegionID  int64    `json:"regionId" validate:"required"`
	AliasName string   `json:"aliasName" validate:"required,min=1,max=100"`
	NameType  NameType `json:"nameType" validate:"required,oneof=COMMON ALIAS"`
	Submitter string   `json:"submitter" validate:"required,min=2,max=100"` // 提交者昵称
}

// AliasResponse 别名响应
type AliasResponse struct {
	ID          int64       `json:"id"`
	ItemID      int64       `json:"itemId"`
	AliasName   string      `json:"aliasName"`
	RegionID    int64       `json:"regionId"`
	NameType    NameType    `json:"nameType"`
	VotesCount  int         `json:"votesCount"`
	Status      AliasStatus `json:"status"`
	SubmittedBy *int64      `json:"submittedBy"`
	ReviewedAt  *time.Time  `json:"reviewedAt"`
	CreatedAt   time.Time   `json:"createdAt"`
}

// AliasDetailResponse 别名详情响应（包含物品和地区信息）
type AliasDetailResponse struct {
	ID          int64             `json:"id"`
	AliasName   string            `json:"aliasName"`
	NameType    NameType          `json:"nameType"`
	VotesCount  int               `json:"votesCount"`
	Status      AliasStatus       `json:"status"`
	Item        ItemSimpleResponse `json:"item"`
	Region      RegionSimpleResponse `json:"region"`
	CreatedAt   time.Time         `json:"createdAt"`
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
	RegionType RegionType `json:"regionType"`
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

// AdminAliasCreateRequest 管理员创建别名请求
type AdminAliasCreateRequest struct {
	ItemID      int64      `json:"itemId" validate:"required"`
	RegionID    int64      `json:"regionId" validate:"required"`
	AliasName   string     `json:"aliasName" validate:"required,min=1,max=100"`
	NameType    NameType   `json:"nameType" validate:"required,oneof=COMMON ALIAS"`
	Status      string     `json:"status" validate:"required,oneof=PENDING APPROVED REJECTED"`
	VotesCount  int        `json:"votesCount"`
	SubmittedBy *int64     `json:"submittedBy"`
}

// AdminAliasUpdateRequest 管理员更新别名请求
type AdminAliasUpdateRequest struct {
	ItemID      int64    `json:"itemId" validate:"required"`
	RegionID    int64    `json:"regionId" validate:"required"`
	AliasName   string   `json:"aliasName" validate:"required,min=1,max=100"`
	NameType    NameType `json:"nameType" validate:"required,oneof=COMMON ALIAS"`
	Status      string   `json:"status" validate:"required,oneof=PENDING APPROVED REJECTED"`
	VotesCount  int      `json:"votesCount"`
}
