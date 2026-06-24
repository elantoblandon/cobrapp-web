# Manual de Usuario - Cobrapp Web

## 1. Introduccion

Cobrapp Web es un sistema web para administrar prestamos, clientes, rutas de cobro, pagos diarios y caja. Esta pensado para negocios que trabajan con microcreditos, pagadiarios, cobros por ruta o prestamos con cuotas periodicas.

El sistema funciona desde computadora, tablet o telefono. El administrador puede gestionar el negocio desde el panel principal, mientras que los cobradores pueden usar la vista movil desde el navegador de su telefono para revisar sus rutas y registrar pagos.

## 2. Roles del sistema

El sistema maneja dos tipos principales de usuario:

| Rol | Que puede hacer |
| --- | --- |
| Administrador | Gestiona usuarios, clientes, prestamos, rutas, cobros, caja y reportes del dashboard. |
| Cobrador | Consulta su ruta de cobro, registra pagos y participa en el control de caja asignado. |

El administrador es quien toma las decisiones principales del negocio. El cobrador tiene una vista enfocada en el trabajo diario de campo.

## 3. Ingreso al sistema

1. Abra la direccion web del sistema en el navegador.
2. Ingrese su correo electronico.
3. Ingrese su contrasena.
4. Presione el boton de iniciar sesion.

Si los datos son correctos, el sistema lo llevara al panel correspondiente.

Para salir del sistema, presione el boton `Salir` en el menu lateral o en la barra superior movil.

## 4. Navegacion principal

El sistema tiene los siguientes modulos:

| Modulo | Para que sirve |
| --- | --- |
| Dashboard | Ver resumen general del negocio. |
| Cobrador | Vista movil para rutas y cobros de campo. |
| Usuarios | Crear administradores y cobradores. |
| Clientes | Registrar y administrar clientes. |
| Prestamos | Crear creditos y revisar cuotas. |
| Rutas | Crear rutas y asignar clientes/cobradores. |
| Cobros | Registrar pagos o abonos. |
| Caja | Abrir caja, registrar gastos y cerrar el cuadre diario. |

En computadora, los modulos aparecen en el menu lateral izquierdo. En telefono, aparecen como iconos en la parte superior; puede deslizar la fila de iconos para verlos todos.

## 5. Dashboard

El Dashboard es la pantalla principal del administrador. Muestra indicadores generales del negocio, como:

- Dinero pendiente por cobrar.
- Monto en mora.
- Cobros recientes.
- Proximas cuotas.
- Accesos rapidos a los modulos principales.

Esta pantalla sirve para tener una vision rapida del estado del negocio antes de entrar a revisar detalles.

## 6. Gestion de usuarios

Ruta: `Usuarios`

Este modulo permite crear y administrar las cuentas que usan el sistema.

### Crear usuario

1. Entre al modulo `Usuarios`.
2. Complete los datos:
   - Nombre.
   - Correo.
   - Telefono.
   - Rol: Cobrador o Administrador.
   - Contrasena inicial.
3. Presione `Crear usuario`.

### Cambiar contrasena

1. Busque el usuario en la lista.
2. Escriba la nueva contrasena.
3. Presione `Cambiar`.

### Activar o desactivar usuario

En la lista de usuarios se puede cambiar el estado de una cuenta. Si un usuario queda inactivo, no deberia poder operar normalmente en el sistema.

Recomendacion: cree una cuenta por cada cobrador. No es recomendable que varios empleados compartan la misma cuenta, porque los pagos y movimientos quedan registrados a nombre del usuario que inicio sesion.

## 7. Gestion de clientes

Ruta: `Clientes`

Este modulo sirve para registrar y consultar la cartera de clientes.

### Crear cliente

1. Entre al modulo `Clientes`.
2. Complete los datos principales:
   - Nombre completo.
   - Identidad.
   - Telefono.
   - Direccion.
   - Nombre del negocio.
   - Direccion del negocio.
   - Calificacion crediticia.
   - Notas.
3. Presione `Crear cliente`.

### Calificacion crediticia

La calificacion ayuda a evaluar el riesgo del cliente:

| Calificacion | Uso sugerido |
| --- | --- |
| Nuevo | Cliente sin historial suficiente. |
| Bueno | Cliente confiable y puntual. |
| Observacion | Cliente que necesita seguimiento. |
| Riesgoso | Cliente con antecedentes de atrasos o dudas. |
| Malo | Cliente no recomendado para nuevos creditos. |

### Estados del cliente

| Estado | Significado |
| --- | --- |
| Activo | Cliente disponible para prestamos y rutas. |
| Inactivo | Cliente que no se esta trabajando actualmente. |
| Bloqueado | Cliente que no deberia recibir nuevos creditos. |

### Buscar clientes

Puede usar la busqueda para encontrar clientes por nombre, identidad o telefono.

