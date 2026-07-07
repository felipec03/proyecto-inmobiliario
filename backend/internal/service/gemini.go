package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const geminiBaseURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview"

func ChatWithGemini(prompt string, history []map[string]string, rubro string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	systemInstruction := fmt.Sprintf(`Eres MiLocal Advisor, un consultor experto en expansión comercial y Real Estate Estratégico.
Tu misión es ayudar a emprendedores a encontrar el local perfecto mediante un sistema de match.
%s
Evalúa factores como: visibilidad, flujo peatonal, compatibilidad de patentes comerciales y ROI.
Si preguntan por zonas específicas, usa Google Search para dar datos actualizados de barrios comerciales en Latam.`,
		rubroInstruction(rubro))

	var contents []map[string]interface{}
	for _, h := range history {
		contents = append(contents, map[string]interface{}{
			"role": h["role"],
			"parts": []map[string]string{{"text": h["content"]}},
		})
	}
	contents = append(contents, map[string]interface{}{
		"role":  "user",
		"parts": []map[string]string{{"text": prompt}},
	})

	body := map[string]interface{}{
		"contents": contents,
		"systemInstruction": map[string]interface{}{
			"parts": []map[string]string{{"text": systemInstruction}},
		},
		"tools": []map[string]interface{}{
			{"googleSearch": map[string]interface{}{}},
		},
	}

	return callGemini(apiKey, "generateContent", body)
}

func GetCommercialMarketTrends(city string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	body := map[string]interface{}{
		"contents": map[string]interface{}{
			"parts": []map[string]string{{
				"text": fmt.Sprintf(`Analiza las tendencias de REAL ESTATE COMERCIAL en %s para la plataforma MiLocal.
Datos de vacancia, precio por m2 en locales y zonas de mayor crecimiento para emprendimientos.
Usa Google Search para datos 2024-2025. Responde en JSON con esta estructura:
{"city":"%s","avgPriceSqm":<number>,"demandLevel":"<Alta/Media/Baja>","summary":"<resumen>","trends":[{"month":"<mes>","growth":<number>}]}`, city, city),
			}},
		},
		"tools": []map[string]interface{}{
			{"googleSearch": map[string]interface{}{}},
		},
	}

	return callGemini(apiKey, "generateContent", body)
}

func rubroInstruction(rubro string) string {
	if rubro == "" {
		return ""
	}
	return fmt.Sprintf("El usuario tiene un negocio de: %s. Enfoca tus consejos en las necesidades técnicas de este sector (permisos, tráfico, instalaciones).", rubro)
}

func callGemini(apiKey, endpoint string, body map[string]interface{}) (string, error) {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %w", err)
	}

	url := fmt.Sprintf("%s:%s?key=%s", geminiBaseURL, endpoint, apiKey)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("error calling Gemini API: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("gemini API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return string(respBody), nil
}
