---
name: creaguia
description: Crea o actualiza guías MDX de ayuda SINAI desde el código de la pantalla, con video tutorial arriba, pasos anidados, tablas de campos, marcadores de captura y preguntas frecuentes. Úsela cuando pidan creaguia, crear una guía, actualizar una guía o documentar una pantalla de SINAI en sinai-docs.
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

Tome las capturas usted mismo en la IE de pruebas **SISTEMAS INFORMATICOS EMPRESARIALES**, con `scripts/shoot.py`, siguiendo [capturas.md](capturas.md). No invente imágenes ni las genere con un modelo de imagen.

Primero deje en cada lugar un `GuideImagePending` con la ruta, la pestaña o ventana, lo que debe verse y el nombre `.jpg` previsto. Luego tome la captura y reemplace el marcador. Si la IE de pruebas no tiene los datos o la configuración que la captura necesita, deje el marcador y explique el motivo en el chat.

Si la guía ya tiene un `GuideImageTrigger` y el código confirma que la pantalla no cambió, consérvelo. Si la pantalla cambió, reemplácelo por un `GuideImagePending`.

Cuando la persona entregue el archivo, use `GuideImageTrigger`. El componente ya muestra la tarjeta pequeña y abre el visor al hacer clic. No cambie ese tamaño en la guía.

```mdx
<GuideImageTrigger src="/images/guides/calendarios/pestana-configuracion.jpg" alt="Pestaña Configuración del calendario">
  Ver ejemplo
</GuideImageTrigger>
```

Si hay varias capturas seguidas, sin texto entre ellas, envuélvalas en un solo `GuideImageRow`. Se acomodan a la derecha hasta llenar la fila y la siguiente baja. Si hay texto entre dos capturas, cada una queda sola.

Al terminar, liste en el chat las capturas que tomó y las que quedaron pendientes, con su nombre de archivo, la carpeta `public/images/guides/<guia>/` y el motivo de cada pendiente.

## Preguntas frecuentes

Responda con lo que hace el código: mensajes, permisos y límites. Use `GuideFAQ` y `GuideFAQItem` con índice `01`, `02`. No deje respuestas pendientes si el código ya las responde.

## Redacción

Español, de usted: haga clic, seleccione, guarde. Cite el mensaje de la pantalla tal como aparece, aunque tenga un error de redacción. No documente pantallas vecinas que no estén en la ruta pedida.
