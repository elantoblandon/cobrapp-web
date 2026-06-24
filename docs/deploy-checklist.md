# Checklist de Despliegue

## Antes de desplegar

- Confirmar que `.env` local tiene `AUTH_SECRET` de minimo 32 caracteres.
- Confirmar conexion `DATABASE_URL` a PostgreSQL de DigitalOcean.
- Ejecutar `npm run verify`.
- Ejecutar `npm audit --audit-level=high`.
- Confirmar que no se sube `.env` al repositorio.
- Confirmar que el admin inicial ya no usa contrasena temporal.

## Variables de entorno en hosting

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
ADMIN_NAME="..."
ADMIN_EMAIL="..."
ADMIN_PASSWORD="..."
```

## Base de datos

- Activar backups automaticos en DigitalOcean.
- Restringir Trusted Sources si el hosting tiene IP fija.
- Guardar credenciales en un gestor seguro.
- Probar `/api/health` despues del despliegue.

## Seguridad operativa

- Cambiar contrasena del admin principal.
- Crear usuarios cobradores individuales.
- Desactivar usuarios que no se usen.
- Revisar caja y pagos diariamente.
- Exportar o respaldar datos antes de cambios grandes.

## Validacion post-deploy

- Abrir `/login`.
- Iniciar sesion.
- Revisar dashboard.
- Crear cliente de prueba.
- Crear prestamo de prueba.
- Registrar pago pequeno.
- Revisar caja.
- Probar instalacion PWA en telefono.
