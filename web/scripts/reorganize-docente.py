"""One-time migration; every previous guide URL is recorded before moving files."""
from pathlib import Path
import json
import re

WEB = Path(__file__).resolve().parents[1]
ROOT = WEB / 'content/docs/docente'

SECTIONS = [
    ('primeros-pasos', 'Primeros pasos', 'Acceda a SINAI y mantenga actualizado su perfil.'),
    ('mi-labor-docente', 'Mi labor docente', 'Consulte su asignación y horario, y documente su labor pedagógica.'),
    ('estudiantes', 'Estudiantes', 'Consulte sus grupos y la información de sus estudiantes.'),
    ('planeacion-y-curriculo', 'Planeación y currículo', 'Organice clases, mallas curriculares, logros y actividades del periodo.'),
    ('registro-de-calificaciones', 'Registro de calificaciones', 'Registre y consulte las valoraciones académicas de sus estudiantes.'),
    ('asistencia-y-seguimiento', 'Asistencia y seguimiento', 'Registre inasistencias, consulte consolidados y gestione excusas.'),
    ('convivencia-y-observador', 'Convivencia y observador', 'Documente el comportamiento, las anotaciones y el seguimiento del estudiante.'),
    ('cierre-academico-periodo', 'Cierre académico (periodo)', 'Consulte refuerzos, observaciones e informes al finalizar el periodo.'),
    ('cierre-de-ano', 'Cierre de año', 'Revise notas finales, ajustes y recuperaciones de cierre anual.'),
    ('aula-virtual', 'Aula virtual', 'Gestione tareas, usuarios y calificaciones del aula virtual.'),
    ('herramientas', 'Herramientas', 'Consulte mensajes, reuniones, informes y utilidades de apoyo.'),
    ('sinai-desktop', 'SINAI Desktop', 'Instale la aplicación y consulte sus procesos y opciones de sincronización.'),
]

# Each list defines the reading order. A third value changes only the page title.
GROUPS = {
    'primeros-pasos': [
        ('como-ingresar-a-sinai', 'ingresar-a-sinai'),
        ('d-recuperar-contrasena', 'recuperar-contrasena'),
        ('como-actualizar-foto-de-perfil', 'actualizar-perfil'),
    ],
    'mi-labor-docente': [
        ('mi-asignacion', 'mi-asignacion'), ('mi-horario', 'mi-horario'),
        ('d-diario-pedagogico', 'diario-pedagogico'),
        ('d-actividades-complementarias', 'actividades-complementarias'),
    ],
    'estudiantes': [
        ('buscar-estudiante', 'buscar-estudiante'), ('lista-por-grupos', 'listas-por-grupo'),
        ('d-cargar-fotografias', 'cargar-fotografias'), ('d-estudiantes-piar', 'estudiantes-piar'),
    ],
    'planeacion-y-curriculo': [
        ('curriculo-adjunto', 'planeacion-de-clases'),
        ('d-estandares', 'estandares'), ('d-banco-de-logros', 'banco-de-logros'),
        ('registro-de-desempenos-logros', 'registro-de-desempenos'),
        ('d-logros-periodo', 'logros-del-periodo', 'Logros del periodo'),
        ('actividades-del-periodo', 'actividades-del-periodo'),
        ('copiar-actividades', 'copiar-planeacion'),
    ],
    'planeacion-y-curriculo/mallas-curriculares': [
        ('curriculo-estandar', 'crear-y-organizar', 'Crear y organizar mallas curriculares'),
        ('mallas-curriculares', 'consultar-y-descargar', 'Consultar y descargar mallas institucionales'),
    ],
    'registro-de-calificaciones': [
        ('registro-de-calificaciones-en-linea', 'registro-en-linea'),
        ('calificacion-definitiva-directa', 'calificacion-definitiva-directa'),
        ('d-planilla-de-calificaciones-excel', 'planilla-excel'),
        ('d-detallado-individual', 'detallado-individual'),
    ],
    'asistencia-y-seguimiento': [('d-excusas', 'excusas')],
    'asistencia-y-seguimiento/inasistencias': [
        ('registro-detallado-de-inasistencias', 'registro-detallado'),
        ('registro-de-inasistencia-por-dia', 'registro-por-dia'),
        ('consultar-o-modificar-inasistencia', 'consultar-o-modificar'),
        ('d-registro-consolidado-de-inasistencias', 'consolidado'),
    ],
    'convivencia-y-observador': [
        ('registro-de-anotaciones', 'anotaciones'),
        ('evaluacion-del-comportamiento', 'evaluacion-del-comportamiento'),
    ],
    'convivencia-y-observador/ficha-observador': [
        ('nueva-version-ficha-observador-2', 'nueva-version'),
        ('caracterizacion', 'caracterizacion'),
        ('valoracion-por-grupo-e-individual', 'valoracion'),
        ('d-registro-de-seguimiento', 'registro-de-seguimiento'),
        ('informes-ficha-observado', 'informes', 'Informes del observador'),
    ],
    'cierre-academico-periodo': [
        ('d-refuerzos', 'refuerzos'), ('observaciones', 'observaciones'),
        ('d-informes-evaluacion', 'informes-de-evaluacion', 'Informes de evaluación'),
        ('d-cuadro-de-honor', 'cuadro-de-honor'),
    ],
    'cierre-de-ano': [
        ('d-notas-finales', 'notas-finales'), ('d-ajuste-de-nota-final', 'ajuste-de-nota-final'),
        ('recuperaciones-finales', 'recuperaciones-finales'),
    ],
    'aula-virtual': [
        ('d-tareas-en-linea', 'tareas-en-linea'), ('aula-virtual-chamilo', 'chamilo'),
        ('gestion-de-usuarios-chamilo', 'gestion-de-usuarios'), ('notas-aula-virtual', 'notas'),
    ],
    'herramientas': [
        ('d-mensajes', 'mensajes'), ('d-gestion-de-reuniones', 'reuniones'),
        ('autoevaluacion-2', 'autoevaluacion'), ('d-informes-digitales', 'informes-digitales'),
        ('informes-herramientas', 'informes', 'Informes de herramientas'),
        ('back-up', 'copia-de-seguridad', 'Copia de seguridad'),
        ('inconsistencias-2', 'inconsistencias'),
    ],
}

