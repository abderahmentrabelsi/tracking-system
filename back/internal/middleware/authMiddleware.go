package middleware

import (
	"back/internal/store"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

type JWTClaims struct {
	UserID       string `json:"userId"`
	Role         string `json:"role"`
	DepartmentID uint   `json:"departmentId"`
	ID           uint   `json:"userID"`
	jwt.StandardClaims
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := getTokenFromRequest(c)
		if tokenString == "" || store.IsTokenRevoked(tokenString) {
			redirectToLogin(c)
			return
		}

		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			redirectToLogin(c)
			return
		}

		if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
			c.Set("userID", claims.UserID)
			c.Set("userRole", claims.Role)
			c.Set("departmentID", claims.DepartmentID)
			c.Set("ID", claims.ID)
			c.Next()
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
		}
	}
}

func getTokenFromRequest(c *gin.Context) string {
	token, err := c.Cookie("access_token")
	if err != nil {
		return ""
	}
	return token
}

func redirectToLogin(c *gin.Context) {
	c.Redirect(http.StatusFound, "/login?redirect="+c.Request.RequestURI)
	c.Abort()
}

func AuthorizeRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.GetString("userRole")

		for _, role := range allowedRoles {
			if role == userRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		c.Abort()
	}
}
