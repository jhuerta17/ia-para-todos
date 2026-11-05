<p>
  <img src="website/public/images/brand/ia-para-todos-symbol-color.png" alt="Símbolo de IA Para Todos" width="88">
</p>

# IA Para Todos

> **Inteligencia Artificial para Todos. Un Futuro Sin Barreras.**

Una iniciativa comunitaria que hace accesible la educación en inteligencia artificial y alfabetización digital para todas las personas, comenzando con las comunidades hispanohablantes y desatendidas.

**[Read in English](README.md)**

## Visita el proyecto

**[Abrir el sitio](https://ia-para-todos-jh.netlify.app/)** ·
**[Crear cuenta de estudiante](https://ia-para-todos-jh.netlify.app/portal/sign-up)** ·
**[Iniciar sesión](https://ia-para-todos-jh.netlify.app/portal/sign-in)** ·
**[Agenda de talleres](https://ia-para-todos-jh.netlify.app/agenda)** ·
[English site](https://ia-para-todos-jh.netlify.app/en)

### Para jueces: crea tu propia cuenta gratuita

1. Abre **Crear cuenta de estudiante**. El control ES/EN cambia el idioma.
2. Escribe tu nombre, un correo propio que puedas consultar y una contraseña de al menos ocho caracteres.
3. Confirma que tienes **18 años o más** y acepta el aviso de cuenta y privacidad.
   Esto no autoriza por sí solo la práctica con IA.
4. Revisa tu correo y spam. Abre el enlace de confirmación para volver al portal.
   Si hace falta, entra desde **Iniciar sesión**; ahí también puedes recuperar tu contraseña.
5. Explora reservas y preparación opcional. Para entrar en **Mis cursos** o
   **Práctica guardada**, lee y acepta el consentimiento adicional de aprendizaje y
   Meta Contributor. Meta puede usar las preguntas y respuestas para entrenar sus modelos.
   Practica solo con ejemplos inventados.

No publicamos contraseñas compartidas. Ser estudiante no da acceso administrativo.
El registro necesita la opción pública de Netlify Identity, `PORTAL_SIGNUP_ENABLED=true`
y un lugar dentro del **piloto de 25 cuentas**. Si está cerrado o lleno, puede aparecer
un error genérico; pide al responsable revisar la disponibilidad. Ver el formulario
no demuestra que el registro ni los correos de confirmación funcionen en ese momento.

### Recorrido breve

- **Descubrir:** consulta agenda y detalles. Las reservas ocupan lugares reales;
  reserva solo si piensas asistir. Puedes reservar como invitado sin crear cuenta.
- **Prepararte:** visita `/preparacion`; el avance se guarda si tienes sesión iniciada.
- **Aprender:** entra en `/portal/courses`, inscríbete y completa una lección.
- **Practicar:** entra en `/portal/chats`, usa un caso inventado y revisa si la respuesta
  es en vivo o de ejemplo. Las conversaciones vencen 30 días después de crearse.
- **Administrar tu cuenta:** `/portal/account` permite solicitar eliminación; también
  puedes borrar conversaciones individuales. Eliminar Identity requiere mantenimiento
  programado; solicitarlo no demuestra que todas las copias del proveedor ya se borraron.
- **Administración:** `/admin/sign-in` necesita el rol `admin`, otorgado por separado.
  Los datos del modo demo son simulados; no necesitas ese acceso para evaluar el portal.

Consulta el [recorrido de cinco minutos](docs/demo/demo-script.md), las
[conexiones y seguridad](docs/architecture.md) y la
[lista de verificación actual](docs/readiness.md). Estos documentos distinguen la
implementación de las pruebas realizadas en producción.

## Conexiones y seguridad

| Servicio | Función y datos |
| --- | --- |
| Angular y Netlify | Sitio bilingüe e interfaces de estudiantes y administración; páginas públicas prerenderizadas. |
| Netlify Functions | Autorización, reservas, progreso, práctica guardada, llamadas de IA y mantenimiento en el servidor. |
| Netlify Identity | Credenciales, confirmación y recuperación por correo, nombre y roles. |
| Neon PostgreSQL | Progreso y chats privados, consentimiento, reservas, cuotas, eliminación y estado de pruebas de WhatsApp. |
| Meta Muse | Tutor: `muse-spark-1.3-contributor`; borradores de bandeja: `muse-spark-1.3`; difusión: Contributor. |
| Netlify Forms | Solicitudes públicas de participación, colaboración y boletín; bandeja con token en el servidor. |
| Netlify Blobs | Interruptor compartido de IA en vivo; no guarda conversaciones ni cuotas. |
| WhatsApp Cloud API | Integración de prueba limitada a destinatarios aprobados; consulta la misma agenda publicada. |

El servidor verifica identidad y propiedad de registros; exige correo confirmado y
consentimiento adicional para aprendizaje y práctica. Las funciones administrativas
verifican el rol `admin`. Los cambios de portal/reservas comprueban el mismo origen;
la IA usa una lista explícita de orígenes HTTPS. Secretos solo en el servidor,
TLS con certificados verificados hacia la base remota y respuestas privadas `no-store`.

La práctica del estudiante limita **20 solicitudes por día UTC** y usa un registro
compartido de **$25 por mes UTC**, con precios configurados. Los límites del tutor
público son por instancia y no garantizan un tope global de gasto. La IA pausada,
los límites o fallos pueden producir respuestas de ejemplo etiquetadas. No son
una auditoría independiente ni cubren todos los costos de proveedores y plataforma.

Se eliminan patrones comunes de correo/teléfono, pero no es anonimización completa.
Borrar un chat local no revierte el uso de Contributor para entrenamiento. Guarda en
privado el enlace de reserva: cualquiera que lo tenga puede administrarla. Más detalles:
[seguridad](SECURITY.md) y [privacidad](docs/safety/privacy-guidelines.md).

## Misión

Reducir la brecha digital mediante talleres gratuitos, accesibles y prácticos que ayuden a las comunidades a comprender y aprovechar la inteligencia artificial y las nuevas tecnologías.

**Mission (English):** *To reduce the digital divide through free, accessible, and practical workshops that empower communities to understand and use artificial intelligence and emerging technologies.*

## Enfoque comunitario

Nuestro enfoque son las **personas adultas hispanohablantes con poca exposición a la inteligencia artificial**, en particular las comunidades mexicoamericanas y otras comunidades hispanas en el área de **Dallas–Fort Worth, Texas**.

Buscamos colaborar con sedes comunitarias de confianza: iglesias, bibliotecas públicas, centros comunitarios, escuelas, organizaciones sin fines de lucro y programas de desarrollo laboral. Una sede publicada no acredita una alianza formal.

IA Para Todos es una iniciativa educativa comunitaria, **inclusiva y no sectaria**: la participación nunca depende de la afiliación o creencia religiosa, y los talleres no contienen contenido religioso.

## Programas educativos

El programa principal es una serie de talleres gratuitos para principiantes — también llamada **IA Para Todos** — comenzando con:

**"IA Para Todos: Descubre el Poder de la Inteligencia Artificial"**
*Un taller gratuito en español para aprender a usar la inteligencia artificial en tu vida diaria, trabajo y familia.*

Talleres introductorios (90–120 minutos cada uno, diseñados para teléfonos inteligentes, sin herramientas de pago):

1. **Introducción a la Inteligencia Artificial** — qué es la IA, qué puede y no puede hacer, primera demostración práctica.
2. **IA para la Vida Diaria** — mensajes, traducción, horarios, tareas cotidianas, uso seguro.
3. **IA para el Trabajo y los Negocios** — comunicación profesional, currículums, productividad, conceptos de negocio.
4. **IA para Padres y Familias** — cómo usan la IA los jóvenes, desinformación, privacidad, seguridad digital.

Cada taller incluye orientación sobre precisión de la IA, privacidad, seguridad y verificación independiente. Los planes de estudio viven en [`workshops/`](workshops/).

## Estado del proyecto

El repositorio incluye la implementación del sitio, portales de estudiantes y
administración, reservas, materiales y conexiones con Meta Muse. Una migración
revisada define próximas sesiones confirmadas; la agenda en vivo determina qué
está publicado y disponible. Publicar fechas no demuestra talleres ya realizados.

Usamos **iniciativa comunitaria**: este repositorio no acredita registro legal como
organización sin fines de lucro, alianzas formales, talleres impartidos, recaudación
ni resultados medidos. Los datos administrativos demo son simulados. Materiales y
planes siguen pendientes de validación en talleres reales.

Ver [pendientes y verificación](docs/readiness.md), [plan piloto](docs/roadmap/90-day-pilot.md)
e [índice de documentación](docs/README.md).

## Estructura del repositorio

```text
ia-para-todos/
├── README.md / README.es.md   # Descripción bilingüe del proyecto (estás aquí)
├── CONTRIBUTING.md             # Cómo contribuir
├── docs/                       # Documentación (organización, estrategia, sin fines
│                               # de lucro, ruta, operaciones, seguridad, marca, demo)
├── website/                    # Sitio bilingüe, portal admin, tutor IA, funciones
├── workshops/                  # Planes de estudio de los talleres
├── templates/                  # Plantillas de difusión, retroalimentación
├── scripts/                    # Automatización del repositorio (bootstrap, validación)
└── .github/                    # Plantillas y flujos de trabajo
```

## Aviso de privacidad

Este es un **repositorio público** — trata cada archivo como permanentemente público. Nunca incluimos registros de participantes, información de contacto, respuestas de encuestas, credenciales, secretos ni detalles confidenciales de alianzas. Los marcadores como `contact@example.org` son solo ejemplos, nunca información de contacto real.

## Cómo contribuir

Tus contribuciones son bienvenidas. Lee primero [CONTRIBUTING.md](CONTRIBUTING.md). Aceptamos contribuciones en español e inglés; el contenido para participantes es español primero.

## Licencia

[LICENSE](LICENSE) describe una dirección **propuesta, pendiente de aprobación final**, CC BY 4.0 / MIT. Los recursos de terceros conservan sus propias licencias; revisa los avisos del tema, fuentes e imágenes antes de reutilizarlos.
