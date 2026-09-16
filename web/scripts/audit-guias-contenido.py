"""Audit all docs MDX guides: empty / video-only / text-only / complete."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "content" / "docs"
OUT = Path(__file__).resolve().parents[1] / "scripts" / "audit-guias-contenido.json"
OUT_MD = Path(__file__).resolve().parents[1] / "scripts" / "audit-guias-contenido.md"

PLACEHOLDER_RE = re.compile(
    r"pendiente de completar|respuesta pendiente|contenido pendiente|"
    r"pronto encontrar[aá]|pr[oó]ximamente|en construcci[oó]n|"
    r"esta gu[ií]a est[aá] pendiente",
    re.I,
)
VIDEO_RE = re.compile(
    r"<YouTube\b|<GuideVideos?\b|youtube\.com/|youtu\.be/|odysee\.com/",
    re.I,
)
BRIDGE_RE = re.compile(
    r"forma parte de la|consulte la gu[ií]a unificada|redirig|"
    r"se consolid[oó]|ir a ficha observador|\?version=(clasica|renovada)",
    re.I,
)
VIDEO_ONLY_PROSE_RE = re.compile(
    r"en este v[ií]deo|en el v[ií]deo|podr[aá]n observar|puede observar|"
    r"vea el (v[ií]deo|tutorial)|video tutorial",
    re.I,
)


def strip_frontmatter(text: str) -> tuple[dict, str]:
    meta: dict = {}
    if not text.startswith("---"):
        return meta, text
    end = text.find("\n---", 3)
    if end == -1:
        return meta, text
    fm = text[3:end].strip()
    body = text[end + 4 :]
    for line in fm.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip("\"'")
    return meta, body


def has_video(body: str) -> bool:
    return bool(VIDEO_RE.search(body))


def extract_prose(body: str) -> str:
    text = body
    text = re.sub(r"##\s*Preguntas frecuentes[\s\S]*", "", text, flags=re.I)
    text = re.sub(r"<GuideFAQ[\s\S]*?</GuideFAQ>", " ", text, flags=re.I)
    text = re.sub(r"<GuideVideos[\s\S]*?</GuideVideos>", " ", text, flags=re.I)
    text = re.sub(r"<YouTube\b[^>]*/>", " ", text, flags=re.I)
    text = re.sub(r"<YouTube\b[\s\S]*?</YouTube>", " ", text, flags=re.I)
    text = re.sub(r"<PlanillaGuideSwitcher[\s\S]*?</PlanillaGuideSwitcher>", " SWITCHER ", text, flags=re.I)
    text = re.sub(r"<GuideImageTrigger[\s\S]*?</GuideImageTrigger>", " ", text, flags=re.I)
    text = re.sub(r"<Card[\s\S]*?</Card>", " ", text, flags=re.I)
    text = re.sub(r"<Cards[\s\S]*?</Cards>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[[^\]]*\]\([^)]+\)", " ", text)
    text = PLACEHOLDER_RE.sub(" ", text)
    text = re.sub(r"^#+\s+.*$", " ", text, flags=re.M)
    text = re.sub(r"[`*_>#\-]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def meaningful_text(prose: str, body: str) -> bool:
    if "SWITCHER" in body or "PlanillaGuideSwitcher" in body:
        # hub with embedded guides counts as having text if switcher panels have steps
        if len(prose) >= 200:
            return True
    if len(prose) < 60:
        return False
    # ignore "watch the video" only blurbs
    cleaned = VIDEO_ONLY_PROSE_RE.sub(" ", prose)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if len(cleaned) < 50:
        return False
    # need some substance: steps or multiple sentences
    has_steps = bool(re.search(r"(?:^|\s)(?:\d+[\.\)]|[-•])\s+\S+", prose))
    words = cleaned.split()
    if has_steps and len(words) >= 20:
        return True
    if len(words) >= 40:
        return True
    return False


def is_index_hub(path: Path, body: str, prose: str) -> bool:
    if path.name != "index.mdx":
        return False
    # Hub with real embedded guide (e.g. observador switcher) is not a bare index.
    if "PlanillaGuideSwitcher" in body and meaningful_text(prose, body):
        return False
    if has_video(body) and meaningful_text(prose, body):
        return False
    return True


def is_bridge(path: Path, meta: dict, body: str, prose: str) -> bool:
    title = (meta.get("title") or path.stem).lower()
    if "redirige" in title or "redirect" in title:
        return True
    if BRIDGE_RE.search(body) and len(prose) < 280 and not has_video(body):
        return True
    return False


def is_role_landing(path: Path) -> bool:
    # administrativo/index.mdx, docente/index.mdx, etc.
    return path.name == "index.mdx" and path.parent.parent == ROOT


def classify(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8", errors="replace")
    meta, body = strip_frontmatter(raw)
    title = meta.get("title") or path.stem
    video = has_video(body)
    prose = extract_prose(body)
    text_ok = meaningful_text(prose, body)
    stub = bool(PLACEHOLDER_RE.search(body)) and not text_ok and not video
    only_faq = (
        "GuideFAQ" in body
        and not video
        and not text_ok
        and len(prose) < 80
    )

    if is_bridge(path, meta, body, prose):
        category = "puente"
    elif is_role_landing(path) or is_index_hub(path, body, prose):
        category = "indice"
    elif stub or only_faq or (not video and not text_ok):
        category = "sin_contenido"
    elif video and not text_ok:
        category = "solo_video"
    elif text_ok and not video:
        category = "solo_texto"
    else:
        category = "completo"

    rel = path.relative_to(ROOT).as_posix()
    module = rel.split("/", 1)[0]
    return {
        "module": module,
        "path": rel,
        "title": title,
        "guide": meta.get("guide") == "true",
        "category": category,
        "has_video": video,
        "has_text": text_ok,
        "prose_len": len(prose),
        "prose_preview": prose[:140],
    }


def main() -> None:
    rows = []
    for path in sorted(ROOT.rglob("*.mdx")):
        if "_archivo" in path.parts:
            continue
        if path.name == "index.mdx" and path.parent == ROOT:
            continue
        rows.append(classify(path))

    by_mod_cat: dict[str, dict[str, list]] = defaultdict(lambda: defaultdict(list))
    for r in rows:
        by_mod_cat[r["module"]][r["category"]].append(r)

    summary = {}
    for mod, cats in by_mod_cat.items():
        summary[mod] = {c: len(v) for c, v in sorted(cats.items())}
        summary[mod]["total"] = sum(len(v) for v in cats.values())

    payload = {"summary": summary, "rows": rows}
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# Auditoría de contenido de guías",
        "",
        "Excluye `_archivo`. Categorías:",
        "- **sin_contenido**: sin tutorial escrito útil y sin video",
        "- **solo_video**: tiene video, pero sin pasos/texto útil",
        "- **solo_texto**: tiene texto/pasos, pero sin video",
        "- **completo**: texto + video (referencia)",
        "- **indice**: aterrizaje/hub de sección (cards)",
        "- **puente**: página puente/redirección corta",
        "",
        "## Resumen por módulo",
        "",
    ]
    for mod in sorted(summary):
        s = summary[mod]
        lines.append(f"### {mod}")
        lines.append("")
        lines.append("| Categoría | Cantidad |")
        lines.append("|---|---:|")
        for k in [
            "sin_contenido",
            "solo_video",
            "solo_texto",
            "completo",
            "indice",
            "puente",
            "total",
        ]:
            if k in s:
                lines.append(f"| {k} | {s[k]} |")
        lines.append("")

    focus = ["sin_contenido", "solo_video", "solo_texto"]
    for cat in focus:
        lines.append(f"## {cat}")
        lines.append("")
        for mod in sorted(by_mod_cat):
            items = by_mod_cat[mod].get(cat, [])
            if not items:
                continue
            lines.append(f"### {mod} ({len(items)})")
            lines.append("")
            for r in sorted(items, key=lambda x: x["path"]):
                flag = " · guide" if r["guide"] else ""
                lines.append(f"- **{r['title']}** — `{r['path']}`{flag}")
            lines.append("")

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"Wrote {OUT_MD}")


if __name__ == "__main__":
    main()
