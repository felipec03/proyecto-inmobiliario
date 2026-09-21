# Épica 1: Infraestructura y Arquitectura Base
> Configurar los repositorios y el pipeline CI/CD utilizando Jenkins. Implementar la infraestructura inicial con Docker Compose. Esta infraestructura debe incluir los servicios para la base de datos PostgreSQL 16, el backend en Go 1.23 y el frontend. Diseñar el esquema de base de datos con las tablas requeridas para almacenar usuarios, documentos, propiedades y variables de preferencias.
## HU-01: Configuración de Infraestructura y Contenedores Locales
- **Descripción:** *Como desarrollador, quiero contar con un entorno local orquestado con Docker Compose para levantar la base de datos, el backend y el frontend rápidamente con un solo comando.*
- **Criterios de Aceptación:** Los tres servicios deben levantarse y comunicarse correctamente en el entorno local.
- **Tareas:**
    - Crear el archivo base de orquestación `docker-compose.yml` para definir los 3 servicios principales.
    - Configurar el servicio de base de datos utilizando la imagen `postgres:16-alpine`, mapeando el puerto 5434 del host al 5432 del contenedor.
    - Configurar el servicio del backend (`milocal-api`) utilizando un binario de Go 1.23, exponiendo los puertos 8080 y 8082.
    - Configurar el servicio del frontend (`milocal-web`) integrando Nginx y la SPA, mapeando el puerto local 3001 al puerto 80 del contenedor.

## HU02: Diseño y Creación del Esquema de Base de Datos Inicial
- **Descripción:** *Como desarrollador backend, quiero establecer la estructura de la base de datos relacional para almacenar las entidades fundamentales del sistema y sus relaciones.*
- **Criterios de Aceptación:** Todas las tablas y relaciones (Foreign Keys) deben estar creadas en PostgreSQL, listas para recibir las primeras inserciones de prueba.
- **Tareas:**
    - Configurar la base de datos inicial en PostgreSQL 16 y crear los scripts base para correr las migraciones.
    - Crear la tabla `users` (para almacenar usuarios semilla, emprendedores y propietarios con contraseñas seguras) y la tabla vinculada `documents` (relación $1:N$).
    - Crear la tabla `properties` asegurando la inclusión de las 24 columnas requeridas para las especificaciones técnicas.
    - Crear la tabla `user_preferences` definiendo campos estructurados como `rubro`, `maxBudget`, `minSize`, `maxSize` y `commune_id` (relación 1:1 con el usuario).
    - Crear las tablas transaccionales y de registro restantes: `matches`, `chat_history` y `assessments` (esta última estructurada con un campo tipo JSONB para almacenar los datos del onboarding).

## HU03: Scaffolding y Estructura Base de los Repositorios
- **Descripción:** *Como líder técnico, quiero inicializar los proyectos de backend y frontend con la arquitectura de carpetas y el stack tecnológico definido para que el equipo pueda empezar a programar.*
- **Criterios de Aceptación:** Repositorio subido a GitHub con los esqueletos de las aplicaciones configurados y ejecutándose sin errores en su estado inicial.
- **Tareas:**
    - Inicializar y configurar el repositorio central del proyecto en GitHub (`[https://github.com/felipec03/proyecto-inmobiliario](https://github.com/felipec03/proyecto-inmobiliario)`).
    - Crear la estructura de directorios del backend en Go, definiendo específicamente las carpetas `cmd/server`, `internal/handler`, `internal/service`, `internal/matcher`, `internal/repository`, middlewares y modelos.
    - Inicializar el proyecto base para el frontend utilizando React 19, TypeScript 5.8 y el empaquetador Vite 6.
    - Instalar y configurar Tailwind CSS en el proyecto frontend para gestionar los estilos de la interfaz.

## HU04: Implementación del Pipeline de Integración y Despliegue Continuo (CI/CD)

