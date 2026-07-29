# Planificación — Agosto 2026

> Proyecto: MiLocal — Trust & Match  
> Capacidad: 15 HH/semana × 4 semanas = **60 HH totales**  
> Objetivo: Alcanzar estado MVP productivo para usuarios reales en Chile

---

## Semana 1 (Ago 1-7): Seguridad, Autorización y Estabilidad

**Horas estimadas: 15**

| Actividad | HH | Detalle |
|-----------|-----|---------|
| Implementar RBAC/ownership checks en todos los endpoints protegidos | 4 | `PUT /users/{id}`, `PUT /preferences`, `POST /upload/*`, `POST /verify`, `POST /properties` |
| Sanitización de errores: reemplazar `err.Error()` con mensajes genéricos | 2 | Todos los handlers. Loggear errores reales server-side |
| Agregar `AuthMiddleware` a `POST /api/match` y `POST /api/assessment` | 1 | user_id ahora se registra correctamente |
| Arreglar CORS: whitelist de orígenes, eliminar `*` + credentials | 1 | Orígenes: localhost:5173, localhost:3001, matchinmobiliario.fcadev.cl |
| Graceful shutdown: `signal.Notify` + `srv.Shutdown()` con timeout 10s | 1 | SIGTERM/SIGINT no matan requests en vuelo |
| Health check real: `db.Ping()` → 503 si DB caída | 0.5 | En vez del 200 ciego actual |
| Validación de inputs en `CreateProperty`: title, price>0, sqm>0, location | 1 | HTTP 400 con mensaje específico |
| Server-side UUID generation para propiedades | 0.5 | Ya no se acepta ID del cliente |
| Proteger `GET /users/{id}` y `GET /users/{id}/preferences` con auth | 1 | Datos personales ya no son públicos |
| Fix `rubro` y `commune_id` en preferences: ya no se descartan silenciosamente | 1 | Se guardan y devuelven correctamente |
| Crear endpoint `POST /api/properties/{propertyId}/contact` | 1 | Solicitudes de visita/propuesta |
| Tests manuales end-to-end de auth + RBAC + match | 1 | Verificar con curl cada endpoint |

**Entregables:**
- Backend seguro: todos los endpoints protegidos con ownership checks
- Errores sanitizados (sin leaks de DB/Go)
- Match y assessment persisten con user_id real
- CORS correcto para producción
- API de contacto funcional

---

## Semana 2 (Ago 8-14): Frontend — Correcciones Críticas y Chile-Only

**Horas estimadas: 15**

| Actividad | HH | Detalle |
|-----------|-----|---------|
| ChatPage → placeholder "Próximamente" (remover SDK Gemini del browser) | 1 | API key ya no se expone en el bundle |
| Reemplazar "Próximamente" en CTAs por ContactModal funcional | 3 | Formulario de contacto con name/email/mensaje → `POST /api/contact` |
| Fix upload de documentos: status `'pending'` en vez de `'verified'` | 0.5 | verifyDocument es el único path a 'verified' |
| Enviar RUT al backend en registro | 1 | `useAuth.register()` + `api.register()` aceptan RUT |
| Deduplicar comunas en `COMUNAS_RM` + ordenar alfabéticamente | 0.5 | Sin duplicados en dropdown |
| Centralizar `UF_RATE` en `constants.ts` (con TODO para backend) | 0.5 | Valor en un solo lugar |
| Fix match score "0%" mientras carga → mostrar "Calculando..." | 0.5 | Sin datos falsos durante loading |
| Ocultar toggle de mapa (no implementado) | 0.5 | Sin botones muertos |
| Puntajes de match en HomePage cards (usuarios autenticados) | 3 | `Promise.allSettled` para calcular match por propiedad |
| Remover "84%" hardcodeado en perfil → mostrar "—" | 0.5 | Sin datos falsos |
| Tests manuales de flujos completos: registro → onboarding → propiedades → match → contacto | 2 | Verificar UX end-to-end |
| LoginPage/RegisterPage: validación de formato email | 1 | Prevenir emails inválidos |
| Onboarding: validación de campos requeridos antes de avanzar paso | 1 | Sin submits vacíos |

**Entregables:**
- Frontend sin API keys expuestas
- CTAs funcionales con modal de contacto
- Flujo de documentos corregido (pending → verified)
- UF rate centralizado
- Match scores reales en HomePage

---

## Semana 3 (Ago 15-21): Calidad, Paginación y UX

