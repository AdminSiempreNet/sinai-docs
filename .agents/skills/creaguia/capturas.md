# Capturas de creaguia

Las capturas se toman en SINAI con un navegador automatizado, en la IE de pruebas **SISTEMAS INFORMATICOS EMPRESARIALES**. La guía primero deja el lugar listo para cada una con un marcador.

## Dónde dejar un marcador

Deje un `GuideImagePending` donde una captura ayude a ubicar algo que el texto no basta para mostrar:

- La pantalla principal, al explicar qué es.
- Cada ventana, panel o menú que se abre con un botón.
- Las pestañas que cambian el contenido de la pantalla.

No deje marcadores para cada paso. Una captura por pantalla, ventana o panel es suficiente.

## Qué escribir en el marcador

Escriba una sola línea con cuatro datos: la ruta de la pantalla, la pestaña o ventana, lo que debe verse y el nombre del archivo previsto.

```mdx
<GuideImagePending>
  Main.aspx/Evaluacion/Comportamiento/General, ventana Asignar descriptores con un descriptor elegido y estudiantes seleccionados. Archivo: asignar-descriptores.jpg
</GuideImagePending>
```

El nombre del archivo va en minúsculas, con guiones y termina en `.jpg`. La carpeta es `public/images/guides/<guia>/`, con el nombre de la guía.

Indique filtros que muestren datos, por ejemplo un grupo con estudiantes, para que la captura no salga vacía.

## Cómo tomar las capturas

Requisitos, una sola vez: `pip install -r scripts/requirements.txt` y `python -m playwright install chromium`, en un entorno virtual fuera del repositorio. Las credenciales están en `sinai-docs/.env`, que no se sube a git. No las imprima ni las copie a otro archivo.

`scripts/sinai_session.py` inicia sesión con el usuario super, deja seleccionada la IE de pruebas, elige el rol y entra con el primer usuario de ese rol. `scripts/shoot.py` recibe un JSON con pasos y deja las capturas en una carpeta. Sus pasos están documentados al inicio del archivo.

```json
[
 {"rol": "Rector"},
 {"goto": "Main.aspx/Evaluacion/Comportamiento/General"},
 {"search": ["#idGrupo"], "rows": "input.planilla-comportamiento__nota", "min": 6},
 {"lock_writes": true},
 {"click": "[title='Autollenar Valoraciones']"},
 {"fill": ".modal input.planilla-comportamiento__nota", "text": "S"},
 {"shot": "asignar-valoracion.jpg"}
]
```

- **Rol:** Rector para las guías administrativas, Docente para las de docente (menú verde) y Estudiante para las de estudiante. Cada rol va en una ejecución aparte, porque después de entrar como un usuario no se puede volver al super en la misma sesión.
- **Ruta:** entre por la URL de la pantalla con `goto`, aunque no esté en el menú. Para la captura de acceso, navegue con los clics del menú para que se vea el submenú activo.
- **Datos:** use `search` o `select_data` para encontrar grupos con estudiantes. Lea el componente de la pantalla para obtener los selectores exactos; no los adivine.
- **Solo lectura:** el script bloquea siempre los botones que guardan (Guardar, Eliminar, Enviar, Asignar, Generar…) y las peticiones `PUT`, `DELETE` y `PATCH`. Después de `lock_writes` bloquea además toda petición que no sea `GET`. A partir de ese paso puede llenar campos para que la captura muestre datos de ejemplo, que nunca se guardan.
- **Acciones con GET:** algunas acciones escriben con una petición `GET`; por ejemplo, Enviar valoraciones de centros de interés llama a `Valoracion/Asignar`. `lock_writes` no las detiene. Antes de poner `force_ok` en un clic, lea en el código qué hace el botón: solo úselo en botones que cambian la pantalla sin llamar al servidor, como Asignar en las ventanas de la planilla de comportamiento.
- **Formato:** 1366 × 768 por defecto. Use `viewport` para una pantalla larga y recorte con Pillow cuando el marcador pide solo una parte.

## Cuando tenga las capturas

Abra cada imagen y confirme que muestra lo que dice el marcador. Luego sustituya el `GuideImagePending` por `GuideImageTrigger` con la ruta pública `/images/guides/<guia>/<archivo>.jpg`. Agrupe las que queden seguidas en `GuideImageRow`.

Si la IE de pruebas no tiene los datos o la configuración que la captura necesita, no cree datos ni cambie la configuración: deje el marcador y explique el motivo en el chat.
