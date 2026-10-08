# SINAI Docs — patrones de interfaz

## Dirección

- Las guías son un entorno de lectura y capacitación: la interfaz debe sentirse clara, calma e institucional.
- Los problemas de contenido externo se comunican como continuidad del aprendizaje, no como un error técnico expuesto al usuario.

## Patrón: respaldo YouTube → versión alternativa

- El componente reutilizable es `web/components/youtube.tsx`.
- YouTube es la plataforma inicial cuando está disponible; la copia alojada en Odysee se presenta en interfaz como “Alternativo”.
- Al recibir los errores 100 (retirado/privado) o 101/150 (incrustación bloqueada) del reproductor de YouTube, cambiar automáticamente a la versión alternativa.
- Si no existe una versión alternativa, reemplazar el reproductor por un estado vacío dentro de la misma proporción 16:9: icono de aviso, título corto y explicación en lenguaje simple. Nunca dejar un iframe negro o un error del proveedor.
- Cuando el respaldo se activa, mantener visibles ambos estados: botón de YouTube deshabilitado con “YouTube no disponible” y mensaje breve que explica que se está mostrando la versión alternativa.
- La comprobación de servidor usa `GET /api/videos/youtube-status?id=...&odyseeUrl=...`, con caché de 24 horas. Si existe `YOUTUBE_API_KEY`, consulta la Data API; si no, usa la comprobación pública oEmbed. También verifica la URL de Odysee. Un fallo temporal queda como `unknown`; una ausencia confirmada deja el tutorial en estado pendiente.

## Detalles visuales

- Mantener la tarjeta de vídeo con borde suave, fondo `bg-fd-card`, radio `rounded-2xl` y sombra discreta existente.
- Acciones de plataforma: botones de al menos 36 px de alto, texto de 12 px semibold, separación de 8 px y respuesta táctil `active:scale-[0.97]`.
- Reservar los colores de marca para identificar plataformas; los avisos y la superficie de error usan tokens Fumadocs (`fd-muted`, `fd-muted-foreground`, `fd-foreground`) para funcionar en tema claro y oscuro.

## Patrón: vistas agrupadoras de sección

- Aplicar en páginas índice que reúnen rutas relacionadas; no en guías de procedimiento individuales.
- El encabezado presenta título y subtítulo mediante una barra vertical del color del rol, un divisor sutil y una descripción introductoria amplia. La descripción siempre es texto normal, nunca un recuadro o alerta.
- La descripción explica qué encontrará la persona, qué puede resolver y cómo se organizan las opciones. Debe usar un tamaño ligeramente mayor que el cuerpo normal y un interlineado generoso.
- Después del encabezado, usar un bloque independiente de ancho completo titulado **Contenido de esta sección**. Los bloques siguientes continúan verticalmente con el mismo ritmo.
- En escritorio, las opciones se presentan en una cuadrícula de tres columnas; por debajo de `900px`, en una columna.
- Cada tarjeta completa es un enlace semántico. Mantener una altura compacta, borde suave, radio cercano a `0.85rem`, estados discretos de hover y foco con el color del rol.
- Cada tarjeta debe tener una ilustración propia, pertinente a su proceso. No repetir la misma imagen base entre opciones. Las ilustraciones toman automáticamente el azul de Administrativo o el verde de Docente y se mantienen completas, sin recortes.
- `web/components/section-hub.tsx` concentra la implementación reutilizable; lee las opciones de las páginas agrupadoras internas para evitar repetir el componente o el estilo en cada archivo MDX.
