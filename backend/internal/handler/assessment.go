package handler

import (
	"encoding/json"
	"net/http"
	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
	"milocal/backend/internal/service"
)

func CalculateMatchScore(w http.ResponseWriter, r *http.Request) {
	var req model.MatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	property, err := repository.GetPropertyByID(req.PropertyID)
	if err != nil {
		writeError(w, http.StatusNotFound, "Property not found", err.Error())
		return
	}

	score := service.CalculateMatch(property, req.Rubro)
	details := service.GetMatchDetails(property, req.Rubro)

	writeJSON(w, http.StatusOK, model.MatchResponse{
		Score:   score,
		Details: details,
	})
}

func SubmitAssessment(w http.ResponseWriter, r *http.Request) {
	var req model.AssessmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	profile := map[string]interface{}{
		"userType": req.UserType,
		"step":     req.Step,
		"data":     req.Data,
	}

	writeJSON(w, http.StatusOK, model.AssessmentResponse{
		Profile: profile,
	})
}
