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
- Archivos y commit: AI_LOG.md y README.md
- Verificación: el enlace a docs/AI_LOG.md abre en GitHub.
- Aprendizaje: Se aprende a llamar otro archivo .md desde un archivo .md.

