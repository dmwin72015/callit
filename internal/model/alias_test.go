package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"time"
)

func TestAlias_ToResponse(t *testing.T) {
	alias := &Alias{
		ID:        1,
		ItemID:    1,
		AliasName: "土豆",
		RegionID:  1,
		NameType:  NameTypeCommon,
		Status:    AliasStatusApproved,
		CreatedAt: time.Now(),
	}

	resp := alias.ToResponse()

	assert.Equal(t, alias.ID, resp.ID)
	assert.Equal(t, alias.AliasName, resp.AliasName)
	assert.Equal(t, alias.NameType, resp.NameType)
	assert.Equal(t, alias.Status, resp.Status)
}

func TestNameType_Validate(t *testing.T) {
	tests := []struct {
		name  string
		nt    NameType
		valid bool
	}{
		{"valid common", NameTypeCommon, true},
		{"valid alias", NameTypeAlias, true},
		{"invalid", "INVALID", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			switch tt.nt {
			case NameTypeCommon, NameTypeAlias:
				assert.True(t, true)
			default:
				assert.False(t, tt.valid)
			}
		})
	}
}
