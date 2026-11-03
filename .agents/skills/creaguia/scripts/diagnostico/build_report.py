"""Construye el informe Excel del diagnóstico de guías y videos.

Uso: build_report.py <dir_datos> <salida.xlsx> [pilot|all]
"""
import json, re, sys
from datetime import date
from pathlib import Path

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.table import Table, TableStyleInfo

sys.path.insert(0, str(Path(__file__).parent))
from routes import build_index, resolve  # noqa: E402
from motivos_pendientes import motivo as motivo_base  # noqa: E402

REPORTES = sorted((Path(sys.argv[1]).resolve().parent / "fase3" / "reportes").glob("*.md"))
MOTIVOS_F3 = {}
for _rep in REPORTES:
    _guia = None
    for _l in _rep.read_text(encoding="utf8").splitlines():
        _m = re.match(r"##\s+(\S+)", _l)
        if _m:
            _guia = _m.group(1).replace("\\", "/").split("content/docs/")[-1]
        for _pm in re.finditer(r"PENDIENTE\s+([\w\-./,\s]+?\.jpg)\s*:\s*([^|]+)", _l):
            for _a in re.findall(r"[\w\-.]+\.jpg", _pm.group(1)):
                MOTIVOS_F3[_a] = _pm.group(2).strip()
                if _guia:
                    MOTIVOS_F3[(_guia, _a)] = _pm.group(2).strip()


def motivo(path, archivo):
    return MOTIVOS_F3.get((path, archivo)) or MOTIVOS_F3.get(archivo) or motivo_base(path, archivo)

D, OUT = Path(sys.argv[1]), Path(sys.argv[2])
SCOPE = sys.argv[3] if len(sys.argv) > 3 else "pilot"
ROOT = Path(r"C:\Users\andyg\Desktop\SIEMPRE.NET\SINAI")
DOCS_URL = "https://ayuda.sinai.net.co/docs/"

inv = json.loads((D / "inventory.json").read_text(encoding="utf8"))
scope_ids = set(json.loads((D / "pilot.json").read_text(encoding="utf8"))["ids"]) if SCOPE == "pilot" else None
metas = {p.parent.name: json.loads(p.read_text(encoding="utf8")) for p in (D / "videos").glob("*/meta.json")}
reads = {}
for f in sorted(D.glob("lectura_*.json")):
    for r in json.loads(f.read_text(encoding="utf8")):
        reads[r["id"]] = r
idx = build_index()

# Solapes (versión anterior → versión vigente) del libro de rutas
solapes = []
wb_r = openpyxl.load_workbook(ROOT / "rutas-administrativo-frontend.xlsx", read_only=True)
for row in list(wb_r["Solapes"].iter_rows(values_only=True))[1:]:
    if row[1]:
        for pref in re.findall(r"(?:Main|App)\.aspx/[\w/]+", row[3] or ""):
            solapes.append((pref.rstrip("/").lower(), row[1], row[4], row[5]))
react_last = {}
for mount in ("Main.aspx", "Index.aspx", "App.aspx"):
    for route, f, _nav in idx[mount]:
        segs = [x for x in route.strip("/").split("/") if x and not x.startswith((":", "$"))]
        if segs:
            react_last.setdefault(segs[-1].lower(), set()).add(f"{mount}{route}")
GENERIC = {"index", "inicio", "default", "calificaciones", "valoracion", "informes", "configuracion", "consulta",
           "reportes", "opciones", "lista", "planilla", "registro", "gestion", "perfil"}

EXPECTED = {"administrativo": "azul", "docente": "verde"}
MODULO = {"azul": "Administrativo", "verde": "Docente"}


