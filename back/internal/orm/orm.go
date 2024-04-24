// file: back/internal/orm/orm.go

package orm

import (
	"gorm.io/gorm"
)

var DB *gorm.DB // This is the global DB instance
