── vertex-cms
    ├── backend-api/            <-- Lógica de Servidor (Laravel)
    │   ├── app/
    │   │   ├── Http/           <-- ADAPTADORES DE ENTRADA (Driving Adapters)
    │   │   │   ├── Controllers/ <-- Transforman peticiones HTTP en llamadas al Núcleo
    │   │   │   └── Resources/   <-- Adaptadores de salida de datos (Transformación de respuesta)
    │   │   └── Providers/       <-- INYECCIÓN DE DEPENDENCIAS (Vinculación Puerto-Adaptador)
    │   ├── src/                 <-- NÚCLEO DE LA APLICACIÓN (Agnóstico al Framework)
    │   │   ├── CMS/             
    │   │   │   ├── Domain/      <-- CAPA DE DOMINIO (Lógica de Negocio Pura)
    │   │   │   │   ├── Entities/   <-- Entidades de Dominio (Modelos de negocio)
    │   │   │   │   └── Ports/      <-- PUERTOS DE SALIDA (Interfaces / Contratos de Infraestructura)
    │   │   │   ├── Application/ <-- CAPA DE APLICACIÓN (Casos de Uso)
    │   │   │   │   └── UseCases/   <-- PUERTOS DE ENTRADA (Orquestación de acciones del sistema)
    │   │   │   └── Infrastructure/ <-- CAPA DE INFRAESTRUCTURA (Detalles de Implementación)
    │   │   │       ├── Persistence/ <-- ADAPTADORES DE SALIDA (Implementación MariaDB/Eloquent)
    │   │   │       ├── Services/    <-- ADAPTADORES DE SALIDA (Servicios Externos: S3, Mail)
    │   │   │       └── Models/      <-- Modelos de Persistencia (Específicos del ORM)
    │   ├── database/            <-- Persistencia: Esquema y datos iniciales
    │   └── routes/
    │       └── api.php          <-- Puntos de entrada de la API REST
    │
    └── frontend-web/           <-- Capa de Presentación (Next.js + React)
        ├── src/
        │   ├── app/             <-- Enrutado y Renderizado de la aplicación
        │   │   ├── (public)/    <-- Vistas públicas (SEO-driven / ISR)
        │   │   ├── (admin)/     <-- Vistas administrativas (SPA-like)
        │   │   └── api/         <-- BFF (Backend For Frontend): Orquestación de servicios
        │   ├── components/      <-- Unidades de interfaz de usuario (UI)
        │   ├── services/        <-- ADAPTADORES DE ENTRADA AL FRONTEND (API Client)
        │   ├── hooks/           <-- Lógica de estado y efectos de React
        │   ├── store/           <-- Gestión de estado global de la aplicación
        │   └── lib/             <-- Librerías auxiliares y utilidades técnicas
        ├── public/              <-- Recursos estáticos del servidor
        └── next.config.js       <-- Configuración del entorno de ejecución