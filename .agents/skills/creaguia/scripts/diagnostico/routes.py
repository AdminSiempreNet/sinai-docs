"""Índice de rutas del código de SINAI y resolución de una URL vista en un video.

Uso como módulo: from routes import build_index, resolve
"""
import re
from pathlib import Path

ROOT = Path(r"C:\Users\andyg\Desktop\SIEMPRE.NET\SINAI")
APPS = {
    "App.aspx": ("frontend/sinai-react-v1 (websinai)", ROOT / "frontend/sinai-react-v1/src"),
    "Main.aspx": ("frontend/sinai-react-v2 (sinai-react)", ROOT / "frontend/sinai-react-v2/sinai-react/src"),
    "Index.aspx": ("frontend/sinai-react-v3 (frontend)", ROOT / "frontend/sinai-react-v3/src"),
}
WEBFORMS = ROOT / "webforms/WEBSINAI"


IMPORT_RE = re.compile(r"(?:const\s+(\w+)\s*=\s*(?:React\.)?lazy\(\s*\(\)\s*=>\s*\{?\s*(?:return\s+)?import\(\s*['\"]([^'\"]+)['\"]|import\s+(\w+)\s+from\s+['\"]([^'\"]+)['\"])", re.S)
ROUTE_RE = re.compile(r"path=[\"']([^\"']+)[\"'][^<>]*?element=\{\s*<(\w+)|element=\{\s*<(\w+)[^>]*>[^<>]*?path=[\"']([^\"']+)[\"']", re.S)


def _component_file(src_root, file, mod):
    if mod.startswith("."):
        base = (file.parent / mod)
    else:
        base = src_root / mod
    for cand in [base] + [base.with_name(base.name + e) for e in (".tsx", ".jsx", ".js", ".ts")] +                 [base / ("index" + e) for e in (".tsx", ".jsx", ".js", ".ts")]:
        if cand.is_file():
            return cand.resolve().relative_to(ROOT).as_posix()
    return None


WRAPPERS = {"ProtectedRoute", "Suspense", "Fragment", "Navigate", "Route", "Outlet", "React"}


def _scan(mount, src_root, files):
    """Devuelve (ruta, archivo, redirige_a) por cada <Route> con path."""
    out = []
    for f in files:
        t = f.read_text(encoding="utf8", errors="ignore")
        if "<Route" not in t:
            continue
        imports = {}
        for a, b, c, d in IMPORT_RE.findall(t):
            imports[a or c] = b or d
        for names, mod in re.findall(r"import\s*\{([^}]+)\}\s*from\s*[\"']([^\"']+)[\"']", t):
            for n in names.split(","):
                n = n.split(" as ")[-1].strip()
                if n:
                    imports.setdefault(n, mod)
        for chunk in re.split(r"<Route(?=[\s>])", t)[1:]:
            chunk = re.split(r"<Route(?=[\s>])|</Route", chunk)[0]
            pm = re.search(r"path=[\"']([^\"']+)[\"']", chunk)
            dyn = re.search(r"path=\{\s*(\w+)\s*\+\s*[\"']([^\"']+)[\"']\s*\}", chunk)
            if dyn:
                const = re.search(r"const\s+" + dyn.group(1) + r"\s*=\s*[\"']([^\"']+)[\"']", t)
                if not const:
                    continue
                path = "/" + (const.group(1) + dyn.group(2)).lstrip("/")
            elif pm:
                path = "/" + pm.group(1).lstrip("/")
            else:
                continue
            nav = re.search(r"<Navigate\s+to=[\"']([^\"']+)[\"']", chunk)
            comps = [c for c in re.findall(r"<([A-Z]\w+)", chunk) if c not in WRAPPERS]
            comp_file = None
            for c in comps:
                if c in imports:
                    comp_file = _component_file(src_root, f, imports[c])
                    if comp_file:
                        break
            out.append((path, comp_file or f.relative_to(ROOT).as_posix(), nav.group(1) if nav else None))
    return out


def build_index():
    idx = {"App.aspx": [], "Main.aspx": [], "Index.aspx": [], "webforms": {}}
    v1 = APPS["App.aspx"][1]
    idx["App.aspx"] = _scan("App.aspx", v1, [f for f in v1.rglob("*.js*") if "node_modules" not in f.parts])
    v2 = APPS["Main.aspx"][1]
    idx["Main.aspx"] = _scan("Main.aspx", v2, [f for f in v2.rglob("*.tsx") if "node_modules" not in f.parts])
    gen = (APPS["Index.aspx"][1] / "routeTree.gen.ts").read_text(encoding="utf8")
    v3r = APPS["Index.aspx"][1] / "routes"
    for p in set(re.findall(r"fullPath: '([^']+)'", gen)):
        base = v3r / p.strip("/")
        cands = [base.with_name(base.name + ".tsx"), base / "index.tsx", base / "route.tsx"]
        hit = next((c for c in cands if c.is_file()), None)
        idx["Index.aspx"].append((p, hit.relative_to(ROOT).as_posix() if hit else "frontend/sinai-react-v3/src/routes" + p.rstrip("/"), None))
    for f in WEBFORMS.rglob("*.aspx"):
        if "ClientApp" in f.parts or "node_modules" in f.parts:
            continue
        rel = f.relative_to(WEBFORMS).as_posix()
        idx["webforms"][rel.lower()] = "webforms/WEBSINAI/" + rel
    return idx


def _pat(route):
    r = re.escape(route.rstrip("/") or "/")
    r = re.sub(r":(\w+)|\\\$(\w+)", r"[^/]+", r.replace("\\:", ":"))
    return re.compile("^" + r + "/?$", re.I)


def resolve(url, idx):
    """Devuelve dict con montaje, repositorio, ruta y archivo, o el motivo si no se encuentra."""
    u = url.strip().split("?")[0].split("#")[0]
    u = re.sub(r"^(https?://)?[^/]*(sinai|localhost|siempreserver|\.co\b|\.com\b)[^/]*", "", u, flags=re.I)  # quita el dominio
    u = re.sub(r"^/?WEBSINAI(?=/)", "", u, flags=re.I)  # carpeta de la app en servidores locales
    u = re.sub(r"^/?\d+/", "/", u)  # prefijo de institución
    u = "/" + u.lstrip("/")
    for mount, (repo, _) in APPS.items():
        m = re.match(r"^/" + re.escape(mount) + r"(/.*)?$", u, re.I)
        if m:
            sub = (m.group(1) or "/").rstrip("/") or "/"
            hits = [(route, f, nav) for route, f, nav in idx[mount] if _pat(route).match(sub)]
            if hits:
                hits.sort(key=lambda h: (h[2] is not None, ":" in h[0]))  # rutas reales primero, luego exactas
                route, f, nav = hits[0]
                r = {"montaje": mount, "repo": repo, "ruta": f"{mount}{sub}", "archivo": f, "existe": True, "redirige": None}
                if nav:
                    target = "/" + nav.split("?")[0].lstrip("/")
                    tgt = next((h for h in idx[mount] if _pat(h[0]).match(target) and not h[2]), None)
                    r.update(redirige=f"{mount}{nav if nav.startswith('/') else '/' + nav}", archivo=tgt[1] if tgt else f)
                return r
            return {"montaje": mount, "repo": repo, "ruta": f"{mount}{sub}", "archivo": None, "existe": False, "redirige": None}
    m = re.match(r"^/(.+\.aspx)", u, re.I)
    if m:
        f = idx["webforms"].get(m.group(1).lower())
        return {"montaje": "webforms", "repo": "webforms/WEBSINAI", "ruta": m.group(1), "archivo": f, "existe": bool(f), "redirige": None}
    return {"montaje": None, "repo": None, "ruta": u, "archivo": None, "existe": False, "redirige": None}


if __name__ == "__main__":
    i = build_index()
    print({k: len(v) for k, v in i.items()})
    for t in ["sinai.net.co/Main.aspx/Evaluacion/CentrosInteres/Matriculas", "https://www.sinai.net.co/App.aspx/Menu/Icons/444819",
              "sinai.net.co/Admin/Menu/Inicio.aspx", "sinai.net.co/Index.aspx/evaluacion/preinformes/grupo"]:
        print(t, "->", resolve(t, i))
