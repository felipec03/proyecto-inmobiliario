# Alternativas sin IA para Tendencias de Mercado — MiLocal

> **Contexto:** El módulo `GET /api/trends` (Pulso Comercial) depende actualmente de Gemini 3 Flash Preview + Google Search grounding para obtener datos de precios, vacancia y crecimiento inmobiliario por ciudad. El cliente aún no ha decidido qué proveedor LLM utilizar. Este documento explora alternativas que **no dependen de modelos de lenguaje** para mantener el módulo funcional.

---

## 1. Estado Actual del Módulo

| Campo | Valor |
|-------|-------|
| **Endpoint** | `GET /api/trends?city={ciudad}` |
| **Backend** | `internal/handler/chat.go:36` → `service.GetCommercialMarketTrends()` |
| **Dependencia** | Gemini 3 Flash Preview + Google Search grounding |
| **Frontend** | `TrendsPage.tsx` — consume el endpoint, fallback a `DEFAULT_TREND` hardcodeado |
| **Producto en pausa** | Sí (ver `docs/FUERA_DE_ALCANCE_LLM.md`) |

---

## 2. Alternativas sin IA

### 2.1 APIs Públicas de Datos Inmobiliarios

| Fuente | Cobertura | Datos | Costo | Fiabilidad |
|--------|-----------|-------|-------|------------|
| **Properati** | LatAm (AR, BR, CL, CO, MX, PE, UY) | Precio/m², oferta, demanda por barrio | Freemium (API key requerida) | Alta — datos reales de portales |
| **Portal Inmobiliario** | Chile | Precio/m², vacancia, absorción | Contacto comercial | Alta — fuente primaria |
| **Mercado Libre Inmuebles** | LatAm | Precios publicados, tiempo de publicación | Web scraping (no tiene API pública) | Media — datos de marketplace |
| **OpenStreetMap + Overpass API** | Global | Ubicación, superficie, tipo de edificación | Gratis | Media — datos colaborativos |
| **INE / DANE / INEGI** | Chile, Colombia, México | Censos, permisos de edificación, índices económicos | Gratis (datos abiertos) | Alta — fuente oficial |

**Ventajas:**
- Datos reales, no sintéticos.
- Actualización periódica garantizada por la fuente.
- Sin dependencia de LLM.

**Desventajas:**
- Requiere integraciones por país (LatAm fragmentado).
- APIs con rate limits y costos variables.
- No todas las ciudades tienen cobertura.

### 2.2 Web Scraping de Portales Inmobiliarios

| Portal | Ciudad | Datos extraíbles |
|--------|--------|------------------|
| PortalInmobiliario.com | Santiago, Chile | Precio/m², vacancia, tiempo de publicación, sectores |
| Inmuebles24.com | CDMX, México | Precio, m², zona, antigüedad del anuncio |
| Fincaraiz.com.co | Medellín, Bogotá | Precio/m², estrato, barrio |
| Zonaprop / Argenprop | Buenos Aires | Precio/m², tipología, antigüedad |
| Adondevivir / Urbania | Lima | Precio, m², distrito |

**Stack técnico propuesto:**
- **Backend:** Go + `chromedp` (headless Chrome) o `colly` (scraper HTTP) en un cron job.
- **Frecuencia:** Diaria o semanal (según frescura requerida).
- **Almacenamiento:** Tabla `market_trends (city, date, avg_price_sqm, vacancy_rate, source)`.

**Ventajas:**
- Control total sobre los datos y la frecuencia de actualización.
- Sin costo de API (solo infraestructura).

**Desventajas:**
- Legalmente gris (depende de ToS de cada portal).
- Frágil ante cambios de layout HTML.
- Requiere mantenimiento continuo.
- Bloqueo por anti-bot (Cloudflare, CAPTCHA).

### 2.3 Crowdsourcing / Encuestas

Utilizar la base de usuarios de MiLocal para recolectar datos:

