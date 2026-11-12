### Entrada #1
- Fecha: 2026-10-28 - 8:29 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Entender el taller UberClone Conductor y definir arquitectura, plan por entregables y manejo de la bitácora
- Prompt: "este es el taller que debemos realizar, quiero primero que lo entiendas y me avises, luego quiero que armemos un plan por secciones de como desarrollarlo, necesito la pestaña 1 y pestaña 2 completa para el 5 de noviembre, entonces armemos un plan donde ese desarrollo sea el primer entregable, además quiero especificar que si el taller no indica en que idioma debe ser el código entonces el código será en ingles, tambien me gustaria que me digas como podemos armar el tema de la bitacora con los datos requeridos por mensaje, como lo especifica el taller, recuerda aun no debes codificar nada, solo decirme como vamos a trabajar."
- Resumen de la respuesta: Resumen del taller, plan de 6 entregables con el E1 detallado día a día (28 oct al 5 nov), arquitectura de carpetas con Context para el registro, riesgos de librerías y Expo Go, y formato de la bitácora.
- Archivos y commit: Estructura inicial de aplicativo(template blank) - Hash: 3de68ea
- Verificación: Contrastado con el PDF del taller (secciones 2, 3, 5 y 8)
- Aprendizaje: Se toma en cuenta arquitectura y plan de trabajo dividido en días e historias de usuarios ideado por Claude.

### Entrada #2
- Fecha: 2026-10-29 - 11:12 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Redactar la sección "Uso de IA" del README y definir cuándo documentar instalación y variables de entorno
- Prompt: "luego de que entiendas esa info, ayudame en el tema de la bitacora, ya cree el docs/AI_LOG.md, y quiero crear una sección Uso de IA con el enlace a la bitácora(AI_LOG.md) en el README.md, ayudame con el texto para crear esa seccion en el readme. Por ultimo, el taller indica que a aparte de la sección uso de IA en el readme lleva instrucciones de instalación y variables de entorno (.env.example), como documento eso en el readme, en que momentos deberia documentar eso?, si puedes dame un ejemplo general" (precedido de la sección 7 del taller pegada textualmente)
- Resumen de la respuesta: Texto de la sección "Uso de IA", tabla de momentos para documentar instalación y variables, reglas de .env.example y plantilla general de README.
- Qué se usó / modificado / descartado: Formato de sección Uso de IA en docs/AI_LOG.md
- Archivos y commit: AI_LOG.md y README.md - Hash: 2f3c3bc
- Verificación: el enlace a docs/AI_LOG.md abre en GitHub.
- Aprendizaje: Se aprende a llamar otro archivo .md desde un archivo .md.

### Entrada #3
- Fecha: 2026-10-29 - 11:36 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Crear el archivo de tema (theme.js) con paleta, spacing, radius, typography y shadows inspirados en Uber
- Prompt: "por favor diseña el theme.js con la paleta de colores que consideres adecuada, con todas las variables de spacing, typography, radius, etc; Debes definir por tu cuenta si el tema será claro u oscuro dependiendo que sea mas facil de manejar en desarrollo y recuerda que estamos inspirados en la App de Uber. Recuerda marcar este código como asistido por la IA."
- Resumen de la respuesta: Se eligió tema claro con acentos en negro y azul. Se entregó theme.js con colors, spacing, radius, typography (con presets), shadows y sizes, más notas de uso.
- Qué se usó / modificó / descartó: se adquirió por completo el archivo de tema del aplicativo (theme.js)
- Archivos y commit: src/theme/theme.js — Hash: d3a6403
- Verificación: importado en una pantalla y los valores se aplican sin errores en Expo Go.
- Aprendizaje: Crear cada parte del tema en diferentes constantes separadas en un mismo archivo.

### Entrada #4
- Fecha: 2026-10-30 - 1:10 AM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Implementar la validación de un campo (nombre completo) mostrando el error solo cuando corresponde
- Prompt: "ahora dime como añado la validacion de un campo y que solo salga cuando sea error. por ejemplo, que nombre completo no pase 50 caracteres y solo tenga letras y espacios. este mensaje genera entrada de bitacora"
- Resumen de la respuesta: Se creó el validador validateFullName en utils/validators.js y se explicó el patrón con estado touched, error calculado en cada render, borde rojo y mensaje debajo del campo, además de casos de prueba.
- Qué se usó / modificó / descartó: Por ahora no se utilizó la respuesta de Claude dentro del proyecto ya que decidí primero crear 
la maqueta visual y luego implementar el almacenamiento y validaciones de los datos.
- Archivos y commit: ninguno.
- Verificación: no se verifica porque no se usa en el momento.
- Aprendizaje: se toma en cuenta la respuesta de claude para implementar en un futuro y se aprende a como realizar la validación
de un campo.

### Entrada #5
- Fecha: 2026-10-30 - 3:55 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Implementar el LanguageContext para traducir la interfaz y decidir los componentes de entrada para género e idioma
- Prompt: "Me podrías dar un ejemplo de como sería el language context y como se usaria en PersonalDataScreen donde estoy trabajando actualmente?, quiero empezar a implementar los textos según el lenguaje desde ya y no se como hacer para que la screen reconozca si debe mostrar el idioma español o ingles. y dame un ejemplo de como usarlo almenos para la etiqueta de nombre completo del label. Tambien tenemos datos como genero e idioma, como me recomiendas trabajarlos, con checkbox, radio, toggle o selects?"
- Resumen de la respuesta: Se creó LanguageContext con la función t() y el hook useLanguage, se envolvió App.js con el Provider, se tradujo la etiqueta de nombre completo y se cambió el validador para devolver claves. Se recomendó select para género y control segmentado para idioma.
- Qué se usó / modificó / descartó: Se usa gran parte del languageContext brindado en la respuesta, se implementa manualmente el hook
de useLanguage y se añade manualmente en el App.js el provider; Los archivos que contienen los textos correspondientes de cada idioma
se habian creado manualmente en un momento anterior.
- Archivos y commit: src/context/LanguageContext.js — Hash: d3a6403
- Verificación: cambiar el idioma en el estado inicial y comprobar que la etiqueta y el resto de textos cambian.
- Aprendizaje: Se aprende a crear una función para obtener el texto segun el idioma seleccionado y la clave del texto requerida.

### Entrada #6
- Fecha: 2026-10-30 - 5:16 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Crear los componentes SelectField (género e idioma con Modal + FlatList) y DateField (fecha de nacimiento) para la maqueta de datos personales
- Prompt: "Por ahora estoy haciendo la maqueta (visual, no funcional), de la parte de datos personales del registro del conductor, quiero que me des un ejemplo de como usar un Select, que usare para el campo genero, el modal + FlatList que usaré para recrear el selector de idioma en la app de Uber Pasajero y el selector de fecha para el campo fecha de nacimiento. Dime que librerias debo importar y toma de ejemplo como tengo los siguientes campos hasta el momento." (seguido del fragmento JSX con los campos birthDate, gender y language)
- Resumen de la respuesta: Se entregaron SelectField y DateField, el archivo de opciones, la función formatDate, las claves de traducción nuevas y el uso en la pantalla. Se indicó instalar @react-native-community/datetimepicker y se explicó la diferencia entre Android e iOS.
- Qué se usó / modificó / descartó: se usaron los componentes de SelectField y DateField para los campos de los formularios de registro, además se creo un archivo que va a contener arrays con las opciones de los distintos SelectField en el aplicativo.
- Archivos y commit: src/components/forms/SelectField.js, src/components/forms/DateField.js, src/data/options.js — Hash: d3a6403
- Verificación: Se prueba en Expo Go que el select abre, muestre las opciones y que el DateTimePicker abra el calendario para seleccionar una fecha.
- Aprendizaje: Se aprende a implementar la libreria del DateTimePicker, además de como crear un componente tipo lista con FlatList y ventana Modal.

### Entrada #7
- Fecha: 2026-10-30 - 7:23 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Corregir el espaciado entre los campos de texto y el label siguiente en el formulario de datos personales
- Prompt: "ayudame solo a corregir el diseño del formulario, entre los campos textinput y el label del siguiente campo no parece haber espacio, estan casi juntos, los unicos campos que parecen generar espacio debajo de su input son el datetimepicker y el select. dime exactamente que debo corregir en estilos." (acompañado del JSX y los estilos de la pantalla)
- Resumen de la respuesta: Se identificó que los TextInput no usaban el estilo field ni tenían margen inferior, a diferencia de SelectField y DateField. Se corrigió con marginBottom en el estilo input y se unificó el color de fondo de los tres tipos de campo.
- Qué se usó / modificó / descartó: Se añadio marginBottom en un estilo y se implemento en los input de los formularios.
- Archivos y commit: src/screens/PersonalDataScreen.js — Hash: d3a6403
- Verificación: revisado en Expo Go que todos los campos tienen el mismo espacio y color.
- Aprendizaje: Se aprende a dar estilo uniforme a campos de un formulario.

### Entrada #8
- Fecha: 2026-10-30 - 9:27 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Crear el componente PhotoField (cámara o galería) con expo-image-picker para los campos de foto de las pestañas de registro
- Prompt: "estaba realizando las maquetas visuales de las pestañas de registro de conductor pero sin los campos que requieran fotos de la galeria o uso de la camara, me tope con que la pestaña 3 usa varios de estos campos, entonces para terminar la maqueta necesito que me digas que libreria importar, como utilizarla y dame un ejemplo de como integrar un campo tipo foto en cualquiera de los 3 formularios de registro. me imagino que los campos tipo foto, todos van a permitir o usar la camara o seleccionar una imagen desde galeria, no forzadamente una de las dos opciones, cierto?, tambien quisiera saber si para las validaciones requerimos adicionalmente una libreria que lea las imagenes?, o le dejamos esa pregunta a la profe?"
- Resumen de la respuesta: Se recomendó expo-image-picker y se entregó PhotoField con elección entre cámara y galería, vista previa y permiso de cámara, junto con las claves de traducción y un ejemplo de uso. Se aclaró que la validación de foto obligatoria no requiere librería adicional y que verificar la placa exigiría OCR.
- Qué se usó / modificó / descartó: Se uso el componente PhotoField generado.
- Archivos y commit: src/components/form/PhotoField.js — Hash: d3a6403
- Verificación: probado en Expo Go que se elige desde galería o permite abrir la camara.
- Aprendizaje: se aprende a implementar la librería expo-image-picker.