def analyze_video(vid, guide):
    m, r = metas.get(vid, {}), reads.get(vid, {})
    row = {"id": vid, "link": f"https://youtu.be/{vid}", "estado": [], "fecha": m.get("upload_date"),
           "duracion": m.get("duration"), "titulo_yt": m.get("yt_title")}
    if not m:
        row["estado"].append("Sin analizar")
        return row
    if m.get("status") != "ok":
        row["estado"].append("No disponible en YouTube")
        row["notas"] = m.get("error", "")[:200]
        return row
    color = r.get("color_menu") if r.get("color_menu") in ("azul", "verde") else m.get("color_auto")
    row["color"] = color
    row["modulo_video"] = MODULO.get(color, "Indeterminado")
    exp = EXPECTED.get(guide["role"])
    row["modulo_esperado"] = MODULO.get(exp, "No aplica (estudiante)") if exp else "No aplica (estudiante)"
    if exp and color in ("azul", "verde") and color != exp:
        row["estado"].append("Módulo equivocado")
    if r.get("tema_coincide") == "no":
        row["estado"].append("No corresponde al tema")
    elif r.get("tema_coincide") == "dudoso":
        row["estado"].append("Revisar tema")
    row["ruta_menu"] = r.get("ruta_menu")
    row["url"] = r.get("url_principal")
    row["notas"] = r.get("notas", "")
    row["legibilidad"] = r.get("legibilidad")
    if not r:
        row["estado"].append("Lectura pendiente")
    elif not row["url"]:
        row["estado"].append("Ruta no visible en el video")
    else:
        res = resolve(row["url"], idx)
        row.update(repo=res["repo"], ruta_codigo=res["ruta"], archivo=res["archivo"], existe=res["existe"])
        low = res["ruta"].lower()
        if res["repo"] and not res["existe"]:
            row["estado"].append("Desactualizado: la ruta del video ya no existe en el código")
        if res.get("redirige"):
            row["estado"].append("Desactualizado: la pantalla se reorganizó")
            row["migracion"] = f"Ahora redirige a {res['redirige']}"
            row["ruta_codigo"] = res["redirige"]
        for pref, mod, ver_b, rutas_b in solapes:
            if low.startswith(pref):
                row["estado"].append(f"Desactualizado: {mod} tiene versión nueva en {ver_b}")
                row["migracion"] = rutas_b
                break
        if res["montaje"] == "webforms" and res["existe"]:
            stem = Path(res["ruta"]).stem.lower()
            if stem in react_last and stem not in GENERIC:
                row["estado"].append("Revisar: posible versión React de esta pantalla")
                row["migracion"] = ", ".join(sorted(react_last[stem])[:3])
    if not row["estado"]:
        row["estado"].append("Vigente")
    return row


def estado_contenido(rel):
    t = (ROOT / "sinai-docs/web/content/docs" / rel).read_text(encoding="utf8")
    if "/sinai-desktop/" in rel or "/ayuda/" in rel or "/_archivo/" in rel:
        return "Fuera de alcance (desktop, ayuda, archivo)"
    if re.search(r"^lastReviewed:", t, re.M) and (re.search(r"^### 1\.", t, re.M) or "<PlanillaGuideSwitcher" in t):
        return "Escrita desde el código (skill)"
    if "pendiente de completar" in t:
        return "Borrador sin contenido"
    return "Migrada de WordPress, sin verificar"


