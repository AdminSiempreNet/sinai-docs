# Capturas de creaguia

Ejecute esto solo después de que la persona acepte tomar las capturas y entregue la dirección de SINAI.

El mismo script sirve en Cursor y en la terminal. Quien no use Cursor lo ejecuta desde `sinai-docs/web`.

## Manifiesto

Escríbalo en `sinai-docs/web/.local/<guia>-shots.json`. Esa carpeta no se sube al repositorio. La sesión tampoco.

```json
{
  "outDir": "public/images/guides/calendarios",
  "shots": [
    {
      "file": "pestana-configuracion.jpg",
      "path": "/Admin/Establec/Calendario/Calendario.aspx",
      "waitFor": "Configuración",
      "selector": ""
    }
  ]
}
```

`file` termina en `.jpg`. `path` es la ruta de la pantalla, con `?Tab=` cuando el código abre esa pestaña por query. `waitFor` es un texto visible que confirma que la pantalla cargó. `selector` es opcional: si viene vacío, la captura es la ventana de 1440×900.

## Ejecución

Desde `sinai-docs/web`:

```bash
pnpm capture:guide -- --url https://direccion-de-sinai --manifest .local/calendarios-shots.json
```

Si falta Playwright, instálelo en `sinai-docs/web` y vuelva a ejecutar:

```bash
pnpm add -D playwright
pnpm exec playwright install chromium
```

La primera vez el script abre una ventana, espera el inicio de sesión en la institución y pide Enter en la terminal. La sesión queda en `web/.local/sinai-capture-session.json`. Para repetir el inicio de sesión, agregue `--login`.

Cada archivo sale a doble resolución, en JPG con calidad 90.

## Después de capturar

Sustituya cada `GuideImagePending` capturada por `GuideImageTrigger` con la ruta pública `/images/guides/<guia>/<archivo>.jpg`. Agrupe las que queden seguidas en `GuideImageRow`.

Si una captura falla, deje su `GuideImagePending` y diga cuál no se pudo tomar.
