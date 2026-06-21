package repository

import (
	"testing"
	"github.com/rdd/cnalias/server/internal/model"
)

func TestTypeCheck(t *testing.T) {
	var _ model.Region
	var _ model.RegionType
}
