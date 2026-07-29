package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"milocal/backend/internal/auth"
	"milocal/backend/internal/middleware"
	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
)

func Register(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sanitizedError(w, http.StatusBadRequest, "Invalid request body", err)
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
		sanitizedError(w, http.StatusInternalServerError, "Error checking email", err)
		return
	}
	if existing != nil {
		writeError(w, http.StatusConflict, "Email already registered", "")
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error hashing password", err)
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
		sanitizedError(w, http.StatusInternalServerError, "Error creating user", err)
		return
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error generating token", err)
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
		sanitizedError(w, http.StatusBadRequest, "Invalid request body", err)
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
		sanitizedError(w, http.StatusInternalServerError, "Error fetching user", err)
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
		sanitizedError(w, http.StatusInternalServerError, "Error generating token", err)
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
		sanitizedError(w, http.StatusInternalServerError, "Error fetching user", err)
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
