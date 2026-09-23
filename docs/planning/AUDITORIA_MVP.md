# To-Do: MiLocal MVP — Hallazgos y Mejoras

> Audit combinado de backend + frontend — Julio 2026

---

## 1. CRÍTICO — Bloquean el lanzamiento

| # | Categoría | Hallazgo | Detalle |
|---|-----------|----------|---------|
| C1 | Auth | Sin autenticación | No login, registro, JWT, sesiones. Cualquier ID de usuario es leíble/escribible. |
| C2 | Auth | Sin endpoint de registro | `POST /api/users` no existe. Solo usuarios de seed. |
| C3 | Backend | Sin validación de inputs | Properties, users, match aceptan cualquier dato. Riesgo de SQL injection en queries dinámicas. |
| C4 | Backend | Sin file upload | Documentos y fotos de propiedades son solo URLs. No multipart/form-data, no storage. |
| C5 | Frontend | Datos hardcodeados | Properties duplicados en seed SQL, `HomePage.tsx` y `PropertyDetailPage.tsx`. El frontend no consume la API real. `TrendsPage` nunca llama al endpoint. |
| C6 | Backend | Sin graceful shutdown | No `recover()` de panics, no `signal.Notify` para SIGTERM. |

## 2. ALTO — Limitan severamente la funcionalidad MVP

| # | Categoría | Hallazgo | Detalle |
|---|-----------|----------|---------|
| H1 | Backend | Sin paginación | `GET /api/properties` devuelve todas las filas. Sin `page`, `limit`, `offset`. |
| H2 | Backend | Búsqueda insuficiente | Solo filtra por `?rubro=`. Sin filtros de precio, ubicación, m², afluencia, etc. |
| H3 | Backend | Sin update/delete de properties | Solo `POST` (crear). Owners no pueden gestionar sus inmuebles. |
| H4 | Frontend | Desconexión frontend-backend | `PropertyDetailPage` llama a `api.calculateMatch()` pero usa fallback hardcodeado. |
| H5 | Backend | Sin rate limiting | Sin protección contra abuso en `/api/match`, `/api/chat`, etc. |
| H6 | Backend | Logger no-op | Middleware de logger con cuerpo vacío. Sin logs de requests, tiempos, ni errores. |
| H7 | Backend | Errores filtran internos | `writeError()` envía errores crudos de Go al cliente. Riesgo de seguridad y UX. |
| H8 | Backend | Assessment no persiste | `POST /api/assessment` recibe y devuelve datos sin guardarlos en DB. |
| H9 | Frontend | Sin diseño responsive/mobile | Sidebar solo visible en `md+`. Sin hamburger menu, sin navegación mobile. |
| H10 | Frontend | Sin routing basado en URLs | Navegación por `useState` (tabs). Deep linking, back/forward y bookmarks rotos. |

## 3. MEDIO — Importante para producción

| # | Categoría | Hallazgo | Detalle |
|---|-----------|----------|---------|
| M1 | Backend | Sin structured logging | `log.Println` sin niveles, JSON, correlation IDs. |
| M2 | Backend | Migraciones no versionadas | `RunMigrations()` ejecuta SQL crudo cada inicio. Sin tabla de tracking. |
| M3 | Backend | Sin config management | `os.Getenv()` con defaults hardcodeados. Sin `.env` loader, sin validación. |
| M4 | Backend | Tabla `matches` sin uso | Creada pero nunca escrita ni leída en el código. |
| M5 | Backend | Chat history no persiste | Handler `Chat` nunca escribe a `chat_history`. |
| M6 | Backend | CORS `*` en producción | Sin restricción de orígenes. |
| M7 | Backend | Gemini retorna JSON crudo | `ChatWithGemini` retorna texto raw de Gemini sin extraer contenido. |
| M8 | Backend | Location similarity naive | `toLower()`/`split()` custom. Solo compara 3 chars. No geocoding real. |
| M9 | Frontend | Sin formulario de creación de inmuebles | Backend tiene `POST /api/properties` pero owners no tienen UI para publicar. |
| M10 | Frontend | Sin favoritos/guardados | Sin mecanismo para bookmarkear inmuebles. |
| M11 | Frontend | "Contactar" sin handlers | Botones "Solicitar Visita" y "Enviar Propuesta" no tienen `onClick`. |
| M12 | Frontend | Sin historial de matches | Matches calculados pero no guardados en perfil del usuario. |
| M13 | Frontend | Chat no persiste mensajes | Recargar la página pierde todo el historial del chat. |