videos_rows, guides_rows = [], []
for g in inv:
    vids = [v for v in g["videos"] if v["id"]]
    analyzed = [v for v in vids if scope_ids is None or v["id"] in scope_ids]
    in_scope = bool(vids) and len(analyzed) == len(vids)
    vrows = []
    for v in analyzed:
        vr = analyze_video(v["id"], g)
        vr.update(guia=g["title"], mdx=g["path"], rol=g["role"], titulo_guia_video=v["title"])
        vrows.append(vr)
    videos_rows += vrows
    if not vids and any(v["odysee"] for v in g["videos"]):
        estado = "Solo en Odysee (sin YouTube)"
    elif not vids:
        estado = "Sin video" if not g["video_pending"] else "Video pendiente (marcador en la guía)"
    elif not in_scope:
        estado = "Fuera de la prueba"
    else:
        sts = sorted({s for vr in vrows for s in vr["estado"] if s != "Vigente"})
        estado = "; ".join(sts) if sts else "Vigente"
    repos = sorted({vr.get("repo") for vr in vrows if vr.get("repo")})
    guides_rows.append({
        "rol": g["role"].capitalize(), "seccion": "/".join(g["path"].split("/")[1:-1]), "guia": g["title"],
        "mdx": g["path"], "url_doc": DOCS_URL + g["path"][:-4], "estructura": "Skill" if g["skill_structure"] else "Antigua",
        "videos": len(g["videos"]), "estado": estado,
        "ruta_menu": " | ".join(dict.fromkeys(vr["ruta_menu"] for vr in vrows if vr.get("ruta_menu"))),
        "url": " | ".join(dict.fromkeys(vr["ruta_codigo"] for vr in vrows if vr.get("ruta_codigo"))),
        "repo": " | ".join(repos),
        "archivo": " | ".join(dict.fromkeys(vr["archivo"] for vr in vrows if vr.get("archivo"))),
        "capturas": len(g["images_pending"]),
        "contenido": estado_contenido(g["path"]),
        "fase2": "Sí" if re.search(r'^lastModified:\s*"?2026-10-30', (ROOT / "sinai-docs/web/content/docs" / g["path"]).read_text(encoding="utf8"), re.M) else "",
    })

# ---------- Excel ----------
F = "Arial"
HDR = PatternFill("solid", fgColor="1F4E78")
thin = Side(style="thin", color="D9D9D9")
wb = openpyxl.Workbook()
FILLS = {"Tomada": "E2EFDA", "Pendiente": "FFE699", "Vigente": "E2EFDA", "Módulo equivocado": "F8CBAD", "Desactualizado": "FFE699", "No disponible": "F4B084",
         "Sin video": "D9D9D9", "No corresponde": "F8CBAD", "Revisar": "DDEBF7", "Ruta no visible": "DDEBF7"}


def sheet(title, headers, rows, widths, desc):
    ws = wb.create_sheet(title)
    ws["A1"] = title
    ws["A1"].font = Font(name=F, size=14, bold=True, color="1F4E78")
    ws["A2"] = desc
    ws["A2"].font = Font(name=F, size=9, italic=True, color="595959")
    for c, h in enumerate(headers, 1):
        cell = ws.cell(row=4, column=c, value=h)
        cell.font = Font(name=F, bold=True, color="FFFFFF")
        cell.fill = HDR
        cell.alignment = Alignment(wrap_text=True, vertical="center")
    for r, row in enumerate(rows, 5):
        for c, v in enumerate(row, 1):
            cell = ws.cell(row=r, column=c, value=v)
            cell.font = Font(name=F, size=10)
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            cell.border = Border(bottom=thin)
            if isinstance(v, str) and v.startswith("https://"):
                cell.hyperlink = v
                cell.font = Font(name=F, size=10, color="0563C1", underline="single")
            if headers[c - 1] == "Estado":
                for k, col in FILLS.items():
                    if isinstance(v, str) and k in v:
                        cell.fill = PatternFill("solid", fgColor=col)
                        break
    for c, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(c)].width = w
    ws.freeze_panes = "A5"
    if rows:
        ref = f"A4:{get_column_letter(len(headers))}{len(rows) + 4}"
        t = Table(displayName=re.sub(r"\W", "", title.title()), ref=ref)
        t.tableStyleInfo = TableStyleInfo(name="TableStyleLight1", showRowStripes=False)
        ws.add_table(t)
    return ws


fmt_date = lambda s: f"{s[:4]}-{s[4:6]}-{s[6:]}" if s else None
vid_headers = ["Rol guía", "Guía", "Archivo MDX", "Video", "Título del video", "Publicado", "Duración (min)",
               "Módulo esperado", "Módulo en el video", "Estado", "Ruta de menú (video)", "URL principal (video)",
               "Repositorio", "Archivo de código", "Versión vigente / migración", "Notas de lectura"]
