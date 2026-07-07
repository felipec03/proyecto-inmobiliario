package model

import "time"

type BusinessRubro string

const (
	RubroGastronomia    BusinessRubro = "Gastronomía"
	RubroBelleza        BusinessRubro = "Belleza / estética"
	RubroRetail         BusinessRubro = "Retail"
	RubroServicios      BusinessRubro = "Servicios"
	RubroBodega         BusinessRubro = "Bodega / logística"
	RubroOtro           BusinessRubro = "Otro"
)

type UserType string

const (
	UserEntrepreneur UserType = "entrepreneur"
	UserOwner        UserType = "owner"
)

type DocStatus string

const (
	DocEmpty    DocStatus = "empty"
	DocPending  DocStatus = "pending"
	DocVerified DocStatus = "verified"
)

type DocType string

const (
	DocIdentity DocType = "identity"
	DocIncome   DocType = "income"
	DocLegal    DocType = "legal"
	DocProperty DocType = "property"
)

type PowerCapacity string

const (
	PowerBasica   PowerCapacity = "Básica"
	PowerTrifasica PowerCapacity = "Trifásica"
)

type FootTraffic string

const (
	TrafficBajo  FootTraffic = "Bajo"
	TrafficMedio FootTraffic = "Medio"
	TrafficAlto  FootTraffic = "Alto"
)

type UserProfile struct {
	ID       string     `json:"id"`
	Name     string     `json:"name"`
	Email    string     `json:"email"`
	Type     UserType   `json:"type"`
	Level    int        `json:"level"`
	SubType  string     `json:"subType"`
}

type Document struct {
	ID     string    `json:"id"`
	UserID string    `json:"userId"`
	Name   string    `json:"name"`
	Type   DocType   `json:"type"`
	Status DocStatus `json:"status"`
}

type CommercialSpecs struct {
	HasGas         bool           `json:"hasGas"`
	PowerCapacity  PowerCapacity   `json:"powerCapacity"`
	WaterConnection bool          `json:"waterConnection"`
	GreaseTrap     bool           `json:"greaseTrap"`
	FrontageSize   int            `json:"frontageSize"`
	FootTraffic    FootTraffic     `json:"footTraffic"`
	PermittedUses  []string       `json:"permittedUses"`
}

type Property struct {
	ID                   string          `json:"id"`
	Title                string          `json:"title"`
	Price                float64         `json:"price"`
	Currency             string          `json:"currency"`
	Sqm                  int             `json:"sqm"`
	Location             string          `json:"location"`
	Lat                  float64         `json:"lat"`
	Lng                  float64         `json:"lng"`
	Image                string          `json:"image"`
	Description          string          `json:"description"`
	Specs                CommercialSpecs `json:"specs"`
	NearbyPOIs           []string        `json:"nearbyPOIs"`
	PastBusiness         string          `json:"pastBusiness"`
	RenovationNeeded     string          `json:"renovationNeeded"`
	OwnerNotes           string          `json:"ownerNotes"`
	Negotiable           bool            `json:"negotiable"`
	NeighborhoodInsights string          `json:"neighborhoodInsights"`
}

type ChatMessage struct {
	Role    string                   `json:"role"`
	Content string                   `json:"content"`
	Sources []map[string]interface{} `json:"sources,omitempty"`
}

type ChatRequest struct {
	Prompt  string        `json:"prompt"`
	History []ChatMessage `json:"history"`
	Rubro   string        `json:"rubro,omitempty"`
}

type ChatResponse struct {
	Text    string                   `json:"text"`
	Sources []map[string]interface{} `json:"sources,omitempty"`
}

type MarketTrend struct {
	City        string       `json:"city"`
	AvgPriceSqm float64      `json:"avgPriceSqm"`
	DemandLevel string       `json:"demandLevel"`
	Summary     string       `json:"summary"`
	Trends      []TrendPoint `json:"trends"`
}

type TrendPoint struct {
	Month  string  `json:"month"`
	Growth float64 `json:"growth"`
}

type MatchRequest struct {
	PropertyID string `json:"propertyId"`
	Rubro      string `json:"rubro"`
}

type MatchResponse struct {
	Score   int      `json:"score"`
	Details []string `json:"details"`
}

type AssessmentRequest struct {
	UserType string                 `json:"userType"`
	Step     int                    `json:"step"`
	Data     map[string]interface{} `json:"data"`
}

type AssessmentResponse struct {
	Profile map[string]interface{} `json:"profile"`
}

type UpdateUserRequest struct {
	Name    string `json:"name,omitempty"`
	Email   string `json:"email,omitempty"`
	SubType string `json:"subType,omitempty"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func NewUserProfile(id, name, email string, userType UserType) *UserProfile {
	return &UserProfile{
		ID:      id,
		Name:    name,
		Email:   email,
		Type:    userType,
		Level:   0,
		SubType: "natural",
	}
}

type NullTime struct {
	Time  time.Time
	Valid bool
}
