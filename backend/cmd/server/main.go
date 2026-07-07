package main

import (
	"log"
	"net/http"
	"os"

	"milocal/backend/internal/handler"
	"milocal/backend/internal/middleware"
	"milocal/backend/internal/repository"
)

func main() {
	if err := repository.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	if err := repository.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	mux.HandleFunc("GET /api/properties", handler.GetProperties)
	mux.HandleFunc("GET /api/properties/{id}", handler.GetProperty)
	mux.HandleFunc("POST /api/properties", handler.CreateProperty)

	mux.HandleFunc("GET /api/users/{id}", handler.GetUser)
	mux.HandleFunc("PUT /api/users/{id}", handler.UpdateUser)
	mux.HandleFunc("POST /api/users/{userId}/documents/{docId}/verify", handler.VerifyDocument)

	mux.HandleFunc("POST /api/match", handler.CalculateMatchScore)
	mux.HandleFunc("POST /api/assessment", handler.SubmitAssessment)

	mux.HandleFunc("POST /api/chat", handler.Chat)
	mux.HandleFunc("GET /api/trends", handler.GetTrends)

	var h http.Handler = mux
	h = middleware.CORS(h)
	h = middleware.Logger(h)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, h); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
