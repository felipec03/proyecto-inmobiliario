# MiLocal - Trust & Match

Plataforma de matchmaking inmobiliario comercial impulsada por IA. Conecta emprendedores
buscando locales comerciales con propietarios que tienen espacios disponibles, usando un
motor de scoring de compatibilidad basado en rubro, especificaciones técnicas y datos de
mercado.

## Stack

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19, TypeScript 5.8, Vite 6, Tailwind CSS |
| **Backend** | Go 1.23, net/http (stdlib) |
| **Base de datos** | PostgreSQL 16 |
| **Infraestructura** | Docker + Docker Compose |
| **Librerías UI** | Lucide React, Motion (Framer), Recharts |

## Estructura del proyecto

```
├── frontend/                    # SPA React + TypeScript + Vite
│   ├── src/
│   │   ├── components/          # Componentes reutilizables (BrandLogo, CommercialCard, etc.)
│   │   ├── pages/               # Vistas principales (Home, Chat, Profile, Trends, Onboarding)
│   │   ├── services/            # Cliente REST API + servicios externos
│   │   ├── types/               # Definiciones TypeScript
│   │   └── hooks/               # Custom hooks
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                     # API REST en Go
│   ├── cmd/server/main.go       # Entry point
│   ├── internal/
│   │   ├── handler/             # HTTP handlers (CRUD + proxy LLM)
│   │   ├── model/               # Modelos de datos y DTOs
│   │   ├── repository/          # Acceso a PostgreSQL
│   │   ├── service/             # Lógica de negocio (match scoring, LLM proxy)
│   │   └── middleware/          # CORS, logging
│   ├── migrations/              # SQL de inicialización
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
│
├── docs/                        # Documentación
│   ├── governance/              # RACI + métricas COBIT
│   ├── ops/                     # Catálogo de servicios + SLA (ITIL 4)
│   ├── scrum/                   # Product backlog + user stories
│   └── security/                # Política de privacidad + matriz de riesgos (ISO 27001)
│
├── docker-compose.yml
└── README.md
```

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/properties?rubro=` | Listar propiedades (filtro opcional por rubro) |
| `GET` | `/api/properties/{id}` | Detalle de una propiedad |
| `POST` | `/api/properties` | Crear propiedad |
| `GET` | `/api/users/{id}` | Perfil de usuario + documentos |
| `PUT` | `/api/users/{id}` | Actualizar perfil |
| `POST` | `/api/users/{userId}/documents/{docId}/verify` | Verificar documento (Trust Level) |
| `POST` | `/api/match` | Calcular score de compatibilidad rubro-propiedad |
| `POST` | `/api/assessment` | Guardar resultado de onboarding |
| `POST` | `/api/chat` | Chat con IA (proxy - fuera de alcance) |
| `GET` | `/api/trends?city=` | Tendencias de mercado (proxy - fuera de alcance) |

## Despliegue local

### Requisitos

- Docker + Docker Compose
- (Opcional) Node.js 20+ para desarrollo del frontend
- (Opcional) Go 1.23+ para desarrollo del backend

### Con Docker Compose (recomendado)

```bash
# 1. Crear archivo .env con las API keys necesarias
echo "GEMINI_API_KEY=tu_key_aqui" > .env

# 2. Levantar todos los servicios
docker compose up -d

