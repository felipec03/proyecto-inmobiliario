# Plan de Matchmaking - MiLocal

> _Documento de referencia para el diseño, evolución y mantenimiento del motor de compatibilidad._

## 1. Estado Actual del Motor

El motor de matchmaking está completamente implementado como un sistema de **Weighted Feature Distance** en `internal/service/matcher/`. La implementación actual soporta:

- **7 dimensiones técnicas** (especificaciones del local): capacidad eléctrica, gas, agua, trampa de grasas, frente comercial, flujo peatonal, precio negociable.
- **3 dimensiones de preferencias del usuario**: ajuste de presupuesto, ajuste de tamaño, coincidencia de ubicación.
- **6 perfiles de rubro** con pesos e ideales específicos: Gastronomía, Belleza/Estética, Retail, Servicios, Bodega/Logística, Otro.
- **Regla dura**: cap en 29% si el rubro no está en los usos permitidos de la propiedad.
- **Explainability completa**: cada match devuelve el desglose completo (`specScore`, `userScore`, `breakdown` por dimensión).

## 2. Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  POST /api/match  ──►  handler.CalculateMatchScore()        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  service.CalculateMatch()  ──►  matcher.Calculate()         │
│  service.GetMatchDetails()                                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              matcher/matcher.go (Orquestador)                │
│                                                              │
│  ┌──────────────────┐     ┌───────────────────┐             │
│  │ extractSpecFeatures()│  │ extractUserFeatures()│           │
│  │ 7-dim technical  │     │ 3-dim preferences │             │
│  │ vector           │     │ vector            │             │
│  └───────┬──────────┘     └────────┬──────────┘             │
│          │                         │                         │
│          └──────────┬──────────────┘                         │
│                     ▼                                        │
│  ┌──────────────────────────────────────┐                    │
│  │  engine.Score()                      │                    │
│  │  - Weighted Manhattan Distance       │                    │
│  │  - Spec score (rubro profile)        │                    │
│  │  - User score (preferences)          │                    │
│  │  - Blended final score               │                    │
│  │  - Hard cap 29% if !permitted        │                    │
│  │  - Feature breakdown                 │                    │
│  └──────────────────────────────────────┘                    │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────┐                    │
│  │  matcher/profiles.go                 │                    │
│  │  - RubroProfile{IdealFeatures,       │                    │
│  │    FeatureWeights, UserPrefWeights}  │                    │
│  │  - extractSpecFeatures()             │                    │
│  │  - extractUserFeatures()             │                    │
│  │  - NormalizeWeights()                │                    │
│  └──────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Repository Layer                           │
│  repository.GetPropertyByID(id)  ──►  model.Property        │
└─────────────────────────────────────────────────────────────┘
```

## 3. Dimensiones de Features Explicadas

### 3.1 Dimensiones Técnicas (Specs) — Vector de 7 elementos

| # | Dimensión           | Key       | Tipo     | Encoding                            |
|---|--------------------|-----------|----------|-------------------------------------|
| 0 | Capacidad Eléctrica | `power`   | Binario  | Básica = 0.0, Trifásica = 1.0      |
| 1 | Conexión de Gas    | `gas`     | Binario  | No = 0.0, Sí = 1.0                 |
| 2 | Conexión de Agua   | `water`   | Binario  | No = 0.0, Sí = 1.0                 |
| 3 | Trampa de Grasa    | `grease`  | Binario  | No = 0.0, Sí = 1.0                 |
| 4 | Frente Comercial   | `frontage`| Normalizado | min(metros/20, 1.0)             |
| 5 | Flujo Peatonal     | `traffic` | Ordinal  | Bajo = 0.33, Medio = 0.66, Alto = 1.0 |
| 6 | Precio Negociable  | `negotiable`| Binario | No = 0.0, Sí = 1.0              |

### 3.2 Dimensiones de Preferencias (User) — Vector de 3 elementos

| # | Dimensión          | Key       | Tipo     | Encoding                                      |
|---|--------------------|-----------|----------|-----------------------------------------------|
| 7 | Ajuste Presupuesto | `budget`  | Función  | price ≤ budget → 1.0, ≤ 1.3x → 0.7, ≤ 1.5x → 0.4, else → 0.1; sin pref → 0.5 |
| 8 | Ajuste Tamaño      | `size`    | Función  | sqm en rango → 1.0, ±30% → 0.6, else → 0.2; sin pref → 0.5 |
| 9 | Match Ubicación    | `location`| Similitud | exacta = 1.0, prefijo 3 letras = 0.8, palabra común = 0.6, else = 0.2; sin pref = 0.5 |

## 4. Perfiles de Rubro Mapeados

Cada rubro define un `RubroProfile` con tres componentes:

- **IdealFeatures** (vector de 7): valor "perfecto" esperado para cada dimensión técnica.
- **FeatureWeights** (vector de 7): importancia relativa de cada dimensión (suma normalizada = 1.0).
- **UserPrefWeights** (escalar 0-1): cuánto pesan las preferencias personales vs. las specs técnicas en el score final.

### Gastronomía

| Dimensión | Ideal | Peso (norm.) |
|-----------|-------|-------------|
| Trifásica | 0.80  | 10%         |
| Gas       | 1.00  | 15%         |
| Agua      | 1.00  | 10%         |
| Trampa    | 1.00  | 25%         |
| Frente    | 0.25  | 5%          |
| Tráfico   | 0.80  | 25%         |
| Negociable| 0.50  | 10%         |
| *UserPrefWeight* | — | **30%** |

### Belleza / Estética

| Dimensión | Ideal | Peso (norm.) |
|-----------|-------|-------------|
| Trifásica | 0.50  | 10%         |
| Gas       | 0.30  | 5%          |
| Agua      | 0.80  | 25%         |
| Trampa    | 0.00  | 5%          |
| Frente    | 0.30  | 15%         |
| Tráfico   | 0.80  | 30%         |
| Negociable| 0.50  | 10%         |
| *UserPrefWeight* | — | **25%** |

### Retail

| Dimensión | Ideal | Peso (norm.) |
|-----------|-------|-------------|
| Trifásica | 0.50  | 5%          |
| Gas       | 0.00  | 0%          |
| Agua      | 0.30  | 5%          |
| Trampa    | 0.00  | 0%          |
| Frente    | 0.50  | 30%         |
| Tráfico   | 0.80  | 30%         |
| Negociable| 0.70  | 30%         |
| *UserPrefWeight* | — | **35%** |

### Servicios

| Dimensión | Ideal | Peso (norm.) |
|-----------|-------|-------------|
| Trifásica | 0.60  | 20%         |
| Gas       | 0.30  | 5%          |
| Agua      | 0.60  | 15%         |
| Trampa    | 0.20  | 5%          |
| Frente    | 0.20  | 10%         |
| Tráfico   | 0.50  | 20%         |
| Negociable| 0.50  | 25%         |
| *UserPrefWeight* | — | **25%** |

### Bodega / Logística

| Dimensión | Ideal | Peso (norm.) |
|-----------|-------|-------------|
| Trifásica | 0.50  | 10%         |
| Gas       | 0.00  | 0%          |
| Agua      | 0.30  | 5%          |
| Trampa    | 0.00  | 0%          |
| Frente    | 0.60  | 40%         |
| Tráfico   | 0.20  | 15%         |
| Negociable| 0.60  | 30%         |
| *UserPrefWeight* | — | **30%** |

### Otro (default/fallback)

| Dimensión | Ideal | Peso (norm.) |
|-----------|-------|-------------|
| Trifásica | 0.50  | 15%         |
| Gas       | 0.50  | 15%         |
| Agua      | 0.50  | 15%         |
| Trampa    | 0.30  | 10%         |
| Frente    | 0.30  | 10%         |
| Tráfico   | 0.50  | 20%         |
| Negociable| 0.50  | 15%         |
| *UserPrefWeight* | — | **30%** |

## 5. Weighted Feature Distance — Fórmula

### 5.1 Score de Especificaciones (specScore)

```
specScore = Σ( weight[i] × (1 - |actual[i] - ideal[i]|) ) / Σ(weight[i])
```

Es una **distancia Manhattan ponderada y normalizada**. Cada dimensión i mide qué tan cerca está el valor real del ideal definido para el rubro.

- `actual[i]` ∈ [0, 1]: valor extraído de la propiedad.
- `ideal[i]` ∈ [0, 1]: valor definido en `RubroProfile.IdealFeatures[i]`.
- `weight[i]`: peso normalizado del perfil de rubro.

### 5.2 Score de Preferencias (userScore)

```
userScore = Σ( userWeight[j] × (1 - |userActual[j] - userIdeal[j]|) ) / Σ(userWeight[j])
```

- `userActual[j]`: vector de 3 elementos (budget fit, size fit, location match).
- `userIdeal[j]`: [1.0, 1.0, 1.0] (el usuario idealmente quiere coincidencia perfecta).
- `userWeight[j]`: [0.4, 0.3, 0.3] (presupuesto pesa más que tamaño y ubicación).

### 5.3 Score Final

```
finalScore = specScore × (1 - α) + userScore × α
```

Donde `α = RubroProfile.UserPrefWeights` (0.25–0.35 según rubro).

### 5.4 Desglose (Breakdown)

Para cada una de las 10 dimensiones (7 spec + 3 user):

```
dimWeight[i] = fullWeights[i]  // normalizado de spec weights × (1-α) + user weights × α
dimScore[i]  = (1 - |fullActual[i] - fullIdeal[i]|) × dimWeight[i]
```

Se retorna un array de 10 `FeatureContrib` con dimensión, score, peso, ideal y actual.

## 6. Reglas Duras (Hard Constraints)

### 6.1 Cap de Usos Permitidos (29%)

**Regla**: Si la propiedad NO incluye el rubro solicitado en su lista `permitted_uses`, el score final se capa en **0.29** (29%), independientemente del resto de dimensiones.

```go
if !permitted {
    finalScore = math.Min(finalScore, 0.29)
}
```

**Justificación**: Un score de 29% es lo suficientemente bajo para desincentivar la recomendación pero mantiene la propiedad visible en caso de que el emprendedor quiera explorar cambios de uso. 29% es deliberadamente inferior al umbral psicológico de "30% = malo".

### 6.2 Perfil Default

Si un rubro no tiene perfil definido en el mapa `Profiles`, se usa el perfil "Otro" como fallback con pesos balanceados.

### 6.3 Neutralidad

Cuando el usuario no provee preferencias (budget, size, location), las dimensiones correspondientes reciben un score neutral de 0.5 para no sesgar el resultado.

## 7. Breakdown de Explainabilidad

Cada respuesta del endpoint `/api/match` incluye un campo `breakdown` con 10 items:

```json
{
  "dimension": "power",
  "label": "Capacidad Eléctrica",
  "score": 0.085,
  "weight": 0.09,
  "maxWeight": 0.09,
  "ideal": 0.8,
  "actual": 1.0
}
```

| Campo       | Significado                                             |
|-------------|---------------------------------------------------------|
| `dimension` | Clave técnica de la dimensión                           |
| `label`     | Nombre legible para el usuario                          |
| `score`     | Contribución real de esta dimensión al score final      |
| `weight`    | Peso normalizado de esta dimensión en el score final    |
| `maxWeight` | Peso máximo posible (= weight, normalizado)             |
| `ideal`     | Valor ideal según el perfil del rubro                   |
| `actual`    | Valor real extraído de la propiedad                     |

### Cálculo de porcentaje por dimensión

```
porcentaje = (actual / ideal) × 100    si actual ≤ ideal
porcentaje = 100 - ((actual - ideal) / (1 - ideal)) × 100    si actual > ideal
```

Esto permite al frontend renderizar barras de progreso como "Capacidad Eléctrica: 85%".

## 8. Path a ML / Mejoras Futuras

### 8.1 Estado Actual: Weighted Feature Distance

La arquitectura actual es un **sistema basado en reglas** con pesos definidos por expertos de dominio. Es determinístico, explicable y no requiere datos de entrenamiento.

### 8.2 Fase 2: Recolección de Labels

**Requisito previo para ML**: datos etiquetados.

- **Label positivo (1)**: Match que resultó en contrato de arriendo firmado → registrar en tabla `matches` con `status = 'closed_won'`.
- **Label negativo (0)**: Match descartado explícitamente por el usuario → `status = 'closed_lost'`.

### 8.3 Fase 3: Entrenamiento Supervisado

Una vez acumulados ≥ 500 matches etiquetados:

1. Usar los mismos 10 features vectorizados como input de un modelo XGBoost.
2. Agregar features derivadas: interacciones rubro × feature, precio/m² vs mediana de la zona.
3. El modelo entrenado reemplazaría `weightedDistance()` manteniendo la misma interfaz `EngineResult`.
4. Los pesos actuales pueden usarse como **priors** para inicializar el modelo o como features adicionales.

### 8.4 Fase 4: Sistema Híbrido

Mantener el motor de reglas como **fallback** y el modelo ML como **primary scorer** cuando la confianza sea suficiente (umbral de probabilidad > 0.7).

### 8.5 Hyperparámetros Tunables

Actualmente los pesos y valores ideales están hardcodeados en `profiles.go`. Una mejora intermedia sería:

- Mover los perfiles a una tabla `rubro_profiles` en la base de datos.
- Crear un endpoint de administración para tunear pesos sin redeploy.
- A/B testing entre diferentes configuraciones de pesos.

## 9. Puntos de Integración con la API

| Endpoint              | Método | Relación con Matchmaking          |
|-----------------------|--------|-----------------------------------|
| `/api/match`          | POST   | Punto principal de entrada        |
| `/api/properties`     | GET    | Datos de entrada (propiedades)    |
| `/api/properties/{id}`| GET    | Detalle de propiedad individual   |
| `/api/users/{id}`     | GET    | Perfil y preferencias del usuario |
| `/api/assessment`     | POST   | Captura de rubro y preferencias   |
| `/api/trends`         | GET    | Datos de mercado complementarios  |
| `/api/chat`           | POST   | Asistente contextual con datos    |

### Flujo Típico de un Match

```
1. Usuario completa assessment  →  POST /api/assessment
2. Se determina rubro y preferencias
3. Se obtienen propiedades       →  GET /api/properties?rubro=Gastronomía
4. Se calcula match por propiedad →  POST /api/match {propertyId, rubro, userPreferences}
5. Se muestran resultados con breakdown visual
6. Usuario consulta detalles     →  GET /api/properties/{id}
7. Usuario consulta al asistente →  POST /api/chat
```

## 10. Estrategia de Testing

### 10.1 Tests Unitarios (pendientes de implementar)

| Componente              | Qué testear                                       |
|-------------------------|---------------------------------------------------|
| `extractSpecFeatures()` | Encoding correcto para cada combinación de specs  |
| `extractUserFeatures()` | Budget fit, size fit, location match extremos     |
| `weightedDistance()`    | Casos borde: vectores vacíos, pesos cero          |
| `Score()`               | Assert scores para combinaciones conocidas        |
| `calculateLocationSimilarity()` | Exact match, prefix match, word match, no match |
| `NormalizeWeights()`    | Suma = 1.0, pesos cero → sin división por cero    |

### 10.2 Tests de Integración (pendientes)

| Escenario                          | Expected Result            |
|------------------------------------|----------------------------|
| Restaurante en local sin gas       | Score medio-bajo           |
| Restaurante en local con specs completas | Score alto (> 0.85)   |
| Retail en bodega (no permitido)    | Score ≤ 0.29               |
| Bodega en local con gran frente    | Score alto en frontage     |
| Sin preferencias de usuario        | userScore = neutral (0.5)  |
| Budget exactamente igual al precio | Budget fit = 1.0           |
| Precio > 1.5x budget               | Budget fit = 0.1           |

### 10.3 Cómo Ejecutar Tests Manualmente

```bash
# Match sin preferencias
curl -X POST http://localhost:8080/api/match \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"1","rubro":"Gastronomía"}'

# Match con preferencias completas
curl -X POST http://localhost:8080/api/match \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"1","rubro":"Gastronomía","userPreferences":{"maxBudget":1500000,"minSize":30,"maxSize":80,"preferredLocation":"Lastarria"}}'

# Match no permitido (Bodega para Gastronomía)
curl -X POST http://localhost:8080/api/match \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"2","rubro":"Gastronomía"}'  # Score ≤ 0.29
```

---

_Última actualización: Julio 2026 - Fase 1 MVP con Authentication y File Upload._
