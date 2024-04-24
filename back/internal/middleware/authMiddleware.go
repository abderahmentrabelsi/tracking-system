package middleware

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"strings"
)

type JWTClaims struct {
	UserID string `json:"userId"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := getTokenFromRequest(c)
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		token, _ := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
			// Now you have a valid token and can extract the UserID and Role
			c.Set("userID", claims.UserID)
			c.Set("userRole", claims.Role)
			c.Next()
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
	}
}

func getTokenFromRequest(c *gin.Context) string {
	bearerToken := c.GetHeader("Authorization")
	if len(bearerToken) > 7 && strings.ToUpper(bearerToken[0:7]) == "BEARER " {
		return bearerToken[7:]
	}

	// Attempt to retrieve the access token from cookies if not found in header
	if cookie, err := c.Cookie("access_token"); err == nil {
		return cookie
	}
	return ""
}
