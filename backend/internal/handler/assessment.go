package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"milocal/backend/internal/middleware"
	"milocal/backend/internal/model"
	"milocal/backend/internal/repository"
	"milocal/backend/internal/service/matcher"
)

func CalculateMatchScore(w http.ResponseWriter, r *http.Request) {
	var req model.MatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sanitizedError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	property, err := repository.GetPropertyByID(req.PropertyID)
	if err != nil {
		sanitizedError(w, http.StatusNotFound, "Property not found", err)
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

	// Save match to DB
	userID := middleware.GetUserIDFromContext(r.Context())
	matchID := generateUUID()
	matchScore := int(result.Score * 100)
	if err := repository.SaveMatch(matchID, userID, req.PropertyID, req.Rubro, matchScore); err != nil {
		log.Printf("Warning: failed to save match: %v", err)
	}

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
		sanitizedError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	userID := middleware.GetUserIDFromContext(r.Context())
	assessmentID := generateUUID()

	if err := repository.SaveAssessment(assessmentID, userID, req.UserType, req.Step, req.Data, false); err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error saving assessment", err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"id":        assessmentID,
		"userId":    userID,
		"userType":  req.UserType,
		"step":      req.Step,
		"data":      req.Data,
		"completed": false,
	})
}
