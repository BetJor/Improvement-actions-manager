# Manual de Arquitectura: Gestor de Acciones de Mejora

## 1. Introducción

Este documento describe la arquitectura técnica de la aplicación "Gestor de Acciones de Mejora". Está destinado a desarrolladores y personal técnico que necesiten comprender la estructura del proyecto, las tecnologías utilizadas y las decisiones de diseño clave.

## 2. Stack Tecnológico

La aplicación se construye sobre un stack moderno basado en JavaScript, aprovechando un ecosistema de herramientas ágiles y potentes.

- **Frontend**:
    - **Framework**: [Next.js](https://nextjs.org/) (con App Router) - Permite renderizado del lado del servidor (SSR) y del lado del cliente (CSR), optimizando el rendimiento y el SEO.
    - **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) - Aporta tipado estático para un código más robusto y mantenible.
    - **Librería UI**: [React](https://react.dev/) - Para la construcción de interfaces de usuario declarativas y reutilizables.
    - **Componentes UI**: [ShadCN/UI](https://ui.shadcn.com/) - Una colección de componentes accesibles y personalizables.
    - **Estilos**: [Tailwind CSS](https://tailwindcss.com/) - Un framework CSS "utility-first" para un diseño rápido y consistente.

- **Backend (BaaS - Backend as a Service)**:
    - **Plataforma**: [Firebase](https://firebase.google.com/) - Proporciona servicios backend integrados y escalables.
    - **Autenticación**: Firebase Authentication (Login con Google, Email/Contraseña).
    - **Base de Datos**: Firestore - Una base de datos NoSQL, escalable y en tiempo real para almacenar toda la información de la aplicación (acciones, usuarios, datos maestros).
    - **Almacenamiento de Archivos**: Firebase Storage - Para guardar los ficheros adjuntos a las acciones de mejora.

- **Inteligencia Artificial (GenAI)**:
    - **Framework**: [Genkit](https://firebase.google.com/docs/genkit) - Un framework open source de Firebase para construir flujos de IA robustos y monitorizables. Se utiliza para las funcionalidades de "mejorar texto" y "sugerir análisis".

- **Gestión de Estado**:
    - Se utiliza una combinación de **React Context API** y hooks personalizados (`useState`, `useReducer`) para gestionar el estado global y local.
        - `useAuth`: Gestiona la sesión del usuario.
        - `useTabs`: Controla el sistema de navegación por pestañas.
        - `useActionState`: Mantiene un estado global de las acciones de mejora para evitar cargas de datos repetitivas.

- **Internacionalización (i18n)**:
    - La aplicación soporta múltiples idiomas (castellano y catalán) a través de archivos de traducción en formato JSON ubicados en la carpeta `messages`.

## 3. Estructura del Proyecto

El proyecto sigue una estructura estándar para aplicaciones Next.js, con algunas carpetas clave:

- **/src/app/**: Contiene las rutas principales de la aplicación, siguiendo la convención del App Router de Next.js.
- **/src/components/**: Alberga todos los componentes de React reutilizables.
    - **/src/components/ui/**: Componentes base de ShadCN/UI.
- **/src/lib/**: Ficheros de utilidad, configuración de Firebase y definiciones de tipos de TypeScript (`types.ts`).
- **/src/services/**: Lógica de acceso a datos. Centraliza toda la comunicación con Firebase (Firestore y Storage). Separa la lógica de la base de datos de los componentes de la interfaz.
- **/src/ai/**: Contiene la configuración y los flujos (`flows`) de Genkit para las funcionalidades de IA.
- **/src/hooks/**: Hooks personalizados de React para encapsular lógica compleja (ej. `useAuth`, `useTabs`).
- **/messages/**: Archivos JSON con las traducciones para cada idioma soportado (`ca`, `es`).
- **/public/**: Ficheros estáticos, como imágenes y logotipos.
- **firestore.rules**: Fichero que define las reglas de seguridad para la base de datos Firestore, controlando quién puede leer y escribir datos.

## 4. Flujo de Datos y Lógica

### 4.1. Acciones de Mejora (CRUD y Ciclo de Vida)

- **Creación y Lectura**: La obtención y creación de acciones se centraliza en `src/services/actions-service.ts`.
- **Estado Global**: El hook `useActionState` carga todas las acciones una vez y las mantiene en un estado global. Esto permite que diferentes componentes (la tabla principal, el dashboard) accedan a los datos sin tener que volver a pedirlos a Firebase, mejorando el rendimiento.
- **Ciclo de Vida**: Las transiciones de estado (ej. de "Pendiente Análisis" a "Pendiente Comprobación") se gestionan a través de la función `updateAction`, que actualiza el documento correspondiente en Firestore.

### 4.2. Autenticación

- El hook `useAuth` encapsula la lógica de Firebase Authentication. Gestiona el estado del usuario, los roles, los permisos y las funciones de suplantación de identidad.
- Se comunica con la colección `users` en Firestore para obtener datos adicionales del perfil, como el rol o el avatar.

### 4.3. Datos Maestros (Configuración)

- Las tablas maestras (Ámbitos, Orígenes, Centros, etc.) se gestionan desde la página de Configuración.
- La lógica de lectura y escritura para estos datos se encuentra en `src/services/master-data-service.ts`.
- La aplicación utiliza un sistema de "seeding" (siembra de datos) que puebla estas colecciones con datos iniciales si se encuentran vacías, facilitando el primer arranque.

### 4.4. Inteligencia Artificial

- Los flujos de Genkit (en `/src/ai/flows/`) se definen como "server actions" de Next.js.
- Los componentes de la interfaz llaman a estas funciones asíncronas para obtener sugerencias de la IA.
- Los "prompts" que utiliza la IA se almacenan en Firestore (`app_settings/prompts`), lo que permite modificarlos en caliente desde la página de "Configuración IA" sin necesidad de redesplegar el código.

## 5. Modelo de Datos (Firestore)

La base de datos en Firestore se estructura en las siguientes colecciones principales:

-   `actions`: Colección principal donde se almacena cada acción de mejora.
    -   `id` (string): Identificador único del documento.
    -   `actionId` (string): ID legible para el usuario (ej. "AM-24001").
    -   `title` (string): Título de la acción.
    -   `description` (string): Descripción detallada.
    -   `status` (string): Estado actual del workflow ('Borrador', 'Pendiente Análisis', etc.).
    -   `creator` (map): Objeto con información del usuario creador (`id`, `name`, `email`).
    -   `creationDate` (timestamp): Fecha de creación.
    -   `responsibleGroupId` (string): Email o ID del grupo responsable del análisis.
    -   `typeId`, `categoryId`, `subcategoryId`, `centerId` (strings): IDs que enlazan con las colecciones de datos maestros.
    -   `analysis` (map): Objeto que contiene el análisis de causas, las acciones propuestas y el responsable de verificación.
    -   `verification` (map): Objeto con las notas y resultados de la verificación.
    -   `closure` (map): Objeto con las conclusiones y el estado final (Conforme/No Conforme).
    -   `comments` (array): Lista de comentarios.
    -   `attachments` (array): Lista de ficheros adjuntos.
    -   `followers` (array): Lista de IDs de usuarios que siguen la acción.

-   `users`: Almacena los perfiles de los usuarios de la aplicación.
    -   `id` (string): UID de Firebase Authentication.
    -   `name` (string): Nombre del usuario.
    -   `email` (string): Correo electrónico.
    -   `role` (string): Rol principal del usuario en el sistema ('Admin', 'Creator', etc.).
    -   `avatar` (string): URL de la imagen de perfil.

-   **Colecciones de Datos Maestros**:
    -   `ambits`: Tipos principales de acción (Calidad, Medioambiente...).
    -   `origins`: Orígenes de las acciones (Auditoría interna, externa...), enlazados a un `ambit`.
    -   `classifications`: Clasificación más detallada, enlazada a un `origin`.
    -   `responsibilityRoles`: Define los roles funcionales (ej. "Comité de Calidad") y cómo se resuelven (email fijo o patrón dinámico).
    -   `locations`: Almacena los centros de trabajo y las áreas funcionales.

-   `app_settings`: Colección para configuraciones globales.
    -   `prompts` (documento): Almacena los textos de los prompts de la IA.
    -   `workflow` (documento): Guarda la configuración de los plazos del workflow.

## 6. Decisiones de Arquitectura

- **Separación de Servicios**: La lógica de negocio y el acceso a datos están aislados en la carpeta `services`. Esto hace que los componentes sean más "tontos" y se centren en la presentación, facilitando el mantenimiento y las pruebas.
- **Estado Global Centralizado**: El uso de `useActionState` para las acciones de mejora evita la complejidad de librerías de estado más pesadas y resuelve el problema de la sincronización de datos entre componentes.
- **Navegación por Pestañas Dinámicas**: El hook `useTabs` permite una experiencia de usuario similar a la de un escritorio, donde se pueden tener varias vistas abiertas simultáneamente. El contenido de las pestañas se carga de forma diferida (`lazy loading`) para optimizar el rendimiento inicial.

---
*Versión 1.0 - 2024-07-31*