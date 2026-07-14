package matcher

import "math"

type FeatureContrib struct {
	Dimension string  `json:"dimension"`
	Label     string  `json:"label"`
	Score     float64 `json:"score"`
	Weight    float64 `json:"weight"`
	MaxWeight float64 `json:"maxWeight"`
	Ideal     float64 `json:"ideal"`
	Actual    float64 `json:"actual"`
}

type EngineResult struct {
	Score        float64            `json:"score"`
	Permitted    bool               `json:"permitted"`
	Breakdown    []FeatureContrib   `json:"breakdown"`
	UserScore    float64            `json:"userScore"`
	SpecScore    float64            `json:"specScore"`
}

var dimensionLabels = []string{
	"Capacidad Eléctrica",
	"Conexión de Gas",
	"Conexión de Agua",
	"Trampa de Grasa",
	"Frente Comercial",
	"Flujo Peatonal",
	"Precio Negociable",
	"Ajuste de Presupuesto",
	"Ajuste de Tamaño",
	"Coincidencia de Ubicación",
}

var dimensionKeys = []string{
	"power",
	"gas",
	"water",
	"grease",
	"frontage",
	"traffic",
	"negotiable",
	"budget",
	"size",
	"location",
}

func Score(propertyFeats []float64, userFeats []float64, rubro string, permitted bool) EngineResult {
	profile, ok := Profiles[rubro]
	if !ok {
		profile = Profiles["Otro"]
	}

	normWeights := NormalizeWeights(profile.FeatureWeights)

	specScore := weightedDistance(propertyFeats, profile.IdealFeatures, normWeights)

	userWeights := []float64{0.4, 0.3, 0.3}
	userScore := weightedDistance(userFeats, []float64{1.0, 1.0, 1.0}, userWeights)

	finalScore := specScore*(1.0-profile.UserPrefWeights) + userScore*profile.UserPrefWeights

	if !permitted {
		finalScore = math.Min(finalScore, 0.29)
	}

	finalScore = math.Round(finalScore*100.0) / 100.0

	fullFeats := append(append([]float64{}, propertyFeats...), userFeats...)
	fullIdeal := append(append([]float64{}, profile.IdealFeatures...), 1.0, 1.0, 1.0)
	fullWeights := make([]float64, 10)
	for i, w := range normWeights {
		fullWeights[i] = w * (1.0 - profile.UserPrefWeights)
	}
	for i := 0; i < 3; i++ {
		fullWeights[7+i] = userWeights[i] * profile.UserPrefWeights
	}
	fullWeights = NormalizeWeights(fullWeights)

	breakdown := make([]FeatureContrib, 10)
	for i := 0; i < 10; i++ {
		actual := 0.0
		if i < len(fullFeats) {
			actual = fullFeats[i]
		}
		ideal := 0.0
		if i < len(fullIdeal) {
			ideal = fullIdeal[i]
		}

		diff := math.Abs(actual - ideal)
		dimScore := (1.0 - diff) * fullWeights[i]

		breakdown[i] = FeatureContrib{
			Dimension: dimensionKeys[i],
			Label:     dimensionLabels[i],
			Score:     math.Round(dimScore*1000) / 1000,
			Weight:    math.Round(fullWeights[i]*100) / 100,
			MaxWeight: math.Round(fullWeights[i]*100) / 100,
			Ideal:     math.Round(ideal*100) / 100,
			Actual:    math.Round(actual*100) / 100,
		}
	}

	return EngineResult{
		Score:     finalScore,
		Permitted: permitted,
		Breakdown: breakdown,
		UserScore: math.Round(userScore*100) / 100,
		SpecScore: math.Round(specScore*100) / 100,
	}
}

func weightedDistance(actual, ideal, weights []float64) float64 {
	if len(actual) != len(ideal) || len(actual) != len(weights) {
		return 0
	}

	totalWeight := 0.0
	weightedSum := 0.0

	for i := 0; i < len(actual); i++ {
		diff := math.Abs(actual[i] - ideal[i])
		dimScore := 1.0 - diff
		if dimScore < 0 {
			dimScore = 0
		}
		weightedSum += dimScore * weights[i]
		totalWeight += weights[i]
	}

	if totalWeight == 0 {
		return 0
	}

	return weightedSum / totalWeight
}
