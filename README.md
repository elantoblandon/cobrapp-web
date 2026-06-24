# Cobrapp Web

Aplicacion web responsiva para gestion de prestamos, rutas, cobros, caja diaria y cobradores.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- PWA basica con cola offline inicial para pagos

## Configuracion local

1. Instalar dependencias:

```bash
npm install
```

2. Configurar `.env`:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="minimo-32-caracteres"
ADMIN_NAME="Administrador"
ADMIN_EMAIL="admin@cobrapp.local"
ADMIN_PASSWORD="CambiaEstaClave123!"
```

3. Verificar entorno:

```bash
npm run check:env
```

4. Ejecutar migraciones:

```bash
npm run db:migrate -- --name init
```

5. Crear/actualizar admin inicial:

```bash
npm run db:seed
```

6. Iniciar desarrollo:

```bash
npm run dev
```

## Comandos

```bash
npm run lint
npm run typecheck
npm run build
npm run verify
npm run db:studio
```

## Modulos

- Login y roles
- Usuarios
- Clientes
- Prestamos y cuotas
- Cobros y abonos
- Rutas y asignaciones
- Vista movil del cobrador
- Caja diaria y gastos
- Dashboard con datos reales
- PWA/offline inicial

## Healthcheck

```text
/api/health
```

Devuelve estado de app y base de datos.
