package model

import (
	"time"
)

// Tag 标签模型
type Tag struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null;unique;size:50" json:"name" validate:"required,min=1,max=50"`
	Color     string    `gorm:"size:20;default:'#1890ff'" json:"color"`
	CreatedAt time.Time `json:"-"`
}

func (Tag) TableName() string {
	return "tags"
}

// ToResponse 转换为响应格式
func (t *Tag) ToResponse() *TagResponse {
	return &TagResponse{
		ID:    t.ID,
		Name:  t.Name,
		Color: t.Color,
	}
}

// TagResponse 标签响应
type TagResponse struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}

// TagRequest 标签请求
type TagRequest struct {
	Name  string `json:"name" validate:"required,min=1,max=50"`
	Color string `json:"color"`
}
