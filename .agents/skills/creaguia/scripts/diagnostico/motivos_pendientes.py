"""Motivo de cada captura pendiente: (fragmento de la ruta MDX, archivo) -> motivo."""

SIN_DATOS = "La IE de pruebas no tiene los datos que la captura necesita"

MOTIVOS = [
    ("configuracion-de-parametros", "columna-creditos.jpg", "Los créditos no están habilitados en el calendario de la IE de pruebas."),
    ("observador-del-estudiante/caracterizacion", "ventana-importar.jpg", "El botón Importar está bloqueado por seguridad; habría que verificar en el código que solo abre la ventana."),
    ("observador-del-estudiante/caracterizacion", "caracterizacion-reportes.jpg", f"{SIN_DATOS}: no hay caracterización registrada en 2025."),
    ("observador-del-estudiante/configuracion", "ventana-tipos-predeterminados.jpg", "El botón solo aparece si la IE no tiene tipos de seguimiento, y la de pruebas tiene 5."),
    ("observador-del-estudiante/seguimientos", "ver-anotaciones.jpg", f"{SIN_DATOS}: no hay anotaciones disciplinarias."),
    ("observador-del-estudiante/seguimientos", "anotaciones-disciplinarias.jpg", f"{SIN_DATOS}: ningún grupo tiene anotaciones (2024 y 2025)."),
    ("observador-del-estudiante/valoracion", "autollenar-periodo.jpg", "La IE de pruebas no tiene escala del observador configurada en 2025."),
    ("administrativo/herramientas/preinformes", "dashboard.jpg", f"{SIN_DATOS}: no hay cortes consolidados en 2025; crear uno escribe datos."),
    ("administrativo/herramientas/preinformes", "consolidar.jpg", f"{SIN_DATOS}: no hay cortes consolidados en 2025; crear uno escribe datos."),
    ("planeacion-de-actividades", "copiar-actividades.jpg", "Todos los periodos de 2025 están cerrados para planeación; con el periodo cerrado Copiar no abre la ventana."),
    ("inasistencias/consultar-o-modificar", "resultado-por-estudiante.jpg", f"{SIN_DATOS}: la docente de prueba no tiene inasistencias registradas."),
    ("cierre-academico-periodo/refuerzos", "acta-recuperacion.jpg", "El botón Acta guarda recuperaciones y crea el acta (escribe datos)."),
    ("docente/herramientas/valoracion-centros-de-interes", "planilla-valoracion.jpg", "En el super solo NOEMYS tiene rol Docente y no tiene centros de interés asignados (habría que asignarle uno)."),
    ("docente/herramientas/valoracion-centros-de-interes", "enviar-valoraciones.jpg", "En el super solo NOEMYS tiene rol Docente y no tiene centros de interés asignados (habría que asignarle uno)."),
    ("actividades-complementarias", "lista-actividades.jpg", f"{SIN_DATOS}: ningún funcionario tiene actividades complementarias en 2025."),
    ("actividades-del-periodo", "ventana-copiar.jpg", "Todos los periodos de la docente de prueba están cerrados para planeación."),
    ("estandares", "estandares-competencias.jpg", f"{SIN_DATOS}: no hay estándares cargados."),
    ("estandares", "registrar-estandar.jpg", "La opción que permite a los docentes gestionar estándares (config. 47) no está habilitada."),
    ("planeacion-de-clases", "", f"{SIN_DATOS}: la docente de prueba no tiene planeaciones visibles en ningún calendario."),
    ("calificacion-definitiva-directa", "ventana-autollenar.jpg", "Autollenar solo aparece con actividades y ninguna asignatura tiene actividades (2025 y 2023)."),
    ("registro-de-calificaciones/planilla-excel", "diligenciar-excel.jpg", "No hay planillas generadas; generarlas escribe datos."),
    ("estudiante/", "", "En andino, al entrar como cualquier estudiante desde el super, todas las páginas dan Server Error (fallo del servidor)."),
    ("autoevaluacion-responder", "", "El Rector de la IE de pruebas no tiene autoevaluaciones abiertas; responder una encuesta escribe datos."),
    ("calificaciones/registro-por-actividades", "", "Requiere cambiar el SIE del usuario de prueba, o la IE no tiene grupos ni datos de ese sistema de evaluación."),
    ("ficha-observador/caracterizacion", "", "Ningún grupo tiene estudiantes generados en la caracterización; Generar escribe datos."),
    ("aula-virtual/chamilo", "", "LoginChamilo.aspx puede actualizar la contraseña de Chamilo al cargar, por eso no se abrió."),
    ("informes-digitales", "historial-con-informe.jpg", "La IE de pruebas no tiene informes digitales generados; generarlos escribe datos."),
    ("procesos-de-validacion", "planilla-validacion.jpg", "El único grupo de validación de la IE de pruebas no tiene estudiantes con validaciones."),
]


def motivo(mdx_path, archivo):
    for frag, arch, texto in MOTIVOS:
        if frag in mdx_path and (not arch or arch == archivo):
            return texto
    return "Sin tomar"
