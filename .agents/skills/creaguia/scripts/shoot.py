"""Ejecuta una secuencia de pasos en SINAI y toma capturas. Solo lectura.

Uso: shoot.py <pasos.json> <dir_salida>

Pasos (lista de objetos):
  {"rol": "Rector"}                      entra como super y suplanta un usuario de ese rol
  {"goto": "Main.aspx/..."}             navega por URL
  {"click": "selector"} | {"click_text": "texto"}   clic (bloquea acciones que guardan)
  {"hover": "selector"}
  {"select": "selector", "label": "..."} | {"select": "selector", "index": 2}
  {"select_data": "selector", "rows": "selector filas"}   prueba opciones hasta que haya filas
  {"fill": "selector", "text": "..."}
  {"wait": 1500}
  {"shot": "archivo.jpg", "clip": "selector opcional", "full": false}
  {"dump": "etiqueta"}                   lista selects, botones y pestañas visibles
"""
import json, re, sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).parent))
from sinai_session import enter_as, goto, login_super, settle  # noqa: E402

sys.stdout.reconfigure(encoding="utf-8")
steps = json.loads(Path(sys.argv[1]).read_text(encoding="utf8"))
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

BLOCK = re.compile(r"^\s*(guardar|guardar cambios|eliminar|sí, eliminar|si, eliminar|enviar|enviar valoraciones|asignar|"
                   r"asignar a la columna|agregar|crear|crear calendario|aceptar|confirmar|cargar archivo|procesar|"
                   r"si, enviar|sí, enviar|generar|importar|restaurar)\s*$", re.I)
# Algunas acciones usan GET (p. ej. Enviar valoraciones de centros de interés), así que lock_writes no las cubre:
# la lista anterior aplica siempre y solo force_ok, puesto tras leer el código, permite un clic de esa lista.
blocked_requests = []
LOCK = {"on": False}


def guard(route):
    m = route.request.method
    if m in ("PUT", "DELETE", "PATCH") or (LOCK["on"] and m not in ("GET", "HEAD", "OPTIONS")):
        blocked_requests.append(f"{route.request.method} {route.request.url}")
        return route.abort()
    return route.continue_()


def check_click(page, loc):
    txt = (loc.inner_text(timeout=3000) or "").strip()
    val = loc.get_attribute("value") or ""
    for t in (txt, val):
        if t and BLOCK.match(t):
            raise RuntimeError(f"Clic bloqueado (acción que guarda): «{t}»")


def count_rows(page, st):
    return page.evaluate(st["rows_js"]) if "rows_js" in st else page.locator(st["rows"]).count()