**Mecanismo:**
- Al registrar una propiedad, el owner reporta precio de arriendo, m² y ubicación.
- Datos agregados y anonimizados producen tendencias reales del mercado.

**Ventajas:**
- Datos hyperlocales de usuarios activos.
- Sin dependencias externas.
- Engagement con la plataforma.

**Desventajas:**
- Requiere masa crítica de usuarios ($\geq 100$ propiedades por ciudad).
- Sesgo de autoselección (solo usuarios de MiLocal).
- No es viable para MVP (sin usuarios aún).

### 2.4 Datos Estáticos Curados Manualmente

Mantener un dataset curado por el equipo con datos de mercado:

**Fuentes de datos manuales:**
- Reportes trimestrales de consultoras (Colliers, CBRE, JLL).
- Informes de cámaras de comercio locales.
- Publicaciones de medios especializados.

**Implementación:**
- Tabla `static_trends` en PostgreSQL.
- Endpoint `/api/trends` lee de esta tabla en vez de llamar a Gemini.
- Actualización manual trimestral (o mediante CMS admin).

**Ventajas:**
- Sin dependencia técnica externa.
- 100\% predecible y consistente.
- Fácil de implementar: es un CRUD sobre una tabla.

**Desventajas:**
- No escala a muchas ciudades sin equipo dedicado.
- Datos desactualizados entre actualizaciones.
- No cubre ciudades no prioritarias.

---

## 3. Recomendación para MVP

**Estrategia recomendada: Enfoque híbrido por fases.**

### Fase 1 (MVP — Agosto 2026): Datos Estáticos Curados
- Crear tabla `static_trends` con datos manuales de 3 ciudades prioritarias (Santiago, CDMX, Medellín).
- Endpoint `/api/trends` lee exclusivamente de esta tabla.
- Actualización manual mensual por el equipo.
- **Costo:** 0 USD/mes. **Esfuerzo:** 4 HH iniciales + 1 HH/mes mantención.

### Fase 2 (Post-MVP — Q4 2026): API Pública + Caché
- Integrar **Properati API** para datos automatizados de precio/m² en LatAm.
- Caché en Redis con TTL de 24h para no exceder rate limits.
- Mantener `static_trends` como fallback.
- **Costo:** Freemium (gratis para volúmenes bajos). **Esfuerzo:** 8 HH.

### Fase 3 (Escala — 2027): Web Scraping Propio
- Cron job Go con `chromedp` scrapeando 3 portales por país.
- Pipeline ETL: scrape → clean → aggregate → store.
- Dashboard de calidad de datos para monitorear frescura.
- **Costo:** Infraestructura (1 VPS). **Esfuerzo:** 20 HH + 2 HH/mes mantención.

### ¿Y el LLM?
- Si el cliente decide usar LLM, se puede reintroducir como **generador de resúmenes** (summary) sobre los datos reales obtenidos por las fuentes anteriores, sin depender del LLM para los datos numéricos.
- Esto desacopla la obtención de datos (determinística) de la generación de texto (LLM).

---

## 4. Implementación Técnica Recomendada (Fase 1)

### 4.1 Esquema de Base de Datos

```sql
CREATE TABLE IF NOT EXISTS static_trends (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL UNIQUE,
    avg_price_sqm NUMERIC(10,2) NOT NULL,     -- en UF o moneda local
    currency VARCHAR(10) DEFAULT 'UF',
    demand_level VARCHAR(10) NOT NULL CHECK (demand_level IN ('Alta', 'Media', 'Baja')),
    summary TEXT,
    source VARCHAR(255),                       -- fuente del dato (ej. "Colliers Q2 2026")
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS static_trends_monthly (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    month VARCHAR(10) NOT NULL,                -- ej. "Ene", "Feb"
    growth NUMERIC(5,2),                      -- porcentaje de crecimiento
    UNIQUE (city, month)
);
```

### 4.2 Datos de Ejemplo (Seed)