vrows_x = [[v["rol"].capitalize(), v["guia"], v["mdx"], v["link"], v.get("titulo_yt") or v["titulo_guia_video"],
            fmt_date(v.get("fecha")), round(v["duracion"] / 60, 1) if v.get("duracion") else None,
            v.get("modulo_esperado"), v.get("modulo_video"), "; ".join(v["estado"]), v.get("ruta_menu"),
            v.get("ruta_codigo") or v.get("url"), v.get("repo"), v.get("archivo"), v.get("migracion"), v.get("notas")]
           for v in sorted(videos_rows, key=lambda x: (x["mdx"], x["id"]))]
vw = [12, 28, 40, 26, 32, 11, 9, 14, 14, 30, 34, 40, 26, 52, 40, 50]

g_headers = ["Rol", "Sección", "Guía", "Archivo MDX", "Página publicada", "Estructura", "Videos", "Estado",
             "Ruta de menú", "URL en la plataforma", "Repositorio (fuente de verdad)", "Archivo de código", "Capturas pendientes", "Actualizada en esta revisión", "Estado del contenido"]
g_rows = [[g["rol"], g["seccion"], g["guia"], g["mdx"], g["url_doc"], g["estructura"], g["videos"], g["estado"],
           g["ruta_menu"], g["url"], g["repo"], g["archivo"], g["capturas"], g["fase2"], g["contenido"]] for g in guides_rows]
gw = [13, 34, 30, 44, 30, 10, 8, 34, 36, 42, 30, 55, 10, 12, 30]

wb.remove(wb.active)
res = wb.create_sheet("Resumen")
sheet("Guías", g_headers, g_rows, gw,
      "Una fila por guía. La ruta y el repositorio salen de la URL vista en el video, cruzada con el código local.")
sheet("Videos", vid_headers, vrows_x, vw, "Una fila por video analizado.")
sheet("Sin video", ["Rol", "Sección", "Guía", "Archivo MDX", "Página publicada", "Estado"],
      [[g["rol"], g["seccion"], g["guia"], g["mdx"], g["url_doc"], g["estado"]] for g in guides_rows if g["estado"].startswith(("Sin video", "Video pendiente", "Solo en Odysee"))],
      [13, 34, 34, 50, 40, 32], "Guías sin video incrustado (todas las secciones).")
for title, key, desc in [("Módulo equivocado", "Módulo equivocado", "El color del menú del video no corresponde al rol de la guía (azul = administrativo, verde = docente)."),
                         ("Desactualizados", "Desactualizado", "El video muestra una pantalla que ya no existe en el código o que tiene versión nueva."),
                         ("Revisar", ("Revisar", "No corresponde", "Ruta no visible", "No disponible"), "Casos que requieren una revisión humana.")]:
    keys = key if isinstance(key, tuple) else (key,)
    sheet(title, vid_headers, [r for r in vrows_x if any(k in r[9] for k in keys)], vw, desc)
cap_rows = []
WEBD = ROOT / "sinai-docs" / "web"
MOTIVOS = {
    "agregar-estudiantes.jpg": "La IE de pruebas no tiene estudiantes matriculados en centros de interés (calendarios 2024 y 2025). Se necesita crear una matrícula de prueba.",
    "confirmar-eliminacion.jpg": "Sin matrículas en centros de interés no hay botón para quitar un estudiante. Se necesita crear una matrícula de prueba.",
    "gestionar-descriptores.jpg": "El botón Descriptores solo aparece con la configuración «Descriptores del director de grupo», que no está activa en la IE de pruebas.",
}
for g in inv:
    mdx = (WEBD / "content" / "docs" / g["path"]).read_text(encoding="utf8")
    for src, alt in re.findall(r'<GuideImageTrigger src="([^"]+)" alt="([^"]*)"', mdx):
        f = WEBD / "public" / src.lstrip("/")
        if f.exists() and date.fromtimestamp(f.stat().st_mtime) >= date(2026, 10, 30):
            cap_rows.append([g["role"].capitalize(), g["title"], g["path"], alt, f.name,
                             "web/public" + src.rsplit("/", 1)[0] + "/", "Tomada (automática)",
                             "IE de pruebas SISTEMAS INFORMATICOS EMPRESARIALES"])
    for p in g["images_pending"]:
        arch = re.search(r"Archivo:\s*`?([\w\-.]+\.jpg)", p)
        name = arch.group(1) if arch else "(sin nombre definido)"
        folder = "web/public/images/guides/" + Path(g["path"]).stem + "/"
        cap_rows.append([g["role"].capitalize(), g["title"], g["path"], re.sub(r"\s*Archivo:.*$", "", p),
                         name, folder, "Pendiente", motivo(g["path"], name)])
