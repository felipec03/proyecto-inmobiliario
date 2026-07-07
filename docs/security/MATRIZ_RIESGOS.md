# Matriz de Riesgos de Seguridad e Información (ISO 27001)

Foco: Módulo de Assessment y Datos Financieros de Arrendatarios.

## Identificación y Evaluación de Riesgos

| ID | Activo | Amenaza | Vulnerabilidad | Impacto | Probabilidad | Nivel de Riesgo | Control Mitigante (Anexo A ISO 27001) |
|:---|:---|:---|:---|:---|:---|:---|:---|
| R.01 | Datos Financieros (Carpeta Tributaria) | Acceso No Autorizado | Falta de cifrado en BD / Bucket | Crítico | Media | **Alto** | **A.8.24:** Cifrado de datos en reposo y tránsito. Control estricto de acceso (RBAC). |
| R.02 | Identidad del Usuario | Suplantación de Identidad (Spoofing) | Proceso de registro débil (solo email) | Alto | Media | **Medio** | **A.5.11:** Autenticación multifactor (MFA) para perfiles de arrendadores y arrendatarios PRO. |
| R.03 | Algoritmo de Match | Sesgo Algorítmico / Manipulación | Falta de auditoría de lógica de código | Medio | Baja | **Bajo** | **A.8.29:** Pruebas de seguridad en el ciclo de vida de desarrollo. Auditoría periódica de logs. |
| R.04 | Disponibilidad del Portal | Ataque DDoS | Infraestructura sin balanceo / WAF | Alto | Baja | **Medio** | **A.8.20:** Protección de servicios de red mediante Web Application Firewall (WAF). |

## Plan de Tratamiento
1. **Prioridad 1:** Implementar `Vault` para manejo de secretos y llaves de cifrado.
2. **Prioridad 2:** Auditoría de cumplimiento Ley 19.628 Chile.
3. **Prioridad 3:** Pruebas de penetración (Pentesting) al motor de Assessment antes del lanzamiento MVP.
