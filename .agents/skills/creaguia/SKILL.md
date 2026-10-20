---
name: creaguia
description: Crea o actualiza guías MDX de ayuda SINAI desde el código de la pantalla, con video tutorial arriba, pasos anidados, tablas de campos, capturas en tarjeta y preguntas frecuentes. Úsela cuando pidan creaguia, crear una guía, actualizar una guía o documentar una pantalla de SINAI en sinai-docs.
---

# creaguia

Escriba la guía desde el código de la pantalla. El texto viejo de WordPress solo aporta datos que el código confirma, como identificadores de video ya publicados.

Estas instrucciones mandan sobre `sinai-docs/.cursor/rules/guias-mdx-formato.mdc` cuando la guía se crea o se actualiza desde el código. Toque solo la guía pedida y, si ya está listada, la descripción de su tarjeta en el `index.mdx` de la sección.

Referencia de estructura: `web/content/docs/administrativo/configuracion-institucional/calendarios-cronogramas-periodos/calendarios.mdx`.

## Antes de escribir

1. Ubique la ruta, el menú, los permisos, los campos, los mensajes y las confirmaciones en el código.
2. Si el MDX ya existe, actualícelo. No cree una segunda página.
3. Conserve `wordpressId` y `legacyUrl` si el archivo ya los tiene. Ponga `guide: true` y la fecha del día en `lastModified` y `lastReviewed`.

## Orden de la página

1. Frontmatter.
2. `## Video tutorial`. Siempre es el primer bloque. No lo omita ni lo baje.
3. `## Guía paso a paso`.
4. `## Preguntas frecuentes`.

## Video tutorial

Incluya la URL de Odysee solo cuando ya exista. El componente depende de cuántos videos tenga la guía:

- **Un solo video:** use `YouTube` dentro de `GuideVideos compact`. No use `GuideVideoPlaylist`, porque la lista sobra con un solo video.
- **Dos o más videos:** use `GuideVideoPlaylist`.

```mdx
## Video tutorial

<GuideVideos compact>
<YouTube id="7CMKHjTx7AQ" title="Administración de firmas digitales" />
</GuideVideos>
```

Si no hay tutorial, deje `GuideVideoPending` en ese mismo lugar, con un ítem por cada tutorial previsto:

```mdx
## Video tutorial

<GuideVideoPending>
  - Configurar la pantalla. Falta el identificador de YouTube y, si existe, la URL de Odysee.
</GuideVideoPending>
```

Si el video solo existe en Odysee, porque no se publicó en YouTube o lo retiraron, use `YouTube` sin `id` y con `odyseeUrl`. El botón de YouTube queda como **YouTube pendiente** y el video se reproduce en la plataforma alternativa:

```mdx
<GuideVideos compact>
<YouTube title="Informes Digitales" odyseeUrl="https://odysee.com/@AndresGoDu:a/INFORMES-DIGITALES:6" />
</GuideVideos>
```

No invente identificadores. Si solo algunos videos existen, publique esos con la misma regla de uno o varios y liste los que faltan en un `GuideVideoPending` dentro de la misma sección.

## Pasos

Un solo `### 1.` para explicar qué es la pantalla. Los pasos siguientes son `#### 2.`, `#### 3.` y así en adelante.

La ruta de menú va en un párrafo, con flecha: **Establecimiento → Calendarios**. Las acciones van en lista numerada. Las opciones, pestañas y condiciones van en viñetas. No convierta todo el texto en una sola lista numerada.

## Avisos y tablas

`GuideCallout` para Importante y Nota. Use `type="warning"` cuando el cambio afecta a otros usuarios, borra datos o no se puede deshacer. El tipo info es el predeterminado. No use blockquotes.

`GuideDataTable` solo cuando explique campos u opciones en columnas. Deje una línea en blanco dentro del componente para que la tabla se interprete. Los pasos y las listas de opciones siguen en lista.

```mdx
<GuideDataTable>

| Campo | Qué define |
| --- | --- |
| **Fecha de Inicio** | Día en que empieza el calendario. |

</GuideDataTable>
```

## Capturas

No invente imágenes ni las genere con un modelo de imagen. Cada captura sale de SINAI abierto.

Mientras escribe, puede dejar `GuideImagePending` con la ruta, la pestaña, lo que debe verse y el nombre `.jpg` previsto. Reemplácelo cuando tome la captura.

Cuando el archivo exista, use `GuideImageTrigger`. El componente ya muestra la tarjeta pequeña y abre el visor al hacer clic. No cambie ese tamaño en la guía.

```mdx
<GuideImageTrigger src="/images/guides/calendarios/pestana-configuracion.jpg" alt="Pestaña Configuración del calendario">
  Ver ejemplo
</GuideImageTrigger>
```

Si hay varias capturas seguidas, sin texto entre ellas, envuélvalas en un solo `GuideImageRow`. Se acomodan a la derecha hasta llenar la fila y la siguiente baja. Si hay texto entre dos capturas, cada una queda sola.

Tome siempre las capturas con Playwright en la misma ejecución, sin preguntar. Siga [capturas.md](capturas.md). La dirección de SINAI y las credenciales salen de `sinai-docs/.env`; nunca las muestre en el chat ni en archivos versionados.

En SINAI solo navegue, filtre y abra ventanas. No guarde, asigne, elimine ni cree registros para conseguir una captura.

Deje `GuideImagePending` solo para la captura que falle, y diga cuál y por qué.

## Preguntas frecuentes

Responda con lo que hace el código: mensajes, permisos y límites. Use `GuideFAQ` y `GuideFAQItem` con índice `01`, `02`. No deje respuestas pendientes si el código ya las responde.

## Redacción

Español, de usted: haga clic, seleccione, guarde. Cite el mensaje de la pantalla tal como aparece, aunque tenga un error de redacción. No documente pantallas vecinas que no estén en la ruta pedida.