cap_rows.sort(key=lambda r: (r[6] != "Pendiente", r[2]))
sheet("Capturas", ["Rol", "Guía", "Archivo MDX", "Qué muestra / qué debe verse", "Archivo", "Carpeta", "Estado", "Motivo / origen"],
      cap_rows, [13, 30, 48, 64, 30, 44, 18, 60],
      "Capturas tomadas automáticamente en la IE de pruebas y marcadores pendientes con su motivo.")

hall = []
bit = D.parent / "fase2" / "BITACORA.md"
if bit.exists():
    lote = ""
    for line in bit.read_text(encoding="utf8").splitlines():
        if line.startswith("## "):
            lote = line[3:].strip()
        elif line.startswith("- ") and lote:
            body = line[2:].strip()
            guia, sep, det = body.partition(": ")
            if not sep or " " in guia.strip():
                guia, det = "(general)", body
            tipo = "; ".join(t for t, k in [("Bug / riesgo de código", ("Bug", "RIESGO", "POSIBLE BUG")),
                                            ("Captura pendiente", ("PENDIENTE",)),
                                            ("Revisar", ("Revisar", "OJO", "IMPORTANTE", "VIDEO INVÁLIDO"))]
                             if any(x in body for x in k))
            hall.append([lote, guia.strip(), tipo or "Hallazgo", det])
for _rep in REPORTES:
    _lote, _guia, _det = _rep.stem, None, []
    for _l in _rep.read_text(encoding="utf8").splitlines() + ["## FIN"]:
        if _l.startswith("## "):
            if _guia and _det:
                _txt = " ".join(_det)
                _tipo = "; ".join(t for t, k in [("Bug / riesgo de código", ("bug", "Bug", "riesgo", "RIESGO")),
                                                ("Captura pendiente", ("PENDIENTE",)), ("Revisar", ("Revisar", "revisar"))]
                                  if any(x in _txt for x in k))
                hall.append([_lote, _guia, _tipo or "Hallazgo", _txt[:3000]])
            _guia, _det = _l[3:].strip().replace("\\", "/").split("content/docs/")[-1], []
        elif _l.strip().startswith("- ") and _guia:
            _det.append(_l.strip()[2:])
sheet("Hallazgos", ["Lote", "Guía", "Tipo", "Detalle (pantalla, afirmaciones falsas, pendientes y avisos)"], hall,
      [34, 34, 22, 130], "Resumen por guía de lo encontrado al reescribirlas desde el código y tomar las capturas.")

bot = json.loads((D / "botones_ayuda.json").read_text(encoding="utf8")) if (D / "botones_ayuda.json").exists() else []
orden_acc = {"Requiere cambio en la aplicación": 0, "Revisar": 1, "Corregido con redirección en sinai-docs": 2, "Ninguna": 3}
bot.sort(key=lambda b: (orden_acc.get(b.get("accion"), 9), b["app"], b["archivo"], b["linea"]))
sheet("Botones de Ayuda", ["Acción", "Estado", "Aplicación", "Archivo de código", "Línea", "URL actual", "Debe apuntar a", "Guía esperada (MDX)"],
      [[b.get("accion"), b.get("estado"), b["app"], b["archivo"], b["linea"], b["url"],
        ("https://ayuda.sinai.net.co" + b["destino"]) if str(b.get("destino", "")).startswith("/docs/") else b.get("destino", ""),
        b.get("guia_esperada")] for b in bot],
      [30, 30, 16, 60, 7, 60, 60, 50],
      "Enlaces de ayuda encontrados en el código de la aplicación. 'Requiere cambio en la aplicación': pedir a desarrollo que el botón apunte a la URL de la columna 'Debe apuntar a'.")

