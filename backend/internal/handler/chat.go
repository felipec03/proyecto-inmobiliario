package handler

import (
	"encoding/json"
	"net/http"

	"milocal/backend/internal/model"
	"milocal/backend/internal/service"
)

func Chat(w http.ResponseWriter, r *http.Request) {
	var req model.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sanitizedError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	history := make([]map[string]string, len(req.History))
	for i, msg := range req.History {
		history[i] = map[string]string{
			"role":    msg.Role,
			"content": msg.Content,
		}
	}

	responseText, err := service.ChatWithGemini(req.Prompt, history, req.Rubro)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Gemini API error", err)
		return
	}

	writeJSON(w, http.StatusOK, model.ChatResponse{
		Text: responseText,
	})
}

func GetTrends(w http.ResponseWriter, r *http.Request) {
	city := r.URL.Query().Get("city")
	if city == "" {
		city = "Santiago"
	}

	responseText, err := service.GetCommercialMarketTrends(city)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Gemini API error", err)
		return
	}

	var trends model.MarketTrend
	json.Unmarshal([]byte(responseText), &trends)

	writeJSON(w, http.StatusOK, trends)
}
