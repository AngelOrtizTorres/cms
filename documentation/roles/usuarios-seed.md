# Usuarios seed del CMS

Fuente: backend/database/seeders/UserSeeder.php

## Credenciales

- Administrador
  - Email: admin@gmail.com
  - Password: admin123456789
  - Role: admin

- Autor
  - Email: author@gmail.com
  - Password: author123456789
  - Role: author

- Editor
  - Email: editor@gmail.com
  - Password: editor123456789
  - Role: editor

## Comando de seed

```bash
cd app-cms/backend
php artisan db:seed --class=UserSeeder
```

## Nota de seguridad

Estas credenciales son para entorno local/desarrollo. Cambiarlas en producción.
