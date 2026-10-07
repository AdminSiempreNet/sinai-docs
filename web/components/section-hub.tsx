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
  image: string;
  imageAlt: string;
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
      card('Planta de cargos', 'Configure la planta de cargos de la institución.', '/docs/administrativo/gestion-de-personal/planta-de-cargos', images.adminPersonnel, 'Equipo institucional y estructura de cargos', Briefcase),
      card('Registro de Funcionarios', 'Registre y actualice la información de funcionarios.', '/docs/administrativo/gestion-de-personal/funcionarios', images.adminPersonnel, 'Identificación y registro de funcionarios', Contact),
      card('Asignación académica', 'Asigne carga académica por periodo o por estudiante.', '/docs/administrativo/gestion-de-personal/asignacion-academica', images.adminPersonnel, 'Organización del personal y su carga académica', BookOpen),
      card('Seguimiento docente', 'Consulte novedades, asistencia, horas, diario y tareas del docente.', '/docs/administrativo/gestion-de-personal/seguimiento-docente', images.adminPersonnel, 'Seguimiento de actividades del equipo docente', ClipboardCheck),
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
};

function HubIllustration({ item }: { item: HubCard }) {
  const Icon = item.icon;

  return (
    <div className="sinai-institutional-card-illustration">
      <Image
        src={item.image}
        alt={item.imageAlt}
        width={720}
        height={720}
        sizes="(max-width: 900px) 100vw, 33vw"
        data-image-modal-managed
      />
      <span className="sinai-section-card-topic" aria-hidden="true">
        <Icon />
      </span>
    </div>
  );
}

export function SectionHub({ section }: { section: string }) {
  const hub = HUBS[section];

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
          {hub.cards.map((item) => (
            <Link className="sinai-institutional-card" href={item.href} key={item.href}>
              <HubIllustration item={item} />
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
