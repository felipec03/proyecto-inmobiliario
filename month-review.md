# Month Review — Julio 2026

> Proyecto: MiLocal — Trust & Match  
> Capacidad: 15 HH/semana × 4 semanas = **60 HH totales**  
> Commits: 9 (todos en julio 2026)

---

## Semana 1 (Jul 1-7): Inicialización del Proyecto y Scaffolding

**Horas estimadas: 15**

| Actividad | HH | Evidencia |
|-----------|-----|-----------|
| Inicialización del repositorio, `go mod init` backend Go 1.23 | 2 | `go.mod`, `go.sum` |
| Scaffold backend: `cmd/server/main.go`, `internal/` package structure | 2 | `main.go`, estructura de paquetes |
| Diseño del esquema DB: 5 tablas (users, documents, properties, matches, chat_history) + SQL migration | 3 | `migrations/001_init.sql`, `db.go` |
| Docker Compose: PostgreSQL 16 + backend + frontend services | 2 | `docker-compose.yml` |
| Dockerfile multi-stage backend (`golang:1.23-alpine` → `alpine:3.20`) y frontend (node → nginx) | 2 | `backend/Dockerfile`, `frontend/Dockerfile`, `nginx.conf` |
| Scaffold frontend: Vite 6 + React 19 + TypeScript 5.8 + Tailwind CSS 3 | 2 | `frontend/package.json`, `vite.config.ts`, `tsconfig.json` |
| Documentación inicial: `README.md`, `docs/DEFINICION_PROBLEMA.md` | 2 | `README.md`, `docs/` |

**Entregables de la semana:**
- Estructura del monorepo definida (backend Go + frontend React)
- Base de datos funcional con esquema completo (5 tablas, constraints, índices)
- Orquestación Docker Compose funcional (3 servicios con healthchecks)
- Primer commit: `81a6a21 init`

---

## Semana 2 (Jul 8-14): Dominio Core, CRUD y Motor de Matchmaking

**Horas estimadas: 15**

| Actividad | HH | Evidencia |
|-----------|-----|-----------|
| Definición de modelos: Property, UserProfile, Document, CommercialSpecs, DTOs | 2 | `internal/model/models.go` |
| Repository layer: DB init, connection pool, `GetAllProperties`, `GetPropertyByID`, `CreateProperty` | 3 | `internal/repository/properties.go` |
| Repository layer: `GetUserByID`, `GetUserDocuments`, `UpdateUser`, `VerifyDocument` | 2 | `internal/repository/users.go` |
| Handler layer: CRUD parcial de properties y usuarios (GET, POST, PUT) | 2 | `internal/handler/properties.go`, `users.go` |
| Diseño e implementación del motor Weighted Feature Distance | 4 | `internal/service/matcher/` (profiles.go, engine.go, matcher.go) |
| 6 perfiles de rubro con vectores de ideales y pesos + hard rule 29% | 1 | `internal/service/matcher/profiles.go` |
| Helpers: `writeJSON`, `writeError`, router setup, CORS middleware | 1 | `main.go`, `internal/middleware/cors.go` |

**Entregables de la semana:**
- 7 endpoints REST funcionales (properties CR, users RU, health)
- Motor de matchmaking con 10 dimensiones (7 specs + 3 user preferences)
- 6 perfiles de rubro configurables por pesos
- Explainability: desglose por dimensión (`specScore`, `userScore`, `breakdown`)

---

## Semana 3 (Jul 15-21): Autenticación, File Upload e Integración Frontend-Backend

**Horas estimadas: 15**

| Actividad | HH | Evidencia |
|-----------|-----|-----------|
| JWT auth: `internal/auth/jwt.go` — generación y validación HS256, 24h | 2 | `internal/auth/jwt.go` |
| Auth handlers: Register, Login, Me con bcrypt y UUID v4 | 3 | `internal/handler/auth.go` |
| Auth middleware: protección de rutas con Bearer token + contexto | 1 | `internal/middleware/auth.go` |
| File upload: documentos (multipart, 10MB, whitelist) + property images | 3 | `internal/handler/upload.go` |
| Actualización de modelos DB: `password_hash`, `file_path`, nuevos repos | 2 | `internal/model/models.go`, `internal/repository/users.go` |
| API client frontend: auth endpoints, upload, JWT automático, manejo 401 | 2 | `frontend/src/services/api.ts` |
| Auth UI: LoginPage, RegisterPage con validación, loading, error | 2 | `frontend/src/pages/LoginPage.tsx`, `RegisterPage.tsx` |

**Entregables de la semana:**
- Autenticación JWT completa (register, login, me, middleware de protección)
- File upload con validación (tamaño, extensión, sanitización)
- 3 nuevos endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- 2 nuevos endpoints: `POST /api/upload/document/{id}`, `POST /api/upload/property-image/{id}`
- Frontend: login, registro, almacenamiento de JWT en localStorage, rutas protegidas

