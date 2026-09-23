# Avance y Plan — Agosto 2026

> **Proyecto:** MiLocal — Trust & Match  
> **Fecha de corte:** 30 de julio de 2026  
> **Capacidad:** 15 HH/semana × 8 semanas = **120 HH totales** (Julio 60 + Agosto 60)

---

## 1. Lo Implementado — Julio 2026 (60 HH)

### Backend (Go 1.23)

| # | Endpoint | Método | Auth | Estado |
|---|----------|--------|------|--------|
| 1 | `/api/health` | GET | Público | ✅ |
| 2 | `/api/auth/register` | POST | Público | ✅ |
| 3 | `/api/auth/login` | POST | Público | ✅ |
| 4 | `/api/auth/me` | GET | JWT | ✅ |
| 5 | `/api/properties` | GET | Público | ✅ (sin paginación) |
| 6 | `/api/properties/{id}` | GET | Público | ✅ |
| 7 | `/api/properties` | POST | JWT | ⚠️ Sin validación ni owner_id |
| 8 | `/api/users/{id}` | GET | Público | ⚠️ Debe ser protegido |
| 9 | `/api/users/{id}` | PUT | JWT | ⚠️ Sin RBAC |
| 10 | `/api/users/{id}/documents/{did}/verify` | POST | JWT | ⚠️ Sin RBAC |
| 11 | `/api/users/{id}/preferences` | GET | JWT | ✅ |
| 12 | `/api/users/{id}/preferences` | PUT | JWT | ✅ |
| 13 | `/api/upload/document/{userId}` | POST | JWT | ✅ |
| 14 | `/api/upload/property-image/{propertyId}` | POST | JWT | ✅ |
| 15 | `/api/match` | POST | Público | ✅ |
| 16 | `/api/assessment` | POST | Público | ⚠️ No persiste |
| 17 | `/api/chat` | POST | Público | 🔴 ON HOLD (LLM) |
| 18 | `/api/trends` | GET | Público | 🔴 ON HOLD (LLM) |

**Resumen:** 16 endpoints funcionales, 2 placeholders (LLM). 11 completos, 5 con gaps de seguridad.

### Motor de Matchmaking

- Weighted Feature Distance con **10 dimensiones** (7 specs + 3 preferencias)
- **6 perfiles de rubro** con vectores de ideales y pesos calibrados
- Hard rule: cap del 29% si rubro ∉ `permitted_uses`
- Explainability completa: `specScore`, `userScore`, `breakdown` por dimensión
- Plan de evolución documentado (WFD → ML con XGBoost)

### Frontend (React 19 + TypeScript + Tailwind CSS 3)

| Página | API real | Loading | Error | Empty |
|--------|----------|---------|-------|-------|
| LoginPage | ✅ | ✅ | ✅ | N/A |
| RegisterPage | ✅ | ✅ | ✅ | N/A |
| HomePage | ✅ | ✅ | ✅ | ✅ |
| PropertyDetailPage | ✅ | ✅ | ✅ | — |
| OnboardingPage | ❌ | ❌ | ❌ | — |
| ProfilePage | ⚠️ | ✅ | ✅ | ✅ |
| ChatPage | ❌ (SDK cliente) | ✅ | ⚠️ | ✅ |
| TrendsPage | ✅ | ✅ | ✅ | — |

- **9 componentes reutilizables:** BrandLogo, CommercialCard, ContactModal, DocumentCard, SidebarLink, Skeleton, TechBadge, Toast, ViabilityItem
- **React Router v7** con deep linking
- Diseño responsive mobile con hamburger menu animado
- Auth context (`useAuth`) + JWT automático en API client

### Base de Datos (PostgreSQL 16)

