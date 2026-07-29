package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"milocal/backend/internal/middleware"
	"milocal/backend/internal/repository"
)

const maxUploadSize = 10 << 20

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".pdf":  true,
}

func UploadDocument(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	if userID == "" {
		writeError(w, http.StatusBadRequest, "Missing userId", "")
		return
	}

	// P0-1: Authorization — JWT userID must match the resource owner
	jwtUserID := middleware.GetUserIDFromContext(r.Context())
	if jwtUserID != userID {
		writeError(w, http.StatusForbidden, "No tienes permiso para modificar este perfil", "")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		writeError(w, http.StatusBadRequest, "File too large or invalid form", "max file size is 10MB")
		return
	}
	defer r.MultipartForm.RemoveAll()

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "Missing file", "field name must be 'file'")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		writeError(w, http.StatusBadRequest, "Invalid file type",
			fmt.Sprintf("allowed types: jpg, jpeg, png, pdf. Got: %s", ext))
		return
	}

	uploadDir := filepath.Join("uploads", "documents", userID)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error creating upload directory", err)
		return
	}

	safeFilename := sanitizeFilename(header.Filename)
	filePath := filepath.Join(uploadDir, safeFilename)

	dst, err := os.Create(filePath)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error creating file", err)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error saving file", err)
		return
	}

	docType := r.FormValue("type")
	if docType == "" {
		docType = "identity"
	}
	docName := r.FormValue("name")
	if docName == "" {
		docName = header.Filename
	}

	docID := r.FormValue("documentId")

	if docID != "" {
		if err := repository.UpdateDocumentFilePath(docID, userID, filePath); err != nil {
			sanitizedError(w, http.StatusInternalServerError, "Error updating document", err)
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"filePath":   filePath,
		"filename":   header.Filename,
		"size":       header.Size,
		"documentId": docID,
		"type":       docType,
		"name":       docName,
	})
}

func UploadPropertyImage(w http.ResponseWriter, r *http.Request) {
	propertyID := r.PathValue("propertyId")
	if propertyID == "" {
		writeError(w, http.StatusBadRequest, "Missing propertyId", "")
		return
	}

	// P0-1: Authorization — verify property owner matches JWT user
	jwtUserID := middleware.GetUserIDFromContext(r.Context())
	property, err := repository.GetPropertyByID(propertyID)
	if err != nil {
		sanitizedError(w, http.StatusNotFound, "Property not found", err)
		return
	}
	if property.OwnerID != jwtUserID {
		writeError(w, http.StatusForbidden, "No tienes permiso para modificar esta propiedad", "")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		writeError(w, http.StatusBadRequest, "File too large or invalid form", "max file size is 10MB")
		return
	}
	defer r.MultipartForm.RemoveAll()

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "Missing file", "field name must be 'file'")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		writeError(w, http.StatusBadRequest, "Invalid file type",
			fmt.Sprintf("only jpg, jpeg, png allowed for property images. Got: %s", ext))
		return
	}

	uploadDir := filepath.Join("uploads", "properties", propertyID)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error creating upload directory", err)
		return
	}

	safeFilename := sanitizeFilename(header.Filename)
	filePath := filepath.Join(uploadDir, safeFilename)

	dst, err := os.Create(filePath)
	if err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error creating file", err)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error saving file", err)
		return
	}

	imageURL := "/" + filePath

	if err := repository.UpdatePropertyImage(propertyID, imageURL); err != nil {
		sanitizedError(w, http.StatusInternalServerError, "Error updating property", err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"filePath":   filePath,
		"imageUrl":   imageURL,
		"filename":   header.Filename,
		"size":       header.Size,
		"propertyId": propertyID,
	})
}

func sanitizeFilename(name string) string {
	name = filepath.Base(name)
	ext := filepath.Ext(name)
	base := strings.TrimSuffix(name, ext)

	base = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			return r
		}
		return '_'
	}, base)

	if base == "" {
		base = "file"
	}

	return base + strings.ToLower(ext)
}
