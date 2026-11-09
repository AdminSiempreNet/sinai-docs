"""Reemplaza cada bloque <PlanillaGuide id="..."> de la guía de calificaciones por su versión actualizada."""
import re
from pathlib import Path

GUIA = Path(r"C:\Users\andyg\Desktop\SIEMPRE.NET\SINAI\sinai-docs\web\content\docs\administrativo"
            r"\registro-de-logros-y-calificaciones\calificaciones\registro-por-actividades.mdx")
BLOQUES = Path(__file__).resolve().parents[1] / "fase3" / "cal"

texto = GUIA.read_text(encoding="utf8")
for f in sorted(BLOQUES.glob("*.mdx")):
    nuevo = f.read_text(encoding="utf8").strip()
    gid = re.search(r'<PlanillaGuide\b[^>]*?\bid="([^"]+)"', nuevo, re.S).group(1)
    # Inicio: la etiqueta <PlanillaGuide (no Group) cuyo id coincide; fin: el primer </PlanillaGuide> posterior.
    m = re.search(r'<PlanillaGuide\b(?!Group)[^>]*?\bid="' + re.escape(gid) + r'"', texto, re.S)
    if not m:
        print("NO ENCONTRADO", gid)
        continue
    ini = texto.rfind("<PlanillaGuide", 0, m.end())
    fin = texto.index("</PlanillaGuide>", m.end()) + len("</PlanillaGuide>")
    viejo = texto[ini:fin]
    if "<PlanillaGuide " in viejo[1:] and "<PlanillaGuideGroup" not in viejo:
        print("ANIDADO, se omite", gid)
        continue
    texto = texto[:ini] + nuevo + texto[fin:]
    print(f"OK {gid}: {viejo.count(chr(10))} -> {nuevo.count(chr(10))} líneas")

texto = re.sub(r'^lastModified:.*$', 'lastModified: "2026-10-30"', texto, count=1, flags=re.M)
if not re.search(r"^lastReviewed:", texto, re.M):
    texto = texto.replace('lastModified: "2026-10-30"', 'lastModified: "2026-10-30"\nlastReviewed: "2026-10-30"', 1)
GUIA.write_text(texto, encoding="utf8")
