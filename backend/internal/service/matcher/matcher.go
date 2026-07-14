package matcher

import "milocal/backend/internal/model"

type UserPreferences struct {
	MaxBudget        float64 `json:"maxBudget"`
	MinSize          float64 `json:"minSize"`
	MaxSize          float64 `json:"maxSize"`
	PreferredLocation string `json:"preferredLocation"`
}

func Calculate(property *model.Property, rubro string, prefs *UserPreferences) EngineResult {
	permitted := false
	for _, use := range property.Specs.PermittedUses {
		if use == rubro {
			permitted = true
			break
		}
	}

	specFeats := extractSpecFeatures(
		property.Specs.HasGas,
		property.Specs.WaterConnection,
		property.Specs.GreaseTrap,
		string(property.Specs.PowerCapacity),
		property.Specs.FrontageSize,
		string(property.Specs.FootTraffic),
		property.Negotiable,
	)

	budget := 0.0
	sizeMin := 0.0
	sizeMax := 0.0
	prefLoc := ""

	if prefs != nil {
		budget = prefs.MaxBudget
		sizeMin = prefs.MinSize
		sizeMax = prefs.MaxSize
		prefLoc = prefs.PreferredLocation
	}

	userFeats := extractUserFeatures(budget, property.Price, sizeMin, sizeMax, property.Sqm, prefLoc, property.Location)

	return Score(specFeats, userFeats, rubro, permitted)
}
