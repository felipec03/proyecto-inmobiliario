package repository

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

const seedPasswordHash = "$2b$10$/3.fa3KWEGIQHlzaF4G72OXjasnoD1GqSwp9wajT24J2lVCQGY.AS"

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
		// Migration 002: user data
		`CREATE TABLE IF NOT EXISTS assessments (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			user_type VARCHAR(20) NOT NULL,
			step INT NOT NULL DEFAULT 0,
			data JSONB NOT NULL DEFAULT '{}',
			completed BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id)`,
		`CREATE TABLE IF NOT EXISTS user_preferences (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
			rubro VARCHAR(50),
			max_budget DECIMAL(12,2),
			min_size INT,
			max_size INT,
			commune_id VARCHAR(5),
			preferred_location TEXT,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_id VARCHAR(36) REFERENCES users(id)`,
		`CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id)`,
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
		// Owner user
		`INSERT INTO users (id, name, email, type, level, sub_type, password_hash) VALUES ('o1', 'María Propietaria', 'owner@milocal.cl', 'owner', 0, 'natural', '` + seedPasswordHash + `') ON CONFLICT DO NOTHING`,

		// Entrepreneur user
		`INSERT INTO users (id, name, email, type, level, sub_type, password_hash) VALUES ('u1', 'Carlos Emprendedor', 'carlos@startup.cl', 'entrepreneur', 0, 'juridica', '` + seedPasswordHash + `') ON CONFLICT DO NOTHING`,

		// Property 1: Cocina Lastarria
		`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description, owner_id, has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic, permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights) VALUES
		('1', 'Cocina Lastarria', 1200000, 'CLP', 45, 'Lastarria, Santiago', -33.4385, -70.6397, 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800', 'Local ideal para heladería o cafetería pequeña. Cuenta con conexión de agua reforzada y trifásica. Perfecto para emprendimientos gastronómicos en el corazón del barrio Lastarria.', 'o1', false, 'Trifásica', true, true, 4, 'Alto', ARRAY['Gastronomía','Retail'], ARRAY['Metro Univ. Católica (200m)','Centro GAM','Barrio Universitario'], 'Fue una boutique de ropa de diseño independiente por 4 años.', 'Pintura general y mantenimiento menor de sistema eléctrico.', 'Dispuesto a dar 1 mes de gracia por remodelación.', true, 'Zona de alto flujo turístico y estudiantil. Demanda constante los fines de semana.')`,

		// Property 2: Showroom Providencia
		`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description, owner_id, has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic, permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights) VALUES
		('2', 'Showroom Providencia', 900000, 'CLP', 30, 'Providencia, Santiago', -33.4314, -70.6097, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800', 'Showroom boutique con excelente vitrina y alta visibilidad peatonal. Ideal para marcas de retail, diseño o moda independiente.', 'o1', false, 'Básica', true, false, 8, 'Alto', ARRAY['Retail','Servicios'], ARRAY['Metro Pedro de Valdivia (150m)','Mall Costanera Center','Barrio El Golf'], 'Showroom de diseñador emergente por 2 años.', 'Listo para operar. Solo requiere decoración.', 'Abierto a negociar canon de arriendo por contrato a 2+ años.', true, 'Eje comercial de alto poder adquisitivo. Alta rotación de público objetivo.')`,

		// Property 3: Bodega Quilicura
		`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description, owner_id, has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic, permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights) VALUES
		('3', 'Bodega Quilicura', 650000, 'CLP', 200, 'Quilicura, Santiago', -33.3667, -70.7333, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800', 'Amplia bodega industrial con acceso a gran frente de carga y descarga. Conexión trifásica y excelente para logística de última milla.', 'o1', false, 'Trifásica', true, false, 15, 'Bajo', ARRAY['Bodega / logística','Otro'], ARRAY['Autopista Vespucio Norte (500m)','Parque Industrial Quilicura','Metro Quilicura (1.2km)'], 'Centro de distribución de insumos industriales.', 'Nivelación de piso en zona de carga.', 'Incluye gastos comunes por el primer año.', false, 'Zona industrial en expansión. Conectividad privilegiada con acceso directo a autopistas.')`,

		// Property 4: Consultorio Las Condes
		`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description, owner_id, has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic, permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights) VALUES
		('4', 'Consultorio Las Condes', 1500000, 'CLP', 80, 'Las Condes, Santiago', -33.4167, -70.5833, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', 'Espacio profesional de 80m² con sala de espera, 3 consultas independientes y baño privado. Recepción incluida. Ideal para centro médico, dental o psicológico.', 'o1', false, 'Trifásica', true, false, 6, 'Medio', ARRAY['Servicios','Otro'], ARRAY['Metro El Golf (300m)','Clínica Las Condes','Centro Empresarial Nueva Las Condes'], 'Consultorio dental con 5 años de funcionamiento.', 'Listo para operar. Pintura reciente y sistema eléctrico actualizado.', 'Incluye estacionamiento para 2 autos.', true, 'Sector corporativo premium. Alta demanda de servicios profesionales. Poco ruido, ideal para atención de pacientes.')`,

		// Property 5: Spa Ñuñoa
		`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description, owner_id, has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic, permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights) VALUES
		('5', 'Spa Ñuñoa', 750000, 'CLP', 35, 'Ñuñoa, Santiago', -33.4589, -70.6036, 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800', 'Acogedor local con excelente iluminación natural. Conexión de agua reforzada para instalación de lavatorios y camillas. Perfecto para peluquería o centro de estética.', 'o1', false, 'Básica', true, false, 3, 'Medio', ARRAY['Belleza / estética','Servicios'], ARRAY['Metro Ñuñoa (400m)','Plaza Ñuñoa','Teatro UC'], 'Peluquería boutique con clientela fidelizada.', 'Requiere remodelación de baño.', 'Apoyo con contactos de proveedores de equipamiento de estética.', true, 'Barrio residencial consolidado. Comunidad activa con alta valoración de servicios de belleza y bienestar.')`,

		// Property 6: Dark Kitchen La Florida
		`INSERT INTO properties (id, title, price, currency, sqm, location, lat, lng, image, description, owner_id, has_gas, power_capacity, water_connection, grease_trap, frontage_size, foot_traffic, permitted_uses, nearby_pois, past_business, renovation_needed, owner_notes, negotiable, neighborhood_insights) VALUES
		('6', 'Dark Kitchen La Florida', 500000, 'CLP', 25, 'La Florida, Santiago', -33.5333, -70.5833, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800', 'Cocina equipada con campana, mesones de acero y conexión de gas certificada. Trampa de grasa instalada. Lista para operar apps de delivery.', 'o1', true, 'Trifásica', true, true, 2, 'Bajo', ARRAY['Gastronomía','Bodega / logística'], ARRAY['Metro Bellavista de La Florida (600m)','Mall Florida Center','Av. Vicuña Mackenna'], 'Dark kitchen de comida japonesa con buenas calificaciones en apps.', 'Mantenimiento menor de campana extractora.', 'Incluye permisos sanitarios vigentes por 6 meses.', false, 'Zona de alta densidad poblacional. Mercado de delivery en crecimiento con más de 200.000 habitantes en radio de entrega.')`,

		// Documents for entrepreneur user
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
