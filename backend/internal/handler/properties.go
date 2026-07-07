package handler

import (
	"encoding/json"
	"net/http"

	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
)

func GetProperties(w http.ResponseWriter, r *http.Request) {
	rubro := r.URL.Query().Get("rubro")
	properties, err := repository.GetAllProperties(rubro)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Error fetching properties", err.Error())
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
		writeError(w, http.StatusNotFound, "Property not found", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, property)
}

func CreateProperty(w http.ResponseWriter, r *http.Request) {
	var p model.Property
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}
	if err := repository.CreateProperty(&p); err != nil {
		writeError(w, http.StatusInternalServerError, "Error creating property", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, p)
}
