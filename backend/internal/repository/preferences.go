package repository

import (
	"database/sql"
	"fmt"

	"milocal/backend/internal/model"
)

func GetUserPreferences(userID string) (*model.UserPreferences, error) {
	prefs := &model.UserPreferences{}
	var rubro, communeID, prefLocation sql.NullString
	var maxBudget sql.NullFloat64
	var minSize, maxSize sql.NullInt64

	err := DB.QueryRow(`SELECT rubro, max_budget, min_size, max_size, commune_id, preferred_location
		FROM user_preferences WHERE user_id = $1`, userID).Scan(
		&rubro, &maxBudget, &minSize, &maxSize, &communeID, &prefLocation,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error fetching user preferences: %w", err)
	}

	if rubro.Valid {
		prefs.Rubro = rubro.String
	}
	if maxBudget.Valid {
		prefs.MaxBudget = maxBudget.Float64
	}
	if minSize.Valid {
		prefs.MinSize = float64(minSize.Int64)
	}
	if maxSize.Valid {
		prefs.MaxSize = float64(maxSize.Int64)
	}
	if communeID.Valid {
		prefs.CommuneID = communeID.String
	}
	if prefLocation.Valid {
		prefs.PreferredLocation = prefLocation.String
	}

	return prefs, nil
}

func SaveUserPreferences(id, userID string, prefs model.UserPreferences) error {
	_, err := DB.Exec(`INSERT INTO user_preferences (id, user_id, rubro, max_budget, min_size, max_size, commune_id, preferred_location)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id) DO UPDATE SET
			rubro = EXCLUDED.rubro,
			max_budget = EXCLUDED.max_budget,
			min_size = EXCLUDED.min_size,
			max_size = EXCLUDED.max_size,
			commune_id = EXCLUDED.commune_id,
			preferred_location = EXCLUDED.preferred_location,
			updated_at = NOW()`,
		id, userID, prefs.Rubro, prefs.MaxBudget, int(prefs.MinSize), int(prefs.MaxSize), prefs.CommuneID, prefs.PreferredLocation)
	if err != nil {
		return fmt.Errorf("error saving user preferences: %w", err)
	}
	return nil
}
