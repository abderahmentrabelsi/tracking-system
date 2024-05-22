package middleware

import (
	"back/internal/store"
	"github.com/dgrijalva/jwt-go"
	_ "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

type JWTClaims struct {
	UserID string `json:"userId"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := getTokenFromRequest(c)
		if tokenString == "" || store.IsTokenRevoked(tokenString) { // Check if the token is in the blacklist
			c.Redirect(http.StatusFound, "/login?redirect="+c.Request.RequestURI)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while parsing the token"})
			c.Abort()
			return
		}

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
	// Attempt to retrieve the access token from cookies
	token, err := c.Cookie("access_token")
	if err != nil {
		return ""
	}
	return token
}
