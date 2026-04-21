── vertex-cms
    ├── backend-api/
    │   ├── app/
    │   │   ├── Http/                   <-- ADAPTADORES DE ENTRADA (Adaptadores)
    │   │   │   ├── Controllers/        <-- Solo reciben el Request y llaman al Use Case
    │   │   │   ├── Middleware/         <-- CORS, Auth Sanctum
    │   │   │   └── Resources/          <-- Transformers (JSON format para Next.js)
    │   │   └── Providers/              <-- Dependency Injection (Vincula Port -> Adapter)
    │   ├── src/                        <-- EL NÚCLEO (Independiente del Framework)
    │   │   ├── CMS/                    <-- Contexto delimitado del CMS
    │   │   │   ├── Domain/             <-- CAPA DE DOMINIO (Núcleo)
    │   │   │   │   ├── Entities/       <-- Article.php, Banner.php (Clases puras)
    │   │   │   │   ├── Exceptions/     <-- ArticleNotFoundException.php
    │   │   │   │   └── Ports/          <-- PUERTOS DE SALIDA (Interfaces)
    │   │   │   │       ├── ArticleRepositoryInterface.php
    │   │   │   │       └── StorageInterface.php
    │   │   │   ├── Application/        <-- CAPA DE APLICACIÓN (Casos de Uso)
    │   │   │   │   ├── UseCases/       <-- PublishArticle.php, CreateBanner.php
    │   │   │   │   └── DTOs/           <-- Data Transfer Objects
    │   │   │   └── Infrastructure/     <-- CAPA DE INFRAESTRUCTURA (Adaptadores de Salida)
    │   │   │       ├── Persistence/    <-- EloquentArticleRepository.php (MariaDB)
    │   │   │       ├── Services/       <-- S3StorageAdapter.php, MailgridAdapter.php
    │   │   │       └── Models/         <-- Modelos de Eloquent (Solo para persistencia)
    │   ├── database/                   <-- Migraciones y Seeders (Detalle técnico)
    │   └── routes/
    │       └── api.php                 <-- Definición de puntos de entrada
    │
    └── frontend-web/
        ├── src/
        │   ├── app/                    <-- Next.js App Router
        │   │   ├── (public)/           <-- Rutas para la web de noticias (SEO)
        │   │   │   ├── [section]/
        │   │   │   └── article/[slug]/
        │   │   ├── (admin)/            <-- Rutas para el Panel React (Protegidas)
        │   │   │   ├── dashboard/
        │   │   │   └── banners/
        │   │   └── api/                <-- BFF (Backend For Frontend)
        │   │       ├── proxy-laravel/  <-- Rutas que enmascaran la API de Laravel
        │   │       └── revalidate/     <-- Endpoint para Webhooks de purga de caché
        │   ├── components/             <-- Componentes React (Atómicos o por feature)
        │   │   ├── ui/                 <-- Botones, Inputs (Shadcn/UI)
        │   │   ├── banners/            <-- Lógica de inyección de Banners (Img vs Code)
        │   │   └── shared/
        │   ├── services/               <-- Adaptadores de Entrada al Frontend
        │   │   ├── laravel-api.ts      <-- Cliente Axios/Fetch configurado
        │   │   └── article-service.ts  <-- Llamadas específicas a la API
        │   ├── hooks/                  <-- Custom hooks para el estado del CMS
        │   ├── store/                  <-- Gestión de estado (Zustand o Context)
        │   └── lib/                    <-- Utilidades (validaciones, formateo de fechas)
        ├── public/                     <-- Assets estáticos
        └── next.config.js              <-- Configuración de ISR y dominios de imágenes