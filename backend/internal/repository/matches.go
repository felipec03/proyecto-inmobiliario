package repository

import "fmt"

func SaveMatch(id, userID, propertyID, rubro string, score int) error {
	_, err := DB.Exec(`INSERT INTO matches (id, user_id, property_id, rubro, score)
		VALUES ($1, $2, $3, $4, $5)`,
		id, userID, propertyID, rubro, score)
	if err != nil {
		return fmt.Errorf("error saving match: %w", err)
	}
	return nil
}
