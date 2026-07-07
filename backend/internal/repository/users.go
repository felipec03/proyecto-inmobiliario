package repository

import (
	"database/sql"
	"fmt"
	"milocal/backend/internal/model"
)

func GetUserByID(id string) (*model.UserProfile, error) {
	u := &model.UserProfile{}
	err := DB.QueryRow(`SELECT id, name, email, type, level, sub_type FROM users WHERE id = $1`, id).Scan(
		&u.ID, &u.Name, &u.Email, &u.Type, &u.Level, &u.SubType,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error fetching user: %w", err)
	}
	return u, nil
}

func GetUserDocuments(userID string) ([]model.Document, error) {
	rows, err := DB.Query(`SELECT id, user_id, name, type, status FROM documents WHERE user_id = $1`, userID)
	if err != nil {
		return nil, fmt.Errorf("error fetching documents: %w", err)
	}
	defer rows.Close()

	var docs []model.Document
	for rows.Next() {
		var d model.Document
		if err := rows.Scan(&d.ID, &d.UserID, &d.Name, &d.Type, &d.Status); err != nil {
			return nil, fmt.Errorf("error scanning document: %w", err)
		}
		docs = append(docs, d)
	}
	return docs, rows.Err()
}

func UpdateUser(id string, req model.UpdateUserRequest) (*model.UserProfile, error) {
	u, err := GetUserByID(id)
	if err != nil || u == nil {
		return nil, fmt.Errorf("user not found")
	}

	if req.Name != "" {
		u.Name = req.Name
	}
	if req.Email != "" {
		u.Email = req.Email
	}
	if req.SubType != "" {
		u.SubType = req.SubType
	}

	_, err = DB.Exec(`UPDATE users SET name=$1, email=$2, sub_type=$3, updated_at=NOW() WHERE id=$4`,
		u.Name, u.Email, u.SubType, id)
	if err != nil {
		return nil, fmt.Errorf("error updating user: %w", err)
	}

	return u, nil
}

func VerifyDocument(userID, docID string) (*model.Document, error) {
	_, err := DB.Exec(`UPDATE documents SET status='verified', updated_at=NOW() WHERE id=$1 AND user_id=$2`, docID, userID)
	if err != nil {
		return nil, fmt.Errorf("error verifying document: %w", err)
	}

	var d model.Document
	err = DB.QueryRow(`SELECT id, user_id, name, type, status FROM documents WHERE id=$1`, docID).Scan(
		&d.ID, &d.UserID, &d.Name, &d.Type, &d.Status,
	)
	if err != nil {
		return nil, fmt.Errorf("error fetching document: %w", err)
	}

	updateUserLevel(userID)

	return &d, nil
}

func updateUserLevel(userID string) {
	var total, verified int
	DB.QueryRow(`SELECT COUNT(*) FROM documents WHERE user_id=$1`, userID).Scan(&total)
	DB.QueryRow(`SELECT COUNT(*) FROM documents WHERE user_id=$1 AND status='verified'`, userID).Scan(&verified)

	level := 0
	if total > 0 && verified == total {
		level = 1
	}

	DB.Exec(`UPDATE users SET level=$1, updated_at=NOW() WHERE id=$2`, level, userID)
}