- **Descripción:** *Como ingeniero DevOps, quiero configurar un pipeline automatizado para compilar, probar y desplegar el código en cada actualización de la rama principal.*
- **Criterios de Aceptación:** Cualquier push a la rama principal debe pasar por el proceso completo de compilación y terminar en un despliegue exitoso validado por un chequeo de salud.
- **Tareas:**
    - Configurar el servidor Jenkins e implementar un Webhook (`githubPush()`) que actúe como trigger automático cada vez que se realice un push a la rama `main`.
    - Configurar el paso de compilación (Build) en el pipeline para ejecutar el comando `docker compose build --no-cache` tanto para el backend como para el frontend.
    - Implementar el paso de despliegue (Deploy) utilizando el comando `docker compose up -d`, verificando que se cumpla el healthcheck de PostgreSQL antes de continuar.
    - Integrar una prueba de humo (Smoke test) al final del proceso automatizado ejecutando un `curl` al endpoint `/api/health`, configurado con una política de 10 reintentos y 3 segundos de intervalo entre cada uno.

# Épica 2: Sistema de Usuarios, Autenticación y Trust Level
> Desarrollar los flujos de registro e inicio de sesión integrando JWT para la autenticación y bcrypt para el manejo seguro de contraseñas. Construir los perfiles separados para emprendedores y propietarios. Implementar el sistema de Trust Level permitiendo a los usuarios subir sus documentos de verificación. Los documentos incluyen identidad, comprobantes de ingresos, antecedentes legales y títulos de propiedad.

## HU05: Registro e Inicio de Sesión Seguro
- **Descripción:** *Como usuario (emprendedor o propietario), quiero poder crear una cuenta e iniciar sesión de manera segura para acceder a las funcionalidades de la plataforma.*
- **Criterios de Aceptación:** El usuario puede registrarse e iniciar sesión exitosamente recibiendo un token de acceso, y sus credenciales se procesan de forma encriptada sin filtrarse en la red.
- **Tareas:**
    - Desarrollar el endpoint `POST /auth/register` para la creación de cuentas, almacenando las contraseñas procesadas con el algoritmo bcrypt con un factor de costo de 10.
    - Validar a nivel de código que el hash de la contraseña nunca se serialice en las respuestas JSON hacia el cliente (utilizando tags como `json:"-"`).
    - Desarrollar el endpoint `POST /auth/login` para validar credenciales y emitir un token JWT firmado mediante el algoritmo HS256 utilizando un secreto configurable a través de la variable `JWT_SECRET`.
    - Configurar la expiración del token JWT emitido para que tenga una validez máxima de 24 horas.
    - Crear un middleware de autenticación bajo el directorio `auth/` que intercepte las peticiones y verifique la validez del JWT en todos los endpoints protegidos.

## HU06: Gestión y Autorización de Perfiles
- **Descripción:** *Como usuario autenticado, quiero poder revisar y actualizar la información de mi perfil con campos que se adapten a mi rol, asegurando que nadie más pueda editar mi información.*
- **Criterios de Aceptación:** El sistema proporciona datos de perfil según el rol del usuario y previene que usuarios no autorizados modifiquen datos ajenos.
- **Tareas:**
    - Implementar el endpoint `GET /auth/me` para retornar de forma rápida los datos básicos y el contexto del usuario autenticado que realiza la petición.
    - Desarrollar el endpoint `GET /users/{id}` para consultar el perfil completo del usuario, incluyendo el estado de los documentos vinculados a su cuenta.
    - Construir el endpoint `PUT /users/{id}` para la actualización de datos, aplicando un control de acceso basado en roles (RBAC básico) que exija que el `userID` extraído del JWT coincida obligatoriamente con el recurso que se intenta modificar.
    - Desarrollar las interfaces en el frontend para gestionar el perfil del emprendedor y el perfil del propietario de manera separada.
    - Integrar validaciones lógicas para garantizar que únicamente los perfiles registrados con el tipo "owner" (propietario) posean permisos de acceso a las funciones de publicación de inmuebles.

## HU07: Carga Estructurada de Documentos Oficiales
- **Descripción:** *Como usuario de la plataforma, quiero poder subir mis documentos de respaldo (identidad, ingresos, propiedad) para iniciar el proceso de verificación de mi perfil.*
- **Criterios de Aceptación:** Los documentos se asocian correctamente a la cuenta del usuario sin exceder los límites de tamaño establecidos, previniendo subidas maliciosas.
- **Tareas:**
    - Crear el endpoint `POST /upload/document/{id}` para procesar la subida de los archivos de respaldo, forzando un chequeo de identidad para que el usuario suba elementos exclusivamente a su propia cuenta.
    - Implementar mitigaciones contra la subida de archivos maliciosos creando una lista blanca (whitelist) de extensiones de archivo permitidas.
    - Configurar un límite máximo de tamaño de carga (payload) fijado en 10MB por documento procesado.
    - Construir el componente del frontend que permita cargar y agrupar visualmente los diferentes tipos de documentos requeridos (identidad, ingresos, legales, propiedad).

