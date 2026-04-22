````mermaid
graph TD
    A["vertex-cms"]

    A --> B["backend-api - Laravel"]
    A --> C["frontend-web - Next.js + React"]

    %% BACKEND
    B --> B1["app"]
    B --> B2["src (Core)"]
    B --> B3["database"]
    B --> B4["routes/api.php"]

    %% APP
    B1 --> B1a["Http - Driving Adapters"]
    B1a --> B1a1["Controllers"]
    B1a --> B1a2["Resources"]
    B1 --> B1b["Providers - DI"]

    %% CORE
    B2 --> B2a["CMS"]

    %% DOMAIN
    B2a --> B2a1["Domain"]
    B2a1 --> B2a1a["Entities"]
    B2a1 --> B2a1b["Ports (Output)"]

    %% APPLICATION
    B2a --> B2a2["Application"]
    B2a2 --> B2a2a["UseCases (Input)"]

    %% INFRASTRUCTURE
    B2a --> B2a3["Infrastructure"]
    B2a3 --> B2a3a["Persistence"]
    B2a3 --> B2a3b["Services"]
    B2a3 --> B2a3c["Models"]

    %% FRONTEND
    C --> C1["src"]
    C --> C2["public"]
    C --> C3["next.config.js"]

    %% FRONTEND SRC
    C1 --> C1a["app"]
    C1 --> C1b["components"]
    C1 --> C1c["services (API Client)"]
    C1 --> C1d["hooks"]
    C1 --> C1e["store"]
    C1 --> C1f["lib"]

    %% APP ROUTES
    C1a --> C1a1["public - SEO / ISR"]
    C1a --> C1a2["admin - SPA"]
    C1a --> C1a3["api - BFF"]
````