def dump(page, tag):
    info = page.evaluate("""() => {
      const vis = e => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
      const sels = [...document.querySelectorAll('select')].filter(vis).map(s => ({id: s.id || s.name,
        sel: s.options[s.selectedIndex]?.text?.trim(), n: s.options.length,
        opts: [...s.options].slice(0, 12).map(o => o.text.trim())}));
      const btns = [...document.querySelectorAll('button, a.btn, input[type=button], input[type=submit], [role=tab], .nav-tabs a')]
        .filter(vis).map(b => (b.innerText || b.value || b.title || '').trim().replace(/\\s+/g,' ')).filter(t => t).slice(0, 60);
      const rows = document.querySelectorAll('table tbody tr').length;
      return {url: location.pathname + location.search, sels, btns, rows};
    }""")
    print(f"--- dump {tag}: {info['url']} filas={info['rows']}")
    for s in info["sels"]:
        print(f"  select #{s['id']} = «{s['sel']}» ({s['n']}): {s['opts']}")
    print("  botones:", info["btns"])


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1366, "height": 768}, locale="es-CO")
    ctx.route(re.compile(r"https?://[^/]*sinai[^/]*/.*", re.I), guard)
    # La app verifica Internet con HEAD no-cors a google.com/favicon.ico; se responde localmente.
    ctx.route("https://www.google.com/favicon.ico", lambda r: r.fulfill(status=200, body=""))
    ctx.add_init_script("""(() => { const f = window.fetch.bind(window);
      window.fetch = (u, o) => String(u).includes('google.com/favicon') ? Promise.resolve(new Response(null, {status: 200})) : f(u, o); })();""")
    page = ctx.new_page()
    page.on("dialog", lambda d: d.dismiss())
    logged = False
    for i, st in enumerate(steps):
        try:
            if "rol" in st:
                if not logged:
                    login_super(page); logged = True
                quien = enter_as(page, st["rol"], st.get("usuario"), st.get("calendario"))
                print(f"[{i}] entró como {st['rol']}: {quien}")
            elif "super" in st:
                goto(page, "Super/Inicio.aspx")
            elif "goto" in st:
                goto(page, st["goto"])
            elif "click" in st or "click_text" in st:
                loc = page.locator(st["click"]).first if "click" in st else page.get_by_text(st["click_text"], exact=st.get("exact", True)).first
                if not st.get("force_ok"):
                    check_click(page, loc)
                loc.click(timeout=10000)
                settle(page)
                page.wait_for_timeout(st.get("after", 1200))
            elif "hover" in st:
                page.locator(st["hover"]).first.hover(); page.wait_for_timeout(800)
            elif "select" in st:
                if "label" in st:
                    page.select_option(st["select"], label=st["label"])
                else:
                    page.select_option(st["select"], index=st["index"])
                settle(page); page.wait_for_timeout(st.get("after", 1500))
            elif "select_data" in st:
                n = page.locator(f"{st['select_data']} option").count()
                for k in range(st.get("start", 0), n):
                    page.select_option(st["select_data"], index=k)
                    settle(page); page.wait_for_timeout(st.get("after", 1500))
                    rows = count_rows(page, st)
                    if rows >= st.get("min", 1):
                        print(f"[{i}] {st['select_data']} opción {k}: {rows} filas"); break
                else:
                    print(f"[{i}] {st['select_data']}: ninguna opción con datos")
            elif "search" in st:
                sels, starts = st["search"], st.get("starts", [0] * len(st["search"]))
                tries = [0]

                def rec(level):
                    sel = sels[level]
                    n = page.locator(f"{sel} option").count()
                    for k in range(starts[level], n):
                        if tries[0] >= st.get("max_tries", 80):
                            return None
                        page.select_option(sel, index=k)
                        settle(page); page.wait_for_timeout(st.get("after", 1500))
                        if level + 1 < len(sels):
                            found = rec(level + 1)
                            if found:
                                return [k] + found
                            continue
                        tries[0] += 1
                        if count_rows(page, st) >= st.get("min", 1):
                            return [k]
                    return None

                found = rec(0)
                if found:
                    labels = [page.eval_on_selector(s, "e => e.options[e.selectedIndex].text") for s in sels]
                    print(f"[{i}] datos en {labels} ({count_rows(page, st)} filas)")
                else:
                    print(f"[{i}] sin combinación con datos tras {tries[0]} intentos")
            elif "lock_writes" in st:
                LOCK["on"] = True
                print(f"[{i}] escritura bloqueada: solo GET desde aquí")
            elif "fill_all" in st:
                vals = st["values"]
                n = page.locator(st["fill_all"]).count()
                for k in range(min(n, st.get("max", n))):
                    page.locator(st["fill_all"]).nth(k).fill(str(vals[k % len(vals)]))
                page.keyboard.press("Tab")
                page.wait_for_timeout(500)
            elif "viewport" in st:
                w, h = st["viewport"]
                page.set_viewport_size({"width": w, "height": h}); page.wait_for_timeout(1200)
            elif "eval" in st:
                if re.search(r"click|submit|dispatchEvent|__doPostBack|fetch\(|XMLHttpRequest", st["eval"]) and not st.get("force_ok"):
                    raise RuntimeError("eval bloqueado: ejecuta clics o peticiones; requiere force_ok tras leer el código")
                print(f"[{i}] eval:", page.evaluate(st["eval"]))
            elif "press" in st:
                page.keyboard.press(st["press"]); page.wait_for_timeout(600)
            elif "fill" in st:
                page.fill(st["fill"], st["text"])
            elif "wait" in st:
                page.wait_for_timeout(st["wait"])
            elif "shot" in st:
                path = OUT / st["shot"]
                if st.get("clip"):
                    page.locator(st["clip"]).first.screenshot(path=str(path), type="jpeg", quality=85)
                else:
                    page.screenshot(path=str(path), type="jpeg", quality=85, full_page=st.get("full", False))
                print(f"[{i}] captura {path.name}")
            elif "dump" in st:
                dump(page, st["dump"])
        except Exception as e:
            print(f"[{i}] ERROR en {st}: {str(e).splitlines()[0][:200]}")
            page.screenshot(path=str(OUT / f"error-{i}.png"))
            if st.get("required", True):
                break
    if blocked_requests:
        print("Peticiones bloqueadas:", blocked_requests)
    b.close()