**Horas estimadas: 15**

| Actividad | HH | Detalle |
|-----------|-----|---------|
| Paginación en `GET /api/properties`: `?page=` y `?limit=` params | 3 | Offset-based, metadata en response |
| Filtros avanzados: `?price_min=`, `?price_max=`, `?sqm_min=`, `?sqm_max=`, `?location=` | 3 | WHERE clauses dinámicas parametrizadas |
| Logger estructurado con `log/slog`: método, path, status, duración, correlation ID | 2 | Reemplaza middleware no-op actual |
| `PUT /api/properties/{id}` y `DELETE /api/properties/{id}` | 3 | Owners gestionan sus inmuebles |
| Endpoint `GET /api/properties/{id}/matches` — historial de matches del inmueble | 1 | Auditoría de quién vio qué |
| Frontend: PropertyCard paginación/infinite scroll | 2 | Carga progresiva en vez de todas juntas |
| Frontend: filtros de precio y m² en HomePage | 1 | Sliders o inputs de rango |

**Entregables:**
- Backend con paginación y filtros
- Logging estructurado con correlation IDs
- CRUD completo de propiedades (create, read, update, delete)
- Frontend con scroll infinito y filtros

---

## Semana 4 (Ago 22-29): Documentación, Tests y Deploy Final

**Horas estimadas: 15**

| Actividad | HH | Detalle |
|-----------|-----|---------|
| Tests unitarios del motor de matchmaking | 3 | `matcher/*_test.go`: perfiles, edge cases, 29% cap |
| Tests de integración: handlers con `httptest.NewServer` | 3 | Auth flow, CRUD, match |
| Tests frontend: Vitest + React Testing Library | 3 | CommercialCard, LoginPage, OnboardingPage |
| Documentación OpenAPI completa (18 endpoints) | 2 | `docs/api/openapi.yaml` — Swagger/Redoc |
| Project Charter en LaTeX compilando toda la documentación | 2 | `docs/charter/PROJECT_CHARTER.tex` |
| Planificación Septiembre 2026 | 1 | `docs/planning/SEPTIEMBRE_2026.md` |
| Deploy productivo final + smoke tests | 1 | Verify all endpoints, frontend, auth flow |

**Entregables:**
- Suite de tests (unitarios + integración + frontend)
- Documentación API completa (OpenAPI 3.0)
- Project Charter consolidado
- Planificación del mes siguiente
- Deploy productivo verificado

---

## Resumen de Horas por Área (Agosto)

| Área | Total HH | % |
|------|----------|---|
| Backend — Autorización y seguridad | 8 | 13% |
| Backend — Features (paginación, filtros, CRUD, contacto) | 14 | 23% |
| Frontend — Correcciones críticas | 8 | 13% |
| Frontend — UX y features | 9 | 15% |
| Testing | 9 | 15% |
| Documentación | 5 | 8% |
| Infraestructura / Deploy | 4 | 7% |
| Logging / Observabilidad | 3 | 5% |
| **Total** | **60** | **100%** |

---

## KPIs de Éxito para Agosto

| KPI | Meta | Cómo se mide |
|-----|------|-------------|
| Cobertura de autorización | 100% de endpoints protegidos con ownership check | Code review |
| Errores sanitizados | 0 leaks de errores internos al cliente | `grep -r "err.Error()" internal/handler/` |
| CORS válido | `*` + credentials eliminado | Inspección de headers |
| API key expuesta | 0 keys en bundle frontend | `grep -r "GEMINI\|API_KEY" frontend/src/` |
| Tests | ≥ 20 tests unitarios/integración | `go test ./...` + `npx vitest run` |
| Documentación API | 18 endpoints documentados | OpenAPI spec completa |
| Flujo end-to-end | Registro → Onboarding → Propiedades → Match → Contacto | Smoke test manual |

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|:---:|:---:|-----------|
| La API de contacto requiere cambios en el flujo de notificaciones | Media | Medio | Mantener simple: almacenar en DB, notificar por email en fase 2 |
| El proveedor LLM no se decide en agosto | Alta | Bajo | Chat y Trends ya están en placeholder. Sin dependencia |
| UF rate cambia y los precios muestran valores desactualizados | Alta | Medio | Migrar UF_RATE a endpoint del backend (`GET /api/config`) en semana 3 |
| No hay tiempo para tests E2E completos | Media | Medio | Priorizar tests del matcher (core) y auth. Deferir tests de UI |
