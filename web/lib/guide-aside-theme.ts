export type GuideAsideTheme = {
  id: string;
  src: string;
  caption: string;
  alt: string;
};

const THEMES: GuideAsideTheme[] = [
  {
    id: 'observador',
    src: '/images/guide-aside/observador.png?v=3',
    caption: 'Elija la versión de su institución',
    alt: 'Ilustración escolar de acompañamiento y observación del estudiante en SINAI',
  },
  {
    id: 'calificaciones',
    src: '/images/guide-aside/calificaciones.png?v=3',
    caption: 'Identifique la planilla de su IE',
    alt: 'Ilustración escolar de planilla de calificaciones en SINAI',
  },
  {
    id: 'seguimiento',
    src: '/images/guide-aside/seguimiento.png?v=3',
    caption: 'Siga el día a día estudiantil',
    alt: 'Ilustración escolar de seguimiento a estudiantes en SINAI',
  },
  {
    id: 'primeros-pasos',
    src: '/images/guide-aside/primeros-pasos.png?v=3',
    caption: 'Comience por lo esencial',
    alt: 'Ilustración escolar de primeros pasos en SINAI',
  },
  {
    id: 'configuracion',
    src: '/images/guide-aside/configuracion.png?v=3',
    caption: 'Configure su institución',
    alt: 'Ilustración escolar de configuración institucional en SINAI',
  },
  {
    id: 'personal',
    src: '/images/guide-aside/personal.png?v=3',
    caption: 'Gestione su equipo',
    alt: 'Ilustración escolar de gestión de personal en SINAI',
  },
  {
    id: 'estudiantes',
    src: '/images/guide-aside/estudiantes.png?v=3',
    caption: 'Acompañe a sus estudiantes',
    alt: 'Ilustración escolar de gestión de estudiantes en SINAI',
  },
  {
    id: 'curriculo',
    src: '/images/guide-aside/curriculo.png?v=3',
    caption: 'Organice el currículo',
    alt: 'Ilustración escolar de currículo en SINAI',
  },
  {
    id: 'convivencia',
    src: '/images/guide-aside/convivencia.png?v=3',
    caption: 'Fortalezca la convivencia',
    alt: 'Ilustración escolar de convivencia en SINAI',
  },
  {
    id: 'cierre-periodo',
    src: '/images/guide-aside/cierre-periodo.png?v=3',
    caption: 'Cierre el periodo con orden',
    alt: 'Ilustración escolar de cierre de periodo en SINAI',
  },
  {
    id: 'cierre-ano',
    src: '/images/guide-aside/cierre-ano.png?v=3',
    caption: 'Cierre el año escolar',
    alt: 'Ilustración escolar de cierre de año en SINAI',
  },
  {
    id: 'usuarios',
    src: '/images/guide-aside/usuarios.png?v=3',
    caption: 'Administre accesos y roles',
    alt: 'Ilustración escolar de usuarios y permisos en SINAI',
  },
  {
    id: 'herramientas',
    src: '/images/guide-aside/herramientas.png?v=3',
    caption: 'Herramientas de apoyo',
    alt: 'Ilustración escolar de herramientas administrativas en SINAI',
  },
  {
    id: 'ayuda',
    src: '/images/guide-aside/ayuda.png?v=3',
    caption: 'Estamos para ayudarle',
    alt: 'Ilustración escolar de ayuda y soporte en SINAI',
  },
];

const DEFAULT_THEME: GuideAsideTheme = {
  id: 'default',
  src: '/images/guide-aside/estudiantes.png?v=3',
  caption: 'Consulte la guía de este proceso',
  alt: 'Ilustración escolar de guía administrativa en SINAI',
};

/** Resolve a thematic empty-aside illustration from an administrativo docs pathname. */
export function resolveGuideAsideTheme(pathname: string): GuideAsideTheme {
  const path = pathname.toLowerCase();

  if (path.includes('/observador')) return THEMES.find((t) => t.id === 'observador')!;
  if (path.includes('/calificaciones') || path.includes('registro-por-actividades') || path.includes('planilla')) {
    return THEMES.find((t) => t.id === 'calificaciones')!;
  }
  if (
    path.includes('/seguimiento-a-estudiantes') ||
    path.includes('/inasistencias') ||
    path.includes('/excusas') ||
    path.includes('/anotaciones')
  ) {
    return THEMES.find((t) => t.id === 'seguimiento')!;
  }
  if (path.includes('/primeros-pasos')) return THEMES.find((t) => t.id === 'primeros-pasos')!;
  if (path.includes('/configuracion-institucional')) return THEMES.find((t) => t.id === 'configuracion')!;
  if (path.includes('/gestion-de-personal')) return THEMES.find((t) => t.id === 'personal')!;
  if (path.includes('/gestion-de-estudiantes')) return THEMES.find((t) => t.id === 'estudiantes')!;
  if (path.includes('/curriculo')) return THEMES.find((t) => t.id === 'curriculo')!;
  if (path.includes('/convivencia')) return THEMES.find((t) => t.id === 'convivencia')!;
  if (path.includes('/cierre-academico-periodo')) return THEMES.find((t) => t.id === 'cierre-periodo')!;
  if (path.includes('/cierre-de-ano')) return THEMES.find((t) => t.id === 'cierre-ano')!;
  if (path.includes('/gestion-de-usuarios') || path.includes('/permisos')) {
    return THEMES.find((t) => t.id === 'usuarios')!;
  }
  if (path.includes('/herramientas')) return THEMES.find((t) => t.id === 'herramientas')!;
  if (path.includes('/ayuda')) return THEMES.find((t) => t.id === 'ayuda')!;
  if (path.includes('/registro-de-logros')) return THEMES.find((t) => t.id === 'calificaciones')!;

  return DEFAULT_THEME;
}

export function listGuideAsideThemes() {
  return THEMES;
}