## HU08: Sistema de Trust Level (Verificación Interna)
- **Descripción:** *Como administrador interno, quiero contar con herramientas para revisar y validar los documentos subidos por los usuarios para aumentar su nivel de confianza dentro de la red.*
- **Criterios de Aceptación:** Los administradores pueden aprobar documentos y el sistema transiciona automáticamente el nivel de confianza del usuario evaluado.
- **Tareas:**
    - Desarrollar el endpoint `PUT /users/{id}/documents/verify` protegido mediante requerimientos de autenticación, destinado a asentar la revisión administrativa de los comprobantes.
    - Programar la lógica de base de datos para que los usuarios inicien con un Trust Level de valor "0" (no verificado) y, al tener sus 3 documentos obligatorios verificados exitosamente, asciendan a Trust Level "1".
    - Integrar en el frontend una insignia o indicador visual dentro de las pantallas de perfiles para que tanto emprendedores como propietarios puedan visualizar el estado de Trust Level.
# Épica 3: Onboarding y Captura Estructurada de Datos
> Crear un formulario o assessment breve para captar el rubro, presupuesto, tamaño y requerimientos técnicos requeridos por el emprendedor. Desarrollar el assessment del propietario para recopilar información sobre el inmueble, la renta solicitada y el perfil de arrendatario deseado. Asegurar que todas las respuestas de este proceso se almacenen de forma estructurada en la base de datos para alimentar los futuros cálculos de compatibilidad.

## HU09: Cuestionario de Necesidades del Emprendedor (Assessment)
- **Descripción:** *Como emprendedor, quiero completar un formulario guiado sobre mi negocio y requerimientos para que la plataforma pueda recomendarme locales compatibles.*
- **Criterios de Aceptación:** El usuario puede seleccionar su rubro, presupuesto, tamaño y requerimientos técnicos, y la información se almacena temporal y permanentemente para su análisis.
- **Tareas:**
    - Diseñar e implementar el flujo de onboarding en el frontend para capturar las variables clave: rubro o actividad, presupuesto máximo de arriendo, rango de m2 requerido, comunas preferidas y requerimientos técnicos.
    - Implementar el endpoint `POST /assessment` autenticado con JWT para guardar progresivamente las evaluaciones de onboarding del usuario.
    - Almacenar los datos capturados de este proceso en la tabla `assessments`, utilizando el campo estructurado `data JSONB` junto con el `userType` y el `step` actual.

## HU10: Definición de Oferta y Arrendatario Ideal (Propietario)
- **Descripción:** *Como propietario, quiero completar un cuestionario indicando las condiciones comerciales de mi local y qué tipo de negocios permito.*
- **Criterios de Aceptación:** El propietario registra la renta, rubros permitidos y perfil deseado, asegurando que la información quede lista para alimentar el motor de compatibilidad.
- **Tareas:**
    - Construir la interfaz del assessment para el propietario, priorizando la recolección de información sobre la renta solicitada, el estado del inmueble, los rubros permitidos o deseados y el perfil de arrendatario buscado.
    - Validar en el frontend que cada respuesta capturada se envíe como una variable estructurada y utilizable, descartando preguntas que no ayuden a segmentar o explicar una compatibilidad.

## HU11: Gestión y Consolidación de Preferencias Base
- **Descripción:** *Como sistema, quiero consolidar las respuestas validadas de los assessments en una estructura de preferencias de usuario unificada para que el motor de matchmaking acceda rápidamente a ellas.*
- **Criterios de Aceptación:** Las preferencias consolidadas del usuario se actualizan y se consultan a través de la API REST manteniendo la consistencia de los datos numéricos y ordinales.
- **Tareas:**
    - Desarrollar el endpoint `PUT /users/{id}/preferences` protegido por JWT para guardar definitivamente las variables procesadas, asegurando que solo el usuario propietario pueda realizar esta modificación.
    - Mapear y persistir las respuestas consolidadas en la tabla `user_preferences`, registrando obligatoriamente los campos `rubro`, `maxBudget`, `minSize`, `maxSize` y `commune_id` (relación 1:1 con la tabla users).
    - Construir el endpoint `GET /users/{id}/preferences` requerido para que la interfaz de usuario o el motor de matching obtengan las preferencias almacenadas en cualquier momento.
