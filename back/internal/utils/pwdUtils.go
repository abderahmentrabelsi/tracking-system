package utils

import (
	"unicode"
)

func ValidatePassword(password string) bool {
	var hasMinLen, hasUpper, hasLower, hasNumber, hasSymbol bool
	const minLen = 8

	if len(password) >= minLen {
		hasMinLen = true
	}

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSymbol = true
		}
	}

	return hasMinLen && hasUpper && hasLower && (hasNumber || hasSymbol)
}
