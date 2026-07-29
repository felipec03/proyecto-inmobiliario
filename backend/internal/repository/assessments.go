package repository

import (
	"encoding/json"
	"fmt"
)

func SaveAssessment(id, userID, userType string, step int, data map[string]interface{}, completed bool) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("error marshaling assessment data: %w", err)
	}

	_, err = DB.Exec(`INSERT INTO assessments (id, user_id, user_type, step, data, completed)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (id) DO UPDATE SET
			step = EXCLUDED.step,
			data = EXCLUDED.data,
			completed = EXCLUDED.completed,
			updated_at = NOW()`,
		id, userID, userType, step, jsonData, completed)
	if err != nil {
		return fmt.Errorf("error saving assessment: %w", err)
	}
	return nil
}
