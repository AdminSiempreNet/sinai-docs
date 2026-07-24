# Sistema visual de SINAI · Base de conocimiento

## Intención

- **Personas:** administrativos, docentes y estudiantes, incluyendo personas con poca familiaridad digital.
- **Tarea principal:** encontrar un proceso, comprenderlo y ejecutarlo con seguridad.
- **Sensación:** un manual de acompañamiento institucional: claro, sereno y orientado a una acción por vez.

## Dirección

- **Firma:** el recorrido visible de la guía: resumen breve, video disponible primero, pasos jerárquicos y capturas ampliables.
- **Evitar:** paneles recargados, bordes fuertes, color decorativo y títulos duplicados.
- **Jerarquía:** la guía y su acción actual lideran; navegación, metadatos y notas se mantienen en un segundo plano.

## Color y roles

- Administrativo: `#011AC7`.
- Docente: `#00AA01`.
- Estudiante: `#D98E00` en modo claro y `#F1DC55` en modo oscuro para conservar contraste.
- El color de rol comunica selección, enlace, foco y progreso; no se usa como decoración masiva.
- Fondos y texto usan los tokens de Fumadocs (`fd-*`) para conservar modo claro y oscuro.

## Espaciado y profundidad

- Unidad base: 4 px.
- Controles y resúmenes: 12–16 px de relleno.
- Bloques de guía: 24–32 px entre grupos; 48 px antes de una sección principal.
- Profundidad: bordes suaves y una sombra discreta para tarjetas y capturas; en oscuro prima el borde sobre la sombra.
- Radios: 8 px en controles, 12 px en tarjetas, 16 px en contenedores de video y modal.

## Patrones reutilizables

- Guía: `guide: true`; orden `Video tutorial → Guía paso a paso → temas/pasos`.
- Subtítulo principal: una oración breve orientada al resultado que se construye a partir del propósito real de la guía; no repite el título, no menciona el videotutorial y no usa fragmentos truncados del contenido.
- Redacción: tono institucional en segunda persona formal (`ingrese`, `seleccione`, `haga clic`), instrucciones directas, botones y rutas destacados, y listas numeradas para acciones secuenciales.
- Temas y pasos: encabezados Markdown simples y listas; evitar círculos numerados grandes o tarjetas decorativas que compitan con el procedimiento.
- Espacio del video: `GuideVideos compact` en todas las guías para mantener una separación mínima entre “Video tutorial” y el reproductor.
- Resumen: `GuideSummary` solo cuando exista información real sobre objetivo, requisito o duración.
- Video: `YouTube` con `odyseeUrl` cuando esté disponible; si no, mostrar “Odysee pendiente”.
- Captura: imagen local, texto alternativo descriptivo, foco visible, modal, Escape para cerrar y retorno del foco al origen.
- Galería de capturas: `GuideGallery` inicia siempre abierta para que las imágenes sean visibles al cargar la guía.
- Índice derecho: toma `guideToc` del frontmatter cuando sea necesario; de lo contrario, usa la jerarquía de encabezados.

## Navegación y accesibilidad

- Las ramas principales inician cerradas; la rama que contiene la página activa conserva el color del rol aun contraída.
- Objetivos táctiles mínimos de 44 px para controles de modal.
- Todo contenido interactivo debe tener estados de foco visibles, teclado y texto alternativo.
- Respetar `prefers-reduced-motion` en animaciones nuevas.