SUBGROUPS = {
    'planeacion-y-curriculo/mallas-curriculares': ('Mallas curriculares', 'Cree unidades curriculares o consulte las mallas publicadas por su institución.'),
    'asistencia-y-seguimiento/inasistencias': ('Inasistencias', 'Registre y consulte la asistencia por día o de forma detallada.'),
    'convivencia-y-observador/ficha-observador': ('Ficha observador', 'Consulte la caracterización, valoración y seguimiento del estudiante.'),
}

DESKTOP = {
    'inicio-desktop': ('inicio-y-configuracion', 'Inicio y configuración', 'Instale SINAI Desktop y consulte su institución, asignación, autorizaciones y listados.'),
    'planeacion-desktop': ('planeacion', 'Planeación', 'Gestione actividades y descriptores desde SINAI Desktop.'),
    'evaluacion-desktop': ('evaluacion', 'Evaluación', 'Consulte las planillas de calificaciones y las escalas de desempeño.'),
    'seguimiento-desktop': ('asistencia', 'Asistencia', 'Registre las inasistencias desde SINAI Desktop.'),
    'herramientas-desktop': ('herramientas-y-sincronizacion', 'Herramientas y sincronización', 'Sincronice la información y envíe los datos a SINAI en línea.'),
}

# These six pages have no instructions or media: only placeholder FAQs.
MERGED = {
    'registro-de-actividades': 'actividades-del-periodo',
    'registro-de-actividades-2': 'actividades-del-periodo',
    'registro-de-calificaciones-en-linea-2': 'registro-de-calificaciones-en-linea',
    'registro-de-calificaciones-en-linea-3': 'registro-de-calificaciones-en-linea',
    'planeacion-de-clases': 'curriculo-adjunto',
    'planeacion-o-asignacion-de-desempenos-al-periodo': 'd-logros-periodo',
}

def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def safe(path):
    result = path.resolve()
    assert result.is_relative_to(ROOT.resolve()), result
    return result

def field(text, name):
    match = re.search(r'^' + name + r':\s*"(.*)"\s*$', text, re.M)
    return match[1] if match else ''

