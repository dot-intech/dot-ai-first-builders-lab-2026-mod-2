# PRD-001: NutraShot — Registro dietario asistido por fotografía

## Contexto y Problema
Cuando queremos llevar un registro diario de lo que comemos y las calorías ingeridas en cada comida, el hacerlo nosotros manualmente anotando las comidas y cantidades y calculando a partir de eso las calorías se torna tedioso rápidamente, lo que hace que muchas veces abandonemos el registro y no podamos hacer un buen seguimiento dietario, indispensable para controlar nuestro peso o tratar problemas de salud. Para solucionar esta situación es necesaria una aplicación web que nos permita cargar fácil y rápidamente lo que comemos a partir de una foto del plato, y se encargue de identificar, describir y contabilizar los alimentos, permitiendo guardar un registro diario de lo que consumimos y las calorias asociadas, de manera de poder identificar si estamos cumpliendo nuestras metas dietarias.

### Sujetos involucrados
**Usuarios**: Cada usuario es una persona que quiere utilizar la aplicación para monitorear su ingesta calórica diaria. Su necesidad principal es registrar la información nutricional de sus comidas de manera fácil y rápida, utilizando la cámara de su teléfono celular para fotografiar su plato antes de empezar a comer.

## Objetivos
Que la aplicación lleve un registro claro y ordenado de los alimentos consumidos a lo largo del tiempo, permitiendo a los usuarios ingresar esta información de manera rápida y sencilla utilizando la cámara del celular para sacar una foto del plato antes de empezar a comer. A partir de la foto la aplicación se encarga de identificar los alimentos (y bebidas) y calcular las porciones y calorías que se van a consumir, permite al usuario revisar y editar esta información y al confirmar guarda un registro con todos estos datos en una base de datos persistente, que el usuario luego puede consultar para visualizar la información. La acción de ingresar un nuevo consumo a partir de la foto debe ser algo rápido para el usuario, y la demora entre cargar la foto y ver la información estimada del consumo no debería llevar más de 10 segundos de interacción. El usuario podrá ver de manera fácil y clara su consumo de calorías diario y un breve historial de los consumos cargados a lo largo del tiempo.

## Requerimientos Funcionales
- RF-01: El usuario debe autenticarse en la aplicación antes de poder usarla.
- RF-02: Antes de autenticarse, el usuario sólo debe poder ver la pantalla de inicio de sesión con el nombre, el logo de la aplicación y la opcion de "Obtener link de acceso" para iniciar sesión.
- RF-03: El usuario debe poder iniciar sesion únicamente con un link de acceso (magic link) recibido via mail al ingresar a la opción "Obtener link de acceso".
- RF-04: Luego de autenticarse, el sistema debe mostrarle al usuario un tablero principal donde vea un saludo de bienvenida, una sección con información de las calorías consumidas en el día actual, y una sección de acciones con las siguientes opciones: [Nuevo, Historial, Cerrar Sesión].
- RF-05: La opcion "Nuevo" debe permitirle al usuario agregar un nuevo consumo a su registro dietario a partir de una foto tomada en el momento; el consumo queda registrado en su bitácora de consumos diarios.
- RF-06: La opcion "Nuevo" debe permitirle al usuario agregar un nuevo consumo a su registro dietario a partir de una imagen preexistente en la galería; el consumo queda registrado en su bitácora de consumos diarios.
- RF-07: Al momento de registrar un nuevo consumo, el sistema debe analizar la imagen provista por el usuario y mostrar la descripción de los alimentos y bebidas en la imágen, la cantidad de calorías estimada y el % (sin decimales) de desglose nutricional de esas calorías en las siguientes 4 categorías [Carbohidratos, Proteinas, Grasas, Otros Nutrientes]. La suma de estos porcentajes debe ser exactamente 100%.
- RF-08: La opcion "Historial" debe permitirle al usuario visualizar una pantalla con un resumen de los consumos cargados a lo largo del tiempo mostrando fecha, hora y cantidad de calorías.
- RF-09: La opcion "Historial" debe presentar la información separada de manera jerarquica por semanas, meses y años.
- RF-10: La opcion "Cerrar Sesión" debe cerrar la sesión actual previo confirmación del usuario.
- RF-11: Al momento de analizar la imágen de un consumo, el sistema deberá consultar internamente un modelo de visión a través de la API de Google AI Studio, enviando la imágen y un prompt pidiendo los datos necesarios a obtener de la imágen, de manera transparente para el usuario, que sólo verá un indicador gráfico de que el sistema está procesando la imagen.
- RF-12: El sistema deberá indicar con un mensaje de error cuando no se pueda procesar la imagen por error interno o por demora superior a los 30 segundos, permitiendo al usuario hacer una carga manual de la descripción y cantidad de calorías del consumo.
- RF-13: Luego de mostrar la información obtenida a partir de una imágen, el sistema debe permitirle al usuario editar estos datos antes de guardarlos en el registro de consumo.
- RF-14: El sistema debe actualizar el gráfico del tablero principal en tiempo real luego de guardar un nuevo registro de consumo.
- RF-15: Al desglosar los alimentos detectados en una imagen, el sistema debe indicar en una descripción amigable al usuario los ingredientes detectados e incluir también la bebida si existe en la imagen.
- RF-16: Al desglosar los alimentos detectados en una imagen, el sistema debe recordar al usuario que la información puede ser inexacta.
- RF-17: Al desglosar los alimentos detectados en una imagen, el sistema debe advertir al usuario cuando no se pueda estimar correctamente la información a partir de la imagen (baja confianza) y darle la opción de cargar una nueva imagen.
- RF-18: Al desglosar los alimentos detectados en una imagen, el usuario debe editar obligatoriamente la descripción y cantidad de calorías cuando el sistema haya estimado la información con un bajo nivel de confianza.
- RF-19: La opcion "Historial" debe permitirle al usuario eliminar cualquiera de los consumos que se está visualizando por pantalla, previo confirmación y advertencia de que la acción es irreversible.

