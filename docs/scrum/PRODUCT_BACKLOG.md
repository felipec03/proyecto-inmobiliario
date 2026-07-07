# Product Backlog - MiLocal (Módulo de Assessment)

Este backlog se centra en la construcción del perfil del arrendatario y el motor de pre-calificación.

## Historias de Usuario (Épicas de Onboarding & Assessment)

| ID | Historia de Usuario | Prioridad (MoSCoW) | Criterios de Aceptación (DoD) |
|:---|:---|:---|:---|
| US.01 | **Perfilamiento de Rubro:** Como emprendedor, quiero seleccionar mi rubro comercial para que el sistema filtre locales con permisos adecuados. | Must Have | - Selección de rubros: Gastronomía, Retail, Logística, etc. <br> - Validación de compatibilidad técnica. |
| US.02 | **Carga de Carpeta Tributaria:** Como prospecto arrendatario, quiero subir mi carpeta tributaria (Sii) para automatizar mi perfil financiero. | Must Have | - Soporte PDF. <br> - Validación de integridad de archivo. <br> - Cifrado AES-256 en reposo. |
| US.03 | **Generación de "Trust Score":** Como sistema, quiero calcular un puntaje de confianza basado en deudas (Dicom/Equifax) y flujos. | Must Have | - Integración con API de buró de crédito. <br> - Algoritmo de scoring ponderado. |
| US.04 | **Validación de Identidad (KYC):** Como dueño, quiero que los postulantes verifiquen su identidad antes de contactarme. | Should Have | - Verificación biométrica o carga de documento ID. <br> - Marcado de "Perfil Verificado". |
| US.05 | **Dashboard de Postulante:** Como emprendedor, quiero ver mi nivel de "arrendatibilidad" y qué documentos me faltan. | Should Have | - Barra de progreso. <br> - Sugerencias de mejora de perfil. |

## Definición de Terminado (Definition of Done - Global)
- Código revisado por pares (Peer Review).
- Cobertura de tests unitarios > 80%.
- Escaneo de vulnerabilidades sin hallazgos críticos.
- Documentación técnica actualizada en el Wiki/Repo.
- Cumplimiento de criterios de accesibilidad (WCAG 2.1).
