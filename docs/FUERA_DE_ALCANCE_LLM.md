# Funcionalidades con IA/LLM — ON HOLD

> **[PLACEHOLDER — Pendiente decisión de cliente sobre proveedor LLM]**

Este documento registra las funcionalidades del proyecto que dependen de modelos LLM
y que están **en pausa (ON HOLD)** hasta que el cliente defina el proveedor y modelo
definitivo a utilizar. Las alternativas en evaluación son:

- **Gemini** (Google) — actualmente implementado como placeholder
- **DeepSeek V4 Pro** — viable para texto, sin capacidades multimodales
- **Claude** (Anthropic) — viable para texto + visión
- **GPT-4o** (OpenAI) — viable para texto + visión
- **Alternativa sin IA** — resuelta para el módulo de trends (ver `docs/trends/ALTERNATIVAS_SIN_IA.md`)

> **Nota:** El módulo de tendencias (Pulso Comercial, sección 2) ya **no** está en pausa:
> se resuelve con datos estáticos curados. El chatbot y el Visual Analyzer continúan ON HOLD.

---

## 1. Chatbot - Consultor Estratégico MiLocal

| Campo | Valor |
|-------|-------|
| **Estado** | Fuera de alcance |
| **Modelo actual** | Gemini 3 Flash Preview |
| **SDK/Librería** | `@google/genai` (frontend), REST directa (backend proxy) |
| **Endpoint** | `POST /api/chat` (backend) |
| **Código implicado** | `frontend/src/pages/ChatPage.tsx`, `frontend/src/services/gemini.ts`, `backend/internal/handler/chat.go`, `backend/internal/service/gemini.go` |

### Qué hace
Chat conversacional donde el usuario (emprendedor o propietario) consulta al "MiLocal
Strategic Advisor" sobre:
- Zonas comerciales recomendadas según rubro
- Flujo peatonal y visibilidad
- Compatibilidad de patentes comerciales
- ROI esperado por ubicación
- Requisitos legales y normativos

### Dependencia de LLM
- `chatWithGemini()` envía el prompt + historial + rubro del usuario
- Usa **system instruction** para contextualizar al modelo como consultor inmobiliario
- Usa **Google Search grounding** como herramienta para datos actualizados de barrios LatAm
- Espera respuesta en texto libre (no estructurado)

### Por qué está fuera de alcance
Decisión de producto: el módulo de matchmaking (backend de datos) tiene prioridad sobre
las funcionalidades asistivas por IA. El chatbot se reactivará en una fase posterior.

---

## 2. Pulso Comercial - Tendencias de Mercado

| Campo | Valor |
|-------|-------|
| **Estado** | Resuelto para el MVP con datos estáticos curados (sin LLM) |
| **Modelo actual** | Ninguno (se elimina la dependencia de Gemini 3 Flash Preview) |
| **Endpoint** | `GET /api/trends?city={ciudad}` (backend) lee de `static_trends` |
| **Código implicado** | `frontend/src/pages/TrendsPage.tsx`, `backend/internal/handler/trends.go` (nuevo), `docs/trends/ALTERNATIVAS_SIN_IA.md` |

### Qué hace
Genera un reporte estructurado (JSON) con tendencias de mercado inmobiliario comercial:
- Precio promedio por m² en la ciudad consultada
- Nivel de demanda (Alta/Media/Baja)
- Resumen ejecutivo
- Serie temporal mensual de crecimiento (6 meses)

### Dependencia de LLM
- `GetCommercialMarketTrends(city)` envía prompt pidiendo análisis de vacancia, precios
  y zonas de crecimiento para la ciudad
- Usa **Google Search grounding** para datos actualizados (2024-2025)
- Espera respuesta en **JSON estructurado** (`application/json`) con schema definido
- `TrendsPage.tsx` actualmente usa datos demo hardcodeados (`DEMO_TREND`), no consume
  el endpoint real

### Cómo se resuelve para el MVP
Siguiendo `docs/trends/ALTERNATIVAS_SIN_IA.md`, el módulo se desacopla del LLM mediante la
tabla `static_trends` con datos curados de fuentes verificadas (Colliers, CBRE, JLL) para
Santiago, Ciudad de México y Medellín. El frontend consume esos datos reales en lugar de
`DEMO_TREND` y el equipo los actualiza vía `PUT /admin/trends/{city}`. Así el MVP no queda
bloqueado por la decisión del proveedor LLM.

### Alternativa evaluada: DeepSeek V4 Pro
- **Viable** para generación de JSON estructurado
- **No viable** para web search (DeepSeek no tiene grounding de búsqueda)
- Se necesitaría una capa externa de datos para alimentar el prompt con precios reales

---

## 3. Visual Analyzer - Análisis Visual de Locales

| Campo | Valor |
|-------|-------|
| **Estado** | Fuera de alcance (placeholder en UI) |
| **Modelo actual** | Gemini 3 Flash Preview (multimodal) |
| **Código implicado** | `geminiService.ts` (legacy, `analyzeLocalPotential`), `App.tsx` (pestaña "Visual Analyzer" muestra "Próximamente") |

### Qué hace
El usuario sube/toma una foto de un local comercial y el modelo analiza:
- Visibilidad y atractivo de la fachada
- Espacio disponible para letreros y señalización
- Aptitud técnica según el rubro del negocio
- Recomendaciones ejecutivas de potencial comercial

### Dependencia de LLM
- `analyzeLocalPotential(base64Image, rubro)` envía imagen JPEG en base64 + prompt
- Usa el modelo **Gemini 3 Flash Preview en modo multimodal** (visión + texto)
- Responde en texto libre con análisis motivador estilo "MiLocal Analysis"

### Por qué está fuera de alcance
No se migró al nuevo frontend ni al backend. La funcionalidad requiere un modelo
**multimodal con capacidades de visión**, lo cual:
- Gemini Flash Preview lo soporta
- DeepSeek V4 Pro **no** lo soporta
- Requeriría mantener Gemini o evaluar alternativas con visión (GPT-4o, Claude)

---

## Resumen de dependencias LLM

| Funcionalidad | Backend | Frontend | ¿Migrable a DeepSeek? | Bloqueante |
|---------------|---------|----------|----------------------|------------|
| Chatbot | `POST /api/chat` | `ChatPage.tsx` | Sí (solo texto) | No |
| Pulso Comercial (trends) | `GET /api/trends` → `static_trends` | `TrendsPage.tsx` | N/A — resuelto sin LLM | No (datos estáticos curados) |
| Visual Analyzer | No migrado | Placeholder | **No** | Requiere visión multimodal |

---

## Archivos legacy con dependencias LLM (raíz del repo)

Estos archivos pertenecen al monolito original y pueden eliminarse:

| Archivo | Contenido |
|---------|-----------|
| `geminiService.ts` | `chatWithGemini`, `analyzeLocalPotential`, `getCommercialMarketTrends` |
| `App.tsx` | Importa las 3 funciones de `geminiService.ts` |

---

## Variables de entorno requeridas (cuando se reactiven)

| Variable | Uso |
|----------|-----|
| `GEMINI_API_KEY` | Backend y/o frontend para llamadas a Gemini |
| `DEEPSEEK_API_KEY` | Alternativa futura para Pulso Comercial |

---

_Última actualización: Julio 2026 - Fase de reestructuración backend/frontend_