### Entrada #9
- Fecha: 2026-10-30 - 10:28 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Crear el componente CheckboxField con estilo similar al de Uber para aceptar los términos y condiciones
- Prompt: "Como podemos hacer el checkbox para aceptar los terminos y condiciones con un estilo parecido al de la plataforma de uber?, podemos usar un pressable y darle estilos o que deberiamos usar?"
- Resumen de la respuesta: Se recomendó Pressable con Ionicons sin librerías y se entregó CheckboxField con cuadro de esquinas pequeñas, relleno negro y palomita blanca al marcarse, soporte para mensaje de error y accesibilidad, más un nuevo valor radius.xs en el tema.
- Qué se usó / modificó / descartó: Se implementó el componente CheckboxField generado por la IA; Manualmente se integra el componente en DocumentsScreen.
- Archivos y commit: src/components/forms/CheckboxField.js — Hash: d3a6403
- Verificación: probado en Expo Go que el cuadro se marca y desmarca y que el texto largo baja de línea sin salirse
- Aprendizaje: Se aprende a hacer un campo tipo checkbox utilizando Pressable y Ionicons.

### Entrada #10
- Fecha: 2026-10-30 - 10:59 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Corregir los errores de diseño de las alertas del componente PhotoField (texto cortado, alerta con espacio vacío y permiso de cámara en inglés)
- Prompt: "Veo errores de estilos en las alertas del componente PhotoField, pide permisos en inglés y los textos en español se ven que no encajan bien en la alerta, inclusive un texto ni lo muestra completo y otra alerta parece vacía, solo tiene un título, un gran espacio en blanco y 3 botones de opción, ayúdame a corregir eso porfavor." (acompañado de 3 capturas de pantalla de las alertas)
- Resumen de la respuesta: Se explicó que el permiso en inglés es un mensaje fijo de Expo Go, que el texto cortado se debía a pasar el mensaje como título del Alert y que el espacio vacío es una limitación del Alert nativo con tres botones. Se reemplazó el Alert de elección por una hoja inferior propia (Modal) y se dejó el aviso de permiso con título, mensaje y botón para abrir ajustes.
- Qué se usó / modificó / descartó: No se implementan los cambios de Alert a Modal, se corrige simplemente los Alert para que muestren los textos correctamente y por ahora no se solución el problema de la solicitud de permisos  en inglés.
- Archivos y commit: src/components/forms/PhotoField.js — Hash: d3a6403
- Verificación: Se prueba en Expo Go que las alertas no contienen errores de diseño comot texto cortado o ventana de alerta incompleta.
- Aprendizaje: Se aprende a manipular textos dentro de los Alerts.

### Entrada #11
- Fecha: 2026-10-30 - 11:50 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Definir el plan de trabajo para las validaciones y el guardado de la información del registro del conductor
- Prompt: "nos falta lo más importante para terminar los formularios de registro, las validaciones y el guardado de la información, ¿como haremos el tema de guardar la info del registro?, se almacena simplemente en asyncstorage o se guarda directamente en firebase o como lo hacemos?, necesito saber esto para proseguir con el tema de añadir los campos, hacer sus respectivas validaciones y guardar su información; No requiero código en esta respuesta, solo que me digas el plan de trabajo para estos datos."
- Resumen de la respuesta: Se explicó que los datos viven en el RegistrationContext mientras se llena el formulario, se guardan en Firebase al enviar y AsyncStorage queda solo para preferencias y sesión. Se entregó un plan en dos fases (validaciones hasta el 5 de noviembre y Firebase en el E2), un modelo de datos propuesto y las consultas pendientes con la profesora.
- Qué se usó / modificó / descartó: No se modifica nada al ser una pregunta meramente de consulta.
- Archivos y commit: ninguno.
- Verificación: no requiere verificación debido a que fue una simple consulta.
- Aprendizaje: ninguno debido a que aun no se implementa el plan de trabajo propuesto por Claude.

### Entrada #12
- Fecha: 2026-11-05 - 12:39 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Obtener un ejemplo de validación de un campo (nombre completo), revisar el diseño visual de las pestañas de registro y definir dónde ubicar el botón "Enviar registro"
- Prompt: "dame un ejemplo de como agregar validación a un campo, pasame las lineas exactas de ese ejemplo y donde irian, además de como usaría el registrationContext; Por último quiero que valides el diseño, si te parece bien o no, si se puede mejorar en cuanto a lo visual el tema y dime donde podría ir visualmente el botón de enviar registro."
- Resumen de la respuesta: Se entregó el ejemplo completo para "Nombre completo": validador puro validateFullName en utils/validators.js que devuelve claves de traducción, clave nueva errors.nameTooLong en es/en, se guía en la creación de RegistrationContext (datos, touched, errores derivados con useMemo y validez por pestaña), y los cambios en PersonalDataScreen (value, onChangeText, onBlur, borde y mensaje de error). Se revisó el diseño (teclado que tapa campos, cabecera repetida, pestañas sin etiquetas, foto de perfil circular, estados de input, contraste) y se propuso una barra fija "Enviar registro" encima de la barra de pestañas mediante la prop tabBar del navegador.
- Qué se usó / modificó / descartó: se usó el archivo de validators.js y se tomo como guía de ejemplo el resgitrationContext.js que dió claude como respuesta.
- Archivos y commit: src/utils/validators.js, src/context/RegistrationContext.js — Hash: ffdd854
- Verificación: probado en Expo Go que el error aparece solo tras salir del campo con números, más de 50 caracteres y vacío, y que desaparece con un nombre válido
- Aprendizaje: los errores se derivan del estado en lugar de guardarse, y el estado touched evita mostrar errores antes de que el usuario interactúe

### Entrada #13
- Fecha: 2026-11-05 - 4:14 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Implementar la barra de progreso de las pestañas de registro (numeración, etiquetas y check verde por pestaña completa) y el botón fijo "Enviar registro" habilitado solo cuando las tres pestañas son válidas
- Prompt: "por favor pasame el código para aplicar unos cambios de diseño que me habías recomendado:

Barra de pestañas. tabBarShowLabel: false oculta las etiquetas, que sí defines en cada pestaña. Con solo iconos no se entiende que hay 3 pasos. Muestra los textos o numera las pestañas (1, 2, 3), y agrega un check verde (colors.success) cuando una esté completa.
(lo que requiero es que apliques la barra de progreso para las pestañas).

y el boton de enviar registro como me lo habias propuesto." — Seguimiento: "pasame lo que me falta para implementar la barra de progreso y el botón de enviar registro, marca el codigo afectado como asistido por IA(como lo pide el taller) y crea la entrada #13 para la bitacora."
- Resumen de la respuesta: Se creó el componente RegistrationTabBar, que se conecta al navegador con la prop tabBar y dibuja de arriba abajo una barra de progreso de tres segmentos con el contador de pasos completos, el botón "Enviar registro" (gris hasta que isRegistrationValid sea verdadero) y las pestañas numeradas con check verde cuando están completas. Se simplificó RegistrationTabs.js, se agregaron las claves de traducción (tabsShort, stepsCompleted, submittedTitle, submittedMessage, genderPlaceholder) y se indicaron las marcas de código asistido por IA.
- Qué se usó / modificó / descartó: Se usó el archivo RegistrationTabBar.js y se modificó el RegistrationTabs.js
- Archivos y commit: src/components/registration/RegistrationTabBar.js, src/navigation/RegistrationTabs.js — Hash: 5a0e3f2
- Verificación: probado en Expo Go que la barra muestra 0/3 al inicio, que cada pestaña se marca con check verde al completarla y que el botón se habilita solo con las tres completas
- Aprendizaje: cómo personalizar la barra de pestañas con la prop tabBar y derivar el progreso del contexto en lugar de guardarlo

