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
  if (/copia-de-seguridad|back-up/.test(path)) return 'ShieldCheck';
  if (/calendario|periodo/.test(path)) return 'CalendarDays';
  if (/matricula|prematricula|inscripcion|reingreso|especialidades|cambio-de-grupo/.test(path)) return 'UsersRound';
  if (/estudiantes|piar|fotografias|lista-por-grupo/.test(path)) return 'UsersRound';
  if (/personal|funcionarios|horario|asignacion|autorizaciones|planta-de-cargos/.test(path)) return 'UserRoundCheck';
  if (/evaluacion|calificaciones|nota|boletin|refuerzos|recuperaciones|consolidar|detallado/.test(path)) return 'ClipboardCheck';
  if (/planeacion|curricular|mallas|estandares|logros|actividades|diario-pedagogico/.test(path)) return 'NotebookPen';
  if (/seguimiento|anotaciones|inasistencias|excusas|observador|comportamiento|convivencia/.test(path)) return 'ScanSearch';
  if (/informes|listados/.test(path)) return 'FileBarChart2';
  if (/herramientas|aula-virtual|chamilo|importaciones/.test(path)) return 'Wrench';
  if (/institucion|establecimiento|configuracion-academica|configuracion-fisica/.test(path)) return 'Landmark';
  if (/promocion/.test(path)) return 'BadgeCheck';
  if (/procesos-de-temporada/.test(path)) return 'CalendarRange';
  if (/actas|reuniones/.test(path)) return 'ClipboardList';
  if (/tareas/.test(path)) return 'ListTodo';
  if (/trasladar|cambio/.test(path)) return 'ArrowRightLeft';
  if (/banco|foliar/.test(path)) return 'BookMarked';
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
  icon(icon) {
    if (!icon) return;

    const Icon = menuIcons[icon] ?? BookOpenCheck;
    return createElement(Icon, {
      className: 'sinai-menu-icon',
      'aria-hidden': true,
    });
  },
});
