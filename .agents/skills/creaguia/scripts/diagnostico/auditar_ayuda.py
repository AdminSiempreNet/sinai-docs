"""Audita los enlaces de ayuda del código de SINAI contra las guías de sinai-docs.

Salidas (en <dir_datos>):
  botones_ayuda.json   una fila por enlace encontrado, con estado y acción
  ayuda-redirects.json redirecciones seguras (enlace roto con un único destino posible)
"""
import json, re, sys
from pathlib import Path

import openpyxl

ROOT = Path(r"C:\Users\andyg\Desktop\SIEMPRE.NET\SINAI")
DOCS = ROOT / "sinai-docs/web/content/docs"
D = Path(sys.argv[1])
SCR = D.parent

APPS = [
    ("webforms", ROOT / "webforms/WEBSINAI", (".aspx", ".ascx", ".master", ".cs", ".vb", ".js")),
    ("sinai-react-v1", ROOT / "frontend/sinai-react-v1/src", (".js", ".jsx", ".ts", ".tsx")),
    ("sinai-react-v2", ROOT / "frontend/sinai-react-v2/sinai-react/src", (".js", ".jsx", ".ts", ".tsx")),
    ("sinai-react-v3", ROOT / "frontend/sinai-react-v3/src", (".js", ".jsx", ".ts", ".tsx")),
]
SKIP = {"node_modules", "ClientApp", "dist", "bin", "obj", "Scripts", "lib", "vendor"}
URL_RE = re.compile(r"https?://(?:www\.)?(ayuda\.sinai\.net\.co/docs/[^\s\"'<>)`]*|ayudasinai\.siempre\.net\.co/[^\s\"'<>)`]*|"
                    r"youtu\.be/[\w-]{11}|youtube\.com/watch\?v=[\w-]{11}|odysee\.com/[^\s\"'<>)`]*)", re.I)
REL_RE = re.compile(r"[\"'`](/docs/(?:administrativo|docente|estudiante|generales)/[^\s\"'`<>)]*)")

# Destinos que ya existen en sinai-docs
existentes = set()
for p in DOCS.rglob("*.mdx"):
    rel = p.relative_to(DOCS).as_posix()[:-4]
    existentes.add("/docs/" + (rel[:-6] if rel.endswith("/index") else rel))
redir = {}
for f in (ROOT / "sinai-docs/web/lib").glob("*redirects.json"):
    for r in json.loads(f.read_text(encoding="utf8")):
        redir[r["source"].rstrip("/")] = r["destination"]

# Mapa archivo de código -> guías (diagnóstico de videos y reportes de las fases 2 y 3)
mapa = {}


def agrega(nombre, guia):
    if nombre and guia:
        mapa.setdefault(Path(nombre).name.lower(), set()).add(guia)


wb = openpyxl.load_workbook(ROOT / "diagnostico-guias-videos.xlsx", read_only=True)
for r in list(wb["Guías"].iter_rows(min_row=5, values_only=True)):
    for a in (r[11] or "").split(" | "):
        agrega(a.strip(), r[3])
for rep in list((SCR / "fase3/reportes").glob("*.md")):
    guia = None
    for line in rep.read_text(encoding="utf8").splitlines():
        m = re.match(r"##\s+(\S+\.mdx)", line)
        if m:
            guia = m.group(1).replace("\\", "/").split("content/docs/")[-1]
        elif guia and line.lstrip("- ").startswith("Pantalla:"):
            for a in re.findall(r"[\w./\\-]+\.(?:aspx|ascx|tsx|jsx)", line):
                agrega(a, guia)


def guia_url(g):
    return "/docs/" + g[:-4].removesuffix("/index")


filas, redirects = [], []
for app, base, exts in APPS:
    for f in base.rglob("*"):
        if f.suffix.lower() not in exts or SKIP & set(f.parts) or not f.is_file():
            continue
        try:
            lines = f.read_text(encoding="utf8", errors="ignore").splitlines()
        except OSError:
            continue
        for n, line in enumerate(lines, 1):
            hallados = [m.group(0) for m in URL_RE.finditer(line)] + \
                       ["https://ayuda.sinai.net.co" + m.group(1) for m in REL_RE.finditer(line)]
            for url in hallados:
                ctx = " ".join(lines[max(0, n - 4):n + 3]).lower()
                if "youtu" in url and not re.search(r"ayuda|help|life-saver|tutorial|video", ctx):
                    continue
                rel_code = f.relative_to(ROOT).as_posix()
                esperadas = sorted(mapa.get(f.name.lower(), set()))
                fila = {"app": app, "archivo": rel_code, "linea": n, "url": url,
                        "guia_esperada": " | ".join(esperadas)}
                if "ayuda.sinai.net.co/docs/" in url:
                    path = "/docs/" + url.split("/docs/", 1)[1].split("#")[0].split("?")[0].rstrip("/")
                    destino = redir.get(path, path)
                    existe = destino in existentes
                    if esperadas and guia_url(esperadas[0]) == destino and len(esperadas) == 1:
                        fila.update(estado="Correcto", accion="Ninguna")
                    elif not existe and len(esperadas) == 1:
                        fila.update(estado="Enlace roto", accion="Corregido con redirección en sinai-docs",
                                    destino=guia_url(esperadas[0]))
                        redirects.append({"source": path, "destination": guia_url(esperadas[0]), "permanent": False})
                    elif not existe:
                        fila.update(estado="Enlace roto", accion="Requiere cambio en la aplicación",
                                    destino=" | ".join(guia_url(g) for g in esperadas) or "(definir guía)")
                    elif esperadas and destino not in {guia_url(g) for g in esperadas}:
                        fila.update(estado="Apunta a otra guía", accion="Requiere cambio en la aplicación",
                                    destino=" | ".join(guia_url(g) for g in esperadas))
                    else:
                        fila.update(estado="Existe (sin guía asociada para verificar)", accion="Revisar")
                else:
                    tipo = "Video de YouTube" if "youtu" in url else "Video de Odysee" if "odysee" in url else "WordPress antiguo"
                    fila.update(estado=f"Apunta a {tipo}", accion="Requiere cambio en la aplicación",
                                destino=" | ".join(guia_url(g) for g in esperadas) or "(definir guía)")
                filas.append(fila)

# Redirecciones únicas y sin conflicto (misma fuente con destinos distintos -> se descarta)
por_fuente = {}
for r in redirects:
    por_fuente.setdefault(r["source"], set()).add(r["destination"])
seguras = [{"source": s, "destination": d.pop(), "permanent": False} for s, d in por_fuente.items() if len(d) == 1]
conflicto = {s for s, d in por_fuente.items() if len(d) > 1}
for fila in filas:
    if fila.get("accion", "").startswith("Corregido") and "/docs/" + fila["url"].split("/docs/", 1)[1].split("#")[0].rstrip("/") in conflicto:
        fila["accion"] = "Requiere cambio en la aplicación"

(D / "botones_ayuda.json").write_text(json.dumps(filas, ensure_ascii=False, indent=1), encoding="utf8")
(D / "ayuda-redirects.json").write_text(json.dumps(sorted(seguras, key=lambda r: r["source"]), ensure_ascii=False, indent=2), encoding="utf8")
from collections import Counter
print("enlaces:", len(filas), dict(Counter(f["estado"] for f in filas)))
print("acciones:", dict(Counter(f["accion"] for f in filas)))
print("redirecciones seguras:", len(seguras))