# Épica 4: Gestión del Inventario Inmobiliario
> Construir el flujo para publicar inmuebles y capturar sus especificaciones. Integrar la captura obligatoria de las dimensiones técnicas del inmueble, tales como capacidad eléctrica, conexiones de agua y gas, trampa de grasa y métricas de flujo peatonal. Desarrollar los endpoints (CRUD) para que los propietarios administren sus propiedades y suban las imágenes de los locales.

## HU12: Publicación de Inmuebles con Especificaciones Técnicas
- **Descripción:** *Como propietario, quiero publicar mi local comercial detallando sus características físicas y técnicas para que pueda ser emparejado con arrendatarios compatibles.*
- **Criterios de Aceptación:** El sistema permite registrar propiedades de manera estructurada, validando estrictamente los permisos del creador y almacenando las variables requeridas por el motor.
- **Tareas:**
    - Desarrollar el endpoint `POST /properties` requiriendo autenticación mediante token JWT.
    - Implementar un control de tipo a nivel de backend para garantizar que solo los usuarios definidos con el rol de propietario (type owner) tengan los privilegios para publicar propiedades.
    - Construir la interfaz de publicación en el frontend garantizando la captura de las dimensiones técnicas clave: capacidad eléctrica, conexión de gas, conexión de agua, trampa de grasa, frente comercial, flujo peatonal y disponibilidad de precio negociable.
    - Persistir la información del inmueble en la tabla `properties`, garantizando el soporte para las 24 columnas de especificaciones técnicas requeridas en el modelo.

## HU13: Gestión de Archivos Multimedia del Inmueble
- **Descripción:** *Como propietario, quiero anexar fotografías a la publicación de mi local para que los emprendedores puedan visualizar el espacio real.*
- **Criterios de Aceptación:** Las imágenes se asocian correctamente a la publicación, limitando la carga exclusivamente al dueño del registro y previniendo la subida de archivos maliciosos.
- **Tareas:**
    - Desarrollar el endpoint `POST /upload/property-image/{id}` eximiendo protección por JWT para recibir los archivos.
    - Aplicar verificaciones de propiedad (ownership checks) para garantizar que únicamente el dueño del inmueble registrado pueda procesar la subida de imágenes en dicho registro.
    - Implementar las medidas de seguridad para cargas fijando un límite máximo de 10MB y una lista blanca (whitelist) de extensiones aceptadas.
    - Desarrollar la interfaz visual en el frontend que asista al propietario en la selección y subida de las imágenes del local.

## HU14: Consulta, Búsqueda y Visualización de Catálogo
- **Descripción:** *Como visitante o emprendedor, quiero explorar los inmuebles comerciales listados y revisar el detalle individual de cada uno para decidir si me interesa.*
- **Criterios de Aceptación:** El sistema expone endpoints públicos funcionales que permiten listar y ver detalles individuales de propiedades sin requerir autenticación previa.
- **Tareas:**
    - Desarrollar el endpoint `GET /properties` con acceso público para listar el catálogo de inmuebles, habilitando filtros mediante query parameters como `?rubro=`.
    - Implementar el endpoint `GET /properties/{id}` para entregar la ficha completa y detallada de un inmueble en particular.
    - Construir el portal público en el frontend conteniendo el buscador y la grilla con el catálogo de locales comerciales disponibles.
    - Diseñar la vista de detalle de la propiedad para que exponga la infraestructura disponible, la ubicación y el estado de vacancia del inmueble.
# Épica 5: Motor de Compatibilidad (Matchmaking V1)
> Implementar la versión inicial del motor de matchmaking utilizando el algoritmo de Weighted Feature Distance. Configurar los 6 perfiles de rubro base y aplicar las fórmulas de puntaje para evaluar el ajuste de las dimensiones técnicas y las preferencias. Implementar reglas duras en el cálculo, aplicando un límite (cap) del 29% al puntaje si el negocio del usuario no está dentro de los usos permitidos del local. Complementar este motor automatizado con capacidades de revisión humana y reglas simples para apoyar la validación del modelo en la fase temprana.

