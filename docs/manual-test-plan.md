# Plan de Pruebas Manuales

## Acceso

- Iniciar sesion con usuario administrador.
- Crear un cobrador activo.
- Cerrar sesion e iniciar sesion con el cobrador.
- Confirmar que el cobrador no puede entrar a pantallas de administrador.

## Clientes

- Crear cliente con datos completos.
- Buscar cliente por nombre, identidad, telefono y negocio.
- Editar cliente.
- Cambiar estado a inactivo y volver a activo.

## Prestamos

- Crear prestamo diario con monto fijo de interes.
- Crear prestamo semanal con interes porcentual.
- Confirmar que se generan cuotas y fechas.
- Confirmar que el prestamo aparece en cartera.

## Rutas

- Crear ruta.
- Asignar cobrador activo.
- Asignar cliente activo.
- Confirmar que el cliente aparece en la vista del cobrador.
- Quitar cliente y confirmar que desaparece de la vista del cobrador.

## Cobros

- Registrar abono parcial.
- Confirmar que la cuota queda parcial.
- Registrar saldo restante.
- Confirmar que la cuota queda pagada.
- Confirmar que el prestamo queda pagado al completar todas las cuotas.

## Caja

- Abrir caja para cobrador.
- Registrar pago y confirmar que se vincula a caja abierta.
- Registrar gasto.
- Cerrar caja con monto contado.
- Confirmar diferencia.

## Offline

- Instalar la app como PWA.
- Abrir vista cobrador.
- Desactivar internet.
- Registrar pago.
- Confirmar banda de pago pendiente offline.
- Activar internet.
- Confirmar sincronizacion automatica.
- Confirmar que el pago no se duplica al recargar.

## Dashboard

- Confirmar cobros de hoy.
- Confirmar dinero en la calle.
- Confirmar clientes en mora.
- Confirmar cajas abiertas.
- Confirmar ultimos pagos y proximas cuotas.