crit = wb.create_sheet("Criterios")
crit_rows = [
    ("Estado", "Significado"),
    ("Vigente", "La URL del video existe en el código y no hay una versión más nueva registrada."),
    ("Módulo equivocado", "El menú del video es azul (administrativo) y la guía es de docente, o verde y la guía es administrativa. No aplica a estudiante."),
    ("Desactualizado: la ruta ya no existe", "La URL del video no se encuentra en el repositorio que le corresponde."),
    ("Desactualizado: tiene versión nueva", "La pantalla del video está en una versión anterior y existe otra en un proyecto más nuevo (hoja Solapes de rutas-administrativo-frontend.xlsx)."),
    ("Revisar: posible versión React", "El video muestra una página WebForms y existe una ruta React con el mismo nombre. Confirmar cuál está en el menú."),
    ("Ruta no visible en el video", "La grabación no muestra la barra de direcciones; la ruta de menú puede estar disponible."),
    ("No corresponde al tema / Revisar tema", "La pantalla del video no coincide con el tema de la guía."),
    ("No disponible en YouTube", "El video fue retirado, es privado o no se pudo descargar."),
    ("Sin video", "La guía no tiene video incrustado."),
    ("", ""),
    ("URL → repositorio", ""),
    ("Admin/…, Docente/…, PlnCur/… (.aspx)", "webforms/WEBSINAI"),
    ("App.aspx/…", "frontend/sinai-react-v1 (websinai)"),
    ("Main.aspx/…", "frontend/sinai-react-v2 (sinai-react)"),
    ("Index.aspx/…", "frontend/sinai-react-v3 (frontend)"),
    ("", ""),
    ("Método", "Se descarga cada video, se extrae un fotograma cada 2 s, se recorta la franja superior (barra de direcciones y menú), "
               "se agrupan los cambios y se leen. El color del menú se mide automáticamente y se confirma visualmente."),
    ("Alcance", "Prueba con 15 guías (33 videos)." if SCOPE == "pilot" else "Todas las guías con video (223 videos)."),
    ("Generado", date.today().isoformat()),
]
for r, (a, b) in enumerate(crit_rows, 1):
    crit.cell(row=r, column=1, value=a).font = Font(name=F, bold=r in (1, 12, 18), size=10)
    crit.cell(row=r, column=2, value=b).font = Font(name=F, bold=r in (1, 12), size=10)
    crit.cell(row=r, column=2).alignment = Alignment(wrap_text=True, vertical="top")
crit.column_dimensions["A"].width = 40
crit.column_dimensions["B"].width = 110

