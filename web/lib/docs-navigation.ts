const ADMIN_SECTION_BY_NAME: Record<string, string> = {
  'Primeros pasos': '/docs/administrativo/primeros-pasos',
  'Configuración Institucional': '/docs/administrativo/configuracion-institucional',
  'Gestión de personal': '/docs/administrativo/gestion-de-personal',
  'Gestión de estudiantes': '/docs/administrativo/gestion-de-estudiantes',
  'Registro de logros y calificaciones':
    '/docs/administrativo/registro-de-logros-y-calificaciones',
  Currículo: '/docs/administrativo/curriculo',
  'Convivencia escolar': '/docs/administrativo/convivencia-escolar',
  'Cierre académico (periodo)': '/docs/administrativo/cierre-academico-periodo',
  'Cierre de año': '/docs/administrativo/cierre-anual',
  'Gestión de usuarios y permisos':
    '/docs/administrativo/gestion-de-usuarios-y-permisos',
  Herramientas: '/docs/administrativo/herramientas',
  Ayuda: '/docs/administrativo/ayuda',
};

const DOCENTE_SECTION_BY_NAME: Record<string, string> = {
  "Primeros pasos": "/docs/docente/primeros-pasos",
  "Mi labor docente": "/docs/docente/mi-labor-docente",
  "Estudiantes": "/docs/docente/estudiantes",
  "Planeación y currículo": "/docs/docente/planeacion-y-curriculo",
  "Registro de calificaciones": "/docs/docente/registro-de-calificaciones",
  "Asistencia y seguimiento": "/docs/docente/asistencia-y-seguimiento",
  "Convivencia y observador": "/docs/docente/convivencia-y-observador",
  "Cierre académico (periodo)": "/docs/docente/cierre-academico-periodo",
  "Cierre de año": "/docs/docente/cierre-anual",
  "Aula virtual": "/docs/docente/aula-virtual",
  "Herramientas": "/docs/docente/herramientas",
  "SINAI Desktop": "/docs/docente/sinai-desktop",
  Ayuda: "/docs/docente/ayuda",
};

const ESTUDIANTE_SECTION_BY_NAME: Record<string, string> = {
  "Primeros pasos": "/docs/estudiante/primeros-pasos",
  "Mi cuenta y comunicaciones": "/docs/estudiante/mi-cuenta-y-comunicaciones",
  "Actividad académica": "/docs/estudiante/actividad-academica",
  "Resultados académicos": "/docs/estudiante/resultados-academicos",
  "Matrícula": "/docs/estudiante/matricula",
  "Asistencia y convivencia": "/docs/estudiante/asistencia-y-convivencia",
};

export const ROLE_SECTIONS: Record<string, Record<string, string>> = {
  administrativo: ADMIN_SECTION_BY_NAME,
  docente: DOCENTE_SECTION_BY_NAME,
  estudiante: ESTUDIANTE_SECTION_BY_NAME,
};

export const SECTION_HREFS = Object.values(ROLE_SECTIONS).flatMap((sections) => Object.values(sections));
