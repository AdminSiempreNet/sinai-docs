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
