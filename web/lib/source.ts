import { ROLE_SECTIONS } from '@/lib/docs-navigation';
import { MenuIcon } from '@/components/menu-icon';
import { docs } from '@/.source/server';
import { loader } from 'fumadocs-core/source';
import { createElement, isValidElement } from 'react';

/**
 * El árbol de contenidos tiene muchas ramas sin icono en su metadata.
 * Esta taxonomía da a cada una una señal visual ligada a su proceso y evita
 * que la carpeta genérica opaque la navegación por rol.
 */
function getSemanticMetaIcon(metaPath: string) {
  const path = metaPath.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Páginas / carpetas de primer nivel (más específicas primero).
  if (/ingresar-a-sinai|como-ingresar/.test(path)) return 'LogIn';
  if (/recuperar-contrasena|cambiar-contrasena|restablecer-contrasena/.test(path)) return 'RotateCcw';
  if (/actualizar-perfil/.test(path)) return 'UserCog';
  if (/datos-institucionales/.test(path)) return 'Building2';
  if (/calendarios-cronogramas-periodos|calendarios(?!-)/.test(path)) return 'CalendarDays';
  if (/gestion-academica|escalas|areas-y-asignaturas|componentes|sedes-grupos/.test(path)) return 'School';
  if (/planta-de-cargos/.test(path)) return 'Users';
  if (/funcionarios/.test(path)) return 'Contact';
  if (/asignacion-academica|mi-asignacion|mi-horario/.test(path)) return 'UserRoundCheck';
  if (/seguimiento-docente/.test(path)) return 'ScanSearch';
  if (/registro-estudiantes|buscar-estudiante/.test(path)) return 'UserPlus';
  if (/informacion-de-estudiantes|cargar-fotografias|listas-por-grupo/.test(path)) return 'Contact';
  if (/novedades-de-estudiantes/.test(path)) return 'ArrowRightLeft';
  if (/validacion-y-electivas/.test(path)) return 'BadgeCheck';
  if (/seguimiento-a-estudiantes/.test(path)) return 'ChartNoAxesCombined';
  if (/calificaciones(?!-)|registro-de-calificaciones|registro-en-linea/.test(path)) return 'ClipboardList';
  if (/educacion-inclusiva|estudiantes-piar|piar-y-caracterizacion/.test(path)) return 'UsersRound';
  if (/logros-y-actividades|banco-de-logros|logros-del-periodo|actividades-del-periodo/.test(path)) return 'Target';
  if (/curriculo-estandar|curriculo-archivo|mallas-curriculares/.test(path)) return 'BookOpen';
  if (/calificacion-comportamiento|evaluacion-del-comportamiento/.test(path)) return 'ClipboardPenLine';
  if (/ficha-observador|observador/.test(path)) return 'Eye';
  if (/anotaciones|registro-de-anotaciones/.test(path)) return 'NotebookTabs';
  if (/consolidacion-y-calculo|calcular-puestos/.test(path)) return 'FileChartColumn';
  if (/reportes-consolidados|nivelaciones|refuerzos|observaciones/.test(path)) return 'ClipboardCheck';
  if (/comision-de-evaluacion|procesar-promocion|como-procesar|ajuste-de-nota|notas-finales|recuperaciones/.test(path)) {
    return 'Award';
  }
  if (/trasladar-matricula/.test(path)) return 'ArrowRightLeft';
  if (/usuarios(?!-)|generar-usuarios|permisos|otras-acciones/.test(path)) return 'UserCog';
  if (/preguntas-frecuentes|politicas|ayuda/.test(path)) return 'CircleHelp';
  if (/autoevaluacion/.test(path)) return 'ClipboardCheck';
  if (/gestion-de-reuniones|reuniones/.test(path)) return 'ClipboardList';
  if (/firmas-digitales/.test(path)) return 'BadgeCheck';
  if (/informes-digitales|informes(?!-)/.test(path)) return 'FileBarChart2';
  if (/copia-de-seguridad|back-up/.test(path)) return 'ShieldCheck';
  if (/chamilo|aula-virtual|tareas-en-linea|mis-tareas/.test(path)) return 'PanelsTopLeft';
  if (/generar-correos|comunidad-educativa|mensajes|mis-docentes/.test(path)) return 'Contact';
  if (/inasistencias|excusas/.test(path)) return 'CalendarX';
  if (/prematricula|matricula(?!-)/.test(path)) return 'UsersRound';
  if (/boletin|calificaciones-consolidadas|resultados-academicos/.test(path)) return 'FileBarChart2';
  if (/planeacion-de-clases|estandares|registro-de-desempenos|copiar-planeacion|diario-pedagogico|actividades-complementarias/.test(path)) {
    return 'NotebookPen';
  }
  if (/cuadro-de-honor/.test(path)) return 'Award';
  if (/inconsistencias/.test(path)) return 'CircleHelp';
  if (/sinai-desktop|inicio-y-configuracion|herramientas-y-sincronizacion/.test(path)) return 'MonitorCog';

  // Carpetas de sección / fallbacks amplios.
  if (/app-sinai-desktop|desktop/.test(path)) return 'MonitorCog';
  if (/primeros-pasos/.test(path)) return 'House';
  if (/cierre-de-ano|promocion/.test(path)) return 'Award';
  if (/cierre-academico|calendario|periodo/.test(path)) return 'CalendarDays';
  if (/gestion-de-estudiantes|matricula|prematricula|inscripcion|reingreso|especialidades|cambio-de-grupo/.test(path)) return 'UsersRound';
  if (/estudiantes|piar|fotografias|lista-por-grupo/.test(path)) return 'UsersRound';
  if (/gestion-de-personal|personal|funcionarios|horario|asignacion|autorizaciones|planta-de-cargos/.test(path)) return 'UserRoundCheck';
  if (/gestion-de-usuarios|usuarios-y-permisos/.test(path)) return 'UserCog';
  if (/registro-de-logros|evaluacion|calificaciones|nota|boletin|refuerzos|recuperaciones|consolidar|detallado/.test(path)) return 'ClipboardCheck';
  if (/curriculo|planeacion|curricular|mallas|estandares|logros|actividades|diario-pedagogico/.test(path)) return 'NotebookPen';
  if (/convivencia|seguimiento|anotaciones|inasistencias|excusas|observador|comportamiento/.test(path)) return 'ScanSearch';
  if (/informes|listados/.test(path)) return 'FileBarChart2';
  if (/herramientas|aula-virtual|chamilo|importaciones/.test(path)) return 'Wrench';
  if (/configuracion-institucional|institucion|establecimiento|configuracion-academica|configuracion-fisica/.test(path)) return 'Landmark';
  if (/procesos-de-temporada/.test(path)) return 'CalendarRange';
  if (/actas|reuniones/.test(path)) return 'ClipboardList';
  if (/tareas/.test(path)) return 'ListTodo';
  if (/trasladar|cambio/.test(path)) return 'ArrowRightLeft';
  if (/banco|foliar/.test(path)) return 'BookMarked';
  if (/archivo/.test(path)) return 'History';
  if (/general|inicio/.test(path)) return 'BookOpenText';

  return 'BookOpenCheck';
}

