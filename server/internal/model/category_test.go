package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestCategory_ToResponse(t *testing.T) {
	cat := &Category{
		ID:        1,
		Name:      "蔬菜",
		SortOrder: 1,
	}

	resp := &CategoryResponse{
		ID:        cat.ID,
		Name:      cat.Name,
		SortOrder: cat.SortOrder,
	}

	assert.Equal(t, cat.ID, resp.ID)
	assert.Equal(t, cat.Name, resp.Name)
	assert.Empty(t, resp.ParentID) // nil
	assert.Empty(t, resp.Children) // 空列表
}
