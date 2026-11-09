"""Sesión de SINAI para capturas: entra como super y suplanta un usuario de la IE de pruebas.

Solo navega. Nunca envía formularios de guardar, eliminar o enviar.
"""
from pathlib import Path
from urllib.parse import urlparse

from dotenv import dotenv_values

# sinai-docs/.env (fuera de git): SINAI_URL, SINAI_USUARIO_SUPER, SINAI_PASSWORD_SUPER
ENV = dotenv_values(Path(__file__).resolve().parents[4] / ".env")
IE = "SISTEMAS INFORMATICOS EMPRESARIALES"
_u = urlparse(ENV["SINAI_URL"] if "://" in ENV["SINAI_URL"] else "https://" + ENV["SINAI_URL"])
BASE = f"{_u.scheme}://{_u.netloc}"


def settle(page, ms=8000):
    """Espera a que la red se calme, sin fallar si un recurso queda abierto."""
    try:
        page.wait_for_load_state("networkidle", timeout=ms)
    except Exception:
        pass


def login_super(page):
    page.goto(f"{BASE}/Web/Default.aspx", wait_until="load", timeout=120000)
    page.fill("#UsernameTxt", ENV["SINAI_USUARIO_SUPER"])
    page.fill("#PasswordTxt", ENV["SINAI_PASSWORD_SUPER"])
    page.click("#Entrar")
    page.wait_for_url(lambda u: "/Web/Default.aspx" not in u, timeout=60000)
    settle(page)
    if "/Super/" not in page.url:
        page.goto(f"{BASE}/Super/Inicio.aspx", wait_until="load")
    page.wait_for_selector("select[id$='RolLst']", timeout=60000)
    settle(page)


def _options(page, sel):
    return page.eval_on_selector_all(f"{sel} option", "os => os.map(o => ({v: o.value, t: o.textContent.trim(), s: o.selected}))")


def _select(page, sel, value):
    """Selecciona y espera el postback si el control lo dispara."""
    try:
        with page.expect_navigation(wait_until="load", timeout=8000):
            page.select_option(sel, value)
    except Exception:
        pass
    settle(page)


def enter_as(page, rol, usuario=None, calendario=None):
    """rol: texto del rol en el super (Rector, Administrativo, Coordinador, Docente, Estudiante...)."""
    if "/Super/Inicio.aspx" not in page.url:
        page.goto(f"{BASE}/Super/Inicio.aspx", wait_until="load")
    inst = "select[id$='InstitucionLst']"
    ie = next(o for o in _options(page, inst) if IE in o["t"])
    if not ie["s"]:
        _select(page, inst, ie["v"])
    if calendario:
        cal = next(o for o in _options(page, "select[id$='CalendarioLst']") if o["t"] == str(calendario))
        if not cal["s"]:
            _select(page, "select[id$='CalendarioLst']", cal["v"])
    rol_opt = next(o for o in _options(page, "select[id$='RolLst']") if o["t"].lower() == rol.lower())
    _select(page, "select[id$='RolLst']", rol_opt["v"])
    users = [o for o in _options(page, "select[id$='UsuarioLst']") if o["v"]]
    if not users:
        raise RuntimeError(f"No hay usuarios con rol {rol} en {IE}")
    if usuario:
        pick = next((o for o in users if usuario.lower() in o["t"].lower()), None)
        if pick is None:
            raise RuntimeError(f"No hay un usuario con rol {rol} que contenga «{usuario}»: " + ", ".join(o["t"] for o in users[:15]))
    else:
        pick = users[0]
    page.select_option("select[id$='UsuarioLst']", pick["v"])
    page.click("[id$='IrUsuario']")
    page.wait_for_url(lambda u: "/Super/" not in u, timeout=60000)
    settle(page)
    return pick["t"]


def goto(page, ruta):
    """ruta relativa al sitio, p. ej. 'Main.aspx/Evaluacion/CentrosInteres/Matriculas'."""
    page.goto(f"{BASE}/{ruta.lstrip('/')}", wait_until="load", timeout=120000)
    settle(page)
    page.wait_for_timeout(1500)


def login_directo(page, rol):
    """Inicia sesión con el usuario propio del rol (SINAI_USUARIO_<ROL> en .env), sin pasar por el super."""
    clave = rol.upper()
    page.goto(f"{BASE}/Web/Default.aspx", wait_until="load", timeout=120000)
    page.fill("#UsernameTxt", ENV[f"SINAI_USUARIO_{clave}"])
    page.fill("#PasswordTxt", ENV[f"SINAI_PASSWORD_{clave}"])
    page.click("#Entrar")
    page.wait_for_url(lambda u: "/Web/Default.aspx" not in u, timeout=60000)
    settle(page)