| Tabla | Columnas | Estado |
|-------|----------|--------|
| `users` | 8 | ✅ Con bcrypt + UUID v4 |
| `documents` | 7 | ✅ Con FK cascade |
| `properties` | 23 | ✅ Sin índice en price/sqm |
| `matches` | 5 | ⚠️ Tabla creada, nunca escrita |
| `assessments` | 6 | ⚠️ Tabla creada, no usada |
| `user_preferences` | 7 | ✅ Con unique constraint |
| `chat_history` | 4 | ⚠️ Placeholder |

### Infraestructura y DevOps

- ✅ Docker Compose: 3 servicios (postgres:16, backend:8080, frontend:80) con healthchecks
- ✅ Jenkins CI/CD: webhook push → build → deploy → smoke test (9 commits en pipeline)
- ✅ Nginx reverse proxy: SPA fallback + proxy `/api/` → backend
- ✅ CORS middleware con preflight

### Documentación (11 documentos)

- `README.md`, `DEFINICION_PROBLEMA.md`, `ALGORITMO_MATCHMAKING.md`, `PLAN_MATCHMAKING.md`
- `PRODUCT_BACKLOG.md`, `FUERA_DE_ALCANCE_LLM.md`, `ALTERNATIVAS_SIN_IA.md`
- `MATRIZ_RIESGOS.md`, `POLITICA_PRIVACIDAD.md`, `CATALOGO_SERVICIOS_SLA.md`, `RACI_METRICAS.md`
- `PROJECT_CHARTER.tex`, `docs/planning/AGOSTO_2026.md`, `docs/planning/JULIO_2026.md`, `docs/planning/AUDITORIA_MVP.md`
- **NUEVO:** `docs/database/schema.dbml` (diagrama DBML)

---

## 2. Lo que se Implementará — Agosto 2026 (60 HH)

### Semana 1 (Ago 1–7): Seguridad, Autorización y Estabilidad — 15 HH

| # | Actividad | HH | Prioridad | Impacto |
|---|-----------|-----|-----------|---------|
| 1 | RBAC/ownership checks en todos los endpoints protegidos | 4 | 🔴 P0 | Cualquiera puede editar datos ajenos actualmente |
| 2 | Sanitización de errores: reemplazar `err.Error()` con mensajes genéricos | 2 | 🔴 P0 | Fuga de información de DB/Go al cliente |
| 3 | `AuthMiddleware` en `POST /api/match` y `POST /api/assessment` | 1 | 🔴 P0 | user_id debe registrarse del JWT |
| 4 | CORS: whitelist de orígenes, eliminar `*` + credentials | 1 | 🔴 P0 | Vulnerabilidad en producción |
| 5 | Graceful shutdown: `signal.Notify` + `srv.Shutdown()` (timeout 10s) | 1 | 🔴 P0 | Requests en vuelo se pierden con SIGTERM |
| 6 | Health check real: `db.Ping()` → 503 si DB caída | 0.5 | 🔴 P0 | Actualmente siempre devuelve 200 ciego |
| 7 | Validación de inputs en `CreateProperty` | 1 | 🔴 P0 | Sin validación de title, price>0, sqm>0 |
| 8 | Server-side UUID para propiedades | 0.5 | 🔴 P0 | Se acepta ID del cliente actualmente |
| 9 | Proteger `GET /users/{id}` y `GET /users/{id}/preferences` con auth | 1 | 🟡 P1 | Datos personales expuestos públicamente |
| 10 | Fix `rubro` y `commune_id` en preferences | 1 | 🟡 P1 | Se descartan silenciosamente al guardar |
| 11 | Endpoint `POST /api/properties/{propertyId}/contact` | 1 | 🟡 P1 | Sin mecanismo de contacto entre usuarios |
| 12 | Tests manuales end-to-end de auth + RBAC + match | 1 | 🟡 P1 | Verificar con curl cada endpoint |

**Entregables:** Backend seguro (100% endpoints con RBAC), errores sanitizados, CORS correcto, graceful shutdown, API de contacto funcional.

### Semana 2 (Ago 8–14): Frontend — Correcciones Críticas — 15 HH

| # | Actividad | HH | Prioridad | Impacto |
|---|-----------|-----|-----------|---------|
| 1 | ChatPage → placeholder "Próximamente" (remover SDK Gemini del browser) | 1 | 🔴 P0 | API key expuesta en bundle frontend |
| 2 | Reemplazar "Próximamente" en CTAs por ContactModal funcional | 3 | 🔴 P0 | Botones muertos en toda la plataforma |
| 3 | Fix upload de documentos: status `'pending'` en vez de `'verified'` | 0.5 | 🔴 P0 | Documentos aparecen como verificados sin serlo |
| 4 | Enviar RUT al backend en registro | 1 | 🟡 P1 | Faltan datos de identificación |
| 5 | Deduplicar comunas en `COMUNAS_RM` + ordenar alfabéticamente | 0.5 | 🟡 P1 | UX rota en dropdown de comuna |
| 6 | Centralizar `UF_RATE` en `constants.ts` | 0.5 | 🟡 P1 | Valor disperso en múltiples archivos |
| 7 | Fix match score "0%" mientras carga → mostrar "Calculando..." | 0.5 | 🟡 P1 | Datos falsos durante loading |
| 8 | Ocultar toggle de mapa (no implementado) | 0.5 | 🟢 P2 | Botón muerto confunde al usuario |
| 9 | Puntajes de match en HomePage cards (usuarios autenticados) | 3 | 🟡 P1 | Core value prop no visible en listado |
| 10 | Remover "84%" hardcodeado en perfil → mostrar "—" | 0.5 | 🟡 P1 | Datos falsos |
| 11 | Conectar OnboardingPage a `api.submitAssessment()` | 2 | 🔴 P0 | Assessment no persiste |
| 12 | DocumentCard → llamar `api.verifyDocument()` real | 1 | 🔴 P0 | Botón sin handler |
| 13 | Corregir URLs de upload en `api.ts` | 0.5 | 🔴 P0 | Upload roto |
| 14 | Tests manuales de flujos completos | 0.5 | 🟡 P1 | Verificar UX end-to-end |

**Entregables:** Frontend sin API keys expuestas, CTAs funcionales, Onboarding conectado a API, match scores reales en HomePage, flujo de documentos corregido.

### Semana 3 (Ago 15–21): Calidad, Features y UX — 15 HH

| # | Actividad | HH | Prioridad | Impacto |
|---|-----------|-----|-----------|---------|
| 1 | Paginación en `GET /api/properties`: `?page=` y `?limit=` | 3 | 🟡 P1 | Sin paginación devuelve todas las filas |
| 2 | Filtros avanzados: `?price_min=`, `?price_max=`, `?sqm_min=`, `?sqm_max=`, `?location=` | 3 | 🟡 P1 | Solo filtra por rubro actualmente |
| 3 | Logger estructurado con `log/slog`: método, path, status, duración, correlation ID | 2 | 🟡 P1 | Middleware no-op actualmente |
| 4 | `PUT /api/properties/{id}` y `DELETE /api/properties/{id}` | 3 | 🟡 P1 | Owners no pueden gestionar sus inmuebles |
| 5 | Persistir matches en tabla `matches` | 1 | 🟢 P2 | Tabla creada pero nunca escrita |
| 6 | Persistir assessments en DB | 1 | 🟡 P1 | Datos de onboarding se pierden |
| 7 | Índices en `properties.price`, `properties.sqm`, `properties.location` | 1 | 🟢 P2 | Queries sin índices en columnas de filtro |
| 8 | Frontend: scroll infinito + filtros de precio y m² en HomePage | 1 | 🟢 P2 | UX de navegación de catálogo |

**Entregables:** Backend con paginación y filtros, logging estructurado, CRUD completo de propiedades, frontend con scroll infinito y filtros.

