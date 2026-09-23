# Definición del Problema - MiLocal

## 1. Enunciado del problema

El mercado de arriendo de locales comerciales en Latinoamérica opera con **asimetría de
información y desconfianza estructural** entre las dos partes:

| Actor | Problema |
|-------|----------|
| **Emprendedor** | Desconoce qué locales son técnicamente compatibles con su rubro (gas, potencia eléctrica, patentes). Invierte semanas visitando espacios que no califican. Carece de historial crediticio verificable ante el propietario. |
| **Propietario** | Recibe postulaciones de arrendatarios sin perfil financiero validado. Enfrenta vacancia prolongada por no saber qué rubros tienen demanda real en su zona. No puede diferenciar entre un postulante solvente y uno riesgoso. |

**La consecuencia:** ciclos de búsqueda largos (3-6 meses), locales vacíos por inadecuación
técnica, y contratos fallidos por falta de confianza financiera. Las partes operan a ciegas.

---

## 2. Problema raíz (5 porqués)

| Nivel | Pregunta | Respuesta |
|-------|----------|-----------|
| 1 | ¿Por qué fallan los matches entre emprendedores y propietarios? | Porque el emprendedor postula a locales incompatibles con su rubro o no logra demostrar solvencia. |
| 2 | ¿Por qué postula a locales incompatibles? | Porque no existe una evaluación técnica automatizada que cruce los requisitos de su rubro contra las especificaciones del local. |
| 3 | ¿Por qué no demuestra solvencia? | Porque no hay un mecanismo estandarizado de verificación de antecedentes financieros que el propietario reconozca como confiable. |
| 4 | ¿Por qué no existe esa evaluación ni ese mecanismo? | Porque el mercado de arriendo comercial es artesanal: los corredores operan con planillas Excel y criterios subjetivos. |
| 5 | ¿Por qué sigue siendo artesanal? | Porque no hay una plataforma que sistematice la compatibilidad técnica por rubro ni que compute un score de confianza verificable. |

---

## 3. Stakeholders y sus dolores

| Stakeholder | Dolor principal | Expectativa de MiLocal |
|-------------|-----------------|----------------------|
| Emprendedor (arrendatario) | "Perdí 3 meses visitando locales que no tenían los permisos para mi cafetería" | Saber en minutos qué locales son realmente viables para mi rubro |
| Propietario (arrendador) | "El último arrendatario quebró a los 4 meses y no pagó" | Filtrar postulantes con perfil financiero verificado antes de mostrar mi propiedad |
| Corredor inmobiliario | "Paso horas calificando manualmente si un local sirve para lo que pide el cliente" | Una herramienta que automatice el pre-filtro técnico |
| Inversionista comercial | "No sé qué rubro tiene más demanda en esta zona" | Datos de mercado que informen qué tipo de negocio maximiza el retorno en cada ubicación |

---

## 4. Alcance de la solución (MVP)

MiLocal resuelve el problema en **3 ejes**, cada uno mapeado a los documentos del proyecto:

### Eje 1: Matchmaking técnico (compatibilidad rubro → local)

| Correspondencia | Referencia |
|-----------------|------------|
| **User Story** | US.01 - Perfilamiento de Rubro |
| **Motor actual** | [`ALGORITMO_MATCHMAKING.md`](matchmaking/ALGORITMO_MATCHMAKING.md) — Weighted Feature Distance con perfiles vectoriales por rubro |
| **Métrica de éxito** | Precisión del Scoring > 90% (validada vs contratos reales) — [`RACI_METRICAS.md`](governance/RACI_METRICAS.md) |
| **Riesgo asociado** | R.03 — Sesgo algorítmico / manipulación del motor de match — [`MATRIZ_RIESGOS.md`](security/MATRIZ_RIESGOS.md) |

**Qué resuelve:** El emprendedor selecciona su rubro y el sistema calcula un score de
compatibilidad (0-100%) por cada propiedad, basado en 10 dimensiones: capacidad eléctrica,
gas, agua, trampa de grasas, frente comercial, flujo peatonal, negociabilidad, presupuesto,
tamaño y ubicación deseada. Las propiedades con el rubro no permitido se capan en 29%.

### Eje 2: Trust & Compliance (verificación del arrendatario)

| Correspondencia | Referencia |
|-----------------|------------|
| **User Stories** | US.02 - Carga de Carpeta Tributaria, US.03 - Trust Score, US.04 - Validación KYC |
| **Implementación actual** | Trust Level 0 → 1 mediante verificación administrativa de 3 documentos obligatorios (identidad, ingresos, legal). Endpoint `POST /api/users/{id}/documents/{docId}/verify` (solo administrador) |
| **Métrica de éxito** | 0 filtraciones de datos sensibles — [`RACI_METRICAS.md`](governance/RACI_METRICAS.md) |
| **Riesgos asociados** | R.01 — Acceso no autorizado a datos financieros (Alto), R.02 — Suplantación de identidad (Medio) — [`MATRIZ_RIESGOS.md`](security/MATRIZ_RIESGOS.md) |
| **Marco legal** | Ley 19.628 (Chile) — Protección de datos personales — [`POLITICA_PRIVACIDAD.md`](security/POLITICA_PRIVACIDAD.md) |