### Entrada #14
- Fecha: 2026-11-09 - 3:01 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Revisar la conexión a Firebase/Firestore (firebaseConfig.js y dbServices.js), conectar el registro con addDriver al enviar el registro y definir cómo manejar la aprobación del conductor y el ID del documento
- Prompt: "implemente dos archivos para conectarme a firebase/firestore (aun no se ha subido a la rama), primero el de config (firebaseConfig.js en src/config) con las credenciales, que no te voy a pasar por obvias razones (si necesitas saber algo especifico del archivo me lo dices). y el dbServices (en src/services) que sería para el CRUD de la bd: [código de src/services/dbServices.js pegado en el mensaje] por ahora solo con los metodos del conductor para realizar el manejo del tema del registro, quisiera saber con un ejemplo, como conecto un dato con el metodo addDriver para que quede en la base de datos, por ejemplo el fullName, ¿debería ser con un handler al dar clic en enviar registro? y segundo quiero que me des una idea para manejar el tema de aprobar el conductor en firebase, no debería ser un campo tipo bool?, y por lo que veo no estoy generando un id, ¿como podríamos usar el documento de identidad del usuario como id o sería mejor dejar que firebase genere un id automaticamente?."
- Resumen de la respuesta: Se señalaron errores en dbServices (falta importar db, doc() sin ID, addDriver sin retorno, campos de fotos y términos ausentes, serverTimestamp) y se entregó la versión corregida con ID automático y la función idNumberExists para evitar duplicados. Se explicó cómo conectar el registro: buildDriver convierte los datos planos del contexto al objeto anidado y handleSubmit llama a idNumberExists y addDriver con manejo de errores. Se recomendó approvalStatus como texto ('pending', 'approved', 'rejected') en lugar de booleano, aprobar desde la consola de Firebase, reglas de Firestore y bloquear el interruptor de disponibilidad con onSnapshot. Se recomendó ID automático (y el uid de Firebase Auth cuando haya login) en lugar de la cédula, y se indicó guardar las claves en variables EXPO_PUBLIC_ dentro de un .env ignorado por Git, con .env.example.
- Qué se usó / modificó / descartó: Se tomaron en cuenta algunos errores que se marcaron del dbServices.js como añadir doc, y la validación para ver si ya existe un conductor con el mismo documento de identidad aunque no creo que sea necesario para el flujo de este aplicativo, también se tomo el archivo buildDriver.js; Se descartó añadir el campo terms porque no lo veo necesario y utilizar serverTimestamp ya que prefiero que las fechas sean enviadas por el reloj de mi dispositivo y no del servidor; Por último se hacen los cambios correspondientes para ocultar las credenciales en un archivo .env.
- Archivos y commit: src/config/firebaseConfig.js, src/services/dbServices.js, src/utils/buildDriver.js, .gitignore, .env.example — Hash: 399e380
- Verificación: No se verifica aun al momento de hacer el commit.
- Aprendizaje: Se aprende a utilizar los servicios de firebase tales como firestore y storage, además de integrar una bd y sus funciones CRUD al aplicativo; Tambien se aprende a ocultar datos o credenciales sensibles al repositorio.

### Entrada #15
- Fecha: 2026-11-09 - 4:57 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Entender cómo manejar las credenciales de Firebase con un archivo .env, el .env.example y el .gitignore para no subir las claves al repositorio
- Prompt: "ayudame a entender lo de las credenciales y el .env, ¿debo crear un archivo process.env y añadir allí las claves?, luego crear un env.example con solo los titulos de las key pero sin valor? y obviamente añadir .env en el gitignore, justo despues de .env*.local?"
- Resumen de la respuesta: Se aclaró que process.env no es un archivo sino el objeto de JavaScript desde donde se leen las variables, y que el archivo a crear se llama .env en la raíz del proyecto, con las claves reales y sin subirse a Git. Se explicó que .env.example sí se sube, con los mismos nombres y sin valores, y que .env debe agregarse al .gitignore (la línea .env*.local solo cubre archivos que terminan en .local). Se advirtió reiniciar con npx expo start -c tras cambiar el .env y comprobar con git check-ignore que no se esté subiendo.
- Qué se usó / modificó / descartó: No se recibieron archivos o código como respuesta.
- Archivos y commit: Ninguno.
- Verificación: git status no lista .env y git check-ignore .env lo confirma.
- Aprendizaje: Se aprende a ocultar datos o credenciales sensibles al repositorio.

### Entrada #16
- Fecha: 2026-11-09 - 6:06 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Reemplazar Firebase Storage por Cloudinary para subir las imágenes del registro (Storage exige el plan de pago Blaze) e integrar la subida con upload preset sin firma, variables de entorno y prueba
- Prompt: "una pregunta, el proyecto que recomienda para las imagenes??, es que creo que storage de firebase cobra dinero, ¿o sabes si es gratuito?, es que tiene el mensaje: Storage requiere una cuenta de facturación (Blaze). Actualiza tu proyecto ahora y obtén $300 en crédito gratuito para probar Storage." — Seguimiento: "pásame la versión de uploadImage para Cloudinary, como integro cloudinary, que debo instalar, todo lo necesario para que quede listo y hacer la prueba, ademas ten en cuenta que no se que es cloudinary y nunca la he usado, asi que se muy detallado"
- Resumen de la respuesta: Se explicó que Firebase Storage exige el plan Blaze (pago por uso con capa gratuita y tarjeta) mientras Firestore funciona sin él, y se compararon las opciones: seguir con Storage con alerta de presupuesto o usar Cloudinary, que el taller recomienda en la sección 7. Se detalló cómo crear la cuenta de Cloudinary, obtener el cloud name y crear un upload preset en modo Unsigned. Se entregó la nueva versión de storageServices.js, donde uploadImage sube con FormData a la API de Cloudinary y devuelve secure_url (sin necesidad de instalar paquetes ni convertir la imagen a blob), se quitaron removeImage y la importación de Storage en firebaseConfig.js, se agregaron las variables EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME y EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET, y se explicó la prueba y los errores típicos.
- Qué se usó / modificó / descartó: se usó la nueva uploadImage; se descartó Firebase Storage por el plan Blaze y la función removeImage porque borrar en Cloudinary requiere el API Secret.
- Archivos y commit: src/services/storageServices.js, src/config/firebaseConfig.js, .env (no se sube), .env.example — Hash: 6f49319
- Verificación: se envió un registro de prueba, las imágenes aparecieron en la Media Library de Cloudinary y las URL https://res.cloudinary.com/... quedaron guardadas en el documento de Firestore
- Aprendizaje: Se aprende a integrar cloudinary.

### Entrada #17
- Fecha: 2026-11-10 - 1:38 AM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Implementar un loader que se muestre desde que se toca "Enviar registro" hasta que el registro se crea, respetando los estilos de la app
- Prompt: "como puedo implementar un loader después de dar clic a enviar registro hasta que se logre crear el registro y respetando los estilos que tiene la app?"
- Resumen de la respuesta: Se recomendó aprovechar el estado sending que ya existía en RegistrationTabBar y crear un componente reutilizable LoadingOverlay, basado en un Modal transparente con una tarjeta centrada que usa el ActivityIndicator y los tokens del tema (overlay, surface, radius, shadows y typography). Se indicó montarlo en RegistrationTabBar con visible={sending}, ocultarlo antes de cada Alert (en iOS una alerta no se muestra sobre un Modal abierto), ignorar el botón atrás de Android y agregar el texto "Enviando tu registro..." en español e inglés.
- Qué se usó / modificó / descartó: se usa archivo LoadingOverlay.js y se modifica el componente RegistrationTabBar.js.
- Archivos y commit: src/components/LoadingOverlay.js — Hash: 5eb0e60
- Verificación: se envió un registro de prueba y se comprobó que el loader aparece al tocar el botón, bloquea la pantalla y desaparece al terminar con éxito o con error.
- Aprendizaje: se aprende a implementar un loader al momento de una acción.

### Entrada #18
- Fecha: 2026-11-10 - 1:50 AM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Obtener un plan de implementación con un paso a paso ordenado sobre como realizar el login del conductor teniendo en cuenta el manejo de sesión requerido.
- Prompt: "hazme un plan de implementación para realizar el login, teniendo en cuenta como estoy estructurando mi proyecto, respetando los archivos para los context y los archivos para los hooks, e implementando AsyncStorage en un archivo useAlmacenamiento o el nombre correspondiente dentro de la carpeta hooks y que este use se va a llamar en el context correspondiente, ejem: RegistrationContext, tambien respetando los estilos del theme creado y usando estilos parecidos a las screen ya existentes; Deseo tambien que me orientes y decidas en que lugar debe ir cada archivo creado y demás reglas funcionales que tengas en cuenta a la hora de dar instrucciones."
- Resumen de la respuesta: Se entregó el archivo PLAN_LOGIN.md, que contiene solo el paso a paso de lo que se debe hacer, sin código de la aplicación. Incluye las reglas generales que se deben seguir, el contexto del proyecto, las reglas funcionales acordadas (estados loading, unregistered, loggedOut y loggedIn, resultado del login según los datos y el estado del conductor, el driverId guardado por dispositivo y la sesión aparte), la ubicación de cada archivo nuevo y modificado (useStorage y useSession en hooks, SessionContext en context, LoginScreen, HomeScreen y LoadingScreen en screens, RootNavigator en navigation), la especificación por archivo, las reglas de estilo con los tokens del tema, las claves de traducción en español e inglés, lo que queda fuera de alcance, el orden de implementación con puntos de control.
- Qué se usó / modificó / descartó: el plan se usó como instrucción, más no se agrega al aplicativo.
- Archivos y commit: Ninguno.
- Verificación: se contrastó el plan con las secciones 1, 2 y 3 del PDF del taller y con la estructura actual del repositorio.
- Aprendizaje: cómo dividir una funcionalidad en un plan por archivos y pasos con puntos de control, y por qué la sesión y el driverId se guardan por separado.

