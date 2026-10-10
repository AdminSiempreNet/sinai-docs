import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import Link from 'next/link';
import {
  Accessibility,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  CheckSquare,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cloud,
  Contact,
  Database,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HeartHandshake,
  ImageIcon,
  KeyRound,
  ListChecks,
  LogIn,
  Mail,
  MapPin,
  Medal,
  MessageSquare,
  MessageSquareWarning,
  Monitor,
  NotebookPen,
  Paperclip,
  Presentation,
  RefreshCcw,
  Scale,
  School,
  Search,
  Send,
  ShieldCheck,
  Trophy,
  UserCog,
  UserSearch,
  Users,
  Video,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

type HubCard = {
  title: string;
  description: string;
  href: string;
  image?: string;
  imageAlt?: string;
  icon: LucideIcon;
};

type HubConfig = {
  title: string;
  subtitle: string;
  description: string;
  cards: HubCard[];
};

const images = {
  adminAccess: '/images/section-hubs/shared/admin-access.png',
  adminPersonnel: '/images/section-hubs/shared/admin-personnel.png',
  adminAcademic: '/images/section-hubs/shared/admin-academic.png',
  adminClosing: '/images/section-hubs/shared/admin-closing.png',
  adminTools: '/images/section-hubs/shared/admin-tools.png',
  teacherAccess: '/images/section-hubs/shared/teacher-access.png',
  teacherPlanning: '/images/section-hubs/shared/teacher-planning.png',
  teacherGrades: '/images/section-hubs/shared/teacher-grades.png',
  teacherSupport: '/images/section-hubs/shared/teacher-support.png',
  teacherDigital: '/images/section-hubs/shared/teacher-digital.png',
  teacherClosing: '/images/section-hubs/shared/teacher-closing.png',
} as const;

const card = (
  title: string,
  description: string,
  href: string,
  image: string,
  imageAlt: string,
  icon: LucideIcon,
): HubCard => ({ title, description, href, image, imageAlt, icon });

const HUBS: Record<string, HubConfig> = {
  administrativo: {
    title: 'Administrativo',
    subtitle: 'Guías para configurar, operar y cerrar los procesos académicos e institucionales de su establecimiento en SINAI.',
    description:
      'Aquí encontrará el recorrido completo del rol Administrativo: desde el primer ingreso y la configuración de la institución, hasta la gestión de personal y estudiantes, el registro de calificaciones, la convivencia escolar, los cierres de periodo y de año, los permisos de usuarios y las herramientas de apoyo.',
    cards: [
      card('Primeros pasos', 'Acceso a la plataforma y configuración inicial de su cuenta.', '/docs/administrativo/primeros-pasos', '/images/section-hubs/dedicated/administrativo/primeros-pasos/ingresar-a-sinai.webp', 'Puerta de acceso a SINAI', LogIn),
      card('Configuración Institucional', 'Datos de la institución, calendarios y configuración académica.', '/docs/administrativo/configuracion-institucional', '/images/section-hubs/institutional-config/institution.webp', 'Edificio de la institución', School),
      card('Gestión de personal', 'Planta, funcionarios, asignación y seguimiento docente.', '/docs/administrativo/gestion-de-personal', '/images/section-hubs/gestion-de-personal/planta-de-cargos.webp', 'Estructura de la planta de cargos', Briefcase),
      card('Gestión de estudiantes', 'Registro, información, novedades y seguimiento de estudiantes.', '/docs/administrativo/gestion-de-estudiantes', '/images/section-hubs/dedicated/administrativo/gestion-de-estudiantes/registro-estudiantes.webp', 'Registro de estudiantes', GraduationCap),
      card('Registro de logros y calificaciones', 'Calificaciones, educación inclusiva, logros y actividades.', '/docs/administrativo/registro-de-logros-y-calificaciones', '/images/section-hubs/dedicated/administrativo/registro-de-logros-y-calificaciones/calificaciones.webp', 'Libro de calificaciones', FileSpreadsheet),
      card('Currículo', 'Currículo estándar y por archivo adjunto.', '/docs/administrativo/curriculo', '/images/section-hubs/dedicated/administrativo/curriculo/curriculo-estandar.webp', 'Planeación curricular', BookOpen),
      card('Convivencia escolar', 'Comportamiento, ficha observador y anotaciones disciplinarias.', '/docs/administrativo/convivencia-escolar', '/images/section-hubs/dedicated/administrativo/convivencia-escolar/calificacion-comportamiento.webp', 'Seguimiento de convivencia', Scale),
      card('Cierre académico (periodo)', 'Consolidados, nivelaciones, puestos e informes de periodo.', '/docs/administrativo/cierre-academico-periodo', '/images/section-hubs/dedicated/administrativo/cierre-academico-periodo/reportes-consolidados.webp', 'Cierre del periodo académico', BarChart3),
      card('Cierre de año', 'Comisión, promoción, recuperaciones y traslado de matrícula.', '/docs/administrativo/cierre-de-ano', '/images/section-hubs/dedicated/administrativo/cierre-de-ano/procesar-promocion.webp', 'Promoción de fin de año', Trophy),
      card('Gestión de usuarios y permisos', 'Usuarios, permisos y verificación de datos.', '/docs/administrativo/gestion-de-usuarios-y-permisos', '/images/section-hubs/dedicated/administrativo/gestion-de-usuarios-y-permisos/usuarios.webp', 'Cuentas y permisos de usuario', Users),
      card('Herramientas', 'Autoevaluación, Chamilo, reuniones, informes y más.', '/docs/administrativo/herramientas', '/images/section-hubs/dedicated/administrativo/herramientas/autoevaluacion.webp', 'Herramientas de apoyo institucional', Wrench),
      card('Ayuda', 'Políticas y preguntas frecuentes.', '/docs/administrativo/ayuda', '/images/section-hubs/dedicated/administrativo/ayuda/preguntas-frecuentes.webp', 'Ayuda y preguntas frecuentes', CircleHelp),
    ],
  },
  'administrativo/configuracion-institucional': {
    title: 'Configuración Institucional',
    subtitle: 'Configure los datos de la institución, calendarios, periodos y la estructura académica.',
    description:
      'Aquí encontrará las guías necesarias para preparar y mantener actualizada la configuración académica de la institución en SINAI. Podrá administrar los datos generales del establecimiento, organizar calendarios, cronogramas y periodos, y definir la estructura de escalas, áreas, componentes, sedes y grupos que soporta los demás procesos.',
    cards: [
      card('Configuración de la Institución', 'Defina y actualice la información general del establecimiento.', '/docs/administrativo/configuracion-institucional/datos-institucionales', '/images/section-hubs/institutional-config/institution.webp', 'Edificio institucional con ubicación y documento', School),
      card('Calendarios, cronogramas y periodos', 'Configure calendarios, parámetros, escalas y periodos académicos.', '/docs/administrativo/configuracion-institucional/calendarios-cronogramas-periodos', '/images/section-hubs/institutional-config/calendar.webp', 'Calendario académico con reloj y parámetros', CalendarDays),
      card('Gestión Académica', 'Organice escalas, áreas, componentes, sedes, grupos y evaluación.', '/docs/administrativo/configuracion-institucional/gestion-academica', '/images/section-hubs/institutional-config/academic-management.webp', 'Libros, birrete y estructura de gestión académica', GraduationCap),
    ],
  },
  'administrativo/primeros-pasos': {
    title: 'Primeros pasos',
    subtitle: 'Ingrese a SINAI, recupere su acceso y mantenga actualizado su perfil de usuario.',
    description:
      'Esta sección reúne lo esencial para comenzar a trabajar como administrativo en SINAI. Encontrará las formas disponibles para ingresar de manera segura, el procedimiento para recuperar el acceso cuando olvide su contraseña y las opciones para mantener al día su información personal, sus datos de contacto y su fotografía.',
    cards: [
      card('¿Cómo ingresar a SINAI?', 'Acceda con credenciales institucionales, SNET CORE o Google.', '/docs/administrativo/primeros-pasos/ingresar-a-sinai', images.adminAccess, 'Portal seguro de acceso administrativo', LogIn),
      card('Recuperar contraseña', 'Restablezca su contraseña y recupere el acceso a la plataforma.', '/docs/administrativo/primeros-pasos/recuperar-contrasena', images.adminAccess, 'Llave y escudo para recuperar el acceso', KeyRound),
      card('Actualizar Datos de Perfil de usuario', 'Actualice fotografía, datos básicos y de contacto de su cuenta.', '/docs/administrativo/primeros-pasos/actualizar-perfil', images.adminAccess, 'Perfil de usuario y controles de actualización', UserCog),
    ],
  },
  'administrativo/gestion-de-personal': {
    title: 'Gestión de personal',
    subtitle: 'Administre planta, funcionarios, asignación académica y seguimiento docente.',
    description:
      'Aquí se concentran los procesos para organizar el equipo humano de la institución. Podrá estructurar la planta de cargos, registrar y actualizar funcionarios, distribuir la carga académica y realizar seguimiento a novedades, asistencia, horas, actividades y demás responsabilidades asociadas a la labor docente.',
    cards: [
      card('Planta de cargos', 'Configure la planta de cargos de la institución.', '/docs/administrativo/gestion-de-personal/planta-de-cargos', '/images/section-hubs/gestion-de-personal/planta-de-cargos.webp', 'Silla institucional conectada a la estructura de cargos', Briefcase),
      card('Registro de Funcionarios', 'Registre y actualice la información de funcionarios.', '/docs/administrativo/gestion-de-personal/funcionarios', '/images/section-hubs/gestion-de-personal/funcionarios.webp', 'Carpeta con ficha de funcionario y verificación', Contact),
      card('Asignación académica', 'Asigne carga académica por periodo o por estudiante.', '/docs/administrativo/gestion-de-personal/asignacion-academica', '/images/section-hubs/gestion-de-personal/asignacion-academica.webp', 'Calendario, libros y ficha de asignación académica', BookOpen),
      card('Seguimiento docente', 'Consulte novedades, asistencia, horas, diario y tareas del docente.', '/docs/administrativo/gestion-de-personal/seguimiento-docente', '/images/section-hubs/gestion-de-personal/seguimiento-docente.webp', 'Reloj, lista de verificación y lupa de seguimiento docente', ClipboardCheck),
    ],
  },
  'administrativo/gestion-de-estudiantes': {
    title: 'Gestión de estudiantes',
    subtitle: 'Registre estudiantes, actualice su información, gestione novedades y haga seguimiento.',
    description:
      'Aquí encontrará el ciclo completo de atención a estudiantes en SINAI. Podrá registrar e importar matrículas, actualizar datos, fotografías y acudientes, gestionar novedades como cambios de grupo o reingresos, organizar validación y electivas, y consultar inasistencias, excusas, anotaciones y el observador.',
    cards: [
      card('Registro estudiantes', 'Registro individual, importación, inscripciones y prematrícula.', '/docs/administrativo/gestion-de-estudiantes/registro-estudiantes', '/images/section-hubs/dedicated/administrativo/gestion-de-estudiantes/registro-estudiantes.webp', 'Ficha de estudiante que se incorpora a la matrícula', Contact),
      card('Información de estudiantes', 'Actualización de datos, fotografías y acudientes.', '/docs/administrativo/gestion-de-estudiantes/informacion-de-estudiantes', '/images/section-hubs/dedicated/administrativo/gestion-de-estudiantes/informacion-de-estudiantes.webp', 'Perfil del estudiante con fotografía y datos de contacto', UserCog),
      card('Novedades de estudiantes', 'Ajustes de matrícula, cambio de grupo y reingresos.', '/docs/administrativo/gestion-de-estudiantes/novedades-de-estudiantes', '/images/section-hubs/dedicated/administrativo/gestion-de-estudiantes/novedades-de-estudiantes.webp', 'Traslado de un estudiante entre grupos', Send),
      card('Validación y electivas', 'Validación, matrícula semestral y modalidades.', '/docs/administrativo/gestion-de-estudiantes/validacion-y-electivas', '/images/section-hubs/dedicated/administrativo/gestion-de-estudiantes/validacion-y-electivas.webp', 'Validación académica y opciones electivas', BadgeCheck),
      card('Seguimiento a estudiantes', 'Inasistencias, excusas, anotaciones y observador.', '/docs/administrativo/gestion-de-estudiantes/seguimiento-a-estudiantes', '/images/section-hubs/dedicated/administrativo/gestion-de-estudiantes/seguimiento-a-estudiantes.webp', 'Seguimiento de asistencia y observador del estudiante', ClipboardCheck),
    ],
  },
  'administrativo/registro-de-logros-y-calificaciones': {
    title: 'Registro de logros y calificaciones',
    subtitle: 'Registre calificaciones, gestione educación inclusiva y planee logros y actividades.',
    description:
      'En esta sección encontrará los procesos que sostienen el registro académico de cada periodo. Incluye la gestión de notas y planillas, los ajustes y autorizaciones, las herramientas de educación inclusiva y PIAR, y la planeación de logros, desempeños y actividades que luego serán evaluados.',
    cards: [
      card('Calificaciones', 'Registro, planillas, trasladados, ajustes y autorizaciones.', '/docs/administrativo/registro-de-logros-y-calificaciones/calificaciones', images.adminAcademic, 'Libro de calificaciones y lista de verificación', FileSpreadsheet),
      card('Educación Inclusiva', 'Consulte y gestione los procesos de PIAR.', '/docs/administrativo/registro-de-logros-y-calificaciones/educacion-inclusiva', images.adminAcademic, 'Recursos académicos para educación inclusiva', Accessibility),
      card('Logros y actividades', 'Organice logros por asignatura y la planeación de actividades.', '/docs/administrativo/registro-de-logros-y-calificaciones/logros-y-actividades', images.adminAcademic, 'Planeación académica y lista de logros', ListChecks),
    ],
  },
  'administrativo/curriculo': {
    title: 'Currículo',
    subtitle: 'Gestione la planeación curricular en versión estándar o con archivo adjunto.',
    description:
      'Este espacio reúne las alternativas para organizar la planeación curricular de la institución. Puede trabajar directamente con la estructura estándar de SINAI o utilizar archivos adjuntos, según el modelo pedagógico definido, y mantener disponible la información que orienta las clases y el trabajo docente.',
    cards: [
      card('Planeación de clases - Versión estándar', 'Construya la planeación curricular con el formato estándar de SINAI.', '/docs/administrativo/curriculo/curriculo-estandar', images.adminAcademic, 'Libros y cuaderno de planeación curricular', NotebookPen),
      card('Planeación de clases - Versión archivo adjunto', 'Organice la planeación curricular mediante archivos adjuntos.', '/docs/administrativo/curriculo/curriculo-archivo-adjunto', images.adminAcademic, 'Documento adjunto dentro de la planeación académica', Paperclip),
    ],
  },
  'administrativo/convivencia-escolar': {
    title: 'Convivencia escolar',
    subtitle: 'Gestione comportamiento, ficha observador y anotaciones disciplinarias.',
    description:
      'Aquí encontrará las herramientas para acompañar la convivencia y el desarrollo formativo de los estudiantes. Podrá configurar y evaluar el comportamiento, consultar la ficha del observador y registrar anotaciones disciplinarias con la información necesaria para realizar un seguimiento claro, responsable y continuo.',
    cards: [
      card('Calificación Comportamiento', 'Gestione logros y evaluación de comportamiento.', '/docs/administrativo/convivencia-escolar/calificacion-comportamiento', images.adminPersonnel, 'Seguimiento institucional del comportamiento', Scale),
      card('Informes de seguimiento', 'Consulte la ficha y los informes del observador.', '/docs/administrativo/convivencia-escolar/ficha-observador', images.adminPersonnel, 'Acompañamiento y seguimiento de estudiantes', HeartHandshake),
      card('Anotaciones disciplinarias', 'Registre y gestione anotaciones disciplinarias.', '/docs/administrativo/convivencia-escolar/registro-de-anotaciones-disciplinarias', images.adminPersonnel, 'Registro de alertas y anotaciones', MessageSquareWarning),
    ],
  },
  'administrativo/cierre-academico-periodo': {
    title: 'Cierre académico (periodo)',
    subtitle: 'Consolide el periodo, nivele, calcule puestos y genere informes de cierre.',
    description:
      'Esta agrupación reúne las tareas necesarias para revisar y cerrar cada periodo académico. Desde aquí podrá consolidar resultados, calcular puestos, gestionar refuerzos y nivelaciones y producir los informes que permiten validar, analizar y comunicar el desempeño de los estudiantes antes del cierre definitivo.',
    cards: [
      card('Consolidar y calcular puestos', 'Consolide calificaciones y calcule los puestos del periodo.', '/docs/administrativo/cierre-academico-periodo/reportes-consolidados', images.adminClosing, 'Calendario y reporte de cierre académico', BarChart3),
      card('Refuerzos', 'Gestione las nivelaciones o refuerzos del periodo.', '/docs/administrativo/cierre-academico-periodo/nivelaciones-de-periodo', images.adminClosing, 'Progreso académico y actividades de refuerzo', RefreshCcw),
      card('Nivelaciones finales', 'Procese las nivelaciones finales asociadas al cierre.', '/docs/administrativo/cierre-academico-periodo/nivelaciones-finales', images.adminClosing, 'Cierre de nivelaciones con verificación', BadgeCheck),
      card('Informes de evaluación', 'Consulte los informes de evaluación del periodo.', '/docs/administrativo/cierre-academico-periodo/informes', images.adminClosing, 'Carpeta con informes académicos consolidados', FileText),
    ],
  },
  'administrativo/cierre-de-ano': {
    title: 'Cierre de año',
    subtitle: 'Procese promoción, recuperaciones, traslado de matrícula e informes de fin de año.',
    description:
      'En este espacio encontrará el recorrido completo para finalizar el calendario académico. Incluye las comisiones de evaluación, la revisión de notas finales, los procesos de promoción y recuperación, los traslados de matrícula y los informes necesarios para verificar que cada estudiante quede correctamente ubicado para el siguiente año.',
    cards: [
      card('Actas de la comisión de evaluación', 'Elabore y gestione las actas de la comisión.', '/docs/administrativo/cierre-de-ano/comision-de-evaluacion', images.adminClosing, 'Documentos oficiales del cierre anual', ClipboardList),
      card('Comisión de evaluación', 'Siga el proceso de temporada de la comisión de evaluación.', '/docs/administrativo/cierre-de-ano/comision-de-evaluacion-proceso', images.adminClosing, 'Equipo de evaluación y reporte de cierre', Users),
      card('Notas finales', 'Ajuste y revise las notas finales del año.', '/docs/administrativo/cierre-de-ano/ajuste-de-nota-final', images.adminClosing, 'Libro cerrado con resultados finales', CheckSquare),
      card('Procesos de promoción', 'Ejecute los procesos de promoción de estudiantes.', '/docs/administrativo/cierre-de-ano/procesar-promocion', images.adminClosing, 'Progreso y promoción académica', Trophy),
      card('Cómo procesar la promoción', 'Consulte el paso a paso para promover estudiantes.', '/docs/administrativo/cierre-de-ano/como-procesar-la-promocion', images.adminClosing, 'Ruta guiada para la promoción escolar', BadgeCheck),
      card('Actas de recuperación', 'Gestione recuperaciones finales y sus actas.', '/docs/administrativo/cierre-de-ano/recuperaciones-finales', images.adminClosing, 'Recuperación y validación de resultados', RefreshCcw),
      card('Trasladar matrícula', 'Traslade matrícula por grupo o por estudiante.', '/docs/administrativo/cierre-de-ano/trasladar-matricula', images.adminClosing, 'Traslado de registros entre grupos', Send),
      card('Informes de promoción', 'Consulte los informes asociados a la promoción.', '/docs/administrativo/cierre-de-ano/informes', images.adminClosing, 'Reporte final de promoción académica', BarChart3),
    ],
  },
  'administrativo/gestion-de-usuarios-y-permisos': {
    title: 'Gestión de usuarios y permisos',
    subtitle: 'Cree y administre usuarios, permisos y verificación de datos de acceso.',
    description:
      'Esta sección centraliza la administración del acceso a SINAI. Podrá generar y actualizar cuentas, asignar permisos al personal y a los estudiantes, revisar la información vinculada a cada usuario y ejecutar acciones de verificación que ayudan a proteger los datos y mantener controlados los privilegios de la plataforma.',
    cards: [
      card('Usuarios', 'Genere y administre las cuentas de usuario.', '/docs/administrativo/gestion-de-usuarios-y-permisos/usuarios', images.adminAccess, 'Usuarios conectados a la plataforma institucional', Users),
      card('Permisos', 'Configure permisos para estudiantes y personal.', '/docs/administrativo/gestion-de-usuarios-y-permisos/permisos', images.adminTools, 'Escudo y controles de seguridad', ShieldCheck),
      card('Otras acciones', 'Verifique y mantenga actualizados los datos de usuarios.', '/docs/administrativo/gestion-de-usuarios-y-permisos/otras-acciones', images.adminTools, 'Herramientas de búsqueda y validación', Search),
    ],
  },
  'administrativo/herramientas': {
    title: 'Herramientas',
    subtitle: 'Utilice autoevaluación, preinformes, reuniones, respaldos y otras utilidades.',
    description:
      'Aquí encontrará utilidades que complementan la operación institucional y apoyan procesos especiales. La sección reúne autoevaluaciones, reuniones, preinformes y alertas, firmas e informes digitales, copias de seguridad, centros de interés, PIAR, correos institucionales y conexiones con servicios educativos externos.',
    cards: [
      card('Gestionar autoevaluaciones', 'Configure y gestione autoevaluaciones institucionales.', '/docs/administrativo/herramientas/autoevaluacion', images.adminTools, 'Herramientas de evaluación institucional', ClipboardCheck),
      card('Autoevaluación institucional y encuestas', 'Responda o consulte autoevaluaciones y encuestas.', '/docs/administrativo/herramientas/autoevaluacion-responder', images.adminTools, 'Formulario de encuesta institucional', CheckSquare),
      card('Usuarios Aula Virtual', 'Gestione usuarios del aula virtual Chamilo.', '/docs/administrativo/herramientas/chamilo', images.adminTools, 'Usuarios conectados al aula virtual', Video),
      card('Gestión de Reuniones', 'Organice y registre reuniones institucionales.', '/docs/administrativo/herramientas/gestion-de-reuniones', images.adminPersonnel, 'Equipo reunido para coordinar procesos', Users),
      card('Firmas digitales', 'Configure y utilice firmas digitales.', '/docs/administrativo/herramientas/firmas-digitales', images.adminTools, 'Documento protegido con firma digital', ShieldCheck),
      card('Preinformes y alertas académicas', 'Consolide causas de bajo desempeño y genere reportes.', '/docs/administrativo/herramientas/preinformes', images.adminAcademic, 'Alertas y reporte de desempeño académico', AlertTriangle),
      card('Informes Digitales', 'Genere y consulte informes digitales.', '/docs/administrativo/herramientas/informes-digitales', images.adminTools, 'Informes digitales organizados en la nube', FileText),
      card('Copia de seguridad', 'Realice y gestione copias de seguridad.', '/docs/administrativo/herramientas/copia-de-seguridad', images.adminTools, 'Nube y respaldo seguro de información', Database),
      card('Centros de interés', 'Cree centros y asígnelos a docentes, grupos y asignaturas.', '/docs/administrativo/herramientas/centros-de-interes', images.adminAcademic, 'Mapa de actividades y centros de interés', MapPin),
      card('Estudiantes PIAR y caracterización', 'Caracterice estudiantes, gestione PIAR y descargue anexos.', '/docs/administrativo/herramientas/piar-y-caracterizacion', images.adminAcademic, 'Recursos accesibles y documentos de apoyo', Accessibility),
      card('Generar correos institucionales', 'Genere correos institucionales para la comunidad.', '/docs/administrativo/herramientas/generar-correos-institucionales', images.adminTools, 'Correo institucional y usuarios conectados', Mail),
      card('Comunidad educativa MORCE', 'Gestione la comunidad educativa MORCE.', '/docs/administrativo/herramientas/comunidad-educativa-morce', images.adminPersonnel, 'Comunidad educativa organizada', HeartHandshake),
    ],
  },
  'administrativo/ayuda': {
    title: 'Ayuda',
    subtitle: 'Consulte políticas institucionales y respuestas a preguntas frecuentes.',
    description:
      'Este espacio reúne la información de apoyo que puede necesitar durante el uso de SINAI. Aquí encontrará los canales y condiciones del soporte técnico, las políticas que orientan el tratamiento responsable de la información y respuestas rápidas a las dudas más comunes del rol administrativo.',
    cards: [
      card('Condiciones de soporte técnico', 'Conozca canales de atención, prioridades y tiempos de respuesta.', '/docs/administrativo/ayuda/condiciones-de-soporte-tecnico', images.adminTools, 'Herramientas de soporte y atención', Wrench),
      card('Políticas', 'Revise las políticas relacionadas con el uso de SINAI.', '/docs/administrativo/ayuda/politicas', images.adminTools, 'Documento protegido de políticas institucionales', ShieldCheck),
      card('Preguntas frecuentes', 'Encuentre respuestas rápidas a dudas frecuentes.', '/docs/administrativo/ayuda/preguntas-frecuentes', images.adminTools, 'Centro de ayuda con preguntas frecuentes', CircleHelp),
    ],
  },
  docente: {
    title: 'Docente',
    subtitle: 'Guías para planear, calificar y acompañar a sus estudiantes durante el año escolar.',
    description:
      'Encuentre las instrucciones de SINAI según la tarea que necesita realizar. Consulte su labor diaria, los procesos de cierre académico y las herramientas de apoyo.',
    cards: [
      card('Primeros pasos', 'Acceda a SINAI y mantenga actualizado su perfil.', '/docs/docente/primeros-pasos', '/images/section-hubs/dedicated/docente/primeros-pasos/ingresar-a-sinai.webp', 'Acceso al módulo docente', LogIn),
      card('Mi labor docente', 'Consulte su asignación y horario, y documente su labor pedagógica.', '/docs/docente/mi-labor-docente', '/images/section-hubs/dedicated/docente/mi-labor-docente/mi-asignacion.webp', 'Asignación y labor docente', Presentation),
      card('Estudiantes', 'Consulte sus grupos y la información de sus estudiantes.', '/docs/docente/estudiantes', '/images/section-hubs/dedicated/docente/estudiantes/buscar-estudiante.webp', 'Consulta de estudiantes', UserSearch),
      card('Planeación y currículo', 'Organice clases, mallas curriculares, logros y actividades del periodo.', '/docs/docente/planeacion-y-curriculo', '/images/section-hubs/dedicated/docente/planeacion-y-curriculo/planeacion-de-clases.webp', 'Planeación de clases', NotebookPen),
      card('Registro de calificaciones', 'Registre y consulte las valoraciones académicas de sus estudiantes.', '/docs/docente/registro-de-calificaciones', '/images/section-hubs/dedicated/docente/registro-de-calificaciones/registro-en-linea.webp', 'Registro de calificaciones', ClipboardCheck),
      card('Asistencia y seguimiento', 'Registre inasistencias, consulte consolidados y gestione excusas.', '/docs/docente/asistencia-y-seguimiento', '/images/section-hubs/dedicated/docente/asistencia-y-seguimiento/inasistencias.webp', 'Control de asistencia', CalendarDays),
      card('Convivencia y observador', 'Documente el comportamiento, las anotaciones y el seguimiento del estudiante.', '/docs/docente/convivencia-y-observador', '/images/section-hubs/dedicated/docente/convivencia-y-observador/ficha-observador.webp', 'Ficha del observador', HeartHandshake),
      card('Cierre académico (periodo)', 'Consulte refuerzos, observaciones e informes al finalizar el periodo.', '/docs/docente/cierre-academico-periodo', '/images/section-hubs/dedicated/docente/cierre-academico-periodo/informes-de-evaluacion.webp', 'Informes de cierre del periodo', FileText),
      card('Cierre de año', 'Revise notas finales, ajustes y recuperaciones de cierre anual.', '/docs/docente/cierre-de-ano', '/images/section-hubs/dedicated/docente/cierre-de-ano/notas-finales.webp', 'Notas finales del año', Trophy),
      card('Aula virtual', 'Gestione tareas, usuarios y calificaciones del aula virtual.', '/docs/docente/aula-virtual', '/images/section-hubs/dedicated/docente/aula-virtual/tareas-en-linea.webp', 'Tareas del aula virtual', Monitor),
      card('Herramientas', 'Consulte mensajes, reuniones, informes y utilidades de apoyo.', '/docs/docente/herramientas', '/images/section-hubs/dedicated/docente/herramientas/mensajes.webp', 'Mensajes y herramientas docentes', MessageSquare),
      card('SINAI Desktop', 'Instale la aplicación y consulte sus procesos y opciones de sincronización.', '/docs/docente/sinai-desktop', '/images/section-hubs/dedicated/docente/sinai-desktop/inicio-y-configuracion.webp', 'Aplicación SINAI Desktop', Monitor),
      card('Ayuda', 'Consulte políticas y recursos de apoyo de SIEMPRE.NET.', '/docs/docente/ayuda', '/images/section-hubs/dedicated/docente/ayuda/condiciones-de-soporte-tecnico.webp', 'Soporte y políticas', CircleHelp),
    ],
  },
  'docente/primeros-pasos': {
    title: 'Primeros pasos',
    subtitle: 'Acceda a SINAI y mantenga actualizado su perfil docente.',
    description:
      'Esta sección reúne lo necesario para comenzar a trabajar en el módulo Docente. Encontrará las formas de ingreso disponibles, el procedimiento para recuperar su contraseña y las opciones para actualizar sus datos personales, mecanismos de autenticación y fotografía antes de iniciar los procesos académicos.',
    cards: [
      card('¿Cómo ingresar a SINAI?', 'Acceda con credenciales, SNET CORE o Google.', '/docs/docente/primeros-pasos/ingresar-a-sinai', images.teacherAccess, 'Portal de acceso al módulo docente', LogIn),
      card('Recuperar contraseña', 'Restablezca su contraseña y recupere el acceso.', '/docs/docente/primeros-pasos/recuperar-contrasena', images.teacherAccess, 'Llave y perfil para recuperar el acceso docente', KeyRound),
      card('Cómo actualizar el perfil', 'Actualice datos, autenticación y fotografía de su perfil.', '/docs/docente/primeros-pasos/actualizar-perfil', images.teacherAccess, 'Perfil docente y controles de actualización', UserCog),
    ],
  },
  'docente/mi-labor-docente': {
    title: 'Mi labor docente',
    subtitle: 'Consulte su asignación y horario, y documente su labor pedagógica.',
    description:
      'Aquí encontrará las herramientas relacionadas con su trabajo cotidiano como docente. Podrá revisar la asignación académica y el horario, registrar el desarrollo de las clases en el diario pedagógico y documentar actividades complementarias, manteniendo organizada la evidencia de su labor durante el periodo.',
    cards: [
      card('Mi asignación', 'Consulte y gestione su asignación académica.', '/docs/docente/mi-labor-docente/mi-asignacion', images.teacherPlanning, 'Docente con libros y planeación académica', Presentation),
      card('Mi horario', 'Configure, verifique y descargue su horario de clases.', '/docs/docente/mi-labor-docente/mi-horario', images.teacherPlanning, 'Agenda docente y organización del horario', Clock),
      card('Diario pedagógico', 'Registre, consulte, edite y descargue sus diarios.', '/docs/docente/mi-labor-docente/diario-pedagogico', images.teacherPlanning, 'Cuaderno de seguimiento pedagógico', NotebookPen),
      card('Actividades complementarias', 'Registre actividades y revise los totales de horas.', '/docs/docente/mi-labor-docente/actividades-complementarias', images.teacherPlanning, 'Lista de actividades complementarias', ListChecks),
    ],
  },
  'docente/estudiantes': {
    title: 'Estudiantes',
    subtitle: 'Consulte sus grupos y la información académica de sus estudiantes.',
    description:
      'En esta sección encontrará las consultas que necesita para reconocer y acompañar a sus grupos. Podrá localizar estudiantes, obtener listados organizados, registrar o actualizar fotografías y consultar quiénes cuentan con PIAR, facilitando el seguimiento individual desde el módulo Docente.',
    cards: [
      card('Buscar Estudiantes', 'Localice estudiantes y consulte su hoja de matrícula.', '/docs/docente/estudiantes/buscar-estudiante', images.teacherSupport, 'Docente consultando información de sus estudiantes', UserSearch),
      card('Listas por grupo', 'Consulte, filtre e imprima los grupos asignados.', '/docs/docente/estudiantes/listas-por-grupo', images.teacherSupport, 'Grupo de estudiantes y lista organizada', ClipboardList),
      card('Cargar fotografía', 'Registre o actualice la fotografía de los estudiantes.', '/docs/docente/estudiantes/cargar-fotografias', images.teacherSupport, 'Perfil estudiantil con imagen', ImageIcon),
      card('Estudiantes PIAR', 'Consulte los estudiantes con PIAR asignados.', '/docs/docente/estudiantes/estudiantes-piar', images.teacherSupport, 'Acompañamiento accesible al estudiante', Accessibility),
    ],
  },
  'docente/planeacion-y-curriculo': {
    title: 'Planeación y currículo',
    subtitle: 'Organice clases, mallas curriculares, logros y actividades del periodo.',
    description:
      'Este espacio concentra la preparación pedagógica del periodo. Desde aquí podrá planear clases, consultar o construir mallas curriculares, revisar estándares y DBA, trabajar con el banco de logros y organizar desempeños y actividades, incluyendo la reutilización de planeaciones entre grupos cuando corresponda.',
    cards: [
      card('Planeación de clases', 'Cree, consulte y gestione las clases planeadas.', '/docs/docente/planeacion-y-curriculo/planeacion-de-clases', images.teacherPlanning, 'Cuaderno y recursos para planear clases', NotebookPen),
      card('Mallas curriculares', 'Cree unidades o consulte las mallas publicadas.', '/docs/docente/planeacion-y-curriculo/mallas-curriculares', images.teacherPlanning, 'Estructura de libros y currículo escolar', BookOpen),
      card('Estándares', 'Consulte estándares de competencias y DBA.', '/docs/docente/planeacion-y-curriculo/estandares', images.teacherPlanning, 'Documento de estándares educativos', FileText),
      card('Banco de logros', 'Consulte logros por año, grado y área.', '/docs/docente/planeacion-y-curriculo/banco-de-logros', images.teacherPlanning, 'Colección organizada de logros académicos', Database),
      card('Registro de desempeños (Logros)', 'Registre desempeños y logros en SINAI.', '/docs/docente/planeacion-y-curriculo/registro-de-desempenos', images.teacherPlanning, 'Lista verificada de desempeños', ClipboardCheck),
      card('Logros del periodo', 'Gestione los logros y desempeños del periodo.', '/docs/docente/planeacion-y-curriculo/logros-del-periodo', images.teacherPlanning, 'Medalla y metas del periodo', Medal),
      card('Actividades del periodo', 'Agregue, genere, edite o elimine actividades.', '/docs/docente/planeacion-y-curriculo/actividades-del-periodo', images.teacherPlanning, 'Agenda de actividades académicas', CalendarDays),
      card('Copiar planeación', 'Reutilice la planeación entre grupos y periodos.', '/docs/docente/planeacion-y-curriculo/copiar-planeacion', images.teacherPlanning, 'Planeación duplicada entre grupos', RefreshCcw),
    ],
  },
  'docente/registro-de-calificaciones': {
    title: 'Registro de calificaciones',
    subtitle: 'Registre y consulte las valoraciones académicas de sus estudiantes.',
    description:
      'Aquí se reúnen las distintas formas de registrar y revisar las calificaciones del periodo. Puede trabajar en línea por actividades, ingresar una valoración definitiva, utilizar la planilla de Excel y consultar el detallado individual para comprender el avance académico de cada estudiante.',
    cards: [
      card('Registro de calificaciones en línea', 'Registre notas parciales por actividades.', '/docs/docente/registro-de-calificaciones/registro-en-linea', images.teacherGrades, 'Planilla digital de calificaciones', ClipboardCheck),
      card('Calificación definitiva directa', 'Registre la nota definitiva por grupo y asignatura.', '/docs/docente/registro-de-calificaciones/calificacion-definitiva-directa', images.teacherGrades, 'Resultado académico verificado', BadgeCheck),
      card('Planilla Excel', 'Descargue, diligencie y cargue la planilla.', '/docs/docente/registro-de-calificaciones/planilla-excel', images.teacherGrades, 'Hoja de cálculo para calificaciones', FileSpreadsheet),
      card('Detallado Individual', 'Consulte el detalle académico de cada estudiante.', '/docs/docente/registro-de-calificaciones/detallado-individual', images.teacherGrades, 'Reporte individual de desempeño', BarChart3),
    ],
  },
  'docente/asistencia-y-seguimiento': {
    title: 'Asistencia y seguimiento',
    subtitle: 'Registre inasistencias, consulte consolidados y gestione excusas.',
    description:
      'Esta sección permite llevar un control claro de la asistencia de los grupos asignados. Encontrará opciones para registrar y consultar inasistencias por día o de forma detallada, además de revisar y gestionar las excusas enviadas por los estudiantes para mantener actualizado su seguimiento escolar.',
    cards: [
      card('Inasistencias', 'Registre y consulte la asistencia por día o en detalle.', '/docs/docente/asistencia-y-seguimiento/inasistencias', images.teacherSupport, 'Calendario de asistencia y seguimiento', CalendarDays),
      card('Excusas', 'Consulte y gestione las excusas enviadas.', '/docs/docente/asistencia-y-seguimiento/excusas', images.teacherSupport, 'Documento de excusa y validación docente', FileText),
    ],
  },
  'docente/convivencia-y-observador': {
    title: 'Convivencia y observador',
    subtitle: 'Documente comportamiento, anotaciones y seguimiento del estudiante.',
    description:
      'Aquí encontrará los procesos para registrar y consultar información relacionada con la convivencia escolar. Podrá crear anotaciones, valorar el comportamiento según los descriptores institucionales y revisar la ficha del observador para acompañar de manera integral la evolución formativa de cada estudiante.',
    cards: [
      card('Registro de anotaciones', 'Registre anotaciones de seguimiento en SINAI.', '/docs/docente/convivencia-y-observador/anotaciones', images.teacherSupport, 'Registro de seguimiento del estudiante', MessageSquare),
      card('Evaluación del comportamiento', 'Valore la convivencia según los descriptores.', '/docs/docente/convivencia-y-observador/evaluacion-del-comportamiento', images.teacherSupport, 'Escala de valoración del comportamiento', Scale),
      card('Ficha observador', 'Consulte caracterización, valoración y seguimiento.', '/docs/docente/convivencia-y-observador/ficha-observador', images.teacherSupport, 'Ficha completa de acompañamiento estudiantil', HeartHandshake),
    ],
  },
  'docente/cierre-academico-periodo': {
    title: 'Cierre académico (periodo)',
    subtitle: 'Consulte refuerzos, observaciones e informes al finalizar el periodo.',
    description:
      'Esta agrupación reúne las acciones docentes necesarias para completar cada periodo académico. Podrá registrar refuerzos, documentar observaciones de seguimiento, consultar informes de evaluación y revisar el cuadro de honor antes de dar por finalizado el proceso con sus grupos.',
    cards: [
      card('Refuerzos', 'Registre notas de refuerzo y genere sus actas.', '/docs/docente/cierre-academico-periodo/refuerzos', images.teacherClosing, 'Refuerzo y recuperación académica', RefreshCcw),
      card('Observaciones', 'Registre observaciones académicas por estudiante.', '/docs/docente/cierre-academico-periodo/observaciones', images.teacherClosing, 'Reporte con observaciones de seguimiento', MessageSquare),
      card('Informes de evaluación', 'Consulte, genere y descargue informes.', '/docs/docente/cierre-academico-periodo/informes-de-evaluacion', images.teacherClosing, 'Informe académico de cierre del periodo', FileText),
      card('Cuadro de Honor', 'Consulte los estudiantes con mejor rendimiento.', '/docs/docente/cierre-academico-periodo/cuadro-de-honor', images.teacherClosing, 'Reconocimiento al rendimiento académico', Trophy),
    ],
  },
  'docente/cierre-de-ano': {
    title: 'Cierre de año',
    subtitle: 'Revise notas finales, ajustes y recuperaciones del cierre anual.',
    description:
      'En este espacio encontrará las tareas que completan el calendario académico desde el rol Docente. Podrá consultar las valoraciones finales, realizar ajustes autorizados y gestionar las recuperaciones pendientes, verificando que los resultados de cada estudiante queden correctamente registrados antes del cierre anual.',
    cards: [
      card('Notas finales', 'Consulte valoraciones y descargue reportes.', '/docs/docente/cierre-de-ano/notas-finales', images.teacherClosing, 'Libro de resultados finales', CheckSquare),
      card('Ajuste de nota final', 'Ajuste una valoración con autorización institucional.', '/docs/docente/cierre-de-ano/ajuste-de-nota-final', images.teacherClosing, 'Ajuste controlado de resultados', Calculator),
      card('Recuperaciones finales', 'Genere y complete las actas de recuperación.', '/docs/docente/cierre-de-ano/recuperaciones-finales', images.teacherClosing, 'Acta de recuperación académica', RefreshCcw),
    ],
  },
  'docente/aula-virtual': {
    title: 'Aula virtual',
    subtitle: 'Gestione tareas, usuarios y calificaciones del aula virtual.',
    description:
      'Esta sección conecta el trabajo docente de SINAI con el aula virtual. Aquí encontrará las opciones para preparar tareas en línea, ingresar a Chamilo, administrar los usuarios que participan en los cursos e importar las calificaciones obtenidas para integrarlas al seguimiento académico.',
    cards: [
      card('Tareas en línea', 'Cree y gestione actividades virtuales.', '/docs/docente/aula-virtual/tareas-en-linea', images.teacherDigital, 'Portátil con tareas de aula virtual', Monitor),
      card('Aula virtual CHAMILO', 'Consulte las opciones del aula virtual.', '/docs/docente/aula-virtual/chamilo', images.teacherDigital, 'Entorno digital para clases en línea', Video),
      card('Gestión de usuarios', 'Administre quienes acceden al aula virtual.', '/docs/docente/aula-virtual/gestion-de-usuarios', images.teacherDigital, 'Usuarios conectados al entorno virtual', Users),
      card('Notas aula virtual', 'Importe calificaciones de Chamilo a SINAI.', '/docs/docente/aula-virtual/notas', images.teacherDigital, 'Sincronización de notas en la nube', Cloud),
    ],
  },
  'docente/herramientas': {
    title: 'Herramientas',
    subtitle: 'Consulte mensajes, reuniones, preinformes y utilidades de apoyo.',
    description:
      'Aquí encontrará recursos complementarios para comunicarse, coordinar actividades y verificar información académica. La sección reúne mensajes, reuniones, autoevaluaciones, preinformes, informes digitales, copias de seguridad, revisión de inconsistencias y valoración de centros de interés desde el módulo Docente.',
    cards: [
      card('Mensajes', 'Envíe, consulte y gestione mensajes internos.', '/docs/docente/herramientas/mensajes', images.teacherDigital, 'Mensajería del módulo docente', MessageSquare),
      card('Gestión de reuniones', 'Cree y administre reuniones académicas.', '/docs/docente/herramientas/reuniones', images.teacherDigital, 'Reunión académica en línea', Video),
      card('Autoevaluación', 'Consulte y responda sus autoevaluaciones.', '/docs/docente/herramientas/autoevaluacion', images.teacherDigital, 'Lista de autoevaluación docente', CheckSquare),
      card('Preinformes y alertas académicas', 'Registre causas y consulte alertas de sus grupos.', '/docs/docente/herramientas/preinformes', images.teacherSupport, 'Alerta de seguimiento académico', AlertTriangle),
      card('Informes Digitales', 'Genere y comparta informes digitales.', '/docs/docente/herramientas/informes-digitales', images.teacherDigital, 'Informe académico en la nube', FileText),
      card('Informes de herramientas', 'Consulte informes asignados por la institución.', '/docs/docente/herramientas/informes', images.teacherDigital, 'Carpeta con informes docentes', ClipboardList),
      card('Copia de seguridad', 'Conozca y utilice las opciones de respaldo.', '/docs/docente/herramientas/copia-de-seguridad', images.teacherDigital, 'Respaldo seguro de información docente', Database),
      card('Inconsistencias', 'Revise datos que requieren atención antes del cierre.', '/docs/docente/herramientas/inconsistencias', images.teacherDigital, 'Alerta de inconsistencia académica', MessageSquareWarning),
      card('Valoración de centros de interés', 'Registre y gestione valoraciones de centros.', '/docs/docente/herramientas/valoracion-centros-de-interes', images.teacherPlanning, 'Valoración de actividades de interés', Medal),
    ],
  },
  'docente/sinai-desktop': {
    title: 'SINAI Desktop',
    subtitle: 'Instale la aplicación y consulte sus procesos y opciones de sincronización.',
    description:
      'Esta sección reúne el uso de la aplicación de escritorio para docentes. Encontrará la instalación y configuración inicial, las herramientas de planeación y evaluación, el registro de asistencia y las opciones para sincronizar y enviar a SINAI en línea la información trabajada localmente.',
    cards: [
      card('Inicio y configuración', 'Instale la aplicación y consulte sus datos iniciales.', '/docs/docente/sinai-desktop/inicio-y-configuracion', images.teacherDigital, 'Aplicación de escritorio configurada', Monitor),
      card('Planeación', 'Gestione actividades y descriptores.', '/docs/docente/sinai-desktop/planeacion', images.teacherPlanning, 'Planeación docente en computador', NotebookPen),
      card('Evaluación', 'Consulte planillas y escalas de desempeño.', '/docs/docente/sinai-desktop/evaluacion', images.teacherGrades, 'Evaluación académica en escritorio', FileSpreadsheet),
      card('Asistencia', 'Registre las inasistencias desde SINAI Desktop.', '/docs/docente/sinai-desktop/asistencia', images.teacherSupport, 'Control de asistencia en la aplicación', CalendarDays),
      card('Herramientas y sincronización', 'Sincronice y envíe los datos a SINAI en línea.', '/docs/docente/sinai-desktop/herramientas-y-sincronizacion', images.teacherDigital, 'Sincronización entre escritorio y nube', Cloud),
    ],
  },
  'docente/ayuda': {
    title: 'Ayuda',
    subtitle: 'Consulte políticas y recursos de apoyo para utilizar SIEMPRE.NET.',
    description:
      'Este espacio reúne la orientación necesaria para resolver dudas y utilizar la plataforma de manera responsable. Aquí podrá consultar la política de tratamiento de datos, conocer los canales y condiciones del soporte técnico y aprender cómo registrar y hacer seguimiento a sugerencias de mejora.',
    cards: [
      card('Protección y tratamiento de datos', 'Consulte la política oficial sobre datos personales.', '/docs/docente/ayuda/politicas/proteccion-y-tratamiento-de-datos-personales', images.teacherDigital, 'Escudo para la protección de datos', ShieldCheck),
      card('Condiciones de soporte técnico', 'Conozca canales, prioridades y tiempos de respuesta.', '/docs/docente/ayuda/condiciones-de-soporte-tecnico', images.teacherDigital, 'Herramientas de soporte técnico', Wrench),
      card('Gestión de sugerencias', 'Registre y haga seguimiento a sus sugerencias.', '/docs/docente/ayuda/politicas/gestion-de-sugerencias', images.teacherDigital, 'Mensaje enviado al equipo de soporte', Send),
    ],
  },
  estudiante: {
    title: 'Estudiante',
    subtitle: 'Entra a tu módulo, realiza tus actividades y consulta tus resultados.',
    description:
      'Desde aquí haces lo que te corresponde como estudiante en SINAI. Puedes entrar con tu usuario, cambiar tu contraseña, actualizar tu foto y tus datos, escribirles a tus docentes, entregar tareas, entrar a tus cursos, responder la autoevaluación, consultar notas, informes y boletines, completar la prematrícula y revisar tus faltas, excusas y seguimiento.',
    cards: [
      card('Primeros pasos', 'Entra con tu usuario y cambia tu contraseña desde el perfil.', '/docs/estudiante/primeros-pasos', '/images/section-hubs/dedicated/estudiante/primeros-pasos/ingresar-a-sinai.webp', 'Estudiante frente a la puerta del salón', LogIn),
      card('Mi cuenta y comunicaciones', 'Actualiza tu perfil, envía mensajes y consulta tus docentes.', '/docs/estudiante/mi-cuenta-y-comunicaciones', '/images/section-hubs/dedicated/estudiante/mi-cuenta-y-comunicaciones/actualizar-perfil-frente.webp', 'Escritorio con el carné del estudiante', UserCog),
      card('Actividad académica', 'Entrega tareas, entra a Chamilo y responde tu autoevaluación.', '/docs/estudiante/actividad-academica', '/images/section-hubs/dedicated/estudiante/actividad-academica/mis-tareas.webp', 'Estudiante con el cuaderno de tareas', NotebookPen),
      card('Resultados académicos', 'Consulta notas, informes y los boletines del periodo y del año.', '/docs/estudiante/resultados-academicos', '/images/section-hubs/dedicated/estudiante/resultados-academicos/boletin-del-periodo.webp', 'Boletín sobre el escritorio', FileText),
      card('Matrícula', 'Revisa tus datos y confirma la prematrícula cuando esté abierta.', '/docs/estudiante/matricula', '/images/section-hubs/dedicated/estudiante/matricula/prematricula.webp', 'Carpeta de matrícula', ClipboardList),
      card('Asistencia y convivencia', 'Consulta faltas, envía excusas y lee tu ficha y tus anotaciones.', '/docs/estudiante/asistencia-y-convivencia', '/images/section-hubs/dedicated/estudiante/asistencia-y-convivencia/inasistencias.webp', 'Calendario de asistencia', CalendarDays),
    ],
  },
  'estudiante/primeros-pasos': {
    title: 'Primeros pasos',
    subtitle: 'Entra a SINAI y cambia tu contraseña cuando la necesites.',
    description:
      'Aquí aprendes a entrar a tu módulo y a dejar segura tu cuenta. Para ingresar, abres el portal, buscas el nombre de tu colegio y eliges usuario y contraseña, SNET CORE o Google. Tu usuario normalmente es tu número de documento. Si ya entraste, cambias la contraseña desde tu perfil: escribes la actual, creas una nueva de al menos 14 caracteres con mayúscula, minúscula y número, y la confirmas.',
    cards: [
      card('¿Cómo ingresar a SINAI?', 'Busca tu colegio en el portal y entra con usuario, SNET CORE o Google.', '/docs/estudiante/primeros-pasos/ingresar-a-sinai', '/images/section-hubs/dedicated/estudiante/primeros-pasos/ingresar-a-sinai.webp', 'Estudiante entrando al salón', LogIn),
      card('Cómo cambiar mi contraseña', 'Escribe la contraseña actual, crea una nueva y confírmala en tu perfil.', '/docs/estudiante/primeros-pasos/cambiar-contrasena', '/images/section-hubs/dedicated/estudiante/primeros-pasos/cambiar-contrasena.webp', 'Estudiante cambiando su contraseña', KeyRound),
    ],
  },
  'estudiante/mi-cuenta-y-comunicaciones': {
    title: 'Mi cuenta y comunicaciones',
    subtitle: 'Actualiza tus datos, escribe mensajes y consulta quién te dicta clase.',
    description:
      'Aquí administras tu cuenta y te comunicas con el colegio. En tu perfil cambias la foto, los datos básicos, el contacto y la contraseña, y puedes vincular SNET CORE. En Mensajes lees, escribes y adjuntas archivos a usuarios de tu institución, como tus docentes. En Mis docentes ves el nombre de quien dicta cada asignatura de tu grupo.',
    cards: [
      card('Cómo actualizar el perfil', 'Cambia tu foto, tus datos básicos, tu contacto y tu contraseña.', '/docs/estudiante/mi-cuenta-y-comunicaciones/actualizar-perfil', '/images/section-hubs/dedicated/estudiante/mi-cuenta-y-comunicaciones/actualizar-perfil-frente.webp', 'Carné y foto sobre el escritorio', UserCog),
      card('Mensajes', 'Lee tu bandeja y envía mensajes o archivos a tus docentes.', '/docs/estudiante/mi-cuenta-y-comunicaciones/mensajes', '/images/section-hubs/dedicated/estudiante/mi-cuenta-y-comunicaciones/mensajes-frente.webp', 'Sobre de mensaje en el escritorio', MessageSquare),
      card('Mis docentes', 'Consulta el nombre de quien dicta cada asignatura de tu grupo.', '/docs/estudiante/mi-cuenta-y-comunicaciones/mis-docentes', '/images/section-hubs/dedicated/estudiante/mi-cuenta-y-comunicaciones/mis-docentes.webp', 'Tarjetas de docentes sobre el escritorio', Users),
    ],
  },
  'estudiante/actividad-academica': {
    title: 'Actividad académica',
    subtitle: 'Entrega tus tareas, entra a tus cursos y responde tu autoevaluación.',
    description:
      'Aquí realizas el trabajo que te dejan en clase. En Mis tareas filtras por grupo, periodo, asignatura y estado, abres las indicaciones del docente, descargas los adjuntos y envías tu archivo antes de la fecha límite. En Aula virtual entras a tus cursos de Chamilo. En Autoevaluación respondes la que tu colegio dejó abierta y envías tus respuestas.',
    cards: [
      card('Mis tareas', 'Filtra tus actividades, abre las indicaciones y envía tu archivo.', '/docs/estudiante/actividad-academica/mis-tareas', '/images/section-hubs/dedicated/estudiante/actividad-academica/mis-tareas.webp', 'Estudiante escribiendo en su cuaderno', NotebookPen),
      card('Aula virtual CHAMILO', 'Entra desde SINAI a los cursos que tienes en Chamilo.', '/docs/estudiante/actividad-academica/aula-virtual', '/images/section-hubs/dedicated/estudiante/actividad-academica/aula-virtual-frente.webp', 'Estudiante frente al computador del aula', Monitor),
      card('Autoevaluación', 'Responde cada punto de la autoevaluación y envía tus respuestas.', '/docs/estudiante/actividad-academica/autoevaluacion', '/images/section-hubs/dedicated/estudiante/actividad-academica/autoevaluacion.webp', 'Lista de autoevaluación sobre el escritorio', CheckSquare),
    ],
  },
  'estudiante/resultados-academicos': {
    title: 'Resultados académicos',
    subtitle: 'Consulta tus notas, abre tus informes y descarga tus boletines.',
    description:
      'Aquí miras cómo vas en el año, cuando tu colegio ya publicó la información. En Calificaciones consolidadas ves la nota de cada asignatura por periodo. En Informes abres o descargas los informes disponibles. En Boletín del periodo y en Boletín final abres el boletín del periodo que elijas o el del cierre del año.',
    cards: [
      card('Informes', 'Abre o descarga los informes que tu colegio ya publicó.', '/docs/estudiante/resultados-academicos/informes', '/images/section-hubs/dedicated/estudiante/resultados-academicos/informes.webp', 'Informes sobre el escritorio', FileText),
      card('Calificaciones consolidadas', 'Elige el periodo y mira la nota de cada asignatura.', '/docs/estudiante/resultados-academicos/calificaciones-consolidadas', '/images/section-hubs/dedicated/estudiante/resultados-academicos/calificaciones-consolidadas.webp', 'Hoja de notas sobre el escritorio', BarChart3),
      card('Boletín del periodo', 'Abre el boletín del periodo que quieras consultar.', '/docs/estudiante/resultados-academicos/boletin-del-periodo', '/images/section-hubs/dedicated/estudiante/resultados-academicos/boletin-del-periodo.webp', 'Boletín del periodo en una carpeta', ClipboardList),
      card('Boletín final', 'Abre el boletín con el resultado de todo el año.', '/docs/estudiante/resultados-academicos/boletin-final', '/images/section-hubs/dedicated/estudiante/resultados-academicos/boletin-final.webp', 'Boletín final con un listón', Trophy),
    ],
  },
  'estudiante/matricula': {
    title: 'Matrícula',
    subtitle: 'Completa tu prematrícula cuando el colegio la tenga abierta.',
    description:
      'Cuando tu colegio habilita la prematrícula, entras y completas el formulario: datos básicos, caracterización, carga de requisitos, información familiar y acudiente. Al guardar, revisas el estado del proceso para confirmar que quedó registrada.',
    cards: [
      card('Prematrícula', 'Completa el formulario, guarda los datos y revisa el estado del proceso.', '/docs/estudiante/matricula/prematricula', '/images/section-hubs/dedicated/estudiante/matricula/prematricula.webp', 'Carpeta de prematrícula sobre el escritorio', ClipboardList),
    ],
  },
  'estudiante/asistencia-y-convivencia': {
    title: 'Asistencia y convivencia',
    subtitle: 'Consulta tus faltas, envía una excusa y lee tu seguimiento.',
    description:
      'Aquí revisas tu asistencia y lo que el colegio registró sobre tu convivencia. En Inasistencias ves las faltas del periodo, en consolidado o día por día. En Excusas envías el soporte de una falta. En Ficha observador, Anotaciones y Seguimiento lees tu ficha, cada anotación con su fecha y el resumen de tu proceso.',
    cards: [
      card('Inasistencias Consolidadas y Detalladas', 'Elige el periodo y consulta tus faltas en consolidado o en detalle.', '/docs/estudiante/asistencia-y-convivencia/inasistencias', '/images/section-hubs/dedicated/estudiante/asistencia-y-convivencia/inasistencias.webp', 'Calendario de asistencia en el escritorio', CalendarDays),
      card('Excusas', 'Adjunta el soporte de una falta y envía la excusa.', '/docs/estudiante/asistencia-y-convivencia/excusas', '/images/section-hubs/dedicated/estudiante/asistencia-y-convivencia/excusas.webp', 'Sobre con una excusa', Mail),
      card('Ficha Observador', 'Abre tu ficha y lee la información de seguimiento que registró el colegio.', '/docs/estudiante/asistencia-y-convivencia/ficha-observador', '/images/section-hubs/dedicated/estudiante/asistencia-y-convivencia/ficha-observador.webp', 'Ficha abierta sobre el escritorio', HeartHandshake),
      card('Anotaciones', 'Lee cada anotación con su fecha y el motivo registrado.', '/docs/estudiante/asistencia-y-convivencia/anotaciones', '/images/section-hubs/dedicated/estudiante/asistencia-y-convivencia/anotaciones.webp', 'Cuaderno de anotaciones', MessageSquare),
      card('Seguimiento', 'Consulta el resumen de tu proceso de acompañamiento.', '/docs/estudiante/asistencia-y-convivencia/seguimiento', '/images/section-hubs/dedicated/estudiante/asistencia-y-convivencia/seguimiento.webp', 'Lista de seguimiento con marcas', ClipboardCheck),
    ],
  },
};

const DETAIL_ICONS: LucideIcon[] = [
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ShieldCheck,
  Users,
  BarChart3,
  BookOpen,
  MessageSquare,
  BadgeCheck,
  Cloud,
];

function stableNumber(value: string) {
  return Array.from(value).reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7);
}

