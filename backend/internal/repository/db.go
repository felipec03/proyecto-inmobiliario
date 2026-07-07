package repository

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() error {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://milocal:milocal@localhost:5434/milocal?sslmode=disable"
	}

	var err error
	DB, err = sql.Open("postgres", dbURL)
	if err != nil {
		return fmt.Errorf("error opening database: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("error connecting to database: %w", err)
	}

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)

	log.Println("Database connection established")
	return nil
}

func RunMigrations() error {
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL UNIQUE,
			type VARCHAR(20) NOT NULL,
			level INT DEFAULT 0,
			sub_type VARCHAR(20) DEFAULT 'natural',
			password_hash TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT ''`,
		`CREATE TABLE IF NOT EXISTS documents (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) REFERENCES users(id),
			name VARCHAR(255) NOT NULL,
			type VARCHAR(20) NOT NULL,
			status VARCHAR(20) DEFAULT 'empty',
			file_path TEXT DEFAULT '',
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT DEFAULT ''`,
		`CREATE TABLE IF NOT EXISTS properties (
			id VARCHAR(36) PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			price DECIMAL(12,2) NOT NULL,
			currency VARCHAR(10) DEFAULT 'CLP',
			sqm INT NOT NULL,
			location VARCHAR(255) NOT NULL,
			lat DECIMAL(10,6),
			lng DECIMAL(10,6),
			image TEXT,
			description TEXT,
			has_gas BOOLEAN DEFAULT false,
			power_capacity VARCHAR(20) DEFAULT 'Básica',
			water_connection BOOLEAN DEFAULT false,
			grease_trap BOOLEAN DEFAULT false,
			frontage_size INT DEFAULT 0,
			foot_traffic VARCHAR(10) DEFAULT 'Bajo',
			permitted_uses TEXT[],
			nearby_pois TEXT[],
			past_business TEXT,
			renovation_needed TEXT,
			owner_notes TEXT,
			negotiable BOOLEAN DEFAULT false,
			neighborhood_insights TEXT,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS matches (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) REFERENCES users(id),
			property_id VARCHAR(36) REFERENCES properties(id),
			rubro VARCHAR(50),
			score INT,
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS chat_history (
			id SERIAL PRIMARY KEY,
			user_id VARCHAR(36) REFERENCES users(id),
			role VARCHAR(10) NOT NULL,
			content TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT NOW()
		)`,
	}

	for _, m := range migrations {
		if _, err := DB.Exec(m); err != nil {
			return fmt.Errorf("migration error: %w", err)
		}
	}

	if err := seedData(); err != nil {
		log.Printf("Warning: seed data error: %v", err)
	}

	log.Println("Migrations completed successfully")
	return nil
}

func seedData() error {
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM properties").Scan(&count)
	if count > 0 {
		return nil
	}

	seeds := []string{
		`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description, has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic, permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights) VALUES
		('1', 'Local Premium con Salida a Calle', 1200000, 'CLP', 45, 'Lastarria, Santiago', -33.4385, -70.6397, 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800', 'Local ideal para heladería o cafetería pequeña. Cuenta con conexión de agua reforzada y trifásica.', false, 'Trifásica', true, true, 4, 'Alto', ARRAY['Gastronomía','Retail'], ARRAY['Metro Univ. Católica (200m)','Centro GAM','Barrio Universitario'], 'Fue una boutique de ropa de diseño independiente por 4 años.', 'Pintura general y mantenimiento menor de sistema eléctrico.', 'Dispuesto a dar 1 mes de gracia por remodelación.', true, 'Zona de alto flujo turístico y estudiantil. Demanda constante los fines de semana.')`,

		`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description, has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic, permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights) VALUES
		('2', 'Bodega Urbana / Dark Store', 35000, 'MXN', 120, 'Colonia Roma, CDMX', 19.4149, -99.1623, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800', 'Espacio optimizado para logística de última milla o taller de servicios técnicos.', false, 'Básica', true, false, 2, 'Bajo', ARRAY['Bodega / logística','Servicios'], ARRAY['Av. Insurgentes (300m)','Metro Insurgentes','Área Residencial'], 'Distribuidora de insumos médicos.', 'Nivelación de piso en zona de carga.', 'Precio firme, pero incluye gastos comunes por el primer año.', false, 'Ubicación estratégica para delivery. Zona segura con control de acceso.')`,

		`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description, has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic, permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights) VALUES
		('3', 'Local Esquina Gran Visibilidad', 9500000, 'COP', 85, 'Vía Primavera, Medellín', 6.2084, -75.5663, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800', 'Local de alto impacto visual. Ideal para marca de retail o salón de belleza de lujo.', true, 'Trifásica', true, false, 12, 'Alto', ARRAY['Retail','Servicios','Otro'], ARRAY['Parque Lleras','Hotel Click Clack','Zona Rosa'], 'Restaurante-Bar de autor.', 'Remodelación de fachada requerida por reglamento de la zona.', 'Interesado en contratos a largo plazo (3+ años).', true, 'Zona comercial más exclusiva de la ciudad. Alto poder adquisitivo.')`,

		`INSERT INTO users (id, name, email, type, level, sub_type, password_hash) VALUES ('u1', 'Carlos Emprendedor', 'carlos@startup.cl', 'entrepreneur', 0, 'juridica', '') ON CONFLICT DO NOTHING`,

		`INSERT INTO documents (id, user_id, name, type, status) VALUES
		('d1', 'u1', 'Identidad Representante', 'identity', 'pending'),
		('d2', 'u1', 'Carpeta Tributaria', 'income', 'empty'),
		('d3', 'u1', 'Escritura Constitución', 'legal', 'empty')`,
	}

	for _, s := range seeds {
		if _, err := DB.Exec(s); err != nil {
			log.Printf("Seed warning: %v", err)
		}
	}

	log.Println("Seed data inserted")
	return nil
}
