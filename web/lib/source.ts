import { ROLE_SECTIONS } from '@/lib/docs-navigation';
import { docs } from '@/.source/server';
import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import {
  ArrowRightLeft,
  Award,
  Backpack,
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  BookOpenText,
  BookMarked,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CalendarX,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  ClipboardPenLine,
  Contact,
  Eye,
  FileBarChart2,
  FileChartColumn,
  GraduationCap,
  History,
  House,
  Landmark,
  List,
  ListChecks,
  ListTodo,
  LogIn,
  MonitorCog,
  NotebookPen,
  NotebookTabs,
  PanelsTopLeft,
  Presentation,
  Puzzle,
  RotateCcw,
  ScanSearch,
  School,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  UserCog,
  UserPlus,
  UserRoundCheck,
  Users,
  UsersRound,
  Vote,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

const menuIcons: Record<string, LucideIcon> = {
  ArrowRightLeft,
  Award,
  Backpack,
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  BookOpenText,
  BookMarked,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CalendarX,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  ClipboardPenLine,
  Contact,
  Eye,
  FileBarChart2,
  FileChartColumn,
  GraduationCap,
  History,
  House,
  Landmark,
  List,
  ListChecks,
  ListTodo,
  LogIn,
  MonitorCog,
  NotebookPen,
  NotebookTabs,
  PanelsTopLeft,
  Presentation,
  Puzzle,
  RotateCcw,
  ScanSearch,
  School,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  UserCog,
  UserPlus,
  UserRoundCheck,
  Users,
  UsersRound,
  Vote,
  Wrench,
};

/**
 * El árbol de contenidos tiene muchas ramas sin icono en su metadata.
 * Esta taxonomía da a cada una una señal visual ligada a su proceso y evita
 * que la carpeta genérica opaque la navegación por rol.
 */
function getSemanticMetaIcon(metaPath: string) {
  const path = metaPath.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (/app-sinai-desktop|desktop/.test(path)) return 'MonitorCog';
  if (/primeros-pasos|ayuda/.test(path)) return 'House';
  if (/copia-de-seguridad|back-up/.test(path)) return 'ShieldCheck';
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
          if (!sections) return node;
          const sectionLandings = new Set(Object.values(sections));

          // `...folder` inserta también el index: queda 1 duplicado por sección.
          // Conservamos el primero (viene del separador) y descartamos el resto.
          const seenLandings = new Set<string>();

          const stripIconUnlessPrimeros = (child: typeof node.children[number]): typeof node.children[number] => {
            if (child.type === 'page') {
              const url = child.url ? String(child.url) : '';
              if (url.includes('/primeros-pasos/')) return child;
              return { ...child, icon: undefined };
            }

            if (child.type === 'folder') {
              return {
                ...child,
                icon: undefined,
                children: child.children.map(stripIconUnlessPrimeros),
              };
            }

            return child;
          };

          return {
            ...node,
            children: node.children
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
              .map(stripIconUnlessPrimeros),
          };
        },
      },
    ],
  },
  icon(icon) {
    if (!icon) return;

    const Icon = menuIcons[icon] ?? BookOpenCheck;
    return createElement(Icon, {
      className: 'sinai-menu-icon',
      'aria-hidden': true,
    });
  },
});