**Qué resuelve:** El propietario solo recibe postulaciones de arrendatarios con Trust Level
verificado (documentos cargados y validados). El emprendedor construye su reputación digital
antes de contactar al dueño. La privacidad está respaldada por cifrado AES-256, tokenización
y el marco de la Ley 19.628.

### Eje 3: Onboarding & Engagement (experiencia del usuario)

| Correspondencia | Referencia |
|-----------------|------------|
| **User Story** | US.05 - Dashboard de Postulante |
| **Implementación actual** | Flujo multi-step de assessment (4 pasos para emprendedor, 3 para propietario) + barra de progreso de Trust Level en sidebar |
| **Métrica de éxito** | Tasa de abandono en carga de documentos < 15% — [`RACI_METRICAS.md`](governance/RACI_METRICAS.md) |

**Qué resuelve:** El usuario sabe exactamente qué le falta para desbloquear el siguiente
nivel (visitas ilimitadas, contacto con propietarios) y recibe feedback inmediato sobre la
completitud de su perfil.

---

## 5. Trazabilidad: problema → solución → medición

| Problema identificado | Historia de usuario | Solución implementada | Cómo se mide |
|-----------------------|--------------------|-----------------------|--------------|
| Emprendedor visita locales incompatibles | US.01 Perfilamiento de Rubro | Motor de scoring vectorial con 6 perfiles de rubro y 10 dimensiones | Precisión del scoring > 90% |
| Propietario no confía en postulantes | US.02 Carpeta Tributaria<br>US.03 Trust Score | Trust Level con 3 documentos verificables | % matches que terminan en contrato |
| Suplantación de identidad | US.04 Validación KYC | Documentos de identidad con status `pending`/`verified` | 0 filtraciones de datos |
| Usuario no sabe qué le falta | US.05 Dashboard | Barra de progreso + sidebar con Trust Level | Tasa de abandono < 15% |
| Datos financieros expuestos | — (transversal) | Cifrado AES-256, RBAC, tokenización | 0 incidentes de seguridad |

---

## 6. Lo que NO resuelve el MVP (fuera de alcance)

Ver [`FUERA_DE_ALCANCE_LLM.md`](FUERA_DE_ALCANCE_LLM.md) para el detalle completo:

- **Chatbot Consultor**: asesoría conversacional sobre zonas, flujos y ROI. Depende de LLM.
- **Pulso Comercial**: datos de mercado (precio/m², vacancia) resueltos en el MVP con datos estáticos curados en `static_trends`, sin LLM. Ver [`ALTERNATIVAS_SIN_IA.md`](trends/ALTERNATIVAS_SIN_IA.md).
- **Visual Analyzer**: análisis multimodal de fotos de fachada. Requiere modelo con visión.
- **Integración con buró de crédito** (US.03): el Trust Score actualmente es binario (documentos verificados = nivel 1). La integración con Dicom/Equifax para scoring ponderado es una fase posterior.

---

## 7. Restricciones

| Tipo | Restricción |
|------|-------------|
| **Técnica** | El motor de matchmaking debe ser explicable: cada dimensión del score debe ser trazable. Esto descarta modelos de caja negra en el MVP. |
| **Legal** | Cumplimiento Ley 19.628 (Chile) para todos los datos personales y financieros recolectados en el onboarding. |
| **Operacional** | API de scoring debe responder en < 2 segundos (p95). Mantención domingo 02:00-04:00 GMT-4. Ver [`CATALOGO_SERVICIOS_SLA.md`](ops/CATALOGO_SERVICIOS_SLA.md). |
| **Negocio** | El scoring debe ser auditable para que corredores y propietarios confíen en él. No puede ser una "caja mágica". |
| **Arquitectura** | Backend Go + PostgreSQL + Frontend React. El motor de matchmaking es un submódulo de un portal inmobiliario más amplio. Ver [`README.md`](../README.md). |

---

## 8. Mapa de dependencias entre documentos

```
DEFINICION_PROBLEMA.md  (este archivo)
    ├── PRODUCT_BACKLOG.md       → Historias de usuario que descomponen el problema
    ├── ALGORITMO_MATCHMAKING.md → Solución técnica del Eje 1
    ├── RACI_METRICAS.md         → Quién resuelve qué + cómo se mide el éxito
    ├── MATRIZ_RIESGOS.md        → Qué puede fallar en la solución
    ├── CATALOGO_SERVICIOS_SLA.md → Restricciones operacionales
    ├── POLITICA_PRIVACIDAD.md   → Restricciones legales
    └── FUERA_DE_ALCANCE_LLM.md  → Lo pospuesto para fases posteriores
```

---

_Última actualización: Septiembre 2026 — Alineado con el Product Backlog consolidado (`docs/scrum/PRODUCT_BACKLOG.md`) y el motor de matchmaking Fase 1_