function iconFor(title: string): LucideIcon {
  const normalized = title.toLocaleLowerCase('es-CO');

  if (/(contraseña|sesión|ingresar|acceso|autorizaci)/.test(normalized)) return KeyRound;
  if (/(usuario|funcionario|personal|docente|estudiante|grupo|matrícula)/.test(normalized)) return Users;
  if (/(calendario|periodo|cronograma|horario|asistencia|inasistencia)/.test(normalized)) return CalendarDays;
  if (/(calific|nota|evaluación|escala|valoración|logro|desempeño)/.test(normalized)) return BarChart3;
  if (/(planilla|excel|reporte|informe|acta|listado)/.test(normalized)) return FileSpreadsheet;
  if (/(planeación|currículo|malla|actividad|clase|asignatura)/.test(normalized)) return NotebookPen;
  if (/(piar|inclusiva|caracterización)/.test(normalized)) return Accessibility;
  if (/(permiso|política|protección|seguridad|auditoría)/.test(normalized)) return ShieldCheck;
  if (/(mensaje|anotación|observación|sugerencia|excusa)/.test(normalized)) return MessageSquare;
  if (/(sincron|desktop|aula virtual|chamilo|descargar|instalar)/.test(normalized)) return Monitor;
  if (/(copia de seguridad|backup)/.test(normalized)) return Database;
  if (/(centro de interés|interés)/.test(normalized)) return MapPin;
  if (/(promoción|cuadro de honor|recuperación|refuerzo)/.test(normalized)) return Trophy;
  if (/(buscar|consultar|verificación)/.test(normalized)) return Search;
  return ClipboardList;
}

