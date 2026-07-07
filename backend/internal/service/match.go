package service

import (
	"milocal/backend/internal/model"
)

func CalculateMatch(property *model.Property, rubro string) int {
	score := 0

	for _, use := range property.Specs.PermittedUses {
		if use == rubro {
			score += 50
			break
		}
	}

	switch rubro {
	case "Gastronomía":
		if property.Specs.GreaseTrap {
			score += 20
		}
		if property.Specs.HasGas {
			score += 20
		}
		if property.Specs.FootTraffic == model.TrafficAlto {
			score += 10
		}
	case "Retail":
		if property.Specs.FrontageSize > 5 {
			score += 30
		}
		if property.Specs.FootTraffic == model.TrafficAlto {
			score += 20
		}
	default:
		score += 30
	}

	if score > 99 {
		score = 99
	}

	return score
}

func GetMatchDetails(property *model.Property, rubro string) []string {
	details := []string{}

	permitted := false
	for _, use := range property.Specs.PermittedUses {
		if use == rubro {
			permitted = true
			break
		}
	}

	if permitted {
		details = append(details, "Uso permitido para "+rubro)
	} else {
		details = append(details, "Permisos limitados para "+rubro)
	}

	if property.Specs.GreaseTrap {
		details = append(details, "Cuenta con trampa de grasa")
	}
	if property.Specs.HasGas {
		details = append(details, "Conexión de gas disponible")
	}
	if property.Specs.WaterConnection {
		details = append(details, "Conexión de agua disponible")
	}
	if property.Specs.PowerCapacity == model.PowerTrifasica {
		details = append(details, "Capacidad eléctrica trifásica")
	}
	if property.Specs.FrontageSize > 5 {
		details = append(details, "Buen frente comercial (>5m)")
	}
	if property.Negotiable {
		details = append(details, "Precio negociable")
	}

	return details
}
