"""One-time migration for the Student role; retains a redirect for every prior guide URL."""
from pathlib import Path
import json
import re

WEB = Path(__file__).resolve().parents[1]
ROOT = WEB / "content/docs/estudiante"

SECTIONS = [
    ("primeros-pasos", "Primeros pasos", "Acceda a SINAI y recupere el acceso a su cuenta."),
    ("mi-cuenta-y-comunicaciones", "Mi cuenta y comunicaciones", "Actualice sus datos y manténgase en contacto con sus docentes."),
    ("actividad-academica", "Actividad académica", "Consulte sus tareas, aula virtual y autoevaluación."),
    ("resultados-academicos", "Resultados académicos", "Revise calificaciones, informes y boletines."),
    ("matricula", "Matrícula", "Complete los procesos de prematrícula disponibles."),
    ("asistencia-y-convivencia", "Asistencia y convivencia", "Consulte su asistencia y los procesos de seguimiento escolar."),
]

GROUPS = {
    "primeros-pasos": [
        ("e-como-ingresar-a-sinai", "ingresar-a-sinai"),
        ("e-como-cambiar-mi-contrasena", "cambiar-contrasena"),
    ],
    "mi-cuenta-y-comunicaciones": [
        ("como-actualizar-el-perfil", "actualizar-perfil"),
        ("e-mensajes", "mensajes"),
        ("mis-docentes", "mis-docentes"),
    ],
    "actividad-academica": [
        ("mis-tareas", "mis-tareas"),
        ("e-aula-virtual-chamilo", "aula-virtual"),
        ("e-autoevaluacion", "autoevaluacion"),
    ],
    "resultados-academicos": [
        ("e-informes", "informes"),
        ("calificaciones-consolidadas", "calificaciones-consolidadas"),
        ("boletin-del-periodo", "boletin-del-periodo"),
        ("boletin-final", "boletin-final"),
    ],
    "matricula": [("e-prematricula", "prematricula")],
    "asistencia-y-convivencia": [
        ("inasistencias-consolidadas-y-detalladas", "inasistencias"),
        ("e-excusas", "excusas"),
        ("e-ficha-observador", "ficha-observador"),
        ("e-anotaciones", "anotaciones"),
        ("seguimiento", "seguimiento"),
    ],
}


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def safe(path):
    result = path.resolve()
    assert result.is_relative_to(ROOT.resolve()), result
    return result


def frontmatter_value(text, field):
    match = re.search(r"^" + field + r':\s*[\"\']?(.*?)[\"\']?\s*$', text, re.M)
    return match[1] if match else ""


def main():
    sources = sorted(path for path in ROOT.rglob("*.mdx") if path.name != "index.mdx")
    by_stem = {path.stem: path for path in sources}
    expected_stems = {stem for entries in GROUPS.values() for stem, _ in entries}
    assert len(sources) == len(by_stem) == len(expected_stems) == 18, "Unexpected Student guide inventory; stop before editing."
    assert set(by_stem) == expected_stems
    metadata = list(ROOT.rglob("meta.json"))

    moves = {
        stem: f"{section}/{slug}"
        for section, entries in GROUPS.items()
        for stem, slug in entries
    }
    assert len(set(moves.values())) == len(moves)
    for destination in moves.values():
        assert not safe(ROOT / f"{destination}.mdx").exists()

    redirects = [
        {
            "source": "/docs/estudiante/" + source.relative_to(ROOT).with_suffix("").as_posix(),
            "destination": "/docs/estudiante/" + moves[stem],
            "permanent": True,
        }
        for stem, source in by_stem.items()
    ]
    write_json(WEB / "lib/estudiante-redirects.json", redirects)

    for stem, destination in moves.items():
        source = safe(by_stem[stem])
        target = safe(ROOT / f"{destination}.mdx")
        target.parent.mkdir(parents=True, exist_ok=True)
        source.rename(target)

    for path in metadata:
        safe(path).unlink()
    for path in sorted(ROOT.rglob("*"), key=lambda item: len(item.parts), reverse=True):
        if path.is_dir() and not any(path.iterdir()):
            safe(path).rmdir()

    def landing(slug, title, description):
        entries = [entry_slug for _, entry_slug in GROUPS[slug]]
        cards = []
        for entry in entries:
            guide = ROOT / f"{slug}/{entry}.mdx"
            text = guide.read_text(encoding="utf-8")
            cards.append(
                "  <Card title=" + json.dumps(frontmatter_value(text, "title"), ensure_ascii=False)
                + ' href="/docs/estudiante/' + slug + "/" + entry + '" description='
                + json.dumps(frontmatter_value(text, "description"), ensure_ascii=False) + " />"
            )
        folder = ROOT / slug
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "index.mdx").write_text(
            "---\n"
            + "title: " + json.dumps(title, ensure_ascii=False) + "\n"
            + "description: " + json.dumps(description, ensure_ascii=False) + "\n"
            + "section: true\n---\n\n"
            + description + "\n\n## Contenido de esta sección\n\n<Cards>\n"
            + "\n".join(cards) + "\n</Cards>\n",
            encoding="utf-8",
        )
        write_json(folder / "meta.json", {
            "title": title,
            "description": description,
            "defaultOpen": False,
            "pages": entries,
        })

    for slug, title, description in SECTIONS:
        landing(slug, title, description)

    write_json(ROOT / "meta.json", {
        "title": "Estudiante",
        "description": "Procesos y guías para el rol Estudiante",
        "root": True,
        "icon": "GraduationCap",
        "defaultOpen": False,
        "pages": ["index"] + [item for slug, title, _ in SECTIONS for item in (f"---{title}---", f"...{slug}")],
    })
    root_cards = [
        "  <Card title=" + json.dumps(title, ensure_ascii=False)
        + ' href="/docs/estudiante/' + slug + '" description='
        + json.dumps(description, ensure_ascii=False) + " />"
        for slug, title, description in SECTIONS
    ]
    (ROOT / "index.mdx").write_text(
        '---\ntitle: "Estudiante"\ndescription: "Guías para consultar su actividad académica y realizar procesos disponibles en SINAI."\n---\n\n'
        "Encuentre las instrucciones según la tarea que necesita realizar: su cuenta, actividad académica, resultados, matrícula y seguimiento escolar.\n\n"
        "## Explore los procesos del módulo\n\n<Cards>\n" + "\n".join(root_cards) + "\n</Cards>\n",
        encoding="utf-8",
    )

    replacements = {item["source"]: item["destination"] for item in redirects}
    for path in (WEB / "content").rglob("*.mdx"):
        text = path.read_text(encoding="utf-8")
        updated = text
        for old in sorted(replacements, key=len, reverse=True):
            updated = updated.replace(old, replacements[old])
        if updated != text:
            path.write_text(updated, encoding="utf-8")

    print(f"{len(sources)} Student guides moved into {len(SECTIONS)} sections; {len(redirects)} old URLs redirected.")


if __name__ == "__main__":
    main()