## 4. BAJO — Nice to have

| # | Categoría | Hallazgo |
|---|-----------|----------|
| L1 | Backend | Health check no verifica DB (siempre 200). |
| L2 | Backend | Sin versionado de API (`/api/v1/`). |
| L3 | Backend | Sin Content-Type negotiation (solo JSON). |
| L4 | Backend | Sin límite de tamaño de request body. |
| L5 | Backend | Sin caching headers. |
| L6 | Backend | Sin métricas/monitoreo (sin `/metrics`). |
| L7 | Frontend | Sin i18n (solo español, multi-ciudad LatAm). |
| L8 | Frontend | Sin accesibilidad (ARIA, keyboard nav, screen readers). |
| L9 | Frontend | Sin SEO (SPA sin SSR, sin meta tags). |
| L10 | Frontend | Sin analytics/tracking. |
| L11 | Frontend | Sin PWA/service worker. |
| L12 | Frontend | Sin dark mode. |
| L13 | Frontend | "Visual Analyzer" es placeholder vacío. |
| L14 | Frontend | Sin galería de imágenes en property detail. |
| L15 | Frontend | Sin comparación lado a lado de inmuebles. |

---

## 5. MEJORAS SUGERIDAS

### Arquitectura

| # | Sugerencia |
|---|------------|
| A1 | **Eliminar prototipo monolítico raíz**: `App.tsx`, `index.tsx`, `types.ts`, `geminiService.ts`, `index.html`, `vite.config.ts` en raíz son legacy. Solo debe quedar `frontend/`. |
| A2 | **Single source of truth para properties**: Eliminar datos hardcodeados en frontend. Consumir exclusivamente la API. |
| A3 | **Extraer config package en backend**: Centralizar `os.Getenv()` en struct validado al startup. |
| A4 | **Agregar service layer**: Los handlers llaman repos directamente. Una capa de servicio permitiría lógica de negocio antes del acceso a DB. |
| A5 | **Herramienta de migración adecuada**: Migrar de `CREATE TABLE IF NOT EXISTS` a `golang-migrate` o `atlas` con version tracking. |
| A6 | **Interfaces para repositorios**: Handlers importan `repository` directamente. Definir interfaces para testear con mocks. |
| A7 | **Routing basado en URLs en frontend**: Reemplazar tab switching con React Router (`/`, `/property/:id`, `/onboarding`, `/profile`, `/chat`, `/trends`). |
| A8 | **Store de estado global**: Zustand o React Context para `userProfile`, `selectedRubro`, `properties` (evitar prop-drilling de 4+ niveles). |
| A9 | **Poblar `hooks/`**: Custom hooks: `useProperties()`, `useMatch()`, `useUser()`, `useDocuments()`. |

### Seguridad

| # | Sugerencia |
|---|------------|
| S1 | **Implementar JWT auth**: Access + refresh tokens con `golang-jwt` o `jose`. Middleware de validación en rutas protegidas. |
| S2 | **RBAC**: Diferenciar emprendedor, propietario, admin. Un owner no debe poder modificar documentos de otro. |
| S3 | **Sanitización de API keys**: `GEMINI_API_KEY` nunca en logs. Sanitizar mensajes de error. |
| S4 | **Validación de inputs**: Longitudes de strings, rangos numéricos, valores enum. Usar librería de validación o validadores custom. |
| S5 | **Rate limiting**: Per-IP y per-user usando `golang.org/x/time/rate`. |
| S6 | **Restringir CORS origins**: Reemplazar `*` por orígenes específicos. |
| S7 | **HTTPS enforcement**: Redirect middleware HTTP→HTTPS en producción. |
| S8 | **Content Security Policy headers en Nginx**. |
| S9 | **No embeber Gemini API key en bundle frontend**: Usar solo proxy del backend. |

### Rendimiento

