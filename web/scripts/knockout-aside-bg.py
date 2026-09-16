"""Remove near-white backgrounds from guide-aside illustrations (v2 set)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ASSETS = Path(
    r"C:\Users\andyg\.cursor\projects\c-Users-andyg-Desktop-SIEMPRE-NET-sinai-docs\assets"
)
OUT_DIR = Path(__file__).resolve().parents[1] / "public" / "images" / "guide-aside"

MAPPING = {
    "aside-calificaciones-v2.png": "calificaciones.png",
    "aside-seguimiento-v2.png": "seguimiento.png",
    "aside-primeros-pasos-v2.png": "primeros-pasos.png",
    "aside-configuracion-v2.png": "configuracion.png",
    "aside-personal-v2.png": "personal.png",
    "aside-estudiantes-v2.png": "estudiantes.png",
    "aside-curriculo-v2.png": "curriculo.png",
    "aside-convivencia-v2.png": "convivencia.png",
    "aside-cierre-periodo-v2.png": "cierre-periodo.png",
    "aside-cierre-ano-v2.png": "cierre-ano.png",
    "aside-usuarios-v2.png": "usuarios.png",
    "aside-herramientas-v2.png": "herramientas.png",
    "aside-ayuda-v2.png": "ayuda.png",
}


def remove_white_bg(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            whiteness = (r + g + b) / 3.0
            chroma = max(r, g, b) - min(r, g, b)

            if whiteness >= 245 and chroma <= 18:
                pixels[x, y] = (r, g, b, 0)
            elif whiteness >= 235 and chroma <= 22:
                t = (whiteness - 235) / 20.0
                c_factor = 1.0 - min(chroma / 22.0, 1.0)
                new_a = int(a * (1.0 - t * c_factor))
                pixels[x, y] = (r, g, b, max(0, min(255, new_a)))

    bbox = rgba.getbbox()
    if bbox:
        pad = 24
        left, top, right, bottom = bbox
        left = max(0, left - pad)
        top = max(0, top - pad)
        right = min(w, right + pad)
        bottom = min(h, bottom + pad)
        rgba = rgba.crop((left, top, right, bottom))

    return rgba


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for src_name, dest_name in MAPPING.items():
        src = ASSETS / src_name
        if not src.exists():
            print("MISSING", src_name)
            continue
        result = remove_white_bg(Image.open(src))
        dest = OUT_DIR / dest_name
        result.save(dest, "PNG", optimize=True)
        print(f"{dest_name}: {result.size} {result.mode} corner={result.getpixel((0, 0))}")


if __name__ == "__main__":
    main()