---

## Semana 4 (Jul 22-29): UI, CI/CD, Documentación y Pulido

**Horas estimadas: 15**

| Actividad | HH | Evidencia |
|-----------|-----|-----------|
| Páginas frontend reales (consumen API): Home, PropertyDetail, Profile, Chat, Trends | 4 | `frontend/src/pages/` (8 archivos) |
| Componentes reutilizables: BrandLogo, CommercialCard, DocumentCard, SidebarLink, TechBadge, Toast, Skeleton | 3 | `frontend/src/components/` (9 archivos) |
| Integración real frontend-backend: eliminación de datos hardcodeados, consumo de API | 2 | `HomePage.tsx`, `PropertyDetailPage.tsx`, `TrendsPage.tsx` |
| Mobile responsive: hamburger menu, sidebar animado, backdrop overlay | 1 | `frontend/src/App.tsx` |
| Auth context (`useAuth`), Toast system, loading/error/empty states | 1 | `frontend/src/hooks/useAuth.tsx`, `components/Toast.tsx`, `Skeleton.tsx` |
| Pipeline Jenkins CI/CD con healthcheck (6 iteraciones) | 2 | `Jenkinsfile` |
| Documentación final: ALGORITMO_MATCHMAKING.md, PLAN_MATCHMAKING.md, PRODUCT_BACKLOG.md, FUERA_DE_ALCANCE_LLM.md, docs de seguridad y gobernanza | 1 | `docs/matchmaking/`, `docs/scrum/`, `docs/security/`, `docs/ops/` |
| Plan de matchmaking LaTeX y alternativas sin IA para trends | 1 | `docs/matchmaking/PLANIFICACION_MATCHMAKING.tex`, `docs/trends/ALTERNATIVAS_SIN_IA.md` |

**Entregables de la semana:**
- 8 páginas SPA con React Router v7, estados loading/error/empty, animaciones motion
- 9 componentes reutilizables con Tailwind CSS
- Cliente API completo con JWT automático y manejo de 401
- Diseño responsive mobile con hamburger menu animado
- Pipeline CI/CD funcional con healthcheck
- Planificación de matchmaking en LaTeX con enfoque en escalabilidad
- Reporte de alternativas sin IA para el módulo de trends
- Documentación de proyecto alineada con COBIT/ITIL 4/ISO 27001

---

## Resumen de Horas por Área

| Área | Total HH | % |
|------|----------|---|
| Backend core (Go, DB, repos, handlers) | 16 | 27% |
| Matchmaking engine | 6 | 10% |
| Autenticación + Seguridad (JWT, bcrypt, middleware) | 8 | 13% |
| File Upload | 3 | 5% |
| Frontend (React, componentes, páginas, estados) | 13 | 22% |
| DevOps (Docker, Jenkins, CI/CD) | 6 | 10% |
| Documentación + Planificación | 6 | 10% |
| Configuración/pulido | 2 | 3% |
| **Total** | **60** | **100%** |

---

## Línea Base MVP — Lo Implementado (Julio 2026)

### Backend (16 endpoints)
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
| 10 | `/api/users/{userId}/documents/{docId}/verify` | POST | JWT | ⚠️ Sin RBAC |
| 11 | `/api/upload/document/{userId}` | POST | JWT | ✅ |
| 12 | `/api/upload/property-image/{propertyId}` | POST | JWT | ✅ |
| 13 | `/api/match` | POST | Público | ✅ |
| 14 | `/api/assessment` | POST | Público | ⚠️ No persiste |
| 15 | `/api/chat` | POST | Público | 🔴 ON HOLD (LLM) |
| 16 | `/api/trends` | GET | Público | 🔴 ON HOLD (LLM) |

### Frontend (8 páginas)
| Página | API real | Loading | Error | Empty |
|--------|----------|---------|-------|-------|
| LoginPage | ✅ | ✅ | ✅ | N/A |
| RegisterPage | ✅ | ✅ | ✅ | N/A |
| HomePage | ✅ | ✅ | ✅ | ✅ |
| PropertyDetailPage | ✅ | ✅ | ✅ | - |
| OnboardingPage | ❌ | ❌ | ❌ | - |
| ProfilePage | ⚠️ | ✅ | ✅ | ✅ |
| ChatPage | ❌ (SDK cliente) | ✅ | ⚠️ | ✅ |
| TrendsPage | ✅ | ✅ | ✅ | - |

### Infraestructura
- ✅ Docker Compose 3 servicios (postgres:16, backend:8080, frontend:80)
- ✅ Jenkins CI/CD con webhook, build, healthcheck
- ✅ Nginx reverse proxy con SPA fallback
- ✅ CORS middleware con preflight, credentials

### Motor de Matchmaking
- ✅ Weighted Feature Distance con 10 dimensiones
- ✅ 6 perfiles de rubro con pesos e ideales específicos
- ✅ Hard rule: cap 29% si rubro ∉ permitted_uses
- ✅ Explainability completa: specScore, userScore, breakdown por dimensión
- ✅ Documentación técnica: ALGORITMO_MATCHMAKING.md, PLAN_MATCHMAKING.md
- ✅ Planificación de escalamiento a ML: PLANIFICACION_MATCHMAKING.tex

### Documentación (10 documentos)
- ✅ `README.md` — Stack, estructura, despliegue
- ✅ `docs/DEFINICION_PROBLEMA.md` — 5 Whys, stakeholders, matriz de trazabilidad
- ✅ `docs/matchmaking/ALGORITMO_MATCHMAKING.md` — Especificación técnica del motor
- ✅ `docs/matchmaking/PLAN_MATCHMAKING.md` — Plan de evolución del motor
- ✅ `docs/matchmaking/PLANIFICACION_MATCHMAKING.tex` — Planificación consolidada en LaTeX
- ✅ `docs/trends/ALTERNATIVAS_SIN_IA.md` — Reporte de alternativas sin IA para trends
- ✅ `docs/FUERA_DE_ALCANCE_LLM.md` — Funcionalidades IA en pausa (placeholders)
- ✅ `docs/scrum/PRODUCT_BACKLOG.md` — User stories con MoSCoW
- ✅ `docs/ops/CATALOGO_SERVICIOS_SLA.md` — ITIL 4 service catalog
- ✅ `docs/governance/RACI_METRICAS.md` — COBIT RACI + KPIs

---

## Línea Base MVP — Lo que Falta (Agosto 2026)

### Crítico (P0)
| # | Gap | Esfuerzo est. |
|---|-----|:---:|
| 1 | `owner_id` en tabla `properties` — inmuebles huérfanos | 3 HH |
| 2 | RBAC — ownership check en PUT/POST protegidos | 4 HH |
| 3 | Sanitizar errores — no filtrar `err.Error()` al cliente | 2 HH |
| 4 | OnboardingPage → llamar `api.submitAssessment()` | 2 HH |
| 5 | DocumentCard → llamar `api.verifyDocument()` real | 2 HH |
| 6 | Corregir URLs de upload en `api.ts` | 1 HH |

### Alto (P1)
| # | Gap | Esfuerzo est. |
|---|-----|:---:|
| 7 | Volumen Docker para `uploads/` | 1 HH |
| 8 | INSERT de documentos en upload (no solo UPDATE) | 2 HH |
| 9 | Paginación en `GET /api/properties` | 3 HH |
| 10 | Validación de inputs en `CreateProperty` y `UpdateUser` | 3 HH |
| 11 | Proteger `GET /api/users/{id}` con auth | 1 HH |
| 12 | ChatPage → rutear por backend en vez de SDK cliente | 2 HH |
| 13 | Tests unitarios para el matcher (core) | 4 HH |

### Medio (P2)
| # | Gap | Esfuerzo est. |
|---|-----|:---:|
| 14 | Persistir matches en tabla `matches` | 2 HH |
| 15 | Persistir assessment en DB | 2 HH |
| 16 | Logger estructurado (`log/slog`) | 2 HH |
| 17 | Índices en `properties.price`, `properties.sqm`, `properties.location` | 1 HH |
| 18 | Puntajes de match en HomePage cards | 2 HH |
| 19 | Botones CTA funcionales (Solicitar Visita) | 3 HH |
| 20 | Routing basado en URLs (deep linking) | 4 HH |

**Total estimado para MVP completo: 46 HH (3 semanas adicionales)**

---

## Timeline de Commits (Julio 2026)

| Semana | Commit | Descripción |
|--------|--------|-------------|
| S1 (Jul ~1) | `81a6a21` | init — proyecto completo inicial (scaffolding, DB, Docker, docs) |
| S2 (Jul ~8) | _squashed_ | Core CRUD + motor WFD (endpoints, repos, matcher, 6 perfiles) |
| S3 (Jul ~15) | _squashed_ | Auth JWT + file upload + integración frontend-backend |
| S4 (Jul 29) | `2ed0169` | Add Jenkinsfile |
| S4 (Jul 29) | `2a7b4fb` | Fix Jenkins CI pipeline |
| S4 (Jul 29) | `047fec7` | Fix CI paths |
| S4 (Jul 29) | `31c6108` | Fix CI compose paths |
| S4 (Jul 29) | `d5813de` | Add Tailwind config |
| S4 (Jul 29) | `f73ce66` | Fix CI build |
| S4 (Jul 29) | `f1fc603` | Usa workspace de Jenkins, elimina PROJECT_DIR y sudo |
| S4 (Jul 29) | `d91c488` | fix: add missing Tailwind CSS config for frontend styling |