def main():
    sources = sorted(p for p in ROOT.rglob('*.mdx') if p.name != 'index.mdx')
    by_stem = {p.stem: p for p in sources}
    assert len(sources) == len(by_stem) == 78, 'Unexpected source inventory; stop before editing.'
    metadata = list(ROOT.rglob('meta.json'))
    original = {p: p.read_text(encoding='utf-8') for p in sources}

    for old_group, (slug, title, description) in DESKTOP.items():
        group = f'sinai-desktop/{slug}'
        SUBGROUPS[group] = (title, description)
        meta = ROOT / 'capacitacion-documentada/app-sinai-desktop' / old_group / 'meta.json'
        GROUPS[group] = [(stem, stem) for stem in json.loads(meta.read_text(encoding='utf-8'))['pages']]

    moves = {}
    titles = {}
    menus = {}
    for group, entries in GROUPS.items():
        menus[group] = [entry[1] for entry in entries]
        for stem, slug, *title in entries:
            assert stem not in moves
            moves[stem] = f'{group}/{slug}'
            if title:
                titles[stem] = title[0]
    assert set(moves) | set(MERGED) == set(by_stem)
    assert not set(moves) & set(MERGED)
    assert len(set(moves.values())) == len(moves)

    for stem in MERGED:
        body = original[by_stem[stem]].split('---', 2)[2].strip()
        assert body.startswith('## Preguntas frecuentes') and 'Respuesta pendiente de completar.' in body
        assert not any(token in body for token in ('<YouTube', '<GuideImage', '## Guía', '## Paso'))
    for dest in moves.values():
        assert not safe(ROOT / f'{dest}.mdx').exists()

    redirects = []
    for stem, source in by_stem.items():
        target = moves[MERGED.get(stem, stem)]
        redirects.append({
            'source': '/docs/docente/' + source.relative_to(ROOT).with_suffix('').as_posix(),
            'destination': '/docs/docente/' + target,
            'permanent': True,
        })
    write_json(WEB / 'lib/docente-redirects.json', redirects)

    # Verified absolute targets remain inside the docente content directory.
    for stem, target in moves.items():
        source = safe(by_stem[stem])
        destination = safe(ROOT / f'{target}.mdx')
        destination.parent.mkdir(parents=True, exist_ok=True)
        source.rename(destination)
        if stem in titles:
            text = destination.read_text(encoding='utf-8')
            text = re.sub(r'^title:.*$', 'title: ' + json.dumps(titles[stem], ensure_ascii=False), text, count=1, flags=re.M)
            destination.write_text(text, encoding='utf-8')
    for stem in MERGED:
        safe(by_stem[stem]).unlink()
    for path in metadata:
        if path != ROOT / 'meta.json':
            safe(path).unlink()
    for path in sorted(ROOT.rglob('*'), key=lambda p: len(p.parts), reverse=True):
        if path.is_dir() and not any(path.iterdir()):
            safe(path).rmdir()

    menus['planeacion-y-curriculo'].insert(1, 'mallas-curriculares')
    menus['asistencia-y-seguimiento'].insert(0, 'inasistencias')
    menus['convivencia-y-observador'].append('ficha-observador')
    menus['sinai-desktop'] = [value[0] for value in DESKTOP.values()]

    def landing(slug, title, description):
        folder = ROOT / slug
        entries = menus[slug]
        cards = []
        for entry in entries:
            child = f'{slug}/{entry}'
            if child in SUBGROUPS:
                child_title, child_description = SUBGROUPS[child]
            else:
                text = (ROOT / f'{child}.mdx').read_text(encoding='utf-8')
                child_title, child_description = field(text, 'title'), field(text, 'description')
            cards.append('  <Card title={' + json.dumps(child_title, ensure_ascii=False) + '} href="/docs/docente/' + child + '" description={' + json.dumps(child_description, ensure_ascii=False) + '} />')
        text = '---\ntitle: ' + json.dumps(title, ensure_ascii=False) + '\ndescription: ' + json.dumps(description, ensure_ascii=False) + '\nsection: true\n---\n\n' + description + '\n\n## Contenido de esta sección\n\n<Cards>\n' + '\n'.join(cards) + '\n</Cards>\n'
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'index.mdx').write_text(text, encoding='utf-8')
        write_json(folder / 'meta.json', {'title': title, 'description': description, 'defaultOpen': False, 'pages': entries})

    for slug, (title, description) in SUBGROUPS.items():
        landing(slug, title, description)
    for slug, title, description in SECTIONS:
        landing(slug, title, description)
    write_json(ROOT / 'meta.json', {
        'title': 'Docente', 'description': 'Procesos y guías para el rol Docente',
        'root': True, 'icon': 'Presentation', 'defaultOpen': False,
        'pages': ['index'] + [item for slug, title, _ in SECTIONS for item in (f'---{title}---', f'...{slug}')],
    })
    cards = ['  <Card title={' + json.dumps(title, ensure_ascii=False) + '} href="/docs/docente/' + slug + '" description={' + json.dumps(description, ensure_ascii=False) + '} />' for slug, title, description in SECTIONS]
    (ROOT / 'index.mdx').write_text('---\ntitle: "Docente"\ndescription: "Guías para planear, calificar y acompañar a sus estudiantes durante el año escolar."\n---\n\nEncuentre las instrucciones de SINAI según la tarea que necesita realizar. Consulte su labor diaria, los procesos de cierre académico y las herramientas de apoyo.\n\n## Explore los procesos del módulo\n\n<Cards>\n' + '\n'.join(cards) + '\n</Cards>\n', encoding='utf-8')

    # Update authored internal links, leaving source-system legacyUrl metadata intact.
    replacements = {item['source']: item['destination'] for item in redirects}
    for path in (WEB / 'content').rglob('*.mdx'):
        text = path.read_text(encoding='utf-8')
        updated = text
        for old in sorted(replacements, key=len, reverse=True):
            updated = updated.replace(old, replacements[old])
        if updated != text:
            path.write_text(updated, encoding='utf-8')
    print(f'{len(sources)} original guides accounted for: {len(moves)} retained, {len(MERGED)} placeholder duplicates redirected; {len(SECTIONS)} sections.')

if __name__ == '__main__':
    main()
