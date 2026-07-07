# Gobernanza y Métricas IT (Basado en COBIT)

Este documento define las responsabilidades y cómo mediremos el éxito del alineamiento entre IT y el Negocio para MiLocal.

## 1. Matriz RACI (Módulo Assessment)

| Actividad | Desarrollador | Product Owner | QA / Seguridad | Stakeholder (Legal) |
|:---|:---:|:---:|:---:|:---:|
| Definición de Criterios de Scoring | C | A | I | R |
| Implementación de API de Match | R | A | C | I |
| Validación de Cumplimiento Normativo | I | C | R | A |
| Aprobación de Pase a Producción | I | A | R | I |

*R: Responsible, A: Accountable, C: Consulted, I: Informed*

## 2. Framework de Métricas (Cascada de Metas)

### Metas de Negocio (Empresariales)
- **Meta:** Generar confianza absoluta entre dueños y arrendatarios.
- **Métrica:** % de matches que terminan en contrato firmado.

### Metas de Alineamiento IT (COBIT)
- **Meta:** Garantizar la integridad y privacidad del perfil financiero.
- **Indicador (KPI):** 0 filtraciones de datos sensibles notificadas.

### Métricas Operacionales (Assessment)
| Métrica | Objetivo (Target) | Frecuencia |
|:---|:---|:---|
| Tiempo promedio de Assessment | < 5 minutos | Mensual |
| Tasa de abandono en carga de documentos | < 15% | Semanal |
| Precisión del Scoring (Validada vs Real) | > 90% | Trimestral |
| Disponibilidad del API de Scoring | 99.9% | Tiempo real |