## 8. Gestion de prestamos

Ruta: `Prestamos`

Este modulo permite crear nuevos creditos y revisar la cartera activa.

### Crear prestamo

1. Entre al modulo `Prestamos`.
2. Seleccione el cliente.
3. Ingrese el monto prestado.
4. Seleccione el tipo de interes:
   - Monto fijo.
   - Porcentaje.
5. Ingrese el valor del interes.
6. Indique el numero de cuotas.
7. Seleccione la modalidad:
   - Diario.
   - Semanal.
   - Quincenal.
   - Mensual.
8. Ingrese la fecha de inicio.
9. Opcionalmente marque `Aplicar mora automatica` e indique el monto de mora.
10. Agregue notas si lo necesita.
11. Presione `Crear prestamo`.

El sistema calcula el total del prestamo, el monto de las cuotas y las fechas de vencimiento segun la modalidad seleccionada.

### Recomendaciones al crear prestamos

- Verifique que el cliente este correctamente registrado antes de crear el credito.
- Revise bien el monto, interes, numero de cuotas y modalidad antes de guardar.
- Use las notas para dejar condiciones especiales, acuerdos o referencias importantes.

## 9. Rutas de cobro

Ruta: `Rutas`

Este modulo permite organizar los clientes por zona o ruta y asignar cobradores.

### Crear ruta

1. Entre al modulo `Rutas`.
2. Escriba el nombre de la ruta, por ejemplo: `Ruta Centro`.
3. Agregue una descripcion si es necesario.
4. Presione `Crear ruta`.

### Asignar cobrador a una ruta

1. Busque la ruta.
2. En la seccion de cobradores, seleccione el cobrador.
3. Presione `Asignar`.

### Asignar cliente a una ruta

1. Busque la ruta.
2. En la seccion de clientes, seleccione el cliente.
3. Ingrese un numero de orden si desea organizar la ruta.
4. Presione `Agregar`.

### Quitar asignaciones

En cada ruta se puede quitar un cobrador o quitar un cliente asignado. Esto no elimina al usuario ni al cliente; solo lo desvincula de esa ruta.

### Activar o desactivar ruta

Una ruta puede estar activa o desactivada. Las rutas activas son las que se usan normalmente para el cobro diario.

## 10. Vista del cobrador

Ruta: `Cobrador`

Esta vista esta pensada para usarse desde el telefono del cobrador.

El cobrador puede ver:

- Rutas asignadas.
- Clientes de cada ruta.
- Cuotas abiertas de cada cliente.
- Monto pendiente por cobrar.
- Cuotas vencidas.
- Boton para llamar al cliente si tiene telefono registrado.
- Boton para abrir la direccion en Google Maps si tiene direccion registrada.

### Registrar cobro desde la vista del cobrador

1. Entre a `Cobrador`.
2. Busque la ruta.
3. Busque el cliente.
4. Ubique la cuota pendiente.
5. Ingrese el monto recibido.
6. Seleccione el metodo de pago:
   - Efectivo.
   - Transferencia.
   - Otro.
7. Confirme la fecha de pago.
8. Agregue una nota si es necesario.
9. Presione `Cobrar`.

En telefono, puede usar el boton `Todo` para colocar rapidamente el saldo completo de la cuota.

## 11. Cobros

Ruta: `Cobros`

Este modulo muestra cuotas pendientes o vencidas y permite registrar pagos o abonos.

### Registrar pago o abono

1. Entre al modulo `Cobros`.
2. Busque la cuota del cliente.
3. Ingrese el monto recibido.
4. Seleccione el metodo de pago.
5. Revise la fecha.
6. Agregue una nota si aplica.
7. Presione `Cobrar`.

El sistema permite registrar:

- Pago completo de la cuota.
- Abono parcial.
- Pago en efectivo.
- Pago por transferencia.
- Otro metodo de pago.

Cuando el pago no cubre toda la cuota, el sistema mantiene saldo pendiente.

### Cobros offline

Si el telefono pierde conexion, el sistema puede guardar pagos offline desde el navegador. Cuando vuelva la conexion, esos pagos se sincronizan.

Recomendaciones:

- No cierre el navegador inmediatamente despues de registrar pagos offline.
- Revise que el sistema muestre confirmacion de sincronizacion cuando vuelva internet.
- Si hay dudas, confirme los pagos recientes en el modulo `Cobros`.

## 12. Caja diaria

Ruta: `Caja`

El modulo de caja sirve para controlar el dinero entregado al cobrador, los pagos recibidos, los gastos y el cierre del dia.

### Abrir caja

1. Entre al modulo `Caja`.
2. Seleccione el cobrador.
3. Indique la fecha.
4. Ingrese el dinero entregado.
5. Agregue una nota si aplica.
6. Presione `Abrir caja`.

