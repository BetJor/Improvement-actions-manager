# Análisis Funcional: Gestor de Acciones de Mejora

## 1. Introducción

### 1.1. Propósito

Este documento describe los requisitos funcionales y no funcionales de la aplicación "Gestor de Acciones de Mejora". El objetivo es servir como guía para el equipo de desarrollo, stakeholders y usuarios clave, definiendo el comportamiento esperado del sistema, sus funcionalidades y las reglas de negocio que lo gobiernan.

### 1.2. Alcance

La aplicación permitirá la gestión integral del ciclo de vida de las acciones de mejora, incluyendo su creación, análisis de causas, definición de planes de acción, verificación y cierre. Incorporará funcionalidades de inteligencia artificial para asistir a los usuarios en la redacción y análisis.

## 2. Roles de Usuario

El sistema definirá varios roles para gestionar los permisos y el acceso a las funcionalidades:

-   **Creador**: Cualquier usuario autenticado. Puede crear nuevas acciones de mejora y cerrar las que él mismo ha creado.
-   **Responsable de Análisis**: Usuario o grupo designado para investigar las causas de una acción y proponer un plan.
-   **Responsable de Ejecución**: Usuario designado para ejecutar una de las tareas del plan de acción.
-   **Responsable de Verificación**: Usuario designado para comprobar la eficacia de las acciones implantadas.
-   **Administrador**: Superusuario con acceso a todas las funcionalidades, incluyendo la gestión de usuarios y la configuración del sistema.

## 3. Requisitos Funcionales

### 3.1. RF-001: Autenticación y Gestión de Usuarios

-   **RF-001.1**: El sistema debe permitir a los usuarios iniciar sesión mediante su cuenta de Google.
-   **RF-001.2**: El sistema debe permitir a los usuarios iniciar sesión con correo electrónico y contraseña.
-   **RF-001.3**: Los usuarios deben poder restablecer su contraseña si la han olvidado.
-   **RF-001.4**: Los administradores deben poder gestionar los usuarios del sistema (crear, editar, eliminar) y asignarles roles.
-   **RF-001.5**: Los administradores deben poder suplantar la identidad de otros usuarios para finalidades de soporte.

### 3.2. RF-002: Gestión de Acciones de Mejora (CRUD)

-   **RF-002.1: Creación**: Cualquier usuario autenticado puede crear una nueva acción de mejora.
    -   La acción se puede guardar como "Borrador" (solo visible para el creador) o "Enviar para Análisis".
    -   Campos obligatorios: Asunto, Observaciones, Ámbito, Origen, Responsable de Análisis.
-   **RF-002.2: Lectura (Listado)**: Los usuarios deben poder visualizar un listado de todas las acciones a las que tienen acceso.
    -   El listado debe ser paginado, ordenable y filtrable por múltiples criterios (ID, título, estado, ámbito, responsable, etc.).
-   **RF-002.3: Lectura (Detalle)**: Los usuarios deben poder abrir una acción para ver todos sus detalles, organizados en pestañas según la fase del ciclo de vida.
-   **RF-002.4: Modificación**: Los usuarios con permisos pueden editar los datos de una acción, según el estado en que se encuentre.
    -   Ejemplo: El creador puede editar un "Borrador"; el responsable de análisis puede editar la sección de análisis de causas.
-   **RF-002.5: Seguimiento**: Los usuarios deben poder marcar acciones como "seguidas" para tenerlas localizadas en su panel de control.

### 3.3. RF-003: Ciclo de Vida de una Acción (Workflow)

El sistema debe gestionar el flujo de trabajo de una acción a través de los siguientes estados:

1.  **Borrador**: Estado inicial. Solo visible para el creador.
2.  **Pendiente Análisis**: La acción se ha enviado al responsable designado, que debe llevar a cabo el análisis de causas.
3.  **Pendiente Comprobación**: El responsable de análisis ha completado el análisis y ha definido un plan de acción. Ahora, el responsable de verificación debe comprobar su eficacia.
4.  **Pendiente de Cierre**: La verificación se ha completado. El creador original debe dar su visto bueno final.
5.  **Finalizada**: La acción se ha cerrado.
    -   Si el cierre es "Conforme", el ciclo termina.
    -   Si el cierre es "No Conforme", el sistema debe crear automáticamente una nueva acción (tipo BIS) vinculada a la original para continuar el tratamiento.

