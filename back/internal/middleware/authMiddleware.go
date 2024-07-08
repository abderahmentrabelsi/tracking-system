package middleware

import (
	"back/internal/service"
	"back/internal/store"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

type JWTClaims struct {
	UserID   string `json:"UserID"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.StandardClaims
}

func AuthMiddleware(userService *service.UserService) gin.HandlerFunc {
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
			c.Set("username", claims.Username) // Add username to context
			c.Set("userRole", claims.Role)
			fmt.Println("Username set in context:", claims.Username)
			fmt.Println("Role set in context:", claims.Role)
			fmt.Println("UserID set in context:", claims.UserID)
			c.Next()
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
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