| # | Sugerencia |
|---|------------|
| P1 | **Tuning de connection pool**: Agregar `SetConnMaxLifetime` y `SetConnMaxIdleTime`. |
| P2 | **Índices en DB**: `properties.location`, `properties.price` para búsqueda/filtro. |
| P3 | **Paginación**: Offset-based o cursor-based en `/api/properties`. |
| P4 | **Cache de resultados de match**: Para el mismo par (property, rubro), cachear score. |
| P5 | **Lazy loading de imágenes**: `loading="lazy"` en `<img>`. |
| P6 | **Code splitting**: `React.lazy + Suspense` para páginas. |
| P7 | **Memoización**: `React.memo`, `useMemo`, `useCallback` en listas de properties y rubro selector. |
| P8 | **Preconnect a dominios externos**: Google Fonts, Unsplash, pravatar.cc. |

### UX / UI (Frontend)

| # | Sugerencia |
|---|------------|
| U1 | **Bottom navigation bar mobile** con las 5 secciones principales. |
| U2 | **Hamburger menu** para el sidebar en mobile. |
| U3 | **Vista de mapa**: Implementar con Leaflet o Google Maps, con pins y popups. |
| U4 | **Skeleton loading states**: Para cards de properties, stats del perfil, gráfico de trends. |
| U5 | **Toast notifications**: Para success/error al subir documentos, cargar propiedades, etc. |
| U6 | **Validación de formularios**: Onboarding y creación de inmuebles. |
| U7 | **Error boundaries**: React ErrorBoundary para fallos en componentes. |
| U8 | **Selector de rubro conectado al backend**: `GET /api/properties?rubro=`. |
| U9 | **"Visual Analyzer"**: Quitar placeholder o agregar badge "Próximamente". |

### Developer Experience

| # | Sugerencia |
|---|------------|
| D1 | **Makefile**: `make dev`, `make build`, `make test`, `make lint`, `make docker-up`. |
| D2 | **Logger estructurado**: Reemplazar middleware no-op con `log/slog` (Go 1.21+ stdlib). |
| D3 | **Hot reload**: Documentar uso de `air` para backend en desarrollo. |
| D4 | **API documentation**: OpenAPI/Swagger spec con `swaggo/swag`. |
| D5 | **TypeScript strict mode**: Ya activado en `frontend/`, mantener. |
| D6 | **Variable de entorno para API URL**: `VITE_API_URL` con fallback de producción. |

### Testing

| # | Sugerencia |
|---|------------|
| T1 | **Cero tests**: Sin `*_test.go`, sin `*.test.ts`, sin `*.spec.ts`. El Product Backlog exige >80% de cobertura. |
| T2 | **Unit tests para el matcher**: Core value proposition. Testear cada perfil de rubro, el cap del 29%, edge cases. |
| T3 | **Integration tests backend**: `httptest.NewServer` con DB de test. |
| T4 | **Property-based tests para location similarity**: Fuzz testing de `calculateLocationSimilarity`. |
| T5 | **Frontend tests**: Vitest + React Testing Library para componentes y páginas. |
| T6 | **E2E tests**: Playwright o Cypress para flujos críticos (onboarding, búsqueda, detalle, Trust Level). |

### Datos & Esquema

| # | Sugerencia |
|---|------------|
| DS1 | **Índices**: `price`, `sqm` en tabla `properties`. |
| DS2 | **Normalizar rubro**: String libre vs enum `BusinessRubro`. |
| DS3 | **Tabla `property_images`**: Soporte para múltiples imágenes por inmueble. |
| DS4 | **Tabla `favorites/saved`**: Bookmarks de usuarios. |
| DS5 | **Tabla `visits`**: Agendamiento de visitas (funcionalidad Level 1). |

---

## 6. ESTIMACIÓN PARA MVP

**Estado actual**: Fundación arquitectónica sólida, motor de matchmaking funcional, documentación de calidad, CI/CD operativo. **Pero no está listo para MVP.**

**Esfuerzo estimado para llegar a MVP**: 4-6 semanas adicionales (60-90 horas), priorizando:

1. Auth (login, registro, JWT, rutas protegidas)
2. File upload (documentos + imágenes de inmuebles)
3. Integración frontend-backend real (eliminar hardcoded data)
4. Validación de inputs
5. Diseño responsive/mobile
6. Routing basado en URLs
7. Tests básicos (matcher + componentes clave)
