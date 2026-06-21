package model

import (
	"database/sql/driver"
	"time"
)

// ReviewAction 审核动作
type ReviewAction string

const (
	ReviewActionApprove ReviewAction = "APPROVE"
	ReviewActionReject  ReviewAction = "REJECT"
)

// ReviewLog 审核日志模型
type ReviewLog struct {
	ID         int64        `gorm:"primaryKey" json:"id"`
	AliasID    int64        `gorm:"not null" json:"aliasId"`
	ReviewerID int64        `gorm:"not null" json:"reviewerId"`
	Action     ReviewAction `gorm:"column:action;not null;type:varchar(20)" json:"action"`
	Note       string       `gorm:"type:text" json:"note"`
	CreatedAt  time.Time    `json:"createdAt"`
}

func (ReviewLog) TableName() string {
	return "review_logs"
}

// ReviewLogResponse 审核日志响应
type ReviewLogResponse struct {
	ID         int64        `json:"id"`
	Action     ReviewAction `json:"action"`
	Note       string       `json:"note"`
	ReviewerID int64        `json:"reviewerId"`
	CreatedAt  time.Time    `json:"createdAt"`
}

// ReviewRequest 审核请求
type ReviewRequest struct {
	Note string `json:"note"`
}

// Scan implements sql.Scanner
func (rl *ReviewLog) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	return nil
}

// Value implements driver.Valuer
func (rl ReviewLog) Value() (driver.Value, error) {
	return rl.ID, nil
}
