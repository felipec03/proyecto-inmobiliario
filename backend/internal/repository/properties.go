package repository

import (
	"database/sql"
	"fmt"
	"milocal/backend/internal/model"

	"github.com/lib/pq"
)

type scanner interface {
	Scan(dest ...interface{}) error
}

func GetAllProperties(rubro string) ([]model.Property, error) {
	query := `SELECT id, title, price, currency, sqm, location, lat, lng, image, description,
		has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic,
		permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights
		FROM properties`

	var rows *sql.Rows
	var err error

	if rubro != "" {
		query += ` WHERE $1 = ANY(permitted_uses)`
		rows, err = DB.Query(query+" ORDER BY created_at DESC", rubro)
	} else {
		rows, err = DB.Query(query + " ORDER BY created_at DESC")
	}
	if err != nil {
		return nil, fmt.Errorf("error querying properties: %w", err)
	}
	defer rows.Close()

	var properties []model.Property
	for rows.Next() {
		p, err := scanProperty(rows)
		if err != nil {
			return nil, err
		}
		properties = append(properties, *p)
	}
	return properties, rows.Err()
}

func GetPropertyByID(id string) (*model.Property, error) {
	row := DB.QueryRow(`SELECT id, title, price, currency, sqm, location, lat, lng, image, description,
		has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic,
		permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights
		FROM properties WHERE id = $1`, id)
	return scanProperty(row)
}

func CreateProperty(p *model.Property) error {
	_, err := DB.Exec(`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description,
		has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic,
		permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
		p.ID, p.Title, p.Price, p.Currency, p.Sqm, p.Location, p.Lat, p.Lng, p.Image, p.Description,
		p.Specs.HasGas, string(p.Specs.PowerCapacity), p.Specs.WaterConnection, p.Specs.GreaseTrap,
		p.Specs.FrontageSize, string(p.Specs.FootTraffic),
		pq.Array(p.Specs.PermittedUses), pq.Array(p.NearbyPOIs),
		p.PastBusiness, p.RenovationNeeded, p.OwnerNotes, p.Negotiable, p.NeighborhoodInsights,
	)
	return err
}

func scanProperty(s scanner) (*model.Property, error) {
	p := &model.Property{}
	var hasGas, waterConn, greaseTrap, negotiable bool
	var powerCap, footTraf string
	var lat, lng float64
	var permittedUses, nearbyPOIs []string

	if err := s.Scan(
		&p.ID, &p.Title, &p.Price, &p.Currency, &p.Sqm, &p.Location, &lat, &lng, &p.Image, &p.Description,
		&hasGas, &powerCap, &waterConn, &greaseTrap, &p.Specs.FrontageSize, &footTraf,
		pq.Array(&permittedUses), pq.Array(&nearbyPOIs), &p.PastBusiness, &p.RenovationNeeded,
		&p.OwnerNotes, &negotiable, &p.NeighborhoodInsights,
	); err != nil {
		return nil, fmt.Errorf("error scanning property: %w", err)
	}

	p.Specs.HasGas = hasGas
	p.Specs.PowerCapacity = model.PowerCapacity(powerCap)
	p.Specs.WaterConnection = waterConn
	p.Specs.GreaseTrap = greaseTrap
	p.Specs.FootTraffic = model.FootTraffic(footTraf)
	p.Specs.PermittedUses = permittedUses
	p.NearbyPOIs = nearbyPOIs
	p.Lat = lat
	p.Lng = lng
	p.Negotiable = negotiable

	return p, nil
}
