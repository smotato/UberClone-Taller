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
- Archivos y commit: src/theme/theme.js — (completar hash)
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
- Archivos y commit: src/context/LanguageContext.js — (completar hash)
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
- Archivos y commit: src/components/forms/SelectField.js, src/components/forms/DateField.js, src/data/options.js — (completar hash)
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
- Archivos y commit: src/screens/PersonalDataScreen.js — (completar hash)
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
- Archivos y commit: src/components/form/PhotoField.js — (completar hash)
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
- Archivos y commit: src/components/forms/CheckboxField.js — (completar hash)
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
- Archivos y commit: src/components/forms/PhotoField.js — (completar hash)
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