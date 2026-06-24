# Cobrapp Web - Decisiones del MVP

## Contexto

Aplicacion web responsiva para un solo negocio de prestamos y cobros en Honduras.
La moneda base sera HNL y el primer alcance cubre administrador y cobrador.

## Roles

- Administrador: toma decisiones desde el panel, gestiona usuarios, clientes, prestamos, rutas, caja y reportes.
- Cobrador: trabaja desde el navegador del telefono y solo ve clientes, rutas, prestamos y caja que tenga asignados.

## Prestamos

- El administrador podra elegir la modalidad de cobro: diario, semanal, quincenal o mensual.
- Un cliente puede tener mas de un prestamo activo.
- El interes queda configurable por prestamo porque aun no sabemos si el cliente final lo maneja como porcentaje, monto fijo o total pactado.
- Cada prestamo genera cuotas con fecha de vencimiento y estado.

## Mora

- La mora se calculara de forma automatica comparando cuotas pendientes contra su fecha de vencimiento.
- El MVP soporta marcar cuotas y prestamos como atrasados.
- El cobro adicional por mora queda opcional por prestamo para no imponer una regla que el negocio aun no ha definido.

## Rutas y cobros

- Los clientes se asignan a rutas.
- Las rutas se asignan a cobradores por periodos.
- Los pagos se registran contra un prestamo y, cuando aplique, contra una cuota.
- Los pagos registrados sin internet tendran una clave offline para evitar duplicados al sincronizar.

## Caja diaria

- Cada cobrador puede tener una sesion de caja por dia.
- La caja guarda dinero inicial, cobros, gastos, dinero contado y diferencia.
- El administrador podra revisar cierres de caja.

## Offline

- El MVP se disenara como PWA.
- Los registros offline iniciales seran pagos, gastos y notas.
- La sincronizacion manejara estados pendiente, sincronizado, fallido y conflicto.
