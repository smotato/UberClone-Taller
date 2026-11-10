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
- Archivos y commit: src/components/LoadingOverlay.js — Hash: [completar]
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