package service

import (
	"milocal/backend/internal/model"
	"milocal/backend/internal/service/matcher"
)

func CalculateMatch(property *model.Property, rubro string) int {
	result := matcher.Calculate(property, rubro, nil)
	return int(result.Score * 100)
}

func GetMatchDetails(property *model.Property, rubro string) []string {
	result := matcher.Calculate(property, rubro, nil)

	details := []string{}

	for _, b := range result.Breakdown {
		if b.Score > 0 && b.Weight > 0 {
			percentage := int(b.Score / b.Weight * 100)
			if percentage > 0 {
				details = append(details, b.Label+": "+mapPercentage(percentage))
			}
		}
	}

	if !result.Permitted {
		details = append([]string{"Permisos limitados para " + rubro}, details...)
	} else {
		details = append([]string{"Uso permitido para " + rubro}, details...)
	}

	if property.Negotiable {
		details = append(details, "Precio negociable")
	}

	return details
}

func mapPercentage(pct int) string {
	switch {
	case pct >= 90:
		return "Excelente"
	case pct >= 70:
		return "Muy bueno"
	case pct >= 50:
		return "Aceptable"
	case pct >= 25:
		return "Básico"
	default:
		return "Limitado"
	}
}