### Entrada #19
- Fecha: 2026-11-10 - 1:07 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Definir con qué continuar después del login y obtener un plan de implementación de la pantalla de Inicio con Drawer y mapa, revisando todo lo que pide el taller
- Prompt: "ya termine el login, con que deberíamos seguir por ahora?, dejamos la pantalla de home lista, con su tab bar su drawer y mostrando el mapa?, hazme un plan de implementación para eso teniendo en cuenta todo lo que pide el taller, leelo minusociamente y con cuidado para que no se te escape ningun detalle." — Seguimiento: "sí, haz el plan_home y sí, haz la nueva entrada de la bitacora"
- Resumen de la respuesta: Se releyó el PDF completo y se entregó una tabla de requisitos del taller para el Inicio (mapa, interruptor, seguimiento con limpieza de useEffect, bloqueo por aprobación, Drawer, hooks obligatorios, AsyncStorage y consumo de APIs). Se advirtió que el taller solo usa Tabs para el registro, por lo que no se agrega tab bar en Inicio. Se verificó con la lista de módulos de Expo Go de SDK 58 que @react-native-community/geolocation y @react-native-firebase/messaging no vienen incluidos, mientras que expo-location, react-native-maps, Reanimated, worklets, gesture-handler, webview, Stripe y expo-web-browser sí. Se explicó qué es un development build, por qué la librería de geolocalización no funciona en Expo Go, el flujo de pago de la sección 4 y por qué exige un backend, y que el pago en efectivo no necesita túnel. Con las respuestas de la profesora (se acepta expo-location; la pasarela devuelve aprobado o rechazado por API) se generó el archivo PLAN_HOME.md con el paso a paso, los archivos nuevos y modificados, las reglas de estilo, los textos en español e inglés, lo que queda fuera de alcance y los criterios de prueba.
- Qué se usó / modificó / descartó: el plan se usó como instrucción para Claude Code; se descartó la tab bar en Inicio y la librería de geolocalización de la comunidad en favor de expo-location
- Archivos y commit: DriverDrawerContent.js, useDriverLocation.js, DriverDrawer.js, HomeScreen.js y ProfileScreen.js - Hash: 83940d7
- Aprendizaje: diferencia entre Expo Go y development build, y por qué una librería con código nativo no incluida en Expo Go no funciona, tambien se aprende a como implementar mapa y ubicación en el aplicativo, además de como utilizar e implementar Drawer.

### Entrada #20
- Fecha: 2026-11-11 - 11:49 AM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Definir cómo debe comportarse la disponibilidad del conductor al cambiar de pantalla, revisar el impacto en el resto del proyecto y dejar listas las correcciones del Inicio (reenvío periódico de ubicación, categorías del taller, isAvailable inicial y disponibilidad sin quedar colgada)
- Prompt: "Segun lo que pide el taller, ¿cual crees que la mejor manera de implementar la funcionalidad del cambio de disponiblidad del conductor, en caso de estar disponible dejar disponible si cambia de pantalla o pasar a no disponible si cambia de pantalla?, se debe tener en cuenta tambien que puede afectar o que consecuencias puede tener en el resto de desarrollo del proyecto."
- Resumen de la respuesta: Se revisó el código del Inicio contra el PDF y se redactó un prompt para Claude Code con cuatro correcciones: reescritura periódica de la ubicación aunque el conductor esté quieto, campo isAvailable en false al registrar, y reconciliación y reintentos para que la disponibilidad no quede colgada. Se corrigió la propuesta inicial de apagar la disponibilidad al salir de Inicio, porque la app real de Uber Driver no lo hace. Se recomendó mantener la disponibilidad y el seguimiento al navegar por el Drawer, y detenerlos solo al apagar el interruptor, cerrar sesión, apagar el GPS o perder la aprobación. Se explicó que el seguimiento atado al foco rompería la solicitud entrante y el viaje en curso, que se abren encima de Inicio en el Stack, y las consecuencias en suscripciones, Firestore, la app del pasajero y el estado compartido, con la sugerencia de subirlo a un contexto al llegar al flujo del viaje, de agregar un campo de viaje activo.
- Qué se usó / modificó / descartó: se usa el código recibido para implementar la regla de negocio en la disponibilidad del conductor.
- Archivos y commit: src/screens/HomeScreen.js y src/services/dbServices.js — Hash: 0e997ba
- Verificación: con el interruptor activo y el celular quieto, locationUpdatedAt siguió actualizándose en Firestore; ir a Ganancias no cambió isAvailable.
- Aprendizaje: por qué el foco de una pantalla no debe controlar el seguimiento cuando el flujo del viaje se abre encima, y la diferencia entre limpiar una suscripción al desmontar y al perder el foco.

### Entrada #21
- Fecha: 2026-11-11 - 12:23 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Definir cómo reemplazar el punto azul de ubicación del conductor por un auto que se mueva y gire como en las apps de conductor del mercado
- Prompt: "lee mi rama main, ¿como podemos hacer para que mi punto de ubicación actual (conductor) sea un auto, ya sea icono o imagen .png, .svg, o lo que consideres necesario, y que obviamente cuando se mueva el punto de ubicación sea el auto el que se mueva, tal como funcionan las app de conductor en el mercado real?, no me pases código, solo dime como lo puedo implementar."
- Resumen de la respuesta: Se revisó main y se encontró que el punto azul lo dibuja el propio mapa (showsUserLocation), que no hay marcadores ni imagen de auto, y que el hook de ubicación solo entrega latitud y longitud cada ~7 segundos o 12 metros, sin rumbo. Se explicó cómo implementarlo: un PNG del auto visto desde arriba con versiones @2x y @3x, un Marker de react-native-maps con esa imagen (anclado al centro y plano) quitando showsUserLocation, exponer el rumbo y la velocidad desde el hook usando el rumbo del GPS solo con movimiento y suavizando el giro, animar el marcador entre posiciones pidiendo posiciones más frecuentes solo para la pantalla, y una cámara de seguimiento opcional. Se advirtió separar la frecuencia de la pantalla de la de escritura en Firestore para cuidar la cuota, se propuso un componente DriverMarker reutilizable para el flujo del viaje y se plantearon tres niveles de implementación y la decisión sobre mostrar el auto en movimiento estando No disponible.
- Qué se usó / modificó / descartó: la explicación se usó como guía para implementarlo después con Claude Code: el PNG del auto en tres resoluciones, un componente DriverMarker reutilizable y el rumbo y la velocidad expuestos desde useDriverLocation. Se descartó dejar el punto azul de showsUserLocation y, por ahora, la cámara de seguimiento opcional.
- Archivos y commit: src/components/DriverMarker.js, src/hooks/useDriverLocation.js y src/screens/HomeScreen.js — Hash: 8fa9ba0
- Verificación: se revisó la rama main y se contrastó con la lista de módulos incluidos en Expo Go de SDK 58 (react-native-svg, expo-image, react-native-maps y expo-location)
- Aprendizaje: cómo funciona un marcador personalizado con rumbo y animación en react-native-maps, por qué el rumbo del GPS solo es confiable cuando el vehículo se mueve, y por qué la frecuencia con que se actualiza la pantalla debe ser distinta a la de escritura en la base de datos para cuidar la cuota.

### Entrada #22
- Fecha: 2026-11-11 - 7:12 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Definir y planear la edición del perfil del conductor (qué datos se pueden editar, vehículo, documentos e idioma), investigando qué permiten editar las apps de conductor reales, y dejar listo el plan y el prompt para implementarlo con Claude Code
- Prompt: "hazme el plan para que el profile screen pueda editar los datos necesarios que indica el taller, el vehiculo y los documentos creo, tambien debe poder cambiar el idioma" — Seguimiento 1: "me puedes decir en que parte especificamente el taller dice que los datos personales son editables????????????" — Seguimiento 2: "investiga en una app como uber driver, que datos puede editar un conductor después de que aprueben su cuenta" — Seguimiento 3: "no tiene sentido que se pueda editar el vehiculo aprobado, normalmente estas apps funcionan por vehiculo" — Seguimiento 4: "que carajos es: src/utils/profileMappers.js?" — Seguimiento 5: "es algo parecido al buildDriver?" — Seguimiento 6: "esta bien pero no uses timeStamp, usa la fecha del reloj del celular, no del servidor, tal como funcionaba inicialmente.." — Seguimiento 7: "redáctame el prompt para Claude Code y la entrada de bitácora"
- Resumen de la respuesta: Se entregó un plan (PLAN_PROFILE.md) para el perfil editable. Se aclaró que el taller solo dice "datos editables, vehículo, documentos, idioma y cierre de sesión" en la sección 3 (pantalla 7), sin precisar qué campos, y que asociarlos con los datos personales era una interpretación. Se investigó en fuentes públicas qué permiten editar las apps de conductor reales (teléfono y correo con verificación; foto y documentos con aprobación; el vehículo como un registro aparte; sin una guía oficial para Colombia). Con ese criterio y la observación del integrante de que estas apps funcionan por vehículo, el plan quedó así: vehículo de solo lectura, documentos renovables con foto y vencimiento nuevos, celular y correo editables, el resto de datos personales bloqueados, e idioma que cambia al instante y se guarda en Firestore y en AsyncStorage. Se explicó qué es profileMappers.js y en qué se diferencia de buildDriver.js (conversión en ambas direcciones y solo los campos que cambiaron). Se dejó la regla de usar la hora del celular con Date.now() y fechas como Date, sin Timestamp ni serverTimestamp. Se redactó el prompt para Claude Code.
- Qué se usó / modificó / descartó: el plan se usó como instrucción para Claude Code y se implementó por pasos, con puntos de control en la persistencia del idioma y en la edición de celular y correo. Se descartó la edición del vehículo y la de nombre, foto de perfil, documento, fecha de nacimiento, género y número de licencia. Se modificó una parte del plan durante la implementación: se agregó un tiempo máximo de 10 segundos a la escritura del perfil, porque sin conexión updateDoc no falla sino que queda esperando y el Alert de error nunca aparecería. Se agregó también ProfileInfo.js para mover las vistas InfoRow y PhotoThumb. Se verificó en la documentación de Cloudinary que no queda claro si un preset sin firma permite sobrescribir un archivo, por lo que cada foto renovada se sube con un nombre único.
- Archivos y commit: src/screens/ProfileScreen.js, src/components/profile/ (ProfileSection.js, PersonalSection.js, VehicleSection.js, DocumentsSection.js, LanguageSection.js y ProfileInfo.js), src/hooks/useProfileEdit.js, src/utils/profileMappers.js, src/services/dbServices.js, src/services/storageServices.js, src/context/LanguageContext.js, src/hooks/useStorage.js, src/languages/es.js y en.js — Hash: 5a0df66
- Verificación: se contrastó el plan con la sección 3 del PDF y con el código de main. Se probó en Expo Go: la persistencia del idioma al cerrar y reabrir la app (punto de control 1), la edición y el guardado de celular y correo con sus errores bajo el campo (punto de control 2) y, al final, la renovación de documentos, la etiqueta "Vencido", el cambio de idioma y el cierre de sesión, según los criterios de la sección 10 del plan.
- Aprendizaje: diferencia entre guardar un documento nuevo completo y hacer una actualización parcial con rutas de campo con punto, que solo toca lo que cambió; por qué sin conexión una escritura de Firestore queda en espera y hay que ponerle un tiempo máximo para poder avisar el error; por qué un preset de Cloudinary sin firma obliga a usar un nombre único al renovar una imagen; y por qué un vehículo aprobado no se edita en las apps reales, sino que se registra y se aprueba como uno nuevo.

