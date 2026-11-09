const READY: Record<string, string> = {
  'estudiante/primeros-pasos/ingresar-a-sinai': 'Listo cuando veas tu página de inicio.',
  'estudiante/primeros-pasos/cambiar-contrasena': 'Listo cuando SINAI acepte tu contraseña nueva.',
  'estudiante/mi-cuenta-y-comunicaciones/actualizar-perfil': 'Listo cuando veas tus datos actualizados.',
  'estudiante/mi-cuenta-y-comunicaciones/mensajes': 'Listo cuando tu mensaje quede enviado.',
  'estudiante/mi-cuenta-y-comunicaciones/mis-docentes': 'Listo cuando veas el nombre de tus docentes.',
  'estudiante/actividad-academica/mis-tareas': 'Listo cuando la tarea quede enviada.',
  'estudiante/actividad-academica/aula-virtual': 'Listo cuando veas tus cursos.',
  'estudiante/actividad-academica/autoevaluacion': 'Listo cuando envíes tus respuestas.',
  'estudiante/resultados-academicos/informes': 'Listo cuando abras o descargues tu informe.',
  'estudiante/resultados-academicos/calificaciones-consolidadas': 'Listo cuando veas tus notas del periodo.',
  'estudiante/resultados-academicos/boletin-del-periodo': 'Listo cuando veas tu boletín del periodo.',
  'estudiante/resultados-academicos/boletin-final': 'Listo cuando veas tu boletín del año.',
  'estudiante/matricula/prematricula': 'Listo cuando confirmes tu prematrícula.',
  'estudiante/asistencia-y-convivencia/inasistencias': 'Listo cuando veas tus faltas.',
  'estudiante/asistencia-y-convivencia/excusas': 'Listo cuando envíes tu excusa.',
  'estudiante/asistencia-y-convivencia/ficha-observador': 'Listo cuando abras tu ficha.',
  'estudiante/asistencia-y-convivencia/anotaciones': 'Listo cuando veas tus anotaciones.',
  'estudiante/asistencia-y-convivencia/seguimiento': 'Listo cuando veas tu seguimiento.',
};

export function StudentGuideReady({ slug }: { slug: string }) {
  const line = READY[slug];
  if (!line) return null;

  return <p className="sinai-student-guide-ready">{line}</p>;
}
