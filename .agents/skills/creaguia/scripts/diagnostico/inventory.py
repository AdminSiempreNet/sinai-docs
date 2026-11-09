"""Inventario de guías: videos, pendientes de video y capturas pendientes."""
import json, re, sys
from pathlib import Path

DOCS = Path(r"C:\Users\andyg\Desktop\SIEMPRE.NET\SINAI\sinai-docs\web\content\docs")
OUT = Path(sys.argv[1])

def fm(text):
    m = re.match(r"---\n(.*?)\n---", text, re.S)
    d = {}
    if m:
        for line in m.group(1).splitlines():
            k, _, v = line.partition(":")
            d[k.strip()] = v.strip().strip('"')
    return d

guides = []
for f in sorted(DOCS.rglob("*.mdx")):
    if f.name == "index.mdx":
        continue
    t = f.read_text(encoding="utf8")
    rel = f.relative_to(DOCS).as_posix()
    meta = fm(t)
    videos = []
    for m in re.finditer(r"<YouTube\b([^>]*?)/>", t, re.S):
        a = m.group(1)
        vid = re.search(r'\bid="([^"]+)"', a)
        ttl = re.search(r'title="([^"]*)"', a)
        ody = re.search(r'odyseeUrl="([^"]*)"', a)
        videos.append({"id": vid.group(1) if vid else None, "title": ttl.group(1) if ttl else "",
                       "odysee": ody.group(1) if ody else None})
    for m in re.finditer(r"\{\s*id:\s*'([^']+)',\s*title:\s*'([^']*)'(.*?)\}", t, re.S):
        ody = re.search(r"odyseeUrl:\s*'([^']*)'", m.group(3))
        videos.append({"id": m.group(1), "title": m.group(2), "odysee": ody.group(1) if ody else None})
    pend_imgs = [re.sub(r"\s+", " ", p).strip() for p in re.findall(r"<GuideImagePending>(.*?)</GuideImagePending>", t, re.S)]
    guides.append({
        "path": rel,
        "role": rel.split("/")[0],
        "title": meta.get("title", ""),
        "skill_structure": "## Guía paso a paso" in t,
        "videos": videos,
        "video_pending": "<GuideVideoPending" in t,
        "images_pending": pend_imgs,
    })

OUT.write_text(json.dumps(guides, ensure_ascii=False, indent=1), encoding="utf8")
ids = {v["id"] for g in guides for v in g["videos"] if v["id"]}
print(f"guías={len(guides)} con_video={sum(1 for g in guides if g['videos'])} ids_unicos={len(ids)} "
      f"capturas_pendientes={sum(len(g['images_pending']) for g in guides)}")