### Entrada #23
- Fecha: 2026-11-11 - 9:31 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Analizar el avance del proyecto, decidir con qué funcionalidades faltantes continuar y obtener un plan de implementación (prompt para Claude Code) para el tema de las ganancias y el historial de viajes
- Prompt: "Ahora, analiza lo que llevamos de proyecto y dime con que cosas de las faltantes debemos seguir, por ahora tu versión web me dijo que dejaramos la pasarela de pagos y las notificaciones para lo ultimo, por el tema de que pueden generar problemas y no está definido de como trabajarlo con expo go aun. Yo propongo seguir con el tema de la pantalla de ganancias y el historial de viajes, ¿que opinas tu?." — Seguimiento: "sí, hazlo así, crea el PLAN_EARNINGS.md y genera la entrada 23 en @docs/AI_LOG.md , donde especifiques que te pedí un prompt para trabajar con el tema de las earnings; Tambien deseo que tengas en cuenta todos los archivos que la profesa pide en el taller, como los hooks(archivos que empiezan con use en el nombre) a la hora de generar tu plan de implementación."
- Resumen de la respuesta: Se revisó el estado del proyecto: el registro, el login, el Inicio con mapa y auto, y el perfil editable están hechos, mientras que Ganancias e Historial son pantallas provisionales y no existen pricing.js, calculateFare ni la colección trips. Se coincidió en dejar la pasarela de pagos y las notificaciones para el final (la mensajería de Firebase exige un development build), pero se advirtió que Ganancias e Historial dependen de datos de viajes que aún no existen, por lo que primero deben construirse el cálculo de tarifa y el modelo de datos de los viajes. Se entregó el archivo PLAN_EARNINGS.md, un plan para Claude Code solo de la fase A, con una tabla que reparte en fases A, B y C todos los archivos que pide el taller (pricing.js, calculateFare, useDriverLocation, useTripRequests, useEarnings, el contexto del viaje activo, las pantallas del viaje, la pasarela y las notificaciones), las reglas de negocio de tarifa, comisión, periodos y saldo, el modelo de la colección trips, la especificación por archivo (utilidades puras, tripServices, los hooks useEarnings y useTripHistory con useMemo y useCallback, y las pantallas Ganancias, Historial y Detalle con Polyline), viajes de ejemplo solo para desarrollo porque no hay app de pasajero, los textos en español e inglés, lo que queda fuera de alcance, el orden de implementación con dos puntos de control y los criterios de prueba.
- Qué se usó / modificó / descartó: el plan se usó como instrucción para Claude Code y se implementó por pasos, con puntos de control en el cálculo de tarifa y en la pantalla de Ganancias. Se ajustó con decisiones del integrante: la semana empieza el lunes con la hora del celular y filtra por completedAt, los totales de dinero cuentan solo viajes paid, el saldo se calcula con agregaciones de Firestore sobre todos los viajes pagados (todo o nada, con aviso de descuadre y recarga al enfocar, con el gesto de actualizar y al llegar un viaje pagado), la ruta se guarda como polilínea codificada de hasta 100 puntos y el detalle funciona sin ruta. Se descartó un tope de 500 viajes en la consulta de periodos, para que los totales nunca salgan incompletos. Se dejaron para las fases B y C la solicitud entrante, el viaje en curso, useTripRequests, el contexto del viaje activo, la pasarela de pagos y las notificaciones.
- Archivos y commit: PLAN_EARNINGS.md, src/config/pricing.js, src/utils/ (calculateFare.js, formatCurrency.js, dateRanges.js, earningsSummary.js, polyline.js y demoTrips.js), src/services/tripServices.js, src/hooks/ (useEarnings.js y useTripHistory.js), src/components/earnings/ (PeriodCard.js y BalanceCard.js), src/components/history/ (HistoryFilters.js y TripItem.js), src/screens/ (EarningsScreen.js, HistoryScreen.js y TripDetailScreen.js), src/navigation/RootNavigator.js, src/data/options.js, src/languages/es.js y en.js, y una regla de la semana en README.md — Hash: 6be1e74
- Verificación: se contrastó el plan con las secciones 3, 5, 6, 7 y 8 del taller y con la estructura actual del repositorio. El cálculo de tarifa (ejemplo de 8,5 km y 22 min de la sección 5), los periodos con semana desde el lunes, el saldo, la polilínea y la paginación del historial se verificaron con scripts temporales fuera del repositorio (la paginación con una base de datos simulada en memoria). La pantalla de Ganancias con viajes de ejemplo se probó en Expo Go; las pruebas manuales del Historial y del detalle del viaje quedan pendientes.
- Aprendizaje: por qué conviene construir el cálculo de tarifa y el modelo de datos de los viajes antes de las pantallas que los consumen, y por qué los filtros y el orden en las consultas de Firestore exigen índices compuestos.

### Entrada #24
- Fecha: 2026-11-11 - 10:49 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Decidir cómo organizar los servicios de Firestore: fusionar tripServices con dbServices o dejarlos separados y renombrar dbServices a driverServices, ya que solo maneja la colección del conductor
- Prompt: "segun @TALLER_UberClone_Conductor.md me recomiendas que fusionemos el tripServices con dbServices o los dejamos separados y le cambiamos el nombre de dbServices a driverServices ya que solo maneja la colección del driver?, genera entrada 24 para esta pregunta"
- Resumen de la respuesta: Se releyó el taller y se comprobó que no impone nombres ni una estructura para los servicios: solo exige pricing.js, calculateFare, los hooks useDriverLocation, useTripRequests y useEarnings, la colección trips y la bitácora. Se revisó el código: dbServices solo maneja la colección Driver (registro, lectura, escucha en vivo, disponibilidad, ubicación y actualización del perfil) y lo importan seis archivos; tripServices maneja la colección trips (escucha de viajes pagados, página del historial, agregaciones del saldo y viajes de ejemplo). Se recomendó no fusionarlos, porque son colecciones y responsabilidades distintas y la fase B añadirá aceptar, rechazar y escuchar solicitudes, lo que haría crecer un archivo único con lógica sin relación, y renombrar dbServices a driverServices para que los nombres queden simétricos (driverServices, tripServices y storageServices). El cambio solo tocaría los seis imports y se haría aparte, después del commit de la fase A, para que el cambio no mezcle comportamiento nuevo.
- Qué se usó / modificó / descartó: se usó la recomendación: se descartó fusionar los dos servicios y el integrante renombró dbServices.js a driverServices.js. Solo se corrigieron los seis imports afectados, sin cambiar comportamiento ni agregar marcas de código asistido por IA, porque es un cambio mecánico.
- Archivos y commit: src/services/driverServices.js (antes dbServices.js), src/components/profile/DocumentsSection.js, LanguageSection.js y PersonalSection.js, src/components/RegistrationTabBar.js, src/context/SessionContext.js y src/screens/HomeScreen.js — Hash: 6be1e74
- Verificación: se contrastó con el taller (secciones 3, 6 y 7) y con el repositorio: se listaron los imports de dbServices y los exports de cada servicio. Después del renombre se comprobó que no queda ninguna referencia a dbServices en src ni en App.js y que los archivos modificados siguen analizándose sin errores y con sus imports resolviendo.
- Aprendizaje: por qué conviene que cada servicio agrupe una sola colección o responsabilidad y por qué un renombre de archivo debe hacerse en un cambio aparte, sin mezclarlo con funcionalidad nueva.

