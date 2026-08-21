/**
 * Migra el contenido administrativo a la jerarquía de reestructure_menu.md
 * Ejecutar desde web/: node scripts/restructure-admin-menu.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, "../content/docs/administrativo");
const repoRoot = path.resolve(__dirname, "../..");

const CD = "capacitacion-documentada";
const PT = "procesos-de-temporada";

/** @type {Record<string, string>} oldRel -> newRel (sin .mdx, relativo a administrativo/) */
const MOVES = {
  // Primeros pasos
  [`${CD}/inicio/como-ingresar-a-sinai`]: "primeros-pasos/ingresar-a-sinai",
  [`${CD}/inicio/recuperar-contrasena`]: "primeros-pasos/recuperar-contrasena",
  [`${CD}/inicio/actualizar-datos-de-perfil-de-usuario`]: "primeros-pasos/actualizar-perfil",

  // Configuración institucional
  [`${CD}/establecimiento/institucion/configuracion-de-la-institucion`]:
    "configuracion-institucional/datos-institucionales",
  [`${CD}/establecimiento/calendario/calendarios`]:
    "configuracion-institucional/calendarios-cronogramas-periodos/calendarios",
  [`${CD}/establecimiento/configuracion-academica/configuracion-academica`]:
    "configuracion-institucional/calendarios-cronogramas-periodos/configuracion-de-parametros",
  [`${CD}/establecimiento/configuracion-academica/configuracion-sistema-evaluacion`]:
    "configuracion-institucional/calendarios-cronogramas-periodos/configuracion-de-escalas",
  [`${CD}/establecimiento/institucion/criterios-y-metodos-para-el-calculo-de-puestos`]:
    "configuracion-institucional/calendarios-cronogramas-periodos/cronogramas-y-periodos",
  [`${CD}/establecimiento/areas-y-asignatura`]:
    "configuracion-institucional/gestion-academica/areas-y-asignaturas",
  [`${CD}/establecimiento/configuracion-academica/configuracion-de-componentes`]:
    "configuracion-institucional/gestion-academica/componentes",
  [`${CD}/establecimiento/grupos/configuracion-de-grupos`]:
    "configuracion-institucional/gestion-academica/sedes-grupos-y-evaluacion",

  // Gestión de personal
  [`${CD}/personal/planta-de-cargos/planta-de-cargos`]:
    "gestion-de-personal/planta-de-cargos",
  [`${CD}/personal/funcionarios/registro-de-funcionarios`]:
    "gestion-de-personal/funcionarios",
  [`${CD}/personal/asignacion-academica/asignacion-academica`]:
    "gestion-de-personal/asignacion-academica/asignacion-por-periodo",
  [`${CD}/personal/trasladar-asignacion/trasladar-asignacion`]:
    "gestion-de-personal/asignacion-academica/asignacion-por-estudiante",
  [`${CD}/personal/funcionarios/novedades-de-personal`]:
    "gestion-de-personal/seguimiento-docente/novedades",
  [`${CD}/personal/funcionarios/asistencia-docentes`]:
    "gestion-de-personal/seguimiento-docente/asistencia-de-docente",
  [`${CD}/personal/horas-dictadas/horas-dictadas`]:
    "gestion-de-personal/seguimiento-docente/horas-dictadas",
  [`${CD}/personal/actividades-complementarias/actividades-complementarias`]:
    "gestion-de-personal/seguimiento-docente/actividades-complementarias",
  [`${CD}/personal/actividades-complementarias/registro-de-act-complementarias`]:
    "gestion-de-personal/seguimiento-docente/registro-de-actividades-complementarias",
  [`${CD}/personal/actividades-complementarias/tipos-de-act-complementarias`]:
    "gestion-de-personal/seguimiento-docente/tipos-de-actividades-complementarias",
  [`${CD}/personal/diario-pedagogico/diario-pedagogico`]:
    "gestion-de-personal/seguimiento-docente/diario-pedagogico",
  [`${CD}/seguimiento/tareas-en-linea/tareas-en-linea`]:
    "gestion-de-personal/seguimiento-docente/tareas-en-linea",

  // Gestión de estudiantes
  [`${CD}/matricula/estudiantes-nuevos/estudiantes-nuevos`]:
    "gestion-de-estudiantes/registro-estudiantes/registro-individual",
  [`${CD}/matricula/estudiantes-nuevos/importar-matricula`]:
    "gestion-de-estudiantes/registro-estudiantes/importar-matricula-masiva",
  [`${CD}/matricula/estudiantes-nuevos/inscripciones`]:
    "gestion-de-estudiantes/registro-estudiantes/inscripciones",
  [`${CD}/matricula/prematricula/a-prematricula`]:
    "gestion-de-estudiantes/registro-estudiantes/prematricula",
  [`${PT}/prematricula-e-inscripciones/prematricula`]:
    "gestion-de-estudiantes/registro-estudiantes/prematricula-proceso-de-temporada",
  [`${CD}/matricula/ajustes-de-matricula/ajuste-individual-de-matricula`]:
    "gestion-de-estudiantes/informacion-de-estudiantes/actualizacion-individual",
  [`${CD}/matricula/ajustes-de-matricula/actualizacion-de-datos-por-grupo`]:
    "gestion-de-estudiantes/informacion-de-estudiantes/actualizacion-de-datos-por-grupo",
  [`${CD}/matricula/listados/cargar-fotografia`]:
    "gestion-de-estudiantes/informacion-de-estudiantes/cargar-fotografia",
  [`${CD}/matricula/listados/acudientes`]:
    "gestion-de-estudiantes/informacion-de-estudiantes/informacion-de-acudientes",
  [`${CD}/matricula/ajustes-de-matricula/renovacion-de-matricula`]:
    "gestion-de-estudiantes/novedades-de-estudiantes/ajuste-de-matricula",
  [`${CD}/matricula/cambio-de-grupo/cambio-de-grupo`]:
    "gestion-de-estudiantes/novedades-de-estudiantes/cambio-de-grupo",
  [`${CD}/matricula/reingreso/reingreso`]:
    "gestion-de-estudiantes/novedades-de-estudiantes/reingresos",
  [`${CD}/matricula/reingreso/reingreso-de-validantes`]:
    "gestion-de-estudiantes/novedades-de-estudiantes/reingreso-de-validantes",
  [`${CD}/matricula/ajustes-de-matricula/registro-de-validacion`]:
    "gestion-de-estudiantes/validacion-y-electivas/procesos-de-validacion",
  [`${CD}/matricula/matricula-semestral/matricula-semestral`]:
    "gestion-de-estudiantes/validacion-y-electivas/matricula-semestral",
  [`${CD}/matricula/especialidades/estudiantes-en-especialidad`]:
    "gestion-de-estudiantes/validacion-y-electivas/asignacion-de-modalidades",
  [`${CD}/seguimiento/inasistencias/registro-consolidado-de-inasistencias`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/inasistencias",
  [`${CD}/seguimiento/inasistencias/consolidado-de-inasistencias-por-asignaturas`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/inasistencias-por-asignatura",
  [`${CD}/seguimiento/inasistencias/consolidado-individual-de-inasistencias`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/inasistencias-individual",
  [`${CD}/seguimiento/inasistencias/detallado-individual-estudiantes`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/inasistencias-detallado",
  [`${CD}/seguimiento/excusas/excusas`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/excusas",
  [`${CD}/seguimiento/anotaciones/anotaciones`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/anotaciones-internas",
  [`${CD}/seguimiento/f-observador/version-anterior/configuracion-de-aspectos-y-criterios`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/observador-del-estudiante/configuracion",
  [`${CD}/seguimiento/f-observador/version-actualizada`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/observador-del-estudiante/seguimientos",
  [`${CD}/seguimiento/f-observador/version-anterior/ficha-observador-del-estudiante`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/observador-del-estudiante/ficha-observador",
  [`${CD}/seguimiento/f-observador/version-anterior/caracterizacion-adicional`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/observador-del-estudiante/caracterizacion",
  [`${CD}/seguimiento/f-observador/version-anterior/valoracion-individual-y-grupo`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/observador-del-estudiante/valoracion",
  [`${CD}/seguimiento/f-observador/version-anterior/reportes-de-caracterizacion`]:
    "gestion-de-estudiantes/seguimiento-a-estudiantes/observador-del-estudiante/informes",
  // NOTE: convivencia ficha uses informes-de-seguimiento below

  // Registro de logros y calificaciones
  [`${CD}/evaluacion/calificaciones/registro-de-calificaciones`]:
    "registro-de-logros-y-calificaciones/calificaciones/registro-por-actividades",
  [`${CD}/evaluacion/calificaciones/calificacion-definitiva-directa`]:
    "registro-de-logros-y-calificaciones/calificaciones/registro-nota-directa",
  [`${CD}/evaluacion/calificaciones/planilla-de-calificaciones-excel`]:
    "registro-de-logros-y-calificaciones/calificaciones/planilla-excel",
  [`${CD}/evaluacion/calificaciones/calificaciones-de-estudiantes-trasladados`]:
    "registro-de-logros-y-calificaciones/calificaciones/calificaciones-trasladados",
  [`${CD}/evaluacion/calificaciones/modificar-calificaciones-individuales`]:
    "registro-de-logros-y-calificaciones/calificaciones/modificar-calificaciones",
  [`${CD}/evaluacion/ajuste-de-nota-final/ajuste-de-nota-final`]:
    "registro-de-logros-y-calificaciones/calificaciones/ajuste-de-nota-final",
  [`${CD}/personal/autorizaciones/autorizaciones`]:
    "registro-de-logros-y-calificaciones/calificaciones/autorizaciones",
  [`${CD}/establecimiento/institucion/configuracion-de-caracterizacion-de-estudiantes-piar`]:
    "registro-de-logros-y-calificaciones/educacion-inclusiva/piar-cuestionario",
  [`${CD}/matricula/especialidades/educacion-inclusiva`]:
    "registro-de-logros-y-calificaciones/educacion-inclusiva/piar-pedagogico",
  [`${CD}/planeacion/gestion-de-logros/logros-periodos`]:
    "registro-de-logros-y-calificaciones/logros-y-actividades/logros-por-asignatura",
  [`${CD}/planeacion/actividades-periodo/actividades-periodo`]:
    "registro-de-logros-y-calificaciones/logros-y-actividades/planeacion-de-actividades",
  [`${CD}/evaluacion/asignar-logros/asignar-logros`]:
    "registro-de-logros-y-calificaciones/logros-y-actividades/asignar-logros",

  // Currículo
  [`${CD}/planeacion/planeacion-curricular/planeacion-de-clases-version-estandar`]:
    "curriculo/curriculo-estandar",
  [`${CD}/planeacion/planeacion-curricular/planeacion-de-clases-version-archivo-adjunto`]:
    "curriculo/curriculo-archivo-adjunto",

  // Convivencia escolar
  [`${CD}/planeacion/gestion-de-logros/logros-comportamiento`]:
    "convivencia-escolar/calificacion-comportamiento/logros-comportamiento",
  [`${CD}/evaluacion/comportamiento/a-comportamiento`]:
    "convivencia-escolar/calificacion-comportamiento/evaluacion-de-comportamiento",
  [`${PT}/comportamiento-y-convivencia/anotaciones-disciplinarias/anotaciones-disciplinarias`]:
    "convivencia-escolar/registro-de-anotaciones-disciplinarias",
  [`${CD}/seguimiento/informes-de-seguimiento`]:
    "convivencia-escolar/ficha-observador",

  // Cierre académico periodo
  [`${CD}/evaluacion/consolidar/consolidar`]:
    "cierre-academico-periodo/reportes-consolidados",
  [`${CD}/evaluacion/refuerzos/refuerzos`]:
    "cierre-academico-periodo/nivelaciones-de-periodo",
  [`${PT}/promocion-y-finalizacion-de-calendario/nivelaciones-finales`]:
    "cierre-academico-periodo/nivelaciones-finales",
  [`${CD}/evaluacion/detallado-individual/a-detallado-individual`]:
    "cierre-academico-periodo/consolidacion-y-calculo-de-puestos/proceso-de-consolidacion",
  [`${PT}/finalizacion-de-periodo/consolidacion-calculo-de-puestos-y-boletines`]:
    "cierre-academico-periodo/consolidacion-y-calculo-de-puestos/calcular-puestos",
  [`${CD}/evaluacion/informes-de-evaluacion`]:
    "cierre-academico-periodo/informes",

  // Cierre de año
  [`${CD}/promocion/comision-de-evaluacion/actas-de-la-comision-de-evaluacion`]:
    "cierre-de-ano/comision-de-evaluacion",
  [`${PT}/promocion-y-finalizacion-de-calendario/comision-de-evaluacion`]:
    "cierre-de-ano/comision-de-evaluacion-proceso",
  [`${CD}/evaluacion/notas-finales/notas-finales`]:
    "cierre-de-ano/ajuste-de-nota-final",
  [`${CD}/promocion/promocion/procesos-promocion`]:
    "cierre-de-ano/procesar-promocion",
  [`${PT}/promocion-y-finalizacion-de-calendario/como-procesar-la-promocion-de-los-estudiantes`]:
    "cierre-de-ano/como-procesar-la-promocion",
  [`${CD}/promocion/recuperaciones/actas-de-recuperacion`]:
    "cierre-de-ano/recuperaciones-finales",
  [`${CD}/promocion/trasladar-matricula/trasladar-matricula-por-grupo`]:
    "cierre-de-ano/trasladar-matricula/por-grupo",
  [`${CD}/promocion/trasladar-matricula/trasladar-matricula-por-estudiante`]:
    "cierre-de-ano/trasladar-matricula/por-estudiante",
  [`${CD}/promocion/informes-de-promocion`]:
    "cierre-de-ano/informes",

  // Usuarios y permisos
  [`${CD}/establecimiento/usuarios/gestion-de-usuarios`]:
    "gestion-de-usuarios-y-permisos/usuarios/generar-usuarios",
  [`${CD}/establecimiento/usuarios/denegar-funciones-a-estudiantes`]:
    "gestion-de-usuarios-y-permisos/permisos/denegar-funciones-a-estudiantes",
  [`${CD}/establecimiento/usuarios/asignacion-de-permisos`]:
    "gestion-de-usuarios-y-permisos/permisos/gestionar-permisos-de-personal",
  [`${CD}/establecimiento/usuarios/verificacion-de-datos`]:
    "gestion-de-usuarios-y-permisos/otras-acciones/verificacion-de-datos-de-usuarios",

  // Herramientas
  [`${CD}/herramientas/autoevaluacion-institucional/gestionar-autoevaluaciones`]:
    "herramientas/autoevaluacion",
  [`${CD}/inicio/autoevaluacion`]:
    "herramientas/autoevaluacion-responder",
  [`${CD}/herramientas/usuarios-aula-virtual/usuarios-aula-virtual`]:
    "herramientas/chamilo",
  [`${CD}/herramientas/gestion-de-reuniones/a-gestion-de-reuniones`]:
    "herramientas/gestion-de-reuniones",
  [`${CD}/herramientas/informes-digitales/informes-digitales`]:
    "herramientas/informes-digitales",
  [`${CD}/establecimiento/copia-de-seguridad/copia-de-seguridad`]:
    "herramientas/copia-de-seguridad",
  [`${CD}/matricula/listados/estudiantes-piar`]:
    "herramientas/piar-y-caracterizacion",
  [`${CD}/establecimiento/usuarios/generar-correos-institucionales`]:
    "herramientas/generar-correos-institucionales",
  [`${CD}/establecimiento/usuarios/comunidad-educativa-morce`]:
    "herramientas/comunidad-educativa-morce",

  // Ayuda
  "preguntas-frecuentes": "ayuda/preguntas-frecuentes",
};

/** Stubs: newRel path -> title */
const STUBS = {
  "gestion-de-personal/seguimiento-docente/observador-docente": "Observador docente",
  "gestion-de-personal/configuracion-academica": "Configuración académica",
  "configuracion-institucional/gestion-academica/escalas": "Escalas",
  "herramientas/firmas-digitales": "Firmas digitales",
  "ayuda/politicas": "Políticas",
  "gestion-de-usuarios-y-permisos/usuarios/cambiar-estado-de-usuarios": "Cambiar estado de usuarios",
  "gestion-de-usuarios-y-permisos/usuarios/restablecer-contrasena": "Restablecer contraseña",
  "gestion-de-usuarios-y-permisos/usuarios/agregar-o-eliminar-sie": "Agregar o eliminar SIE",
  "gestion-de-usuarios-y-permisos/usuarios/auditoria": "Auditoría",
};

/** Folder titles and page order for meta.json */
const FOLDERS = {
  "primeros-pasos": {
    title: "Primeros pasos",
    icon: "House",
    pages: ["ingresar-a-sinai", "recuperar-contrasena", "actualizar-perfil"],
    description: "Acceso a la plataforma y configuración inicial de su cuenta.",
  },
  "configuracion-institucional": {
    title: "Configuración Institucional",
    icon: "Landmark",
    pages: ["datos-institucionales", "calendarios-cronogramas-periodos", "gestion-academica"],
    description: "Datos de la institución, calendarios y configuración académica.",
  },
  "configuracion-institucional/calendarios-cronogramas-periodos": {
    title: "Calendarios, cronogramas y periodos",
    icon: "CalendarDays",
    pages: [
      "calendarios",
      "configuracion-de-parametros",
      "configuracion-de-escalas",
      "cronogramas-y-periodos",
    ],
    description: "Configure calendarios, parámetros, escalas y cronogramas.",
  },
  "configuracion-institucional/gestion-academica": {
    title: "Gestión Académica",
    icon: "School",
    pages: ["escalas", "areas-y-asignaturas", "componentes", "sedes-grupos-y-evaluacion"],
    description: "Escalas, áreas, componentes, sedes y grupos.",
  },
  "gestion-de-personal": {
    title: "Gestión de personal",
    icon: "Users",
    pages: [
      "planta-de-cargos",
      "funcionarios",
      "configuracion-academica",
      "asignacion-academica",
      "seguimiento-docente",
    ],
    description: "Planta, funcionarios, asignación y seguimiento docente.",
  },
  "gestion-de-personal/asignacion-academica": {
    title: "Asignación académica",
    icon: "UserRoundCheck",
    pages: ["asignacion-por-periodo", "asignacion-por-estudiante"],
    description: "Asignación por periodo y por estudiante.",
  },
  "gestion-de-personal/seguimiento-docente": {
    title: "Seguimiento docente",
    icon: "ScanSearch",
    pages: [
      "novedades",
      "asistencia-de-docente",
      "horas-dictadas",
      "observador-docente",
      "actividades-complementarias",
      "registro-de-actividades-complementarias",
      "tipos-de-actividades-complementarias",
      "diario-pedagogico",
      "tareas-en-linea",
    ],
    description: "Novedades, asistencia, horas y actividades del docente.",
  },
  "gestion-de-estudiantes": {
    title: "Gestión de estudiantes",
    icon: "UsersRound",
    pages: [
      "registro-estudiantes",
      "informacion-de-estudiantes",
      "novedades-de-estudiantes",
      "validacion-y-electivas",
      "seguimiento-a-estudiantes",
    ],
    description: "Registro, información, novedades y seguimiento de estudiantes.",
  },
  "gestion-de-estudiantes/registro-estudiantes": {
    title: "Registro estudiantes",
    icon: "UserPlus",
    pages: [
      "registro-individual",
      "importar-matricula-masiva",
      "inscripciones",
      "prematricula",
      "prematricula-proceso-de-temporada",
    ],
    description: "Registro individual, importación, inscripciones y prematrícula.",
  },
  "gestion-de-estudiantes/informacion-de-estudiantes": {
    title: "Información de estudiantes",
    icon: "Contact",
    pages: [
      "actualizacion-individual",
      "actualizacion-de-datos-por-grupo",
      "cargar-fotografia",
      "informacion-de-acudientes",
    ],
    description: "Actualización de datos, fotografías y acudientes.",
  },
  "gestion-de-estudiantes/novedades-de-estudiantes": {
    title: "Novedades de estudiantes",
    icon: "ArrowRightLeft",
    pages: ["ajuste-de-matricula", "cambio-de-grupo", "reingresos", "reingreso-de-validantes"],
    description: "Ajustes de matrícula, cambio de grupo y reingresos.",
  },
  "gestion-de-estudiantes/validacion-y-electivas": {
    title: "Validación y electivas",
    icon: "BadgeCheck",
    pages: ["procesos-de-validacion", "matricula-semestral", "asignacion-de-modalidades"],
    description: "Validación, matrícula semestral y modalidades.",
  },
  "gestion-de-estudiantes/seguimiento-a-estudiantes": {
    title: "Seguimiento a estudiantes",
    icon: "ChartNoAxesCombined",
    pages: [
      "inasistencias",
      "inasistencias-por-asignatura",
      "inasistencias-individual",
      "inasistencias-detallado",
      "excusas",
      "anotaciones-internas",
      "observador-del-estudiante",
    ],
    description: "Inasistencias, excusas, anotaciones y observador.",
  },
  "gestion-de-estudiantes/seguimiento-a-estudiantes/observador-del-estudiante": {
    title: "Observador del estudiante",
    icon: "Eye",
    pages: ["configuracion", "seguimientos", "ficha-observador", "caracterizacion", "valoracion", "informes"],
    description: "Configuración, seguimientos, caracterización, valoración e informes.",
  },
  "registro-de-logros-y-calificaciones": {
    title: "Registro de logros y calificaciones",
    icon: "ClipboardCheck",
    pages: ["calificaciones", "educacion-inclusiva", "logros-y-actividades"],
    description: "Calificaciones, educación inclusiva, logros y actividades.",
  },
  "registro-de-logros-y-calificaciones/calificaciones": {
    title: "Calificaciones",
    icon: "ClipboardList",
    pages: [
      "registro-por-actividades",
      "registro-nota-directa",
      "planilla-excel",
      "calificaciones-trasladados",
      "modificar-calificaciones",
      "ajuste-de-nota-final",
      "autorizaciones",
    ],
    description: "Registro, planillas, trasladados, ajustes y autorizaciones.",
  },
  "registro-de-logros-y-calificaciones/educacion-inclusiva": {
    title: "Educación Inclusiva",
    icon: "UsersRound",
    pages: ["piar-cuestionario", "piar-pedagogico"],
    description: "PIAR cuestionario y pedagógico.",
  },
  "registro-de-logros-y-calificaciones/logros-y-actividades": {
    title: "Logros y actividades",
    icon: "Target",
    pages: ["logros-por-asignatura", "planeacion-de-actividades", "asignar-logros"],
    description: "Logros por asignatura y planeación de actividades.",
  },
  curriculo: {
    title: "Currículo",
    icon: "BookOpen",
    pages: ["curriculo-estandar", "curriculo-archivo-adjunto"],
    description: "Currículo estándar y por archivo adjunto.",
  },
  "convivencia-escolar": {
    title: "Convivencia escolar",
    icon: "ShieldCheck",
    pages: [
      "calificacion-comportamiento",
      "ficha-observador",
      "registro-de-anotaciones-disciplinarias",
    ],
    description: "Comportamiento, ficha observador y anotaciones disciplinarias.",
  },
  "convivencia-escolar/calificacion-comportamiento": {
    title: "Calificación Comportamiento",
    icon: "ClipboardPenLine",
    pages: ["logros-comportamiento", "evaluacion-de-comportamiento"],
    description: "Logros y evaluación de comportamiento.",
  },
  "cierre-academico-periodo": {
    title: "Cierre académico (periodo)",
    icon: "CalendarCheck",
    pages: [
      "reportes-consolidados",
      "nivelaciones-de-periodo",
      "nivelaciones-finales",
      "consolidacion-y-calculo-de-puestos",
      "informes",
    ],
    description: "Consolidados, nivelaciones, puestos e informes de periodo.",
  },
  "cierre-academico-periodo/consolidacion-y-calculo-de-puestos": {
    title: "Consolidación y cálculo de puestos",
    icon: "FileChartColumn",
    pages: ["proceso-de-consolidacion", "calcular-puestos"],
    description: "Proceso de consolidación y cálculo de puestos.",
  },
  "cierre-de-ano": {
    title: "Cierre de año",
    icon: "Award",
    pages: [
      "comision-de-evaluacion",
      "comision-de-evaluacion-proceso",
      "ajuste-de-nota-final",
      "procesar-promocion",
      "como-procesar-la-promocion",
      "recuperaciones-finales",
      "trasladar-matricula",
      "informes",
    ],
    description: "Comisión, promoción, recuperaciones y traslado de matrícula.",
  },
  "cierre-de-ano/trasladar-matricula": {
    title: "Trasladar matrícula",
    icon: "ArrowRightLeft",
    pages: ["por-grupo", "por-estudiante"],
    description: "Traslado por grupo o por estudiante.",
  },
  "gestion-de-usuarios-y-permisos": {
    title: "Gestión de usuarios y permisos",
    icon: "UserCog",
    pages: ["usuarios", "permisos", "otras-acciones"],
    description: "Usuarios, permisos y verificación de datos.",
  },
  "gestion-de-usuarios-y-permisos/usuarios": {
    title: "Usuarios",
    icon: "Users",
    pages: [
      "generar-usuarios",
      "cambiar-estado-de-usuarios",
      "restablecer-contrasena",
      "agregar-o-eliminar-sie",
      "auditoria",
    ],
    description: "Generación y administración de usuarios.",
  },
  "gestion-de-usuarios-y-permisos/permisos": {
    title: "Permisos",
    icon: "ShieldCheck",
    pages: ["denegar-funciones-a-estudiantes", "gestionar-permisos-de-personal"],
    description: "Permisos de estudiantes y personal.",
  },
  "gestion-de-usuarios-y-permisos/otras-acciones": {
    title: "Otras acciones",
    icon: "Settings",
    pages: ["verificacion-de-datos-de-usuarios"],
    description: "Verificación de datos de usuarios.",
  },
  herramientas: {
    title: "Herramientas",
    icon: "Wrench",
    pages: [
      "autoevaluacion",
      "autoevaluacion-responder",
      "chamilo",
      "gestion-de-reuniones",
      "firmas-digitales",
      "informes-digitales",
      "copia-de-seguridad",
      "piar-y-caracterizacion",
      "generar-correos-institucionales",
      "comunidad-educativa-morce",
    ],
    description: "Autoevaluación, Chamilo, reuniones, informes y más.",
  },
  ayuda: {
    title: "Ayuda",
    icon: "CircleHelp",
    pages: ["politicas", "preguntas-frecuentes"],
    description: "Políticas y preguntas frecuentes.",
  },
};

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".mdx")) acc.push(p);
  }
  return acc;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function stubMdx(title) {
  return `---
title: "${title}"
description: "Contenido pendiente de documentación para «${title}»."
guide: true
---

## Guía paso a paso

Esta guía está pendiente de completar. Pronto encontrará aquí el procedimiento paso a paso.

## Preguntas frecuentes

<GuideFAQ>
  <GuideFAQItem index="01" question={"¿Qué requisitos debo revisar para completar «${title}»?"}>
    Respuesta pendiente de completar.
  </GuideFAQItem>
  <GuideFAQItem index="02" question={"¿Cómo verifico que «${title}» se realizó correctamente?"}>
    Respuesta pendiente de completar.
  </GuideFAQItem>
  <GuideFAQItem index="03" question={"¿Qué debo hacer si encuentro un inconveniente con «${title}»?"}>
    Respuesta pendiente de completar.
  </GuideFAQItem>
</GuideFAQ>
`;
}

function indexMdx(title, description, children) {
  const cards = children
    .map(
      (c) =>
        `  <Card title="${c.title}" href="${c.href}" description="${c.description || "Consulte las opciones disponibles."}" />`,
    )
    .join("\n");
  return `---
title: "${title}"
description: "${description}"
---

${description}

## Contenido de esta sección

<Cards>
${cards}
</Cards>
`;
}

function updateTitle(raw, newTitle) {
  if (/^title:\s*"/m.test(raw)) {
    return raw.replace(/^title:\s*"[^"]*"/m, `title: "${newTitle}"`);
  }
  return raw;
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Collect existing files
const existing = walk(adminRoot).map((f) =>
  path.relative(adminRoot, f).replaceAll("\\", "/").replace(/\.mdx$/, ""),
);

const movedFrom = new Set();
const movedTo = new Set();
const report = { moved: [], stubs: [], orphans: [], errors: [] };

// Execute moves
for (const [from, to] of Object.entries(MOVES)) {
  if (to === "SKIP_DUPLICATE") continue;
  const src = path.join(adminRoot, `${from}.mdx`);
  const dest = path.join(adminRoot, `${to}.mdx`);
  if (!fs.existsSync(src)) {
    report.errors.push(`Origen no existe: ${from}`);
    continue;
  }
  ensureDir(path.dirname(dest));
  let content = fs.readFileSync(src, "utf8");
  fs.writeFileSync(dest, content, "utf8");
  fs.unlinkSync(src);
  movedFrom.add(from);
  movedTo.add(to);
  report.moved.push({ from, to });
}

// Create stubs (skip if file already exists from move)
for (const [rel, title] of Object.entries(STUBS)) {
  if (title === null) continue;
  const dest = path.join(adminRoot, `${rel}.mdx`);
  if (fs.existsSync(dest)) continue;
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, stubMdx(title), "utf8");
  report.stubs.push({ path: rel, title });
  movedTo.add(rel);
}

// Create folder indexes and meta.json
for (const [folder, meta] of Object.entries(FOLDERS)) {
  const dir = path.join(adminRoot, folder);
  ensureDir(dir);

  // Filter pages that exist
  const existingPages = meta.pages.filter((p) => {
    const pagePath = path.join(dir, `${p}.mdx`);
    const folderPath = path.join(dir, p, "index.mdx");
    const folderMeta = path.join(dir, p, "meta.json");
    return fs.existsSync(pagePath) || fs.existsSync(folderPath) || fs.existsSync(folderMeta) || FOLDERS[`${folder}/${p}`];
  });

  const metaJson = {
    title: meta.title,
    description: meta.description,
    defaultOpen: false,
    pages: existingPages.length ? existingPages : meta.pages,
    ...(meta.icon ? { icon: meta.icon } : {}),
  };
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(metaJson, null, 2) + "\n", "utf8");

  // Build cards for index
  const children = meta.pages.map((p) => {
    const subKey = `${folder}/${p}`;
    const sub = FOLDERS[subKey];
    const pageFile = path.join(dir, `${p}.mdx`);
    let childTitle = sub?.title || titleFromSlug(p);
    if (fs.existsSync(pageFile)) {
      const raw = fs.readFileSync(pageFile, "utf8");
      const m = raw.match(/^title:\s*"([^"]+)"/m);
      if (m) childTitle = m[1];
    }
    return {
      title: childTitle,
      href: `/docs/administrativo/${folder}/${p}`,
      description: sub?.description || `Abrir «${childTitle}».`,
    };
  });

  const indexPath = path.join(dir, "index.mdx");
  fs.writeFileSync(indexPath, indexMdx(meta.title, meta.description, children), "utf8");
}

// Orphans: existing guides not moved and not index/preguntas at root that was moved
for (const rel of existing) {
  if (rel === "index") continue;
  if (movedFrom.has(rel)) continue;
  // Skip if already under new structure somehow
  if ([...movedTo].some((t) => rel === t || rel.startsWith(t + "/"))) continue;
  const full = path.join(adminRoot, `${rel}.mdx`);
  let title = path.basename(rel);
  if (fs.existsSync(full)) {
    const raw = fs.readFileSync(full, "utf8");
    const m = raw.match(/^title:\s*"([^"]+)"/m);
    if (m) title = m[1];
  }
  report.orphans.push({
    title,
    oldPath: `administrativo/${rel}.mdx`,
    oldUrl: `http://localhost:3000/docs/administrativo/${rel}`,
  });
}

// Move orphans into _archivo to keep them out of main menu but accessible
const archivoDir = path.join(adminRoot, "_archivo");
ensureDir(archivoDir);
const archivoPages = [];
for (const o of report.orphans) {
  const fromRel = o.oldPath.replace(/^administrativo\//, "").replace(/\.mdx$/, "");
  const src = path.join(adminRoot, `${fromRel}.mdx`);
  if (!fs.existsSync(src)) continue;
  const base = fromRel.replace(/\//g, "--");
  const dest = path.join(archivoDir, `${base}.mdx`);
  fs.renameSync(src, dest);
  archivoPages.push(base);
  o.newPath = `administrativo/_archivo/${base}.mdx`;
  o.newUrl = `http://localhost:3000/docs/administrativo/_archivo/${base}`;
}
fs.writeFileSync(
  path.join(archivoDir, "meta.json"),
  JSON.stringify(
    {
      title: "Archivo (fuera del menú nuevo)",
      description: "Guías que no entraron en la nueva estructura de menú.",
      pages: archivoPages.sort(),
      icon: "History",
    },
    null,
    2,
  ) + "\n",
  "utf8",
);
fs.writeFileSync(
  path.join(archivoDir, "index.mdx"),
  `---
title: "Archivo (fuera del menú nuevo)"
description: "Guías administrativas que no forman parte de la nueva estructura de menú."
---

Estas guías siguen disponibles por URL, pero no aparecen en el menú reestructurado. Revise el listado en la raíz del repositorio: \`guias-sueltas-administrativo.md\`.
`,
  "utf8",
);

// Remove empty old directories (best effort) — leave CD/PT if empty dirs remain
function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) removeEmptyDirs(path.join(dir, e.name));
  }
  const left = fs.readdirSync(dir);
  if (left.length === 0) fs.rmdirSync(dir);
}
removeEmptyDirs(path.join(adminRoot, CD));
removeEmptyDirs(path.join(adminRoot, PT));

// Root meta.json
const rootMeta = {
  title: "Administrativo",
  description: "Procesos y guías para el rol Administrativo",
  root: true,
  icon: "Building2",
  defaultOpen: false,
  pages: [
    "index",
    "primeros-pasos",
    "configuracion-institucional",
    "gestion-de-personal",
    "gestion-de-estudiantes",
    "registro-de-logros-y-calificaciones",
    "curriculo",
    "convivencia-escolar",
    "cierre-academico-periodo",
    "cierre-de-ano",
    "gestion-de-usuarios-y-permisos",
    "herramientas",
    "ayuda",
  ],
};
fs.writeFileSync(path.join(adminRoot, "meta.json"), JSON.stringify(rootMeta, null, 2) + "\n", "utf8");

// Root index
const sectionCards = Object.entries(FOLDERS)
  .filter(([k]) => !k.includes("/"))
  .map(
    ([k, v]) =>
      `  <Card title="${v.title}" href="/docs/administrativo/${k}" description="${v.description}" />`,
  )
  .join("\n");

fs.writeFileSync(
  path.join(adminRoot, "index.mdx"),
  `---
title: "Administrativo"
description: "Base de conocimiento para usuarios administrativos de SINAI."
---

Este módulo reúne las guías para las personas que administran los procesos académicos e institucionales en SINAI.

## Explore las secciones

<Cards>
${sectionCards}
</Cards>

Use el menú lateral para abrir cada sección. Al seleccionar un grupo verá un resumen de su contenido y podrá continuar a la guía específica.
`,
  "utf8",
);

// Orphans markdown report
const orphansMd = `# Guías sueltas — Administrativo

Guías que existían antes de la reestructura y **no entraron** en el menú de \`reestructure_menu.md\`.
Quedaron en \`web/content/docs/administrativo/_archivo/\` (accesibles por URL, fuera del menú principal).

Total: **${report.orphans.length}**

| Título | URL local | Ruta archivo |
|---|---|---|
${report.orphans
  .map((o) => `| ${o.title} | ${o.newUrl || o.oldUrl} | \`${o.newPath || o.oldPath}\` |`)
  .join("\n")}

## Movidas al menú nuevo

Total movidas: **${report.moved.length}**

## Stubs creados (ítems del menú sin guía previa)

${report.stubs.map((s) => `- ${s.title} → \`administrativo/${s.path}.mdx\``).join("\n") || "(ninguno)"}

## Errores

${report.errors.map((e) => `- ${e}`).join("\n") || "(ninguno)"}
`;

fs.writeFileSync(path.join(repoRoot, "guias-sueltas-administrativo.md"), orphansMd, "utf8");

console.log(
  JSON.stringify(
    {
      moved: report.moved.length,
      stubs: report.stubs.length,
      orphans: report.orphans.length,
      errors: report.errors,
    },
    null,
    2,
  ),
);