Solo el administrador puede abrir cajas.

### Registrar gasto

1. Busque una caja abierta.
2. En `Registrar gasto`, ingrese:
   - Monto.
   - Categoria.
   - Descripcion opcional.
3. Presione `Gasto`.

Ejemplos de categoria:

- Transporte.
- Alimentacion.
- Combustible.
- Papeleria.
- Otro.

### Cerrar caja

1. Busque la caja abierta.
2. En `Cierre de caja`, ingrese el efectivo contado.
3. Agregue nota de cierre si aplica.
4. Presione `Cerrar`.

El sistema compara el monto esperado con el monto contado y muestra la diferencia.

### Ver movimientos

Dentro de cada sesion de caja puede abrir `Ver movimientos` para revisar:

- Pagos asociados.
- Gastos registrados.

## 13. Estados importantes

### Estados de prestamos

| Estado | Significado |
| --- | --- |
| Activo | Prestamo en curso. |
| Pagado | Prestamo terminado. |
| En mora | Prestamo con cuotas vencidas. |
| Incobrable | Prestamo considerado perdido o muy riesgoso. |
| Cancelado | Prestamo anulado. |

### Estados de cuotas

| Estado | Significado |
| --- | --- |
| Pendiente | Cuota aun no pagada. |
| Parcial | Cuota con abono, pero no pagada completa. |
| Pagada | Cuota completada. |
| Vencida | Cuota atrasada. |
| Cancelada | Cuota anulada. |

### Estados de caja

| Estado | Significado |
| --- | --- |
| Abierta | Caja en uso durante el dia. |
| Cerrada | Caja ya cuadrada. |
| Revisada | Caja validada posteriormente. |

## 14. Uso recomendado diario

### Antes de iniciar la ruta

1. El administrador revisa el Dashboard.
2. El administrador abre caja para cada cobrador.
3. El cobrador entra a la vista `Cobrador`.
4. El cobrador revisa sus rutas y clientes asignados.

### Durante el dia

1. El cobrador visita clientes segun la ruta.
2. Registra cada pago o abono desde el telefono.
3. Usa llamadas o direccion si estan disponibles.
4. Registra notas cuando haya situaciones especiales.

### Al final del dia

1. El administrador o encargado revisa pagos registrados.
2. Se registran gastos del cobrador.
3. Se cuenta el efectivo.
4. Se cierra la caja.
5. Se revisa cualquier diferencia.

## 15. Buenas practicas

- Mantener actualizados telefono y direccion de cada cliente.
- No crear prestamos a clientes bloqueados o con mala calificacion sin autorizacion.
- Registrar pagos en el momento en que se reciben.
- Usar notas para acuerdos especiales o situaciones fuera de lo normal.
- Revisar la caja al final de cada dia.
- No compartir usuarios ni contrasenas.
- Cambiar contrasenas cuando un cobrador deja de trabajar en el negocio.
- Revisar periodicamente clientes en mora.

## 16. Solucion de problemas frecuentes

### No puedo iniciar sesion

Revise que el correo y la contrasena sean correctos. Si el problema continua, solicite al administrador que cambie la contrasena o revise si el usuario esta activo.

### No aparece un cliente en Prestamos

Verifique que el cliente este activo. Los clientes inactivos o bloqueados pueden no estar disponibles para nuevos prestamos.

### Un cobrador no ve rutas

Revise en el modulo `Rutas` que:

- La ruta este activa.
- El cobrador este asignado a la ruta.
- La asignacion no haya sido retirada.

### No aparecen clientes en la ruta del cobrador

Revise que los clientes esten asignados a la ruta y que esten activos.

### Un pago no se refleja

Revise si el telefono tenia conexion al momento de cobrar. Si el pago fue guardado offline, espere a que el dispositivo recupere internet y sincronice.

### La caja no cuadra

Revise:

- Pagos registrados durante el dia.
- Gastos agregados.
- Dinero entregado al inicio.
- Efectivo contado al cierre.
- Pagos por transferencia que no estan en efectivo.

## 17. Glosario

| Termino | Significado |
| --- | --- |
| Cliente | Persona que recibe un prestamo. |
| Cobrador | Empleado que visita clientes y registra pagos. |
| Ruta | Grupo de clientes organizados por zona o recorrido. |
| Prestamo | Credito otorgado a un cliente. |
| Cuota | Pago programado de un prestamo. |
| Abono | Pago parcial de una cuota. |
| Mora | Atraso o cargo por pago vencido. |
| Caja | Control diario de dinero entregado, pagos, gastos y cierre. |
| Dashboard | Pantalla de resumen general del negocio. |

## 18. Notas finales

Este manual describe el funcionamiento actual del sistema Cobrapp Web. Si se agregan nuevas funciones en el futuro, se recomienda actualizar este documento para mantenerlo alineado con el sistema.