## HU15: Motor de Cálculo Base (Weighted Feature Distance)
- **Descripción:** *Como sistema, quiero calcular la distancia de compatibilidad entre un perfil de negocio y un inmueble utilizando un algoritmo matemático estructurado para generar recomendaciones objetivas.*
- **Criterios de Aceptación:** El motor evalúa inmueble vs perfil entregando un puntaje normalizado y un desglose detallado de las dimensiones que componen dicho puntaje.
- **Tareas:**
    - Implementar la lógica central del algoritmo Weighted Feature Distance en el directorio `internal/matcher/` del backend.
    - Desarrollar el endpoint `POST /match/calculate` protegido con JWT para ejecutar la evaluación de compatibilidad entre un usuario y un inmueble específico a demanda.
    - Programar la normalización de las 10 dimensiones evaluadas (7 técnicas y 3 de preferencias) para que cada variable y el resultado final se ubiquen en un rango matemático de $[0,1]$.
    - Estructurar el payload de respuesta de la API para que devuelva el puntaje general de compatibilidad acompañado de un desglose explicable dimensión por dimensión.

## HU16: Configuración de Perfiles de Rubro y Reglas Duras
- **Descripción:** *Como motor de matching, quiero aplicar ponderaciones estandarizadas y reglas excluyentes basadas en el tipo de negocio para evitar recomendar locales inviables.*
- **Criterios de Aceptación:** El cálculo aplica requerimientos base según el rubro y castiga severamente el puntaje si no se cumplen las condiciones legales de uso del espacio.
- **Tareas:**
    - Configurar los 6 perfiles de rubro predefinidos dentro del servicio del matcher para establecer los requerimientos técnicos base esperados para cada industria.
    - Integrar las fórmulas de cálculo que combinan y ponderan tanto el bloque de dimensiones técnicas como el bloque de dimensiones de preferencias.
    - Implementar la regla dura en el código que aplique un límite máximo (cap) del 29% al puntaje total de compatibilidad si el rubro del emprendedor no está incluido en la lista de usos permitidos del inmueble.

## HU17: Registro de Matches y Apoyo Operativo V1
- **Descripción:** *Como equipo de operaciones, quiero almacenar los cruces generados y complementarlos con revisiones manuales para validar la calidad de las recomendaciones antes de automatizar el proceso al 100%.*
- **Criterios de Aceptación:** Todos los matches calculados quedan registrados en base de datos y expuestos en el backoffice para revisión humana y aprendizaje del modelo.
- **Tareas:**
    - Configurar la persistencia de los resultados de cada evaluación en la tabla `matches` de PostgreSQL para mantener un historial auditable del motor.
    - Desarrollar reglas simples de cruce de variables (presupuesto, ubicación básica) que complementen el algoritmo matemático y faciliten el apoyo manual del equipo durante la fase de prueba controlada.
    - Habilitar campos en el backoffice interno que permitan al equipo de la plataforma registrar observaciones y documentar las razones exactas por las que un match en particular funcionó o fue descartado por los usuarios finales.

# Épica 6: Portal Público y Experiencia de Exploración
> Desarrollar una interfaz con diseño responsive adaptable a plataformas móviles y de escritorio. Crear el buscador y el catálogo público para facilitar el descubrimiento de locales comerciales. Implementar las vistas de detalle del inmueble que muestren al usuario el desglose explicable de su puntaje de compatibilidad para cada dimensión evaluada.

## HU18: Diseño e Interfaz Responsive
- **Descripción:** *Como usuario, quiero acceder a la plataforma desde distintos dispositivos para explorar locales comerciales de forma cómoda y fluida.*
- **Criterios de Aceptación:** La aplicación de página única (SPA) se adapta y renderiza correctamente tanto en pantallas móviles como de escritorio.
- **Tareas:**
    - Desarrollar la estructura base de la interfaz con un diseño responsive (mobile + desktop) utilizando Tailwind CSS.
    - Configurar el enrutamiento y la navegación del frontend utilizando React Router v7, estructurando las 8 páginas contempladas.
    - Integrar la librería motion para manejar las animaciones y transiciones de los componentes visuales.

## HU19: Buscador Inmobiliario y Catálogo Público
- **Descripción:** *Como visitante o usuario registrado, quiero visualizar un listado de locales y ejecutar búsquedas para evaluar la oferta comercial disponible.*
- **Criterios de Aceptación:** El usuario visualiza la grilla de propiedades y puede utilizar el buscador para filtrar los inmuebles presentados.
- **Tareas:**
    - Construir el portal público que incluya el buscador y el catálogo visual de locales comerciales disponibles.
    - Integrar la conexión del catálogo con el backend a través del servicio `api.ts` para consumir los datos de las propiedades.
    - Diseñar e implementar los componentes de las tarjetas (cards) en el catálogo para presentar la información resumida de la ubicación, precio y tamaño de cada inmueble.