### Semana 4 (Ago 22–29): Tests, Documentación y Deploy — 15 HH

| # | Actividad | HH | Prioridad | Impacto |
|---|-----------|-----|-----------|---------|
| 1 | Tests unitarios del motor de matchmaking (`matcher/*_test.go`) | 3 | 🟡 P1 | 0 tests en core IP |
| 2 | Tests de integración: handlers con `httptest.NewServer` | 3 | 🟡 P1 | Auth flow, CRUD, match |
| 3 | Tests frontend: Vitest + React Testing Library | 3 | 🟡 P1 | CommercialCard, LoginPage, OnboardingPage |
| 4 | Documentación OpenAPI completa (23 endpoints) | 2 | 🟢 P2 | OpenAPI spec final en Swagger/Redoc |
| 5 | Project Charter final en PDF | 1 | 🟢 P2 | Compilación LaTeX con todas las secciones |
| 6 | Planificación Septiembre 2026 | 1 | 🟢 P2 | Roadmap post-MVP |
| 7 | Deploy productivo final + smoke tests | 2 | 🟡 P1 | Verificar todos los endpoints, frontend, auth flow |

**Entregables:** Suite de tests (unitarios + integración + frontend), OpenAPI spec completa, Project Charter PDF, deploy productivo verificado.

---

## 3. Semáforo por Área

| Área | Julio | Meta Agosto |
|------|:-----:|:-----------:|
| Backend — CRUD base | 🟢 85% | 🟢 100% |
| Backend — Auth (JWT) | 🟢 90% | 🟢 100% |
| Backend — Matchmaking | 🟢 95% | 🟢 100% |
| Backend — Seguridad/RBAC | 🔴 15% | 🟢 100% |
| Backend — Paginación/Filtros | 🔴 0% | 🟢 100% |
| Frontend — Páginas/UI | 🟡 70% | 🟢 100% |
| Frontend — Integración API real | 🟡 60% | 🟢 100% |
| Frontend — CTAs funcionales | 🔴 10% | 🟢 100% |
| Testing | 🔴 0% | 🟢 100% |
| DevOps/CI/CD | 🟢 80% | 🟢 100% |
| Documentación | 🟢 95% | 🟢 100% |

---

## 4. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|--------|:-----:|:-------:|-----------|
| La API de contacto requiere notificaciones (email) | Media | Medio | Mantener simple: almacenar en DB. Notificaciones en fase 2 |
| El proveedor LLM no se decide en agosto | Alta | Bajo | Chat y Trends ya están en placeholder. Sin dependencia |
| UF rate cambia y precios muestran valores desactualizados | Alta | Medio | Migrar UF_RATE a endpoint del backend `GET /api/config` en semana 3 |
| No hay tiempo para tests E2E completos | Media | Medio | Priorizar tests del matcher (core) y auth. Deferir tests de UI |
| Jenkins inestable con Docker Compose paths | Media | Medio | Ya resuelto en Julio (6 iteraciones del pipeline). Workspace fijo |

---

## 5. KPIs de Éxito para Agosto

| KPI | Meta | Verificación |
|-----|------|-------------|
| Cobertura de autorización | 100% endpoints protegidos con ownership check | Code review |
| Errores sanitizados | 0 leaks de errores internos al cliente | `grep -r "err.Error()" internal/handler/` |
| CORS válido | `*` + credentials eliminado | Inspección de headers |
| API key expuesta | 0 keys en bundle frontend | `grep -r "GEMINI\|API_KEY" frontend/src/` |
| Tests | ≥ 20 tests unitarios/integración | `go test ./...` + `npx vitest run` |
| Documentación API | 23 endpoints OpenAPI 3.0 | OpenAPI spec completa |
| Flujo end-to-end | Registro → Onboarding → Propiedades → Match → Contacto | Smoke test manual |
| Páginas funcionales | 8/8 páginas conectadas a API real | Verificación por página |