### Entrada #25
- Fecha: 2026-11-11 - 11:07 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Obtener el plan de implementación PLAN_TRIP.md para desarrollar la siguiente fase del proyecto (fase B: flujo del viaje)
- Prompt: "una cosa, no subas los .md creados por ti al repositorio, por eso elimine PLAN_EARNINGS.md, teniendo en cuenta eso, quiero que generes la próxima entrada la bitacora donde solo menciones que te pido el PLAN_TRIP.md para implementar la siguiente fase, dicho eso, haz el plan para la fase B."
- Seguimiento 1 (cambio de proveedor de rutas): "No voy a usar Google Cloud (requiere tarjeta). Usa OpenRouteService (directions y matrix) para la distancia, la duración y la ruta dibujada, en lugar de Routes API. Mantén la línea recta de respaldo con el aviso cuando falte la llave o falle la API. La llave va en EXPO_PUBLIC_ORS_API_KEY (solo el nombre en .env.example) y la ruta se guarda en el viaje como ya acordamos. Muestra la atribución "© OpenStreetMap contributors" cuando se dibuje una ruta. Deja la integración aislada en un solo servicio para poder cambiar de proveedor (por ejemplo a Google u OSRM) sin tocar el resto. Antes de implementar, consulta la documentación actual de OpenRouteService y dime los límites del plan gratuito."
- Seguimiento 2: "dale con los pasos siguientes, termina el plan del viaje (sin agregar lo de mercado pago todavía)."
- Resumen de la respuesta: Se entregó PLAN_TRIP.md, el plan de la fase B (flujo del viaje), con la cobertura de los archivos que pide el taller, las reglas de transición de estados, el modelo de datos, la especificación por archivo, los textos en español e inglés, el orden de implementación con tres puntos de control y los criterios de prueba. Tras el seguimiento 1 se consultó la documentación de OpenRouteService, se informaron los límites del plan gratuito (Directions 2.000 solicitudes al día y Matrix 500 al día, 40 por minuto en ambos) y que sus términos piden no usar la llave del lado del cliente, y se reescribió el servicio de rutas con OpenRouteService en un solo archivo. Luego se implementó el flujo completo por pasos: máquina de estados, servicio de rutas, adiciones a tripServices con transacciones, hooks useCountdown y useTripRequests, TripContext, y las pantallas de solicitud entrante, viaje en curso con mapa y cobro y resumen en efectivo, además de retomar el viaje al reabrir la app.
- Qué se usó / modificó / descartó: el plan se usó como instrucción para Claude Code y se implementó con puntos de control en la máquina de estados, la solicitud entrante y el viaje completo. Se modificó el plan: se reemplazaron Directions y Distance Matrix de Google por OpenRouteService (Google Cloud exige tarjeta y esas APIs ya no se pueden habilitar en proyectos nuevos), no se hace una segunda llamada de Matrix al aceptar porque Directions ya trae el tiempo de llegada, se guarda como ruta solo el tramo recogida-destino, y la estimación de distancia y duración se guarda en el viaje al aceptar para no perderla si se cierra la app. Se descartó la pasarela de pagos (Mercado Pago o Stripe) y las notificaciones push, que quedan para una fase posterior. Las solicitudes de ejemplo y los botones que simulan la respuesta de la pasarela son herramientas solo para desarrollo.
- Archivos y commit: src/config/tripFlow.js, src/utils/tripStateMachine.js, src/services/routesServices.js, src/services/tripServices.js, src/hooks/ (useCountdown.js, useTripRequests.js y useTrip.js), src/context/TripContext.js, src/navigation/ (navigationRef.js y RootNavigator.js), src/screens/ (IncomingRequestScreen.js, TripInProgressScreen.js, TripSummaryScreen.js, EarningsScreen.js y TripDetailScreen.js), src/components/trip/ (TripMap.js y RouteAttribution.js), src/components/history/TripItem.js, src/utils/polyline.js, src/languages/es.js y en.js, App.js, .env.example y README.md; el plan PLAN_TRIP.md es material de trabajo y no se sube al repositorio — Hash: c36b946
- Verificación: se contrastó el plan con el taller y con el código del repositorio. La máquina de estados, la interpretación de las respuestas de OpenRouteService, el servicio de rutas con red simulada, las transacciones y la paginación con una base de datos simulada en memoria se verificaron con scripts temporales fuera del repositorio. Con la llave real de OpenRouteService se comprobó el recorrido de datos de un viaje completo en efectivo (estimación, dos tramos de ruta, tarifa, ruta guardada de 100 puntos y cobro). Las pantallas, el contexto y la navegación automática están revisados por sintaxis e imports; sus pruebas manuales en Expo Go quedan pendientes.
- Aprendizaje: cómo organizar un plan por fases con puntos de control y qué archivos de trabajo no deben entregarse en el repositorio; cómo modelar un viaje como una máquina de estados con transiciones atómicas (transacciones de Firestore) para no pisar los cambios de otra app; por qué conviene aislar el proveedor de rutas en un solo servicio, y por qué las llaves incluidas en la app (EXPO_PUBLIC_) se pueden ver y exigen tomar precauciones.


### Entrada #26
- Fecha: 2026-11-12 - 1:08 AM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Interpretar la respuesta de la profesora sobre la pasarela de pagos, evaluar si es viable cobrar con Mercado Pago sin túnel ni URL pública y obtener un plan de implementación que no afecte el entorno, o alternativas si no lo fuera
- Prompt: "Con respecto al problema que tenemos de la pasarela de pago que necesita un tunel o una URL a donde devolver la respuesta, le pregunté a la profesora y me respondió lo siguiente: "Con respecto a la pasarela de pagos, se debe de crear el usuario que se le asignan las tarjetas y el te devuelve una respuesta de la API si fue aprobado o rechazado", ¿como lo interpretas?, si lo ves viable y tienes la idea de una solución que no afecte el entorno, ¿puedes generar un plan de implementación?, de lo contrario, que alternativas me ofreces?, genera nueva entrada de la bitacora en base a este mensaje."
- Resumen de la respuesta: Se interpretó que la respuesta de la profesora descarta el webhook y el túnel: el resultado es la respuesta directa de la API de pagos de Mercado Pago (POST /v1/payments, con binary_mode para que solo pueda ser aprobado o rechazado), y el "usuario al que se le asignan las tarjetas" es un comprador de prueba con tarjetas de prueba cuyo titular (APRO, OTHE, FUND...) define el resultado. Se consultó la documentación de Mercado Pago (tarjetas de prueba, creación de pagos, tarjetas guardadas, tokenización desde el servidor y usuarios de prueba) y se juzgó viable con condiciones que solo se pueden comprobar con credenciales reales: que la cuenta de desarrollador se abra sin tarjeta de crédito y que la tokenización desde el servidor funcione con credenciales de prueba. Se propuso un servidor local mínimo con Node y Express en una carpeta aparte (server/), alcanzable por la red Wi-Fi que Expo Go ya exige, que lee el monto del viaje en Firestore, cobra la tarjeta de prueba, actualiza el viaje y responde a la app; sin túnel, sin Cloud Functions ni facturación de Google y sin instalar nada nuevo en la app. Se generó PLAN_PAYMENT.md con una prueba de viabilidad como primer paso y tres puntos de control, y se listaron alternativas (formulario de tarjeta de Mercado Pago en un WebView, Checkout Pro con retorno interceptado, mantener la simulación actual y Stripe en modo de prueba).
- Qué se usó / modificó / descartó: el plan queda como instrucción para una implementación posterior; todavía no se implementa. Se descartó el webhook y el túnel por la respuesta de la profesora, y se dejó la simulación actual de la pasarela como último recurso.
- Archivos y commit: PLAN_PAYMENT.md (material de trabajo, no se sube al repositorio) — Hash: ninguno.
- Verificación: se contrastó con la sección 4 del taller y con el código actual (resumen del viaje, acciones de la pasarela simulada y reglas de Firestore). La documentación de Mercado Pago se consultó en línea; no se pudo confirmar sin credenciales reales la tokenización desde el servidor ni la apertura de la cuenta sin tarjeta, y por eso el primer paso del plan es una prueba de viabilidad.
- Aprendizaje: la diferencia entre recibir el resultado de un pago por webhook (necesita una URL pública) y obtenerlo en la respuesta directa de la API (no la necesita); por qué el servidor debe leer el monto del viaje y no confiar en el que envía el celular; y cómo usar una clave de idempotencia para no cobrar dos veces.


