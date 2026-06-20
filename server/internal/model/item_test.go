package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"time"
)

func TestItem_ToResponse(t *testing.T) {
	now := time.Now()
	catID := int64(1)

	item := &Item{
		ID:         1,
		Name:        "马铃薯",
		CategoryID: &catID,
		Description: "一种常见蔬菜",
		CreatedAt:  now,
	}

	resp := item.ToResponse()

	assert.Equal(t, item.ID, resp.ID)
	assert.Equal(t, item.Name, resp.Name)
	assert.Equal(t, item.Description, resp.Description)
	assert.Empty(t, resp.Aliases)
	// Tags字段在后续迭代中添加
	assert.NotNil(t, resp)
}