function pathFromDocsUrl(url: string) {
  return url.replace(/^\/docs\//, '').replace(/\/$/, '');
}

/**
 * Client Component serializable — Lucide vive solo en el cliente.
 */
function resolveMenuIcon(iconName: string | undefined) {
  if (!iconName) return undefined;
  return createElement(MenuIcon, {
    key: iconName,
    name: iconName,
    className: 'sinai-menu-icon',
  });
}

function iconNameFromNode(existingIcon: unknown, fallbackPath: string) {
  if (typeof existingIcon === 'string' && existingIcon.length > 0) {
    return existingIcon;
  }
  if (isValidElement(existingIcon)) {
    const props = existingIcon.props as { name?: string };
    if (typeof props.name === 'string') return props.name;
  }
  return getSemanticMetaIcon(fallbackPath);
}

function ensureFirstLevelIcon(existingIcon: unknown, fallbackPath: string) {
  return resolveMenuIcon(iconNameFromNode(existingIcon, fallbackPath));
}

// Completa en memoria la metadata de cada rol sin crear entradas adicionales
// ni exponer información en la navegación.
for (const meta of docs.meta) {
  if (!meta.icon || meta.icon === 'Folder') {
    meta.icon = getSemanticMetaIcon(meta.info.path);
  }
}

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  pageTree: {
    transformers: [
      {
        folder(node, folderPath) {
          const role = folderPath.replaceAll('\\', '/').split('/').filter(Boolean).at(-1) ?? '';
          const sections = ROLE_SECTIONS[role];
          const isKnownRoleRoot = role in ROLE_SECTIONS || role === 'generales';
          if (!isKnownRoleRoot) return node;

          const sectionLandings = new Set(Object.values(sections ?? {}));

          // `...folder` inserta también el index: queda 1 duplicado por sección.
          // Conservamos el primero (viene del separador) y descartamos el resto.
          const seenLandings = new Set<string>();

          // Iconos solo en el primer nivel de cada sección (p. ej. Gestión académica).
          // Los hijos anidados (Escalas, etc.) no llevan icono.
          // Se muta el nodo en lugar de copiarlo con spread: Fumadocs limpia sus
          // claves Symbol internas solo en los nodos originales, y una copia las
          // conservaría, rompiendo la serialización hacia Client Components.
          const applyFirstLevelIcons = (
            child: typeof node.children[number],
            depth: number,
          ): typeof node.children[number] => {
            if (child.type === 'page') {
              const url = child.url ? String(child.url) : '';
              child.icon =
                depth === 0 && !sectionLandings.has(url)
                  ? ensureFirstLevelIcon(child.icon, pathFromDocsUrl(url))
                  : undefined;
              return child;
            }

            if (child.type === 'folder') {
              const indexUrl = child.index?.url ? String(child.index.url) : '';
              const folderPathHint =
                indexUrl
                  ? pathFromDocsUrl(indexUrl)
                  : typeof child.name === 'string'
                    ? child.name
                    : '';

              child.icon = depth === 0 ? ensureFirstLevelIcon(child.icon, folderPathHint) : undefined;
              child.children.forEach((nested) => applyFirstLevelIcons(nested, depth + 1));
              return child;
            }

            return child;
          };

          // Roles planos (p. ej. generales) sin secciones con separador.
          if (!sections) {
            node.children.forEach((child) => applyFirstLevelIcons(child, 0));
            return node;
          }

          node.children = node.children
            .map((child): typeof node.children[number] => {
              if (child.type !== 'separator' || typeof child.name !== 'string') return child;
              const url = sections[child.name];
              return url ? { type: 'page', name: child.name, url, $id: child.$id } : child;
            })
            .filter((child) => {
              const url = 'url' in child && child.url ? String(child.url) : '';
              const name = 'name' in child && child.name ? String(child.name) : '';

              if (url.includes('/_archivo') || name.toLowerCase().includes('archivo (fuera')) {
                return false;
              }

              if (child.type === 'page' && sectionLandings.has(url)) {
                if (seenLandings.has(url)) return false;
                seenLandings.add(url);
              }

              return true;
            })
            .map((child) => applyFirstLevelIcons(child, 0));
          return node;
        },
      },
    ],
  },
  icon(icon) {
    if (!icon) return;
    return resolveMenuIcon(icon);
  },
});
