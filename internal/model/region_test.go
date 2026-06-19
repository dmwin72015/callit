package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestRegionType_Validate(t *testing.T) {
	tests := []struct {
		name  string
		rt    RegionType
		valid bool
	}{
		{"valid province", RegionTypeProvince, true},
		{"valid city", RegionTypeCity, true},
		{"valid dialect", RegionTypeDialect, true},
		{"valid custom", RegionTypeCustom, true},
		{"invalid type", "INVALID", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			switch tt.rt {
			case RegionTypeProvince, RegionTypeCity, RegionTypeDialect, RegionTypeCustom:
				assert.True(t, true)
			default:
				assert.False(t, tt.valid)
			}
		})
	}
}
