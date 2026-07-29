package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	if err := os.MkdirAll("uploads", 0755); err != nil {
		log.Printf("Warning: failed to create uploads directory: %v", err)
	}

	mux := http.NewServeMux()

	// P1-3: Health check with DB ping
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		if err := repository.DB.Ping(); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"status":"unhealthy","error":"database unreachable"}`))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Auth routes (public)
	mux.HandleFunc("POST /api/auth/register", handler.Register)
	mux.HandleFunc("POST /api/auth/login", handler.Login)
	mux.HandleFunc("GET /api/auth/me", middleware.AuthMiddleware(handler.Me))

	// Properties
	mux.HandleFunc("GET /api/properties", handler.GetProperties)
	mux.HandleFunc("GET /api/properties/{id}", handler.GetProperty)
	mux.HandleFunc("POST /api/properties", middleware.AuthMiddleware(handler.CreateProperty))

	// Users
	// P0-6: Protect GET /api/users/{id} with auth
	mux.HandleFunc("GET /api/users/{id}", middleware.AuthMiddleware(handler.GetUser))
	mux.HandleFunc("PUT /api/users/{id}", middleware.AuthMiddleware(handler.UpdateUser))
	mux.HandleFunc("POST /api/users/{userId}/documents/{docId}/verify", middleware.AuthMiddleware(handler.VerifyDocument))

	// User preferences
	// P0-7: Protect GET /api/users/{id}/preferences with auth
	mux.HandleFunc("GET /api/users/{id}/preferences", middleware.AuthMiddleware(handler.GetPreferences))
	mux.HandleFunc("PUT /api/users/{id}/preferences", middleware.AuthMiddleware(handler.SavePreferences))

	// File uploads (protected)
	mux.HandleFunc("POST /api/upload/document/{userId}", middleware.AuthMiddleware(handler.UploadDocument))
	mux.HandleFunc("POST /api/upload/property-image/{propertyId}", middleware.AuthMiddleware(handler.UploadPropertyImage))

	// Matchmaking (P0-2: Add auth middleware)
	mux.HandleFunc("POST /api/match", middleware.AuthMiddleware(handler.CalculateMatchScore))
	mux.HandleFunc("POST /api/assessment", middleware.AuthMiddleware(handler.SubmitAssessment))

	// Chat & trends
	mux.HandleFunc("POST /api/chat", handler.Chat)
	mux.HandleFunc("GET /api/trends", handler.GetTrends)

	var h http.Handler = mux
	h = middleware.CORS(h)
	h = middleware.Logger(h)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// P1-2: Graceful shutdown
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: h,
	}

	go func() {
		log.Printf("Server starting on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("server forced to shutdown: %v", err)
	}
	log.Println("server stopped")
}
