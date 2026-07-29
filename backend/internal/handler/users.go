package handler

import (
	"encoding/json"
	"net/http"

	"milocal/backend/internal/middleware"
	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
)

func GetUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	user, err := repository.GetUserByID(id)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error fetching user", err)
		return
	}
	if user == nil {
		writeError(w, http.StatusNotFound, "User not found", "")
		return
	}

	docs, _ := repository.GetUserDocuments(id)

	response := map[string]interface{}{
		"id":        user.ID,
		"name":      user.Name,
		"email":     user.Email,
		"type":      user.Type,
		"level":     user.Level,
		"subType":   user.SubType,
		"documents": docs,
	}

	writeJSON(w, http.StatusOK, response)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	// P0-1: Authorization — JWT userID must match resource ID
	jwtUserID := middleware.GetUserIDFromContext(r.Context())
	if jwtUserID != id {
		writeError(w, http.StatusForbidden, "No tienes permiso para modificar este perfil", "")
		return
	}

	var req model.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sanitizedError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	user, err := repository.UpdateUser(id, req)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error updating user", err)
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func VerifyDocument(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	docID := r.PathValue("docId")

	// P0-1: Authorization — JWT userID must match the resource owner
	jwtUserID := middleware.GetUserIDFromContext(r.Context())
	if jwtUserID != userID {
		writeError(w, http.StatusForbidden, "No tienes permiso para modificar este perfil", "")
		return
	}

	doc, err := repository.VerifyDocument(userID, docID)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error verifying document", err)
		return
	}

	writeJSON(w, http.StatusOK, doc)
}
