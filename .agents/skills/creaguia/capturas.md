# Capturas de creaguia

Ejecute esto en cada guía, sin pedir permiso. Las capturas siempre se toman con Playwright; el navegador integrado de Cursor no sirve porque recorta la vista.

El mismo script sirve en Cursor y en la terminal. Quien no use Cursor lo ejecuta desde `sinai-docs/web`.

## Credenciales

El script lee `sinai-docs/.env`:

- `SINAI_URL`: dirección de la institución.
- `SINAI_USUARIO_<ROL>` y `SINAI_PASSWORD_<ROL>`, con los roles `ADMIN`, `DOCENTE`, `SUPER` y `ESTUDIANTE`.

Use el rol que corresponde a la pantalla: `admin` para el módulo administrativo y `docente` para el módulo docente. No muestre ni copie esos valores.

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

Cuando la pantalla necesita interacción antes de la captura, agregue `steps`. Cada paso hace una sola cosa y SINAI termina de cargar antes del siguiente:

```json
"steps": [
  { "click": "Asignación por Docente" },
  { "select": "select[id$='ListaDocenteLst']", "index": 1 },
  { "clickSelector": "a[id$='AbrirModalAsignacionBtn']", "wait": 800 },
  { "waitFor": "Agregar asignación" }
]
```

`click` busca un texto visible. `clickSelector` usa un selector CSS. `select` elige por `index` o por `label`. `wait` agrega una pausa en milisegundos. Si el clic falla porque el menú del encabezado de SINAI tapa el botón, agregue `"dispatch": true` al paso de `click` o `clickSelector`. Si un paso falla, esa captura se omite y el script sigue con las demás.

Elija filtros que muestren datos, como un grupo con estudiantes, para que la captura no salga vacía. Antes de reemplazar las marcas, abra cada imagen y confirme que muestra lo que dice el texto.

## Ejecución

Desde `sinai-docs/web`:

```bash
pnpm capture:guide -- --role admin --manifest .local/calendarios-shots.json
```

Con `--role`, el script inicia sesión solo, sin ventana, con el usuario de ese rol. `--url` es opcional y reemplaza a `SINAI_URL`.

Si falta Playwright, instálelo en `sinai-docs/web` y vuelva a ejecutar:

```bash
pnpm add -D playwright
pnpm exec playwright install chromium
```

La sesión de cada rol queda en `web/.local/sinai-session-<rol>.json`. Para repetir el inicio de sesión, agregue `--login`.

Si el inicio de sesión automático falla, por ejemplo porque la institución pide un paso adicional, ejecute sin `--role` y con `--url`. El script abre una ventana para que la persona inicie sesión y continúa cuando aparece el texto de `--login-wait-for "Establecimiento"`. No use "Salir": está oculto en un menú.

Cada archivo sale a doble resolución, en JPG con calidad 90.

## Después de capturar

Sustituya cada `GuideImagePending` capturada por `GuideImageTrigger` con la ruta pública `/images/guides/<guia>/<archivo>.jpg`. Agrupe las que queden seguidas en `GuideImageRow`.

Si una captura falla, deje su `GuideImagePending` y diga cuál no se pudo tomar.