### 3.4. RF-004: Panel de Control (Dashboard)

-   **RF-004.1**: Cada usuario debe tener un panel de control personalizado al iniciar sesión.
-   **RF-004.2**: El panel debe mostrar un widget con "Mis Acciones Pendientes", que son aquellas que requieren una acción por parte del usuario (p. ej., un análisis a hacer, una verificación a realizar).
-   **RF-004.3**: El panel debe mostrar un widget con las "Acciones en Seguimiento".
-   **RF-004.4**: El usuario debe poder reordenar los widgets del panel mediante "drag-and-drop", y su preferencia se debe guardar.

### 3.5. RF-005: Funcionalidades de IA (Genkit)

-   **RF-005.1: Mejora de Texto**: Al crear o editar una acción, el usuario debe poder utilizar un asistente de IA para mejorar la claridad y profesionalidad del texto de las observaciones.
-   **RF-005.2: Sugerencia de Análisis**: El responsable de análisis debe poder solicitar a un asistente de IA una propuesta de análisis de causas y un plan de acción basado en las observaciones iniciales.
-   **RF-005.3: Dictado por Voz**: Los campos de texto largos deben permitir la entrada de contenido mediante dictado por voz.

### 3.6. RF-006: Gestión de Datos Maestros

-   **RF-006.1**: Los administradores deben poder acceder a una sección de "Configuración" para gestionar las tablas maestras del sistema.
-   **RF-006.2**: Se debe poder gestionar (crear, editar, eliminar) los siguientes tipos de datos: Ámbitos, Orígenes, Clasificaciones, Áreas Afectadas y Roles de Responsabilidad.
-   **RF-006.3**: La gestión de Orígenes y Clasificaciones debe ser jerárquica, dependiendo del Ámbito seleccionado.

### 3.7. RF-007: Informes y Exportación

-   **RF-007.1**: El sistema debe proporcionar una sección de informes con visualizaciones gráficas sobre el estado de las acciones.
-   **RF-007.2**: Se debe poder exportar el detalle completo de una acción individual a formato PDF.
-   **RF-007.3**: Se debe poder exportar el listado de acciones (con los filtros aplicados) a formato Excel.

## 4. Requisitos No Funcionales

-   **RNF-001 (Rendimiento)**: Las consultas a la base de datos deben estar optimizadas. La carga inicial de listados largos no debe bloquear la interfaz.
-   **RNF-002 (Usabilidad)**: La interfaz debe ser intuitiva, moderna y responsiva (adaptable a dispositivos móviles).
-   **RNF-003 (Seguridad)**: El acceso a los datos debe estar restringido según el rol del usuario. Las reglas de seguridad de Firestore deben garantizar que un usuario solo puede leer o modificar los datos a los que tiene permiso.
-   **RNF-004 (Escalabilidad)**: La arquitectura basada en Firebase debe permitir un crecimiento futuro en volumen de datos y usuarios sin degradar el rendimiento.
-   **RNF-005 (Internacionalización)**: La aplicación debe estar preparada para soportar múltiples idiomas (inicialmente, catalán y castellano).

## 5. Modelo de Datos Simplificado

-   **Acción de Mejora**: Entidad principal que contiene toda la información de la acción, incluyendo título, descripción, estados, fechas, responsables, análisis, plan de acción, comentarios y adjuntos.
-   **Usuario**: Almacena la información del perfil del usuario, incluyendo su nombre, email, rol y avatar.
-   **Datos Maestros**: Colecciones separadas para Ámbitos, Orígenes, Clasificaciones, Centros, etc.
-   **Configuración App**: Documentación donde se guardan parámetros globales como los prompts de la IA o la configuración del workflow.

---
*Versión 1.0 - 2024-07-31*