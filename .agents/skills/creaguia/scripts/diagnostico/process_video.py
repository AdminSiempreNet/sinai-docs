"""Descarga un video, extrae los cambios de la franja superior (URL + menú) y mide el color del menú.

Uso: process_video.py <youtube_id> <dir_datos>
Deja en <dir_datos>/<id>/: meta.json, crops/*.jpg, sheet_*.jpg
"""
import json, subprocess, sys, shutil
from pathlib import Path

import imageio_ffmpeg, imagehash, numpy as np
from PIL import Image, ImageDraw
import yt_dlp

VID, DATA = sys.argv[1], Path(sys.argv[2])
FF = imageio_ffmpeg.get_ffmpeg_exe()
d = DATA / VID
d.mkdir(parents=True, exist_ok=True)
meta = {"id": VID}

# 1. Descarga
mp4 = d / "video.mp4"
if not mp4.exists():
    opts = {"quiet": True, "no_warnings": True, "noprogress": True, "outtmpl": str(d / "video.%(ext)s"),
            "format": "bv*[height<=720][ext=mp4]/b[height<=720]/b", "ffmpeg_location": FF,
            "merge_output_format": "mp4"}
    try:
        with yt_dlp.YoutubeDL(opts) as y:
            info = y.extract_info(f"https://www.youtube.com/watch?v={VID}", download=True)
        meta.update(yt_title=info.get("title"), upload_date=info.get("upload_date"),
                    duration=info.get("duration"), status="ok")
    except Exception as e:
        meta.update(status="no_disponible", error=str(e)[:300])
        (d / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf8")
        print(json.dumps(meta, ensure_ascii=False)); sys.exit(0)
else:
    old = json.loads((d / "meta.json").read_text(encoding="utf8")) if (d / "meta.json").exists() else {}
    meta.update({k: old.get(k) for k in ("yt_title", "upload_date", "duration")}, status="ok")

# 2. Un fotograma cada 2 s, normalizado a 1280 de ancho
frames = d / "frames"
shutil.rmtree(frames, ignore_errors=True); frames.mkdir()
subprocess.run([FF, "-v", "error", "-i", str(mp4), "-vf", "fps=1/2,scale=1280:-2", str(frames / "f_%04d.png")], check=True)

# 3. Franja superior (barra de direcciones + menú + submenú), deduplicada
crops = d / "crops"
shutil.rmtree(crops, ignore_errors=True); crops.mkdir()
kept, last_hash, colors = [], None, []
files = sorted(frames.glob("*.png"))
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB")
    band = im.crop((0, 0, im.width, int(im.height * 0.32)))
    # Color del menú: píxeles saturados azules vs verdes en la franja
    a = np.asarray(band.resize((320, 58))).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    blue = ((b > r + 40) & (b > g + 5) & (b > 90)).sum()
    green = ((g > r + 30) & (g > b + 10) & (g > 90)).sum()
    colors.append((int(blue), int(green)))
    h = imagehash.dhash(band, hash_size=16)
    if last_hash is None or h - last_hash > 18:
        t = i * 2
        band.save(crops / f"t{t:05d}.jpg", quality=88)
        kept.append(t)
        last_hash = h
shutil.rmtree(frames, ignore_errors=True)

# Si quedaron demasiados recortes, tomar una muestra repartida
MAX = 18
sel = kept if len(kept) <= MAX else [kept[round(j * (len(kept) - 1) / (MAX - 1))] for j in range(MAX)]

# 4. Hojas de 6 recortes, con la marca de tiempo
for old in d.glob("sheet_*.jpg"):
    old.unlink()
for s in range(0, len(sel), 6):
    group = [Image.open(crops / f"t{t:05d}.jpg") for t in sel[s:s + 6]]
    W, H = group[0].width, sum(g.height + 22 for g in group)
    sheet = Image.new("RGB", (W, H), "white")
    y = 0
    for t, g in zip(sel[s:s + 6], group):
        ImageDraw.Draw(sheet).text((6, y + 5), f"{VID}  t={t // 60}:{t % 60:02d}", fill="red")
        sheet.paste(g, (0, y + 22)); y += g.height + 22
    sheet.save(d / f"sheet_{s // 6 + 1}.jpg", quality=85)

bl = np.median([c[0] for c in colors]) if colors else 0
gr = np.median([c[1] for c in colors]) if colors else 0
meta.update(frames=len(files), crops=len(kept), sheets=len(list(d.glob("sheet_*.jpg"))),
            blue_px=float(bl), green_px=float(gr),
            color_auto="azul" if bl > gr * 1.5 and bl > 300 else "verde" if gr > bl * 1.5 and gr > 300 else "indeterminado")
(d / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf8")
print(json.dumps(meta, ensure_ascii=False))

# Con "borrar" como tercer argumento se elimina el video descargado; solo quedan los recortes y las hojas.
if len(sys.argv) > 3 and sys.argv[3] == "borrar":
    mp4.unlink(missing_ok=True)
