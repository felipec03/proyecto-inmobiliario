package handler

import (
	"encoding/json"
	"net/http"

	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
	"milocal/backend/internal/service/matcher"
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

	var prefs *matcher.UserPreferences
	if req.UserPreferences != nil {
		prefs = &matcher.UserPreferences{
			MaxBudget:         req.UserPreferences.MaxBudget,
			MinSize:           req.UserPreferences.MinSize,
			MaxSize:           req.UserPreferences.MaxSize,
			PreferredLocation: req.UserPreferences.PreferredLocation,
		}
	}

	result := matcher.Calculate(property, req.Rubro, prefs)

	response := model.MatchResponse{
		Score:     result.Score,
		Permitted: result.Permitted,
		SpecScore: result.SpecScore,
		UserScore: result.UserScore,
		Breakdown: make([]model.FeatureContrib, len(result.Breakdown)),
	}

	for i, b := range result.Breakdown {
		response.Breakdown[i] = model.FeatureContrib{
			Dimension: b.Dimension,
			Label:     b.Label,
			Score:     b.Score,
			Weight:    b.Weight,
			MaxWeight: b.MaxWeight,
			Ideal:     b.Ideal,
			Actual:    b.Actual,
		}
	}

	writeJSON(w, http.StatusOK, response)
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
