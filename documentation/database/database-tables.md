# Tablas de la base de datos
En esta sección se describen las tablas que se han creado en la base de datos para almacenar la información necesaria para el proyecto. Además se detallan las relaciones entre las tablas y se presentan los campos que componen cada una de ellas.

Más adelante, se explicará algunas de las técnicas o métodos propuestos para optimizar el rendimiento de la base de datos, como la normalización, el uso de índices y la optimización de consultas.

## Índice
- [Tablas de la base de datos](#tablas-de-la-base-de-datos)
  - [Índice](#índice)
  - [Tablas y relaciones](#tablas-y-relaciones)

## Tablas y relaciones

flowchart TD
    %% Estilos
    classDef external fill:#f9f9f9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    classDef infra fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    classDef app fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef domain fill:#fff3e0,stroke:#f57c00,stroke-width:3px

    subgraph External["🌍 Mundo Exterior (Clientes y Servicios)"]
        direction LR
        NextJS["🌐 Next.js (Web Frontend)"]
        ReactPanel["💻 Panel React (Admin)"]
        MariaDB[("🗄️ MariaDB")]
        NextCache["⚡ Caché Next.js (Webhook)"]
    end
    class External external

    subgraph Hexagon["⬡ Sistema CMS (Backend Laravel)"]
        direction TB

        subgraph Infra["Capa de Infraestructura (Adaptadores)"]
            direction LR
            REST["Adaptador de Entrada: Controladores REST"]
            RepoMariaDB["Adaptador de Salida: EloquentArticleRepository"]
            WebhookAdapter["Adaptador de Salida: NextJsRevalidatorAdapter"]
        end
        class Infra infra

        subgraph App["Capa de Aplicación (Casos de Uso y Puertos)"]
            direction LR
            InPort("Puerto de Entrada: \nPublishArticleUseCase")
            OutPortDB("Puerto de Salida: \nArticleRepositoryInterface")
            OutPortEvent("Puerto de Salida: \nCacheRevalidatorInterface")
            Service["Servicio de Aplicación: \nPublishArticleService"]
        end
        class App app

        subgraph Domain["Capa de Dominio (Núcleo Puro)"]
            direction TB
            Entity["Entidad: \nArticle"]
            VO["Value Objects: \nSlug, HtmlContent"]
            Rules["Reglas de Negocio: \n'Debe tener 1 Sección Principal'"]
        end
        class Domain domain

        %% Conexiones Entrada (Driving)
        NextJS -->|Petición GET| REST
        ReactPanel -->|Petición POST| REST
        REST -->|Usa| InPort
        InPort -->|Implementado por| Service
        
        %% Conexiones hacia el Dominio
        Service -->|Instancia / Valida| Entity
        Entity --- VO
        Entity --- Rules
        
        %% Conexiones Salida (Driven)
        Service -->|Usa| OutPortDB
        Service -->|Usa| OutPortEvent
        
        RepoMariaDB -.->|Implementa| OutPortDB
        WebhookAdapter -.->|Implementa| OutPortEvent
        
        RepoMariaDB -->|Guarda Datos| MariaDB
        WebhookAdapter -->|Petición HTTP| NextCache
    end