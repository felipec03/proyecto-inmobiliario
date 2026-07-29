package handler

import (
	"encoding/json"
	"net/http"

	"milocal/backend/internal/middleware"
	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
)

func GetPreferences(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	if userID == "" {
		writeError(w, http.StatusBadRequest, "Missing user ID", "")
		return
	}

	prefs, err := repository.GetUserPreferences(userID)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error fetching preferences", err)
		return
	}
	if prefs == nil {
		writeJSON(w, http.StatusOK, model.UserPreferences{})
		return
	}

	writeJSON(w, http.StatusOK, prefs)
}

func SavePreferences(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	if userID == "" {
		writeError(w, http.StatusBadRequest, "Missing user ID", "")
		return
	}

	// P0-1: Authorization — JWT userID must match resource ID
	jwtUserID := middleware.GetUserIDFromContext(r.Context())
	if jwtUserID != userID {
		writeError(w, http.StatusForbidden, "No tienes permiso para modificar este perfil", "")
		return
	}

	var prefs model.UserPreferences
	if err := json.NewDecoder(r.Body).Decode(&prefs); err != nil {
		sanitizedError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	prefID := generateUUID()
	if err := repository.SaveUserPreferences(prefID, userID, prefs); err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error saving preferences", err)
		return
	}

	writeJSON(w, http.StatusOK, prefs)
}