# 3. Acceder
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# PostgreSQL: localhost:5432 (user: milocal, pass: milocal, db: milocal)
```

### Desarrollo del frontend

```bash
cd frontend
npm install
npm run dev        # Dev server en http://localhost:3000 con proxy a backend
npm run build      # Build de producción
npm run lint       # TypeScript check
```

### Desarrollo del backend

```bash
cd backend
go mod tidy
DATABASE_URL="postgres://milocal:milocal@localhost:5432/milocal?sslmode=disable" \
GEMINI_API_KEY="tu_key" \
go run ./cmd/server
```

## Base de datos

PostgreSQL 16 con las siguientes tablas:

- `users` - Perfiles de emprendedores y propietarios
- `documents` - Documentos de verificación (identidad, ingresos, legal, propiedad)
- `properties` - Locales comerciales con especificaciones técnicas y disponibilidad
- `matches` - Historial de scores calculados con estado (`scored`/`contacted`/`closed_won`/`closed_lost`)
- `assessments` - Respuestas del onboarding (JSONB)
- `user_preferences` - Preferencias de búsqueda del usuario
- `leads` - Guardados, postulaciones y solicitudes de contacto
- `static_trends` - Datos de mercado curados para `GET /api/trends`
- `chat_history` - Registro de conversaciones (placeholder, ON HOLD)

Las migraciones se ejecutan automáticamente al iniciar el backend. El seed incluye 3
propiedades demo (Santiago, CDMX y Medellín) y un usuario de prueba (`u1`).

## Funcionalidades con IA (fuera de alcance actual)

Las siguientes funcionalidades dependen de LLMs y están documentadas pero no activas:

- **Chatbot Consultor MiLocal** - Chat conversacional con Gemini/DeepSeek
- **Pulso Comercial** - Tendencias de mercado con web search grounding
- **Visual Analyzer** - Análisis multimodal de fotos de locales

Ver [`docs/FUERA_DE_ALCANCE_LLM.md`](docs/FUERA_DE_ALCANCE_LLM.md) para el detalle completo.

## Documentación de gobernanza

El proyecto sigue marcos IT estándar:

| Documento | Marco |
|-----------|-------|
| [`RACI_METRICAS.md`](docs/governance/RACI_METRICAS.md) | COBIT |
| [`CATALOGO_SERVICIOS_SLA.md`](docs/ops/CATALOGO_SERVICIOS_SLA.md) | ITIL 4 |
| [`DEFINICION_PROBLEMA.md`](docs/DEFINICION_PROBLEMA.md) | Problema raíz, stakeholders y trazabilidad |
| [`PRODUCT_BACKLOG.md`](docs/scrum/PRODUCT_BACKLOG.md) | Scrum |
| [`POLITICA_PRIVACIDAD.md`](docs/security/POLITICA_PRIVACIDAD.md) | Ley 19.628 (Chile) + ISO 27001 |
| [`MATRIZ_RIESGOS.md`](docs/security/MATRIZ_RIESGOS.md) | ISO 27001 |
| [`ALGORITMO_MATCHMAKING.md`](docs/matchmaking/ALGORITMO_MATCHMAKING.md) | Arquitectura del motor de scoring |
| [`PLAN_MATCHMAKING.md`](docs/matchmaking/PLAN_MATCHMAKING.md) | Plan de evolución y path a ML |
| [`FUERA_DE_ALCANCE_LLM.md`](docs/FUERA_DE_ALCANCE_LLM.md) | Funcionalidades LLM pausadas |
| [`schema.dbml`](docs/database/schema.dbml) | Diagrama entidad-relación de la base de datos |
| [`openapi.yaml`](docs/api/openapi.yaml) | Especificación OpenAPI 3.0 de la API |
| [`PROJECT_CHARTER.tex`](docs/charter/PROJECT_CHARTER.tex) | Project Charter (LaTeX) |
| [`AGOSTO_2026.md`](docs/planning/AGOSTO_2026.md) | Planificación del mes de agosto |

## Módulo de matchmaking

Este proyecto es el submódulo de **matchmaking** de un portal inmobiliario más amplio.
El motor de scoring evalúa compatibilidad entre un rubro comercial y una propiedad
basándose en:

- Permisos de uso del local
- Capacidad eléctrica (básica/trifásica)
- Conexiones de gas, agua y trampa de grasas
- Flujo peatonal (bajo/medio/alto)
- Tamaño de frente comercial
- Historial de negocios anteriores y estado de adecuación

Los usuarios acumulan **Trust Level** (0 → 1) verificando documentos. El nivel 1
desbloquea la capacidad de agendar visitas y enviar propuestas formales.