function readDynamicHub(section: string): HubConfig | null {
  const sourcePath = path.join(process.cwd(), 'content', 'docs', ...section.split('/'), 'index.mdx');
  if (!fs.existsSync(sourcePath)) return null;

  const source = fs.readFileSync(sourcePath, 'utf8');
  const title = source.match(/^title:\s*["'](.+?)["']\s*$/m)?.[1];
  const subtitle = source.match(/^description:\s*["'](.+?)["']\s*$/m)?.[1];
  const withoutFrontmatter = source.replace(/^---[\s\S]*?---\s*/m, '');
  const introduction = withoutFrontmatter
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('<'));

  if (!title || !subtitle) return null;

  const cards: HubCard[] = [];
  const cardExpression = /<Card\s+title=(?:"([^"]+)"|\{\"([^\"]+)\"\})\s+href="([^"]+)"\s+description=(?:"([^"]+)"|\{\"([^\"]+)\"\})\s*\/>/g;
  let match = cardExpression.exec(source);
  while (match) {
    const cardTitle = match[1] ?? match[2];
    const cardDescription = match[4] ?? match[5];
    cards.push({ title: cardTitle, description: cardDescription, href: match[3], icon: iconFor(cardTitle) });
    match = cardExpression.exec(source);
  }

  if (!cards.length) return null;

  const lead = introduction && introduction !== subtitle ? introduction : subtitle;
  return {
    title,
    subtitle,
    description: `${lead} Seleccione una opción para conocer el proceso paso a paso, los datos que debe preparar y las acciones disponibles para completarlo correctamente en SINAI.`,
    cards,
  };
}

function publicImageIfExists(publicPath: string) {
  const diskPath = path.join(process.cwd(), 'public', publicPath);
  return fs.existsSync(diskPath) ? publicPath : null;
}

function transparentImageFor(publicPath: string) {
  const cut = publicImageIfExists(publicPath.replace(/\.webp$/, '-cut.webp'));
  if (cut) return cut;
  const refreshed = publicImageIfExists(publicPath.replace(/\.webp$/, '-v2.webp'));
  if (refreshed) return refreshed;
  return publicImageIfExists(publicPath);
}

function dedicatedImageFor(item: HubCard) {
  const relativePath = item.href.replace(/^\/docs\//, '');
  const studentIllustration = relativePath.startsWith('estudiante/')
    ? publicImageIfExists(`/images/section-hubs/student-illustrations/${relativePath}.png`)
    : null;

  if (studentIllustration) return studentIllustration;

  const studentRootImage = relativePath.match(/^estudiante\/([^/]+)$/)?.[1];

  if (studentRootImage) {
    const rootImage = transparentImageFor(`/images/section-hubs/dedicated/estudiante/root/${studentRootImage}.webp`);
    if (rootImage) return rootImage;
  }

  const explicitPath = item.image?.endsWith('.webp') ? item.image : null;
  if (explicitPath) {
    const explicit = transparentImageFor(explicitPath);
    if (explicit) return explicit;
  }

  return transparentImageFor(`/images/section-hubs/dedicated/${relativePath}.webp`);
}

function generatedImageFor(item: HubCard) {
  const relativePath = item.href.replace(/^\/docs\//, '');
  return publicImageIfExists(`/images/section-hubs/generated/${relativePath}.png`);
}

function HubIllustration({ item, index }: { item: HubCard; index: number }) {
  const image = dedicatedImageFor(item) ?? generatedImageFor(item);

  if (image) {
    return (
      <div className="sinai-institutional-card-illustration">
        <Image src={image} alt={item.imageAlt ?? item.title} width={720} height={720} sizes="(max-width: 900px) 100vw, 33vw" data-image-modal-managed />
      </div>
    );
  }

  const Icon = item.icon;
  const seed = stableNumber(`${item.title}-${item.href}`);
  const DetailIcon = DETAIL_ICONS[seed % DETAIL_ICONS.length];
  const variant = (seed + index) % 4;

  return (
    <div className="sinai-institutional-card-illustration">
      <div className="sinai-section-card-illustration" data-variant={variant} aria-hidden="true">
        <span className="sinai-section-card-orbit" />
        <span className="sinai-section-card-panel sinai-section-card-panel-primary"><Icon /></span>
        <span className="sinai-section-card-panel sinai-section-card-panel-detail"><DetailIcon /></span>
        <span className="sinai-section-card-spark sinai-section-card-spark-one" />
        <span className="sinai-section-card-spark sinai-section-card-spark-two" />
      </div>
    </div>
  );
}

export function SectionHub({ section }: { section: string }) {
  const hub = HUBS[section] ?? readDynamicHub(section);

  if (!hub) return null;

  const headingId = `section-options-${section.replaceAll('/', '-')}`;

  return (
    <div className="sinai-institutional-hub" data-section-hub={section}>
      <header className="sinai-institutional-hero">
        <div className="sinai-institutional-hero-copy">
          <div className="sinai-institutional-title-lockup">
            <span aria-hidden="true" />
            <div>
              <h1>{hub.title}</h1>
              <p>{hub.subtitle}</p>
            </div>
          </div>
          <span className="sinai-institutional-title-rule" aria-hidden="true" />
          <div className="sinai-institutional-description">
            <p>{hub.description}</p>
          </div>
        </div>
      </header>

      <section className="sinai-institutional-options" aria-labelledby={headingId}>
        <div className="sinai-institutional-section-heading">
          <h2 id={headingId}>Contenido de esta sección</h2>
        </div>
        <div className="sinai-institutional-card-grid">
          {hub.cards.map((item, index) => (
            <Link className="sinai-institutional-card" href={item.href} key={item.href}>
              <HubIllustration item={item} index={index} />
              <div className="sinai-institutional-card-copy">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="sinai-institutional-card-action" aria-hidden="true">
                  <ArrowRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