## Requerimientos No Funcionales
- RNF-01: La validez del link de acceso será de 15 minutos, luego de los cuales el mismo expirará y se deberá obtener un nuevo link de acceso para poder iniciar sesión.
- RNF-02: El procesamiento de la imágen desde la carga hasta la visualización de los datos estimados debe concretarse en < 10 s (p95) en condiciones normales de una red 4G.
- RNF-03: El nivel aceptable de confianza en la información estimada a partir de la imagen del consumo debe ser > 70%, caso contrario se clasifica la estimación como de baja confianza.
- RNF-04: El tiempo máximo de procesamiento de la imágen debe ser <= 30s.
- RNF-05: La interfaz gráfica debe ser responsiva y optimizada para dispositivos móviles (iOS y Android) bajo resoluciones estándar de pantalla entre 240p y 4K.
- RNF-06: la sesión expira tras 8 horas de inactividad.
- RNF-07: Por motivos de privacidad y seguridad de la información, las imágenes provistas por el usuario nunca se persisten del lado del backend: 0 persistencia de imágenes provistas por el usuario.
- RNF-08: El sistema soportará 2 idiomas: Español (predeterminado) e Inglés, los que determinan el idioma de la UI y de la descripción de los alimentos provista por el modelo de visión.

## Criterios de Aceptación
- AC-01 (RF-01): Dado un usuario sin una sesión vigente en el sistema, cuando el usuario intenta usar la aplicación, entonces el sistema lo redirige a la pantalla de inicio de sesión.
- AC-02 (RF-02): Dado un usuario que ingresa a la pantalla de inicio de sesión, cuando el usuario no se encuentra autenticado, entonces el sistema sólamente muestra el nombre y el logo de la aplicación, y la opción "Obtener link de acceso".
- AC-03 (RF-03): Dado un usuario sin una sesión vigente en el sistema, cuando el usuario ingresa a la opción "Obtener link de acceso" de la pantalla de inicio de sesión, entonces el sistema le pide ingresar su dirección de email y luego le envía un email con un link de acceso de un único uso para poder ingresar directamente a la aplicación utilizando ese link, que sólo es valido para un inicio de sesión y luego expira.
- AC-04 (RF-04): Dado un usuario que está intentando iniciar sesión en la aplicación, cuando el usuario inicia sesión exitosamente, entonces el sistema lo redirige a la pantalla del tablero principal donde ve un saludo de bienvenida, una sección con información de las calorías consumidas en el día actual, y una sección de acciones con las siguientes opciones: [Nuevo, Historial, Cerrar Sesión].
- AC-05 (RF-05): Dado un usuario que está registrando un nuevo consumo, cuando el usuario elige la opcion "Nuevo" entonces el sistema le permite al usuario agregar un nuevo consumo a su registro dietario a partir de una foto tomada en el momento con el dispositivo actual, y el consumo queda registrado en su bitácora de consumos diarios.
- AC-06 (RF-06): Dado un usuario que está registrando un nuevo consumo, cuando el usuario elige la opcion "Nuevo" entonces el sistema le permite al usuario agregar un nuevo consumo a su registro dietario a partir de una imagen preexistente en la galería del dispositivo actual, y el consumo queda registrado en su bitácora de consumos diarios.
- AC-07 (RF-07): Dado un usuario que está registrando un nuevo consumo, cuando el usuario provee al sistema una imágen, entonces el sistema analiza la imagen provista y muestra por pantalla la descripción de los alimentos y bebidas en la imágen, la cantidad de calorías estimada y el % (sin decimales) de desglose nutricional de esas calorías en las siguientes 4 categorías [Carbohidratos, Proteinas, Grasas, Otros Nutrientes]. La suma de estos porcentajes debe ser exactamente 100%.
- AC-08 (RF-08): Dado un usuario que quiere ver su registro de consumos, cuando el usuario ingresa a la opción "Historial", entonces el sistema muestra una pantalla con todos los consumos cargados a lo largo del tiempo mostrando fecha, hora y cantidad de calorías.
- AC-09 (RF-09): Dado un usuario que ha ingresado en la opcion "Historial", cuando el usuario scrollea en el listado de consumos puede ver el registro de consumos ordenados por fecha y hora descendientemente, y separados de manera jerárquica por semanas, meses y años.
- AC-10 (RF-10): Dado un usuario que está visualizando la pantalla principal, cuando el usuario selecciona la opción de "Cerrar sesión", entonces el sistema le pide confirmación y si el usuario confirma entonces se finaliza la sesión activa del usuario y lo redirige a la pantalla de inicio de sesión.
- AC-11 (RF-11): Dado un usuario que está creando un nuevo registro de consumo a partir de una imágen, cuando el usuario selecciona la imágen y acepta, entonces el sistema le muestra un indicador gráfico de que se está procesando la imagen y cuando finaliza el procesamiento interno muestra la información analizada a partir de la imagen.
- AC-12 (RF-12): Dado un usuario que está creando un nuevo registro de consumo a partir de una imágen, cuando el sistema tarda más de 30 segundos o falla al procesar la imagen, entonces el sistema muestra un mensaje de error amigable al usuario y le permite hacer una carga manual de la descripción y cantidad de calorías del consumo.
- AC-13 (RF-13): Dado un usuario que está creando un nuevo registro de consumo a partir de una imagen, cuando el sistema ha procesado la imagen y está mostrando la información de ingredientes, calorias y desglose nutricional, entonces el sistema permite al usuario editar estos datos antes de guardarlos en el registro de consumo e impactar los datos.
- AC-14 (RF-14): Dado un usuario que está creando un nuevo registro de consumo, cuando el usuario confirma y guarda el nuevo registro de consumo, entonces el sistema lo redirige a la pantalla del tablero principal y actualiza el gráfico inmediatamente mostrando la información actualizada del consumo diario de calorías.
- AC-15 (RF-15): Dado un plato con una pechuga de pollo asada, arroz y un vaso de vino tinto, cuando el usuario toma la fotografía y presiona enviar, entonces el sistema muestra la descripción "Pechuga de pollo asada con arroz y un vaso de vino tinto".
- AC-16 (RF-16): Dado un usuario que está creando un nuevo registro de consumo a partir de una imagen, cuando el sistema ha procesado la imagen y está mostrando la información de ingredientes, calorias y desglose nutricional, entonces el sistema agrega una línea de texto debajo recordando al usuario que la información obtenida puede ser inexacta.
- AC-17 (RF-17): Dado un usuario que está creando un nuevo registro de consumo a partir de una imagen, cuando el sistema no ha podido identificar de manera confiable los alimentos o porciones en la imagen, entonces el sistema advierte al usuario que no se pudo estimar correctamente la información a partir de la imágen y le da la opción de cargar una nueva imágen.
- AC-18 (RF-18): Dado un usuario que está creando un nuevo registro de consumo a partir de una imagen, cuando el sistema ha estimado los alimentos y porciones en la imagen con un nivel de confianza de menos de 70%, entonces el sistema carga la información estimada pero obliga al usuario a editar manualmente la descripción y la cantidad de calorías del consumo.
- AC-19 (RF-19): Dado un usuario que ha ingresado en la opcion "Historial", cuando el usuario intenta eliminar cualquiera de los consumos que se está visualizando por pantalla, entonces el sistema le muestra una advertencia de que la acción es irreversible y le pide confirmación antes de eliminar definitivamente los datos del sistema.