# Resumen con fórmulas sobre las otras hojas
res["A1"] = "Diagnóstico de guías y videos de SINAI"
res["A1"].font = Font(name=F, size=16, bold=True, color="1F4E78")
res["A2"] = f"Alcance: {'prueba con 15 guías' if SCOPE == 'pilot' else 'todas las guías'} · Generado {date.today().isoformat()}"
res["A2"].font = Font(name=F, size=10, italic=True, color="595959")
gl, vl = len(g_rows) + 4, len(vrows_x) + 4
lines = [
    ("Guías", None),
    ("Total de guías", f"=COUNTA(Guías!D5:D{gl})"),
    ("Administrativo", f'=COUNTIF(Guías!A5:A{gl},"Administrativo")'),
    ("Docente", f'=COUNTIF(Guías!A5:A{gl},"Docente")'),
    ("Estudiante", f'=COUNTIF(Guías!A5:A{gl},"Estudiante")'),
    ("Sin video", f'=COUNTIF(Guías!H5:H{gl},"Sin video*")'),
    ("Con estructura de la skill", f'=COUNTIF(Guías!F5:F{gl},"Skill")'),
    ("Analizadas en este informe", f'=COUNTA(Guías!D5:D{gl})-COUNTIF(Guías!H5:H{gl},"Fuera de la prueba")-COUNTIF(Guías!H5:H{gl},"Sin video*")'),
    ("", None),
    ("Videos analizados", None),
    ("Total de videos", f"=COUNTA(Videos!D5:D{vl})"),
    ("Vigentes", f'=COUNTIF(Videos!J5:J{vl},"Vigente")'),
    ("Módulo equivocado", f'=COUNTIF(Videos!J5:J{vl},"*Módulo equivocado*")'),
    ("Desactualizados", f'=COUNTIF(Videos!J5:J{vl},"*Desactualizado*")'),
    ("Revisar (tema, ruta no visible, posible migración)", f'=COUNTIF(Videos!J5:J{vl},"*Revisar*")+COUNTIF(Videos!J5:J{vl},"*Ruta no visible*")+COUNTIF(Videos!J5:J{vl},"*No corresponde*")'),
    ("No disponibles en YouTube", f'=COUNTIF(Videos!J5:J{vl},"*No disponible*")'),
    ("Ruta identificada", f'=COUNTIF(Videos!M5:M{vl},"?*")'),
    ("", None),
    ("Capturas tomadas", f'=COUNTIF(Capturas!G5:G{len(cap_rows) + 4},"Tomada*")'),
    ("Capturas pendientes", f'=COUNTIF(Capturas!G5:G{len(cap_rows) + 4},"Pendiente")'),
    ("Guías actualizadas en esta revisión", f'=COUNTIF(Guías!N5:N{gl},"Sí")'),
    ("Guías escritas desde el código", f'=COUNTIF(Guías!O5:O{gl},"Escrita desde el código*")'),
    ("Guías aún sin verificar (borrador o migradas)", f'=COUNTIF(Guías!O5:O{gl},"Borrador*")+COUNTIF(Guías!O5:O{gl},"Migrada*")'),
    ("Botones de Ayuda que requieren cambio en la app", f'=COUNTIF(\'Botones de Ayuda\'!A5:A{len(bot) + 4},"Requiere*")'),
]
for r, (a, f) in enumerate(lines, 4):
    ca = res.cell(row=r, column=1, value=a)
    ca.font = Font(name=F, size=11, bold=f is None and bool(a), color="1F4E78" if f is None else "000000")
    if f:
        res.cell(row=r, column=2, value=f).font = Font(name=F, size=11)
res.column_dimensions["A"].width = 52
res.column_dimensions["B"].width = 14
res["D4"] = "Hojas"
res["D4"].font = Font(name=F, bold=True, color="1F4E78")
for r, (n, d) in enumerate([("Guías", "Todas las guías con estado, ruta, repositorio y archivo de código."),
                            ("Videos", "Detalle de cada video analizado."), ("Sin video", "Guías que no tienen video."),
                            ("Módulo equivocado", "Videos del módulo que no corresponde."),
                            ("Desactualizados", "Videos de pantallas migradas o eliminadas."),
                            ("Revisar", "Casos para revisión humana."),
                            ("Capturas", "Capturas tomadas y pendientes, con el motivo de cada pendiente."),
                            ("Hallazgos", "Por guía: pantalla real, afirmaciones falsas, bugs y avisos."),
                            ("Botones de Ayuda", "Enlaces de ayuda del código: correctos y los que desarrollo debe cambiar."),
                            ("Criterios", "Definiciones y método.")], 5):
    c = res.cell(row=r, column=4, value=n)
    c.hyperlink = f"#'{n}'!A1"
    c.font = Font(name=F, color="0563C1", underline="single")
    res.cell(row=r, column=5, value=d).font = Font(name=F, size=10)
res.column_dimensions["D"].width = 22
res.column_dimensions["E"].width = 70

wb.save(OUT)
print(f"OK guías={len(g_rows)} videos={len(vrows_x)} capturas={len(cap_rows)} -> {OUT}")
