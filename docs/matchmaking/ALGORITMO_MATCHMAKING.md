# Algoritmo de Matchmaking - MiLocal

## 1. Problema

Dado un emprendedor con un rubro comercial (ej. Gastronomía, Retail) y preferencias
personales (presupuesto, tamaño, ubicación), rankear las propiedades disponibles según
compatibilidad técnica y necesidades específicas.

El score debe ser:
- **Explicable**: el usuario debe entender por qué obtuvo X%
- **Escalable**: agregar un rubro nuevo no debe requerir cambios de código
- **Personalizado**: debe considerar tanto el rubro como las preferencias individuales
- **Extensible**: debe poder migrarse a ML cuando haya suficientes datos históricos

## 2. Enfoque elegido: Weighted Feature Distance

Se eligió un **middle ground** entre reglas hardcodeadas y ML:

| Enfoque | Complejidad | Explicabilidad | Escalabilidad | Ready para ML |
|---------|:-----------:|:--------------:|:-------------:|:-------------:|
| Reglas if/else (anterior) | Baja | Alta | Baja | No |
| **Weighted Feature Distance** | **Media** | **Alta** | **Alta** | **Sí** |
| Cosine Similarity puro | Media | Media | Alta | Sí |
| XGBoost / NN | Alta | Baja | Alta | N/A |

**Weighted Feature Distance** fue seleccionado porque:
1. Cada rubro tiene su propio perfil de pesos e ideales → escalable
2. Cada dimensión del score es trazable → explicable
3. La arquitectura de vectores de features es compatible con ML → migrable a futuro
4. Los pesos pueden ser tuneados empíricamente sin cambiar el motor

## 3. Cómo funciona

### 3.1 Extracción de features

Cada propiedad se codifica en un vector numérico de **10 dimensiones** (7 de specs técnicas + 3 de preferencias de usuario):

| # | Dimensión | Tipo | Encoding |
|---|-----------|------|----------|
| 0 | Capacidad eléctrica | Binario | Básica=0, Trifásica=1 |
| 1 | Conexión de gas | Binario | 0/1 |
| 2 | Conexión de agua | Binario | 0/1 |
| 3 | Trampa de grasas | Binario | 0/1 |
| 4 | Frente comercial | Normalizado | metros / 20, cap 1.0 |
| 5 | Flujo peatonal | Ordinal | Bajo=0.33, Medio=0.66, Alto=1.0 |
| 6 | Precio negociable | Binario | 0/1 |
| 7 | Ajuste presupuesto | Función | ratio precio/budget (ver abajo) |
| 8 | Ajuste tamaño | Función | rango m² vs preferencia (ver abajo) |
| 9 | Coincidencia ubicación | Similaridad | fuzzy match de strings |

**Budget fit (dimensión 7):**
- price <= budget → 1.0
- price <= 1.3x budget → 0.7
- price <= 1.5x budget → 0.4
- price > 1.5x budget → 0.1
- Sin preferencia → 0.5 (neutral)

**Size fit (dimensión 8):**
- sqm dentro del rango → 1.0
- sqm dentro del 70%-130% del rango → 0.6
- Fuera de rango → 0.2
- Sin preferencia → 0.5 (neutral)

**Location match (dimensión 9):**
- Coincidencia exacta → 1.0
- Mismas 3 primeras letras → 0.8
- Coincidencia de palabra → 0.6
- Sin coincidencia → 0.2
- Sin preferencia → 0.5 (neutral)

### 3.2 Perfiles por rubro

Cada rubro define dos vectores:

**IdealVector**: valores "perfectos" de cada dimensión para ese rubro.
**WeightVector**: importancia relativa de cada dimensión (suma = 1.0).

Ejemplo para Gastronomía:

| Dimensión | Ideal | Peso |
|-----------|-------|------|
| Trifásica | 0.8 | 10% |
| Gas | 1.0 | 15% |
| Agua | 1.0 | 10% |
| Trampa grasas | 1.0 | 25% |
| Frente | 0.25 | 5% |
| Tráfico | 0.8 | 25% |
| Negociable | 0.5 | 10% |

Ejemplo para Bodega/Logística:

| Dimensión | Ideal | Peso |
|-----------|-------|------|
| Trifásica | 0.5 | 10% |
| Gas | 0.0 | 0% |
| Agua | 0.3 | 5% |
| Trampa grasas | 0.0 | 0% |
| **Frente** | **0.6** | **40%** |
| Tráfico | 0.2 | 15% |
| **Negociable** | **0.6** | **30%** |