## Fuera de Alcance
- Metas de consumo diario / semanal de calorías.
- Registro y Login de usuario por contraseña.
- Historiales de métricas semanales o mensuales en formato de gráficas avanzadas.
- Exportacion o importación de datos del usuario.
- Eliminación de cuenta y/o datos del usuario.
- Planes de suscripción, pasarelas de pago o perfiles multiusuario.
- RBAC configurable / más de un rol de usuario
- Multi-tenant

## Riesgos y Dependencias
- **Riesgo:** El sistema puede fallar al identificar un ingrediente poco común o mal iluminado → *Mitigación:* Se agregará un aviso estético e informativo al pie del desglose indicando que los valores son estimaciones aproximadas.
- **Riesgo:** El analisis de la imagen puede demorar más tiempo del esperado por problemas de red o imposibilidad de consultar internamente la API del modelo de visión → *Mitigación:* Se mostrará un mensaje de error temporal indicando que no se puede procesar la imágen en este momento y se le permitirá al usuario realizar una carga manual del consumo especificando la descripción de los alimentos y la cantidad de calorías.
- **Dependencia:** Conexión obligatoria a internet y particularmente a la API del modelo de visión (a través de Google AI Studio, modelo gemini-3.1-flash-lite).
- **Dependencia:** Node.js para el backend.
- **Dependencia:** React para el frontend.
- **Dependencia:** PostgreSQL para la base de datos que persistirá la información (tablas: usuarios, consumos).