```sql
INSERT INTO static_trends (city, avg_price_sqm, demand_level, summary, source)
VALUES
  ('Santiago', 0.42, 'Alta', 'Recuperación del 12% en vacancia. Lastarria y Providencia lideran la demanda.', 'Colliers Q2 2026'),
  ('Ciudad de México', 0.38, 'Alta', 'Corredores Roma-Condesa y Polanco con ocupación > 95%.', 'CBRE Q2 2026'),
  ('Medellín', 0.31, 'Media', 'El Poblado mantiene precios estables. Crecimiento en Laureles.', 'JLL Q1 2026');

INSERT INTO static_trends_monthly (city, month, growth) VALUES
  ('Santiago', 'Ene', 2.1), ('Santiago', 'Feb', 2.8), ('Santiago', 'Mar', 1.5),
  ('Santiago', 'Abr', 3.2), ('Santiago', 'May', 2.9), ('Santiago', 'Jun', 4.1);
```

### 4.3 Cambios en el Backend

```go
// En internal/handler/trends.go (nuevo archivo, reemplaza el handler en chat.go)
func GetTrends(w http.ResponseWriter, r *http.Request) {
    city := r.URL.Query().Get("city")
    if city == "" {
        city = "Santiago"
    }

    // Leer de static_trends en vez de llamar a Gemini
    trend, err := repository.GetTrendByCity(city)
    if err != nil {
        writeError(w, http.StatusNotFound, "No hay datos para esta ciudad", "")
        return
    }

    monthly, _ := repository.GetMonthlyTrends(city)
    trend.Trends = monthly

    writeJSON(w, http.StatusOK, trend)
}
```

### 4.4 Endpoint Admin (opcional, para actualizar datos)

```
PUT /api/admin/trends/{city}
Authorization: Bearer <admin_token>

{
  "avgPriceSqm": 0.45,
  "demandLevel": "Alta",
  "summary": "Actualizado con datos de Colliers Q3 2026",
  "source": "Colliers Q3 2026"
}
```

---

## 5. Comparativa Final de Alternativas

| Criterio | APIs Públicas | Web Scraping | Crowdsourcing | Datos Estáticos |
|----------|:---:|:---:|:---:|:---:|
| **Costo inicial** | Medio (freemium) | Bajo (infra) | Bajo | **Muy bajo** |
| **Esfuerzo implementación** | 8 HH | 20 HH | 12 HH + usuarios | **4 HH** |
| **Mantención mensual** | 1 HH | 2 HH | 0 HH | **1 HH** |
| **Precisión de datos** | Alta | Media | Variable | **Alta** (fuentes verificadas) |
| **Cobertura geográfica** | 5+ países | 3 países | Solo usuarios | **3 ciudades prioritarias** |
| **Escalabilidad** | Alta | Media | Alta | Baja |
| **Riesgo legal** | Bajo (API oficial) | Alto (ToS) | Bajo | **Nulo** |
| **Dependencia externa** | API key + internet | Anti-bot | Masa crítica | **Ninguna** |
| **Recomendado para MVP** | Post-MVP | No | No | ✅ **Sí** |

---

## 6. Conclusión

Para el MVP de MiLocal (Agosto 2026), la alternativa recomendada es **Datos Estáticos Curados** porque:

1. **Cero dependencia de LLM** — desacopla completamente el módulo de la decisión del cliente sobre el proveedor IA.
2. **Implementable en 4 HH** — es un CRUD sobre dos tablas, sin integraciones externas.
3. **Costo $0** — sin APIs pagas, sin infraestructura adicional.
4. **Datos verificables** — cada valor tiene fuente trazable (Colliers, CBRE, JLL).
5. **Prepara el camino** — la tabla `static_trends` servirá como fallback cuando se integren APIs en fases posteriores.

La migración a APIs públicas (Properati) se recomienda para post-MVP cuando la plataforma tenga tráfico real que justifique la inversión en datos automatizados.

---

_Última actualización: 31 de Julio de 2026 — Preparación para MVP Agosto 2026_