### Entrada #27
- Fecha: 2026-11-12 - 1:28 AM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Entender para qué haría falta un servidor en la integración con Mercado Pago, si es necesario para el proyecto y si conviene usar expo-web-browser para abrir el pago
- Prompt: "no, explicame lo del servidor, no entiendo lo que planteas y no se si sea necesario para mi proyecto, adicional a eso, ¿no deberiamos usar expo-web-browser para la integración con mercado pago?, crea una nueva entrada con esta duda."
- Resumen de la respuesta: Se explicó que el servidor es el programa que guarda el access_token de Mercado Pago, que funciona como la contraseña de la cuenta de cobro y que el taller prohíbe poner en el código de la app, y que por eso cualquier integración (la API de pagos directa o Checkout Pro) necesita que un programa fuera de la app hable con Mercado Pago; la respuesta de la profesora elimina el túnel (no hay webhook), no el servidor. Se aclaró que ese servidor sería un programa pequeño que corre en el computador durante la demostración, sin nube ni costo. Se evaluó expo-web-browser: viene incluido en Expo Go, el taller sugiere abrir Checkout Pro "en react-native-webview o el navegador", la guía móvil de Mercado Pago abre el pago en un navegador interno y regresa a la app con un deep link, y openAuthSessionAsync devuelve la URL cuando el navegador redirige al esquema de la app. Se reconoció que Checkout Pro con expo-web-browser es una lectura tan válida de la respuesta de la profesora como la del plan anterior (cobrar una tarjeta de prueba desde el servidor), y más realista porque los datos de la tarjeta se escriben en la página de Mercado Pago. Quedaron por verificar con una prueba: si Mercado Pago acepta el enlace de retorno de Expo Go (exp://) en back_urls, ya que su guía móvil usa esquemas propios pero su referencia pide https, y si se puede pagar en modo de prueba con una tarjeta de prueba.
- Qué se usó / modificó / descartó: no se implementó nada; es una consulta. El plan PLAN_PAYMENT.md queda pendiente de revisión según la ruta que se elija (Checkout Pro con expo-web-browser o cobro directo desde el servidor).
- Archivos y commit: ninguno.
- Verificación: se consultó la documentación de expo-web-browser (SDK 58) y la de Mercado Pago sobre back_urls, auto_return, la integración móvil con React Native y el retorno por deep link. No se probó ninguna llamada real porque aún no hay credenciales de prueba.
- Aprendizaje: por qué una llave secreta no puede vivir en una app móvil y qué papel cumple un servidor; la diferencia entre abrir un pago en el navegador y cobrar directamente por la API; y que volver a la app tras el pago no es prueba del pago, que debe confirmarse desde el servidor.


### Entrada #28
- Fecha: 2026-11-12 - 1:47 AM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Evaluar si Mercado Pago se puede integrar en Expo Go sin servidor ni cambios complejos, a partir de un ejemplo propio (MPIntegration.js), la documentación de expo-web-browser y la guía de Mercado Pago para Expo Go, e investigar cómo funcionan las preferencias de Checkout Pro
- Prompt: "es que de verdad no quiero añadir cosas raras, revisa el archivo @MPIntegration.js , no podemos integrar mercado pago asi sin tener que crear nada raro y seguir utilizando expo go?, te paso un par de documentaciones tambien para que analices: https://docs.expo.dev/versions/latest/sdk/webbrowser/, https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/mobile-integration/react-native-expo-go, tambien si puedes, investiga el tema de las preferencias con checkout en mercado pago. crea una entrada para esto."
- Seguimiento 1: "espera, en @TALLER_UberClone_Conductor.md la profesora menciona un tema de backend"
- Seguimiento 2: "sí, reescribe plan y corrige entrada, tambien quiero que me digas exactamente que requieres de mi en mercado pago, debo crear una cuenta developer y registrar un comercio o que debo hacer?"
- Resumen de la respuesta: Se revisó MPIntegration.js, que crea la preferencia de pago desde la app con el access_token leído de un config.json y devuelve el init_point, y se encontraron tres problemas: el token queda dentro de la app (el taller exige que no esté en el código de la app), la moneda está como "$" en lugar de "COP", y faltan back_urls, auto_return y external_reference, sin los cuales no se puede volver a la app ni saber a qué viaje corresponde el pago. Se analizó la guía de Mercado Pago para Expo Go: la preferencia se crea en el backend, el pago se abre con expo-web-browser (openBrowserAsync), se vuelve a la app con un deep link configurado en back_urls (no se permiten localhost ni 127.0.0.1) y el enlace exp:// solo se usa para probar el deep link; la guía no explica cómo leer el estado del pago. De la documentación de expo-web-browser se confirmó que viene incluido en Expo Go y que openAuthSessionAsync devuelve la URL de retorno (type success), mientras que openBrowserAsync en Android solo informa que abrió. Sobre las preferencias de Checkout Pro: se crean con POST /checkout/preferences por cada pago; llevan items (título, cantidad, precio unitario y moneda), y opcionalmente back_urls (success, pending y failure), auto_return, external_reference, binary_mode, notification_url, vencimiento y restricciones de medios de pago; la respuesta trae id, init_point (producción) y sandbox_init_point; al volver, Mercado Pago agrega payment_id, status y external_reference a la URL, y el retorno no debe ser la única confirmación del pago. Se concluyó que es técnicamente posible hacerlo sin servidor y en Expo Go (agregando expo-web-browser, que se instala con npx expo install), pero la primera valoración quedó incompleta: dejar el token de prueba dentro de la app no solo rompe la regla de seguridad del taller (el access_token nunca va en el código de la app), sino que además omite el backend que la sección 4 del taller incluye en su flujo de pago obligatorio (la app envía el tripId al backend, el backend crea la preferencia con la llave secreta y actualiza el viaje). Tras la observación del integrante de que el taller menciona el backend, se corrigió la conclusión: se conserva un backend mínimo (Node.js y Express, que corre en el computador y la app alcanza por la red Wi-Fi), con Checkout Pro y expo-web-browser, sin webhook ni túnel.
- Qué se usó / modificó / descartó: no se implementó nada; es una consulta. Se descartó la integración sin servidor (con el token de prueba dentro de la app) por apartarse del backend obligatorio del taller, y PLAN_PAYMENT.md se reescribió con un backend Express local, Checkout Pro y expo-web-browser. También se consultó la documentación de Mercado Pago sobre cómo crear la aplicación, las credenciales de prueba, las cuentas de prueba y las tarjetas de prueba para indicarle al integrante qué debe hacer en su cuenta.
- Archivos y commit: ninguno. MPIntegration.js es un ejemplo de referencia sin seguimiento en la raíz del proyecto y no debe subirse.
- Verificación: se leyó MPIntegration.js y se consultó la documentación de expo-web-browser, la guía de Mercado Pago para Expo Go, la referencia de creación de preferencias y la configuración de back_urls. No se probó ninguna llamada real porque aún no hay credenciales de prueba, y quedaron sin comprobar si Mercado Pago acepta un enlace exp:// en back_urls y si la cuenta de vendedor necesita validación previa.
- Aprendizaje: qué es una preferencia de pago y cómo se relaciona con el init_point, las back_urls y la referencia externa; la diferencia entre openBrowserAsync y openAuthSessionAsync; y que simplificar una integración dejando un token secreto en la app es una decisión con costos que debe quedar documentada.


### Entrada #29
- Fecha: 2026-11-12 - 2:58 AM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Cambiar la pasarela de pagos de Mercado Pago a Stripe, indicar dónde van las llaves de prueba, reescribir el plan de implementación e implementar el cobro con tarjeta: servidor local de pagos, hoja de pago de Stripe en la app y reemplazo de Mercado Pago por Stripe en los viajes, el saldo y los datos de ejemplo
- Prompt: "no voy a usar mercado pago, voy a usar stripe, ya tengo las key, solo dime donde las pongo y en base a eso, reescribe el plan"
- Seguimiento: "sí, crea la entrada 29 y empieza con el paso 1" / "ya puse las dos key en el lugar correspondientes, no se que carajos es EXPO_PUBLIC_PAYMENTS_API_URL ni de donde se saca, sigue con tu paso 2" / "cual es la direccion exacta que debo poner en el navegador de mi cel" / "ya abrió y responde {"ok":true}, sigue con el paso 3" / "metodo al azar entre mercadopago y stripe?, yo no voy a usar mercadopago para nada, no se porque sigues forzando usarlo en algo..." / "sí, quita mercado pago de todo, se debe reemplazar por stripe" / "no, dejalo asi con ese nombre por ahora, sigue con el plan" / "sí actualiza bitacora, escribir en readme y hacer commit"
- Resumen de la respuesta: Se indicó dónde va cada llave: la clave secreta (sk_test_) solo en server/.env, la clave publicable (pk_test_) y la dirección del servidor en el .env de la raíz con prefijo EXPO_PUBLIC_, y que ninguna llave se comparte por el chat. Se consultó la documentación de Expo y de Stripe: @stripe/stripe-react-native viene incluido en Expo Go (sin Apple Pay ni Google Pay), COP es una moneda de dos decimales (19.200 COP se envía como 1920000) y una tarjeta rechazada deja la hoja de pago abierta, por lo que el estado Rechazado se deduce del último error del PaymentIntent. Se reescribió PLAN_PAYMENT.md con un servidor mínimo en Node y Express (el taller exige un backend), sin webhook ni túnel. La prueba de viabilidad con la llave real confirmó que COP funciona y que la API de la cuenta pide allowed_payment_method_types en lugar de payment_method_types. Se implementó el servidor (config, cliente de Stripe, acceso a Firestore, casos de uso y rutas /health, /payments/intent y /payments/confirm): el monto sale siempre del viaje en Firestore, cada intento usa una clave de idempotencia y el servidor verifica con Stripe que el cobro sea de ese viaje, por ese monto y en COP antes de marcarlo como pagado. En la app se agregaron paymentsServices, el botón Pagar con tarjeta (hoja de pago de Stripe), las acciones del contexto del viaje, los cambios del resumen y los textos en español e inglés. Se explicó qué es EXPO_PUBLIC_PAYMENTS_API_URL (la dirección del servidor en el computador, que el servidor imprime al arrancar). Se corrigió un error del asistente: el botón de solicitud simulada con pasarela creaba siempre viajes con mercadopago, no al azar como se había dicho. Por pedido del integrante se quitó Mercado Pago de los viajes, el saldo, los datos de ejemplo y el filtro del Historial, y se reemplazó por Stripe. Se escribió en el README la sección de cobro con tarjeta.
- Qué se usó / modificó / descartó: se descartó Mercado Pago y se usa Stripe en modo de prueba con un servidor local (el taller exige un backend). Se dejó sin cambios, por decisión del integrante, el nombre del campo "Correo de la cuenta de Mercado Pago" del registro y del perfil del conductor. Los viajes de ejemplo antiguos con mercadopago ya no cuentan en el saldo; se reemplazan quitando y volviendo a cargar los viajes de ejemplo.
- Archivos y commit: server/ (package.json, .env.example, scripts/probe.js, src/config.js, src/stripeClient.js, src/tripsStore.js, src/payments.js, src/index.js), src/services/paymentsServices.js, src/components/trip/PayWithCardButton.js, src/context/TripContext.js, src/screens/TripSummaryScreen.js, src/screens/EarningsScreen.js, src/services/tripServices.js, src/utils/earningsSummary.js, src/utils/demoTrips.js, src/data/options.js, src/languages/es.js y en.js, .env.example, package.json, package-lock.json, README.md y docs/AI_LOG.md; PLAN_PAYMENT.md es material de trabajo y no se sube al repositorio — Hash: 77e7709
- Verificación: la prueba de viabilidad se ejecutó contra Stripe con la llave de prueba del integrante (cuenta válida, cobro en COP, aprobado y rechazado). La lógica del servidor se verificó con Stripe y Firestore simulados (cobro aprobado, rechazado, pendiente, ya pagado, viaje en estado o método incorrecto, monto, moneda o viaje distintos, entradas inválidas, caídas de Stripe o Firestore, errores HTTP y que no se filtren llaves) y con una comprobación real que no escribió en Firestore (la misma clave de idempotencia devuelve el mismo cobro, un pago de prueba queda aprobado y la lectura de Firestore funciona). El integrante comprobó que /health responde desde el navegador del celular. Los archivos de la app se revisaron solo por sintaxis; la prueba completa en Expo Go con las tarjetas de prueba (punto de control 3) no se había ejecutado al momento del commit.
- Aprendizaje: la diferencia entre una llave secreta y una publicable y dónde puede vivir cada una; por qué el resultado de un pago no debe aceptarse solo porque lo diga la app, sino consultarse a la pasarela; y que las monedas con dos decimales se envían en su unidad mínima.


### Entrada #30
- Fecha: 2026-11-12 - 12:05 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Aclarar qué menciona y qué exige realmente el taller (TALLER_UberClone_Conductor.md) sobre las notificaciones
- Prompt: "Hola!, en @TALLER_UberClone_Conductor.md que es el archivo donde indica todo lo que pide este aplicativo, ¿que se menciona y se exige realmente sobre el tema de las notificaciones?, haz una entrada en @docs/AI_LOG.md"
- Resumen de la respuesta: Se leyó el taller completo. Las notificaciones se mencionan en un solo lugar, la sección 7 (APIs gratuitas adicionales): se pide sumar tres servicios gratuitos obligatorios (notificaciones, tiempo real y geolocalización) y la tabla marca Firebase Cloud Messaging (@react-native-firebase/messaging) como "Obligatoria", con el uso "Notificar nuevas solicitudes con la app en segundo plano". No se mencionan en la descripción general, en las pantallas del conductor, en los estados del viaje, en los hooks obligatorios, en la pasarela ni en los entregables (el video no pide mostrarlas). Lo único exigido, entonces, es avisar al conductor de una solicitud nueva cuando la app está en segundo plano; el taller no define el contenido del aviso, qué pasa al tocarlo, ni avisos de otros eventos (viaje cancelado, pago confirmado). Se señaló que la pantalla de solicitud entrante ya cubre el caso con la app abierta (temporizador de 15 segundos), que la librería nombrada requiere una compilación de desarrollo y no funciona en Expo Go, y que expo-notifications sería la alternativa propia de Expo si se quiere seguir en Expo Go, aunque el taller nombra Firebase Cloud Messaging.
- Qué se usó / modificó / descartó: no se implementó nada; es una consulta.
- Archivos y commit: ninguno.
- Verificación: se revisó el texto del taller buscando todas las apariciones de notificaciones, notificar y Firebase Cloud Messaging. No se probó código.
- Aprendizaje: el taller exige notificaciones solo para el caso de la app en segundo plano; conviene decidir con la profesora o el equipo si se usa Firebase Cloud Messaging con una compilación de desarrollo o expo-notifications, y dejar esa decisión documentada.


### Entrada #31
- Fecha: 2026-11-12 - 12:30 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Implementar las notificaciones de solicitudes nuevas con expo-notifications, hacer el plan de implementación y explicar cómo se usan desde Expo Go y qué afectaciones tienen en la aplicación
- Prompt: "implementa las notificaciones con expo-notifications, haz un plan de implementación y explicame en palabras sencillas como se puede utilizar desde expo go y que afectaciones va a tener en la aplicación. Genera una entrada con esto."
- Seguimiento 1: "borra @PLAN_NOTIFICATIONS.md si ya lo utilizaste, ahora, el @TALLER_UberClone_Conductor.md en algun momento menciona o exige alertas con sonido y vibración al llegar una solicitud?"
- Seguimiento 2: "porque con la app abierta no suena ni vibra?, si me llega una solicitud como conductor debería sonar igual o no?" / "sí, implementalo"
- Resumen de la respuesta: Según la documentación de expo-notifications (SDK 58), en Expo Go las notificaciones locales (las que programa la propia app) funcionan, pero las remotas (push) no están disponibles en Android desde el SDK 53 y exigen una compilación de desarrollo. Por eso se implementaron notificaciones locales: la app ya escucha las solicitudes en tiempo real con Firestore y, cuando llega una nueva con la app fuera de primer plano, pide al teléfono que muestre el aviso. Se creó el servicio notificationServices (manejador, canal de Android, permiso y avisos), el hook useRequestNotifications (pide el permiso al quedar disponible, avisa una vez por solicitud y limpia los avisos al volver a la app) y se conectó en TripContext, con textos en español e inglés. Al tocar el aviso no hace falta código: TripContext ya lleva a la solicitud entrante. Se confirmó que el taller no menciona sonido ni vibración (solo notificar solicitudes con la app en segundo plano). Se reconoció que dejar la app abierta sin sonido ni vibración fue una decisión equivocada del asistente: el conductor tiene 15 segundos para responder y puede estar mirando otra pantalla. Se corrigió: con la app abierta ahora vibra (Vibration de React Native, sin dependencias) y suena (el manejador tiene shouldPlaySound activo, sin mostrar el aviso); fuera de la app se muestra la notificación con sonido y vibración del canal de Android. Afectaciones: se agrega una dependencia, el conductor verá un permiso al ponerse disponible (si lo rechaza, todo sigue igual sin avisos), con la app abierta ahora suena y vibra al llegar una solicitud y el resto del flujo del viaje no se modifica. Límite: si el sistema congela la app en segundo plano (iOS en unos 30 segundos, Android tras un rato o con ahorro de batería), la escucha se detiene y no llega el aviso; el aviso garantizado con la app cerrada requiere push remoto y una compilación de desarrollo, que quedó como fase opcional.
- Qué se usó / modificó / descartó: se usó expo-notifications con avisos locales. Se descartó Firebase Cloud Messaging (no funciona en Expo Go) y el push remoto (fase opcional). La instalación de las dependencias de lint que agregó expo lint se revirtió, y no se agregó el plugin de expo-notifications a app.json porque Expo Go no lo necesita.
- Archivos y commit: src/services/notificationServices.js, src/hooks/useRequestNotifications.js, src/context/TripContext.js, src/languages/es.js y en.js, package.json, package-lock.json y docs/AI_LOG.md; PLAN_NOTIFICATIONS.md es material de trabajo y no se sube al repositorio — Hash: pendiente (aún sin commit)
- Verificación: el sonido con la app abierta, la vibración y el comportamiento con el teléfono en silencio no se probaron en un dispositivo. Se consultó la documentación de expo-notifications (SDK 58) y se revisó la sintaxis de los archivos nuevos. No se ejecutó lint ni la prueba en Expo Go con el teléfono (pasos de PLAN_NOTIFICATIONS.md), que quedan pendientes.
- Aprendizaje: la diferencia entre una notificación local y una remota, por qué Expo Go solo permite la primera y que una notificación local depende de que la app siga viva en segundo plano.


### Entrada #32
- Fecha: 2026-11-12 - 12:34 PM
- Integrante: Sergio Stiven Motato
- Herramienta: Claude
- Objetivo: Saber cómo probar el movimiento del auto y el flujo completo del viaje sin la app del pasajero y sin salir de casa, usando el emulador de Android Studio, y también para grabar el video de la entrega
- Prompt: "para probar que al auto se mueva con android studio, como debería hacerlo?, dame un paso a paso?, ya que tengo instalado android studio en mi equipo pero no se como utilizarlo, esto tambien me serviria para hacer el video de explicación del proyecto que se pide en @TALLER_UberClone_Conductor.md y asi no tenemos que implementar más código, ¿o te sigue pareciendo mejor opción crear un botón de simular movimiento?"
- Consultas previas que llevaron a esta: "¿si aun no tenemos conectada la app del pasajero, como podemos probar por ahora el tema de una solicitud entrante y aceptarla/rechazarla y todo lo que va con el viaje?, lo otro es, ¿como puedo probar realmente que el auto llegue al destino, ya que si salgo de mi casa pierdo la conexión de Wi-Fi y el PC y Expo Go deben estar en la misma conexión?, ¿o lo de completar un viaje no está en el alcance o como se simula/prueba?, ya que no he podido lograr que probando la app el auto se mueva porque no puedo salir de casa." / "y mover el auto gastaria tokens o solicitudes de una API?, no quiero que me llegue un cobro por uso"
- Resumen de la respuesta: Se revisó el código y se encontró que ya existen botones de desarrollo en Ganancias para crear solicitudes simuladas cerca de la ubicación del conductor, que los botones "Pasajero a bordo" y "Finalizar viaje" no comprueban cercanía y que la tarifa sale de la ruta de OpenRouteService y no del GPS, por lo que el viaje se puede completar sin moverse; el auto solo se mueve con el GPS real. Mover el auto no consume ninguna API de pago: el GPS y el mapa son locales, la ubicación se guarda en Firestore cada 10 segundos solo si el conductor está Disponible (cupo gratuito del plan Spark) y las rutas se piden una vez por tramo. Se explicó el paso a paso para crear un emulador con Google Play en Android Studio, abrir la app con npx expo start y la tecla a, y mover el auto con Extended controls, Location y Routes (Play route). Se recomendó el emulador como suficiente para el video, porque el taller pide el flujo completo y no que el auto se mueva solo, y dejar el botón de simular movimiento (que seguiría la ruta exacta del viaje) como opción si el trazado manual resulta incómodo.
- Qué se usó / modificó / descartó: no se implementó nada; es una consulta. Se descartó por ahora el botón de simular movimiento. Quedan sin comprobar que el servidor de pagos sea alcanzable desde el emulador con la IP del computador y los nombres exactos de los menús del emulador.
- Archivos y commit: ninguno.
- Verificación: se revisaron en el código los botones de simulación, la escritura de ubicación, el uso de OpenRouteService y las pantallas del viaje. No se probó el emulador.
- Aprendizaje: un viaje se puede completar sin mover el auto porque la tarifa sale de la ruta; el GPS solo afecta el dibujo del auto; y un emulador con ubicación simulada es una forma repetible de grabar la demostración.
