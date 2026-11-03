"""Copia capturas al sitio de ayuda y reemplaza los GuideImagePending, en orden, por GuideImageTrigger.

Cada guía lleva una lista con un elemento por marcador: (archivo, alt) o None para dejar el marcador pendiente.
Los GuideImageTrigger seguidos, sin texto entre ellos, se agrupan en un GuideImageRow.
"""
import re, shutil, sys
from pathlib import Path

CAP = Path(sys.argv[1])
WEB = Path(r"C:\Users\andyg\Desktop\SIEMPRE.NET\SINAI\sinai-docs\web")
DOCS = WEB / "content/docs"

PLAN = {
    "administrativo/configuracion-institucional/calendarios-cronogramas-periodos/calendarios.mdx": ("calendarios", "calendarios", [
        ("acceso-calendarios.jpg", "Menú Establecimiento con la opción Calendarios"),
        ("pestana-configuracion.jpg", "Pestaña Configuración del calendario con los bloques de configuración y Guardar Cambios"),
        ("cronograma-general.jpg", "Pestaña Periodos con el cronograma general, porcentajes, fechas y la leyenda Abierto y Cerrado"),
        ("crear-nuevo-calendario.jpg", "Pestaña Crear Nuevo Calendario con el año propuesto y las fechas"),
    ]),
    "administrativo/convivencia-escolar/calificacion-comportamiento/evaluacion-de-comportamiento.mdx": ("comportamiento-admin", "evaluacion-de-comportamiento", [
        ("planilla.jpg", "Planilla Evaluación de la Convivencia Escolar con grupo y periodo seleccionados"),
        ("seleccion.jpg", "Menú de selección con la opción TODOS y los desempeños de la escala"),
        ("asignar-valoracion.jpg", "Ventana Asignar Valoración con la valoración y los estudiantes seleccionados"),
        ("asignar-descriptores.jpg", "Ventana Asignar descriptores con un descriptor elegido y los estudiantes seleccionados"),
        None,
        ("escalas.jpg", "Panel Escalas con la escala de comportamiento y la escala general"),
        ("configuracion.jpg", "Panel Configuraciones de la planilla de convivencia escolar"),
    ]),
    "docente/convivencia-y-observador/evaluacion-del-comportamiento.mdx": ("comportamiento-docente", "evaluacion-del-comportamiento", [
        ("planilla.jpg", "Planilla Evaluación de la Convivencia Escolar del docente con grupo y periodo"),
        ("seleccion.jpg", "Menú de selección con la opción TODOS y los desempeños de la escala"),
        ("asignar-valoracion.jpg", "Ventana Asignar Valoración con la valoración y los estudiantes seleccionados"),
        ("asignar-descriptores.jpg", "Ventana Asignar descriptores con un descriptor elegido"),
        None,
    ]),
    "administrativo/herramientas/centros-de-interes/matriculas.mdx": ("matriculas", "centros-de-interes-matriculas", [
        ("acceso-matriculas.jpg", "Menú Evaluación, submenú Centros de Interés y panel Opciones con Matrículas"),
        None,
        None,
    ]),
    "administrativo/_archivo/capacitacion-documentada--establecimiento--institucion--mallas-curriculares-y-planes-de-area.mdx": ("mallas", "mallas-curriculares-y-planes-de-area", [
        ("pantalla-mallas-curriculares-y-planes-de-area.jpg", "Pantalla Mallas Curriculares y Planes de Área con el formulario de carga y los documentos disponibles"),
        ("documentos-disponibles-malla-y-plan.jpg", "Tabla Documentos disponibles con archivos cargados y asignaturas sin archivo"),
    ]),
}

PENDING = re.compile(r"<GuideImagePending>.*?</GuideImagePending>", re.S)
TRIGGER = r'<GuideImageTrigger src="[^"]+" alt="[^"]*">\s*Ver ejemplo\s*</GuideImageTrigger>'

for mdx, (src_dir, folder, items) in PLAN.items():
    path = DOCS / mdx
    text = path.read_text(encoding="utf8")
    found = PENDING.findall(text)
    if len(found) != len(items):
        print(f"OMITIDA {mdx}: {len(found)} marcadores y {len(items)} capturas en el plan")
        continue
    dest = WEB / "public/images/guides" / folder
    dest.mkdir(parents=True, exist_ok=True)
    it = iter(items)

    def repl(m):
        item = next(it)
        if item is None:
            return m.group(0)
        name, alt = item
        shutil.copy2(CAP / src_dir / name, dest / name)
        return f'<GuideImageTrigger src="/images/guides/{folder}/{name}" alt="{alt}">\n  Ver ejemplo\n</GuideImageTrigger>'

    text = PENDING.sub(repl, text)
    # Agrupa triggers consecutivos (solo espacios entre ellos) que no estén ya en un GuideImageRow
    text = re.sub(rf"(?<!<GuideImageRow>\n)((?:{TRIGGER})(?:\s*{TRIGGER})+)",
                  lambda m: "<GuideImageRow>\n" + re.sub(r"\n\s*\n", "\n", m.group(1)) + "\n</GuideImageRow>", text)
    path.write_text(text, encoding="utf8")
    done = sum(1 for x in items if x)
    print(f"OK {mdx}: {done} capturas, {len(items) - done} pendientes -> public/images/guides/{folder}/")
