package handler

import (
	"encoding/json"
	"net/http"

	"milocal/backend/internal/middleware"
	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
)

func GetProperties(w http.ResponseWriter, r *http.Request) {
	rubro := r.URL.Query().Get("rubro")
	properties, err := repository.GetAllProperties(rubro)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error fetching properties", err)
		return
	}
	if properties == nil {
		writeJSON(w, http.StatusOK, []model.Property{})
		return
	}
	writeJSON(w, http.StatusOK, properties)
}

func GetProperty(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	property, err := repository.GetPropertyByID(id)
	if err != nil {
		sanitizedError(w, http.StatusNotFound, "Property not found", err)
		return
	}
	writeJSON(w, http.StatusOK, property)
}

func CreateProperty(w http.ResponseWriter, r *http.Request) {
	var p model.Property
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		sanitizedError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// P1-4: Input validation
	if p.Title == "" {
		writeError(w, http.StatusBadRequest, "Validation error", "title is required")
		return
	}
	if p.Price <= 0 {
		writeError(w, http.StatusBadRequest, "Validation error", "price must be greater than 0")
		return
	}
	if p.Sqm <= 0 {
		writeError(w, http.StatusBadRequest, "Validation error", "sqm must be greater than 0")
		return
	}
	if p.Location == "" {
		writeError(w, http.StatusBadRequest, "Validation error", "location is required")
		return
	}

	// P0-1: Authorization
	userID := middleware.GetUserIDFromContext(r.Context())
	if userID == "" {
		writeError(w, http.StatusForbidden, "Solo los propietarios pueden publicar inmuebles", "")
		return
	}

	user, err := repository.GetUserByID(userID)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error verifying user", err)
		return
	}
	if user == nil || user.Type != model.UserOwner {
		writeError(w, http.StatusForbidden, "Solo los propietarios pueden publicar inmuebles", "")
		return
	}

	p.OwnerID = userID
	// P0-5: Generate property ID server-side
	p.ID = generateUUID()

	if err := repository.CreateProperty(&p); err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error creating property", err)
		return
	}
	writeJSON(w, http.StatusCreated, p)
}
