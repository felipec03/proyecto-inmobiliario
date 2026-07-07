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
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Email        string   `json:"email"`
	Type         UserType `json:"type"`
	Level        int      `json:"level"`
	SubType      string   `json:"subType"`
	PasswordHash string   `json:"-"`
}

type UserProfileResponse struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Email   string   `json:"email"`
	Type    UserType `json:"type"`
	Level   int      `json:"level"`
	SubType string   `json:"subType"`
}

type Document struct {
	ID       string    `json:"id"`
	UserID   string    `json:"userId"`
	Name     string    `json:"name"`
	Type     DocType   `json:"type"`
	Status   DocStatus `json:"status"`
	FilePath string    `json:"filePath,omitempty"`
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

type UserPreferences struct {
	MaxBudget         float64 `json:"maxBudget"`
	MinSize           float64 `json:"minSize"`
	MaxSize           float64 `json:"maxSize"`
	PreferredLocation string  `json:"preferredLocation"`
}

type MatchRequest struct {
	PropertyID      string           `json:"propertyId"`
	Rubro           string           `json:"rubro"`
	UserPreferences *UserPreferences `json:"userPreferences,omitempty"`
}

type FeatureContrib struct {
	Dimension string  `json:"dimension"`
	Label     string  `json:"label"`
	Score     float64 `json:"score"`
	Weight    float64 `json:"weight"`
	MaxWeight float64 `json:"maxWeight"`
	Ideal     float64 `json:"ideal"`
	Actual    float64 `json:"actual"`
}

type MatchResponse struct {
	Score     float64         `json:"score"`
	Permitted bool            `json:"permitted"`
	SpecScore float64         `json:"specScore"`
	UserScore float64         `json:"userScore"`
	Breakdown []FeatureContrib `json:"breakdown"`
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

type RegisterRequest struct {
	Name     string   `json:"name"`
	Email    string   `json:"email"`
	Password string   `json:"password"`
	Type     UserType `json:"type"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string             `json:"token"`
	User  UserProfileResponse `json:"user"`
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