Acá se ve cómo el perfil prioriza frente (acceso de camiones) y negociabilidad
para logística, ignorando gas y trampa de grasas.

### 3.3 Cálculo del score

```
specScore = Σ( weight[i] * (1 - abs(actual[i] - ideal[i])) ) / Σ(weight[i])
```

Es un **weighted Manhattan distance** normalizado, donde cada dimensión mide
"qué tan cerca está el valor real del ideal para este rubro".

```
finalScore = specScore * (1 - userPrefWeight) + userScore * userPrefWeight
```

Donde `userPrefWeight` es un hiperparámetro por rubro (0.25-0.35) que controla
cuánto pesan las preferencias personales vs las specs técnicas.

### 3.4 Hard constraint: usos permitidos

Si la propiedad **no tiene el rubro en su lista de usos permitidos**, el score se
capa en **29%** máximo, sin importar el resto de las dimensiones. Esto evita
recomendar una bodega para un restaurante aunque técnicamente tenga buen puntaje.

## 4. API

### Request

```
POST /api/match
Content-Type: application/json

{
  "propertyId": "1",
  "rubro": "Gastronomía",
  "userPreferences": {        // opcional
    "maxBudget": 1500000,
    "minSize": 30,
    "maxSize": 80,
    "preferredLocation": "Santiago"
  }
}
```

### Response

```json
{
  "score": 0.82,
  "permitted": true,
  "specScore": 0.85,
  "userScore": 0.75,
  "breakdown": [
    {
      "dimension": "power",
      "label": "Capacidad Eléctrica",
      "score": 0.085,
      "weight": 0.09,
      "maxWeight": 0.09,
      "ideal": 0.8,
      "actual": 1
    },
    ...
  ]
}
```

Cada item del breakdown indica:
- `score`: contribución real de esta dimensión al score total
- `weight`: peso normalizado que tiene esta dimensión para el rubro
- `maxWeight`: peso máximo posible (= peso)
- `ideal`: valor ideal según el perfil del rubro
- `actual`: valor real de la propiedad

Esto permite al frontend mostrar "_Capacidad Eléctrica: 85%_" con una barra de progreso.

## 5. Estructura del código

```
backend/internal/service/matcher/
├── profiles.go    # Perfiles de rubro (ideal vectors + weights)
├── engine.go      # Motor de scoring (weighted distance + breakdown)
└── matcher.go     # API pública (Calculate)
```

- `profiles.go`: Define los 6 rubros con sus vectores. **Este es el único archivo que se modifica para agregar un rubro nuevo o ajustar pesos.**
- `engine.go`: Implementa `weightedDistance()` y `Score()`. No depende de rubros específicos.
- `matcher.go`: Orquesta la extracción de features y el cálculo. Recibe `Property` + `UserPreferences` y devuelve `EngineResult`.

## 6. Path a ML

La arquitectura está diseñada para ser migrable a modelos supervisados cuando haya
datos de matches exitosos (contratos firmados):

1. **Features ya están vectorizadas**: `extractSpecFeatures()` y `extractUserFeatures()` producen exactamente los mismos vectores que consumiría un modelo ML.
2. **Labels**: cuando un match resulta en contrato firmado → label=1, si no → label=0.
3. **Modelo candidato**: XGBoost con los 10 features + interacciones rubro×feature.
4. **Sustitución**: el modelo entrenado reemplaza a `weightedDistance()` manteniendo la misma interfaz `EngineResult`.

Los pesos ideales actuales pueden usarse como **priors** para inicializar o como
features adicionales en el modelo ML.

## 7. Pruebas

Para verificar el motor manualmente:

```bash
# Sin preferencias de usuario
curl -X POST http://localhost:8080/api/match \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"1","rubro":"Gastronomía"}'

# Con preferencias
curl -X POST http://localhost:8080/api/match \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"1","rubro":"Gastronomía","userPreferences":{"maxBudget":1500000,"minSize":30,"maxSize":80,"preferredLocation":"Lastarria"}}'
```

## 8. Referencias

- **Weighted Manhattan Distance**: usada en sistemas de recomendación content-based
  (Ricci, Rokach, Shapira. _Recommender Systems Handbook_, 2011. Cap 4)
- **Feature encoding ordinal/nominal**: estándar en ML pipelines (scikit-learn
  `OrdinalEncoder`, `OneHotEncoder`)
- **Extensibilidad a XGBoost**: Chen & Guestrin. _XGBoost: A Scalable Tree Boosting
  System_, KDD 2016

---

_Última actualización: Julio 2026 - Fase 1 MVP_
