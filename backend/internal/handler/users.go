package handler

import (
	"encoding/json"
	"net/http"
	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
)

func GetUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	user, err := repository.GetUserByID(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error fetching user", err.Error())
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
	var req model.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	user, err := repository.UpdateUser(id, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error updating user", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func VerifyDocument(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	docID := r.PathValue("docId")

	doc, err := repository.VerifyDocument(userID, docID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error verifying document", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, doc)
}
