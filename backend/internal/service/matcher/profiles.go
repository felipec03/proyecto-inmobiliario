package matcher

import "math"

const (
	DimTrifasica = iota
	DimGas
	DimAgua
	DimGreaseTrap
	DimFrente
	DimTrafico
	DimNegotiable
	DimBudgetFit
	DimSizeFit
	DimLocationMatch
	NumFeatureDims
)

type RubroProfile struct {
	Name            string
	IdealFeatures   []float64
	FeatureWeights  []float64
	UserPrefWeights float64 // 0-1, how much user prefs affect the score
}

var Profiles = map[string]RubroProfile{
	"Gastronomía": {
		Name: "Gastronomía",
		IdealFeatures: []float64{
			0.8, 1.0, 1.0, 1.0, 0.25, 0.8, 0.5,
		},
		FeatureWeights: []float64{
			0.10, 0.15, 0.10, 0.25, 0.05, 0.25, 0.10,
		},
		UserPrefWeights: 0.30,
	},
	"Belleza / estética": {
		Name: "Belleza / estética",
		IdealFeatures: []float64{
			0.5, 0.3, 0.8, 0.0, 0.3, 0.8, 0.5,
		},
		FeatureWeights: []float64{
			0.10, 0.05, 0.25, 0.05, 0.15, 0.30, 0.10,
		},
		UserPrefWeights: 0.25,
	},
	"Retail": {
		Name: "Retail",
		IdealFeatures: []float64{
			0.5, 0.0, 0.3, 0.0, 0.5, 0.8, 0.7,
		},
		FeatureWeights: []float64{
			0.05, 0.00, 0.05, 0.00, 0.30, 0.30, 0.30,
		},
		UserPrefWeights: 0.35,
	},
	"Servicios": {
		Name: "Servicios",
		IdealFeatures: []float64{
			0.6, 0.3, 0.6, 0.2, 0.2, 0.5, 0.5,
		},
		FeatureWeights: []float64{
			0.20, 0.05, 0.15, 0.05, 0.10, 0.20, 0.25,
		},
		UserPrefWeights: 0.25,
	},
	"Bodega / logística": {
		Name: "Bodega / logística",
		IdealFeatures: []float64{
			0.5, 0.0, 0.3, 0.0, 0.6, 0.2, 0.6,
		},
		FeatureWeights: []float64{
			0.10, 0.00, 0.05, 0.00, 0.40, 0.15, 0.30,
		},
		UserPrefWeights: 0.30,
	},
	"Otro": {
		Name: "Otro",
		IdealFeatures: []float64{
			0.5, 0.5, 0.5, 0.3, 0.3, 0.5, 0.5,
		},
		FeatureWeights: []float64{
			0.15, 0.15, 0.15, 0.10, 0.10, 0.20, 0.15,
		},
		UserPrefWeights: 0.30,
	},
}

func NormalizeWeights(weights []float64) []float64 {
	sum := 0.0
	for _, w := range weights {
		sum += w
	}
	if sum == 0 {
		return weights
	}
	normalized := make([]float64, len(weights))
	for i, w := range weights {
		normalized[i] = w / sum
	}
	return normalized
}

func extractSpecFeatures(hasGas, waterConn, greaseTrap bool, powerCap string,
	frontage int, footTraf string, negotiable bool) []float64 {

	f := make([]float64, 7)

	if powerCap == "Trifásica" {
		f[DimTrifasica] = 1.0
	}
	if hasGas {
		f[DimGas] = 1.0
	}
	if waterConn {
		f[DimAgua] = 1.0
	}
	if greaseTrap {
		f[DimGreaseTrap] = 1.0
	}

	f[DimFrente] = math.Min(float64(frontage)/20.0, 1.0)

	switch footTraf {
	case "Bajo":
		f[DimTrafico] = 0.33
	case "Medio":
		f[DimTrafico] = 0.66
	case "Alto":
		f[DimTrafico] = 1.0
	default:
		f[DimTrafico] = 0.33
	}

	if negotiable {
		f[DimNegotiable] = 1.0
	}

	return f
}

func extractUserFeatures(budget, price, sizeMin, sizeMax float64, sqm int,
	prefLocation, propLocation string) []float64 {

	uf := make([]float64, 3)

	if budget > 0 && price > 0 {
		ratio := price / budget
		if ratio <= 1.0 {
			uf[0] = 1.0
		} else if ratio <= 1.3 {
			uf[0] = 0.7
		} else if ratio <= 1.5 {
			uf[0] = 0.4
		} else {
			uf[0] = 0.1
		}
	} else {
		uf[0] = 0.5
	}

	if sizeMin > 0 || sizeMax > 0 {
		sqmF := float64(sqm)
		if sqmF >= sizeMin && sqmF <= sizeMax {
			uf[1] = 1.0
		} else if sizeMin > 0 && sqmF >= sizeMin*0.7 && sqmF <= sizeMax*1.3 {
			uf[1] = 0.6
		} else {
			uf[1] = 0.2
		}
	} else {
		uf[1] = 0.5
	}

	if prefLocation != "" && propLocation != "" {
		match := calculateLocationSimilarity(prefLocation, propLocation)
		uf[2] = match
	} else {
		uf[2] = 0.5
	}

	return uf
}

func calculateLocationSimilarity(pref, prop string) float64 {
	if pref == "" || prop == "" {
		return 0.5
	}
	prefLower := toLower(pref)
	propLower := toLower(prop)

	if prefLower == propLower {
		return 1.0
	}
	if len(prefLower) >= 3 && len(propLower) >= 3 {
		if prefLower[:3] == propLower[:3] {
			return 0.8
		}
	}

	prefWords := split(prefLower)
	propWords := split(propLower)
	for _, pw := range prefWords {
		for _, pwp := range propWords {
			if pw == pwp {
				return 0.6
			}
		}
	}

	return 0.2
}

func toLower(s string) string {
	b := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			b[i] = c + 32
		} else {
			b[i] = c
		}
	}
	return string(b)
}

func split(s string) []string {
	var words []string
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] == ' ' || s[i] == ',' || s[i] == '-' {
			if i > start {
				words = append(words, s[start:i])
			}
			start = i + 1
		}
	}
	if start < len(s) {
		words = append(words, s[start:])
	}
	return words
}
