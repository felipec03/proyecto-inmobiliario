package handler

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"milocal/backend/internal/auth"
	"milocal/backend/internal/middleware"
	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
)

func generateUUID() string {
	b := make([]byte, 16)
	rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return hex.EncodeToString(b[0:4]) + "-" +
		hex.EncodeToString(b[4:6]) + "-" +
		hex.EncodeToString(b[6:8]) + "-" +
		hex.EncodeToString(b[8:10]) + "-" +
		hex.EncodeToString(b[10:16])
}

func Register(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Password = strings.TrimSpace(req.Password)
	req.Type = model.UserType(strings.TrimSpace(string(req.Type)))

	if req.Name == "" || req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "Validation error", "name, email and password are required")
		return
	}

	if len(req.Password) < 6 {
		writeError(w, http.StatusBadRequest, "Validation error", "password must be at least 6 characters")
		return
	}

	if req.Type != model.UserEntrepreneur && req.Type != model.UserOwner {
		req.Type = model.UserEntrepreneur
	}

	existing, err := repository.GetUserByEmail(req.Email)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error checking email", err.Error())
		return
	}
	if existing != nil {
		writeError(w, http.StatusConflict, "Email already registered", "")
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error hashing password", err.Error())
		return
	}

	user := &model.UserProfile{
		ID:           generateUUID(),
		Name:         req.Name,
		Email:        req.Email,
		Type:         req.Type,
		Level:        0,
		SubType:      "natural",
		PasswordHash: string(passwordHash),
	}

	if err := repository.CreateUser(user); err != nil {
		writeError(w, http.StatusInternalServerError, "Error creating user", err.Error())
		return
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error generating token", err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, model.AuthResponse{
		Token: token,
		User: model.UserProfileResponse{
			ID:      user.ID,
			Name:    user.Name,
			Email:   user.Email,
			Type:    user.Type,
			Level:   user.Level,
			SubType: user.SubType,
		},
	})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Password = strings.TrimSpace(req.Password)

	if req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "Validation error", "email and password are required")
		return
	}

	user, err := repository.GetUserByEmail(req.Email)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error fetching user", err.Error())
		return
	}
	if user == nil {
		writeError(w, http.StatusUnauthorized, "Invalid credentials", "")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "Invalid credentials", "")
		return
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error generating token", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, model.AuthResponse{
		Token: token,
		User: model.UserProfileResponse{
			ID:      user.ID,
			Name:    user.Name,
			Email:   user.Email,
			Type:    user.Type,
			Level:   user.Level,
			SubType: user.SubType,
		},
	})
}

func Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromContext(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "Not authenticated", "")
		return
	}

	user, err := repository.GetUserByID(userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error fetching user", err.Error())
		return
	}
	if user == nil {
		writeError(w, http.StatusNotFound, "User not found", "")
		return
	}

	writeJSON(w, http.StatusOK, model.UserProfileResponse{
		ID:      user.ID,
		Name:    user.Name,
		Email:   user.Email,
		Type:    user.Type,
		Level:   user.Level,
		SubType: user.SubType,
	})
}