## HU20: Vista de Detalle y Explicabilidad del Puntaje
- **Descripción:** *Como emprendedor, quiero acceder a la ficha completa de un local y entender detalladamente por qué su nivel de compatibilidad es alto o bajo para mi rubro.*
- **Criterios de Aceptación:** La vista expone todas las características del inmueble y presenta un desglose transparente del cálculo del motor de matchmaking.
- **Tareas:**
    - Desarrollar la vista detallada del inmueble para exponer la infraestructura disponible, metros cuadrados, ubicación, estado de vacancia y renta solicitada.
    - Implementar un componente visual dinámico que renderice el puntaje de compatibilidad general calculado por el motor de matchmaking.
    - Construir un panel de desglose explicable por dimensión, mostrando el impacto individual de cada una de las 10 dimensiones técnicas y de preferencias en el puntaje final del usuario.
# Épica 7: Interacción, Operaciones y Validaciones Reales
> Construir una vista interna de backoffice para que el equipo pueda administrar usuarios, inmuebles, variables y gestionar los leads. Integrar funcionalidades que permitan a los usuarios guardar locales, postular, y enviar o recibir solicitudes de contacto. Registrar métricas operativas clave para analizar qué variables determinan si un usuario acepta o descarta un match.

## HU21: Interacciones de Interés y Postulación
- **Descripción:** *Como emprendedor, quiero interactuar con los locales comerciales que me interesan para iniciar un proceso de acercamiento y posible negociación con el propietario.*
- **Criterios de Aceptación:** El sistema permite al usuario realizar acciones de interés sobre los inmuebles y registra estas interacciones de forma estructurada para ambas partes.
- **Tareas:**
    - Implementar acciones en la interfaz del frontend para que el usuario pueda guardar, postular, solicitar contacto o manifestar interés por un local o perfil específico.
    - Desarrollar la lógica y los endpoints en el backend para registrar y gestionar estas solicitudes de contacto o respuestas generadas en la plataforma.
    - Habilitar el seguimiento de estas interacciones para medir si el interés inicial se traduce posteriormente en visitas coordinadas, negociaciones y operaciones concretadas.

## HU22: Panel de Backoffice y Gestión Administrativa
- **Descripción:** *Como administrador de la plataforma, quiero contar con un panel de control interno para gestionar la oferta, la demanda y supervisar la calidad de las interacciones.*
- **Criterios de Aceptación:** El equipo interno tiene acceso exclusivo a una vista consolidada que permite auditar y administrar entidades clave y el progreso operativo del sistema.
- **Tareas:**
    - Construir la vista interna denominada Backoffice MiLocal destinada a la gestión operativa del equipo.
    - Desarrollar herramientas dentro del backoffice que permitan al administrador visualizar y administrar usuarios, inmuebles, variables capturadas, leads y el estado individual de cada match.
    - Integrar las capacidades para que el administrador de la plataforma pueda gestionar el catálogo y realizar la revisión manual de los documentos para ajustar el Trust Level de los usuarios.

## HU23: Tracking de Aprendizaje y Análisis de Métricas
- **Descripción:** *Como equipo de producto, quiero recopilar y visualizar datos sobre el comportamiento de los usuarios frente a los matches generados para iterar y mejorar el algoritmo de compatibilidad.*
- **Criterios de Aceptación:** El sistema registra de forma trazable las métricas del embudo y los motivos de rechazo/aceptación, centralizando los datos en paneles de evaluación.
- **Tareas:**
    - Implementar el registro del comportamiento de los usuarios para observar qué recomendaciones específicas del motor generan interés, contactos, visitas, descartes y operaciones.
    - Configurar el registro analítico para identificar y registrar en la base de datos qué variables explican la aceptación o el descarte de un match.
    - Medir de forma continua los indicadores de validación del MVP, tales como adquisición de usuarios, activación (completitud de perfil), locales publicados y compatibilidades generadas.
    - Desarrollar e integrar el dashboard de tendencias de mercado focalizado en Chile dentro de la plataforma para visualizar el comportamiento macro de los datos capturados.