import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('content/docs');
const placeholderMarker = 'El contenido detallado se añadirá en la siguiente etapa.';

const repairs = [
  ['administrativo/preguntas-frecuentes.mdx', 'administrativo/__repair_faq/faq-administrativos.mdx'],
  ['administrativo/capacitacion-documentada/inicio/mensajes.mdx', 'administrativo/capacitacion-documentada/inicio/a-mensajes.mdx'],
  ['administrativo/capacitacion-documentada/inicio/inconsistencias.mdx', 'administrativo/procesos-de-temporada/finalizacion-de-periodo/inconsistencias.mdx', 'copy'],
  ['administrativo/capacitacion-documentada/inicio/como-ingresar-a-sinai.mdx', 'administrativo/capacitacion-documentada/inicio/a-como-ingresar-a-sinai.mdx'],
  ['administrativo/capacitacion-documentada/inicio/actualizar-datos-de-perfil-de-usuario.mdx', 'administrativo/capacitacion-documentada/inicio/actualizar-datos-de-perfil-de-usuario-funcionarios.mdx'],
  ['administrativo/capacitacion-documentada/seguimiento/informes-de-seguimiento.mdx', 'administrativo/capacitacion-documentada/seguimiento/informes-seguimiento/informes-seguimiento.mdx'],
  ['administrativo/procesos-de-temporada/promocion-y-finalizacion-de-calendario/que-debo-hacer-antes-de-procesar-la-promocion.mdx', 'administrativo/procesos-de-temporada/promocion-y-finalizacion-de-calendario/promocion-de-los-estudiantes.mdx'],
  ['administrativo/procesos-de-temporada/promocion-y-finalizacion-de-calendario/comision-de-evaluacion.mdx', 'administrativo/procesos-de-temporada/promocion-y-finalizacion-de-calendario/comision-de-evaluacion-y-promocion.mdx'],
  ['administrativo/procesos-de-temporada/autoevaluacion-institucional/gestionar-cuestionarios.mdx', 'administrativo/procesos-de-temporada/autoevaluacion-institucional/configuracion-de-encuestas.mdx'],
  ['administrativo/procesos-de-temporada/autoevaluacion-institucional/gestionar-autoevaluacion.mdx', 'administrativo/procesos-de-temporada/autoevaluacion-institucional/configurar-autoevaluacion.mdx'],
  ['administrativo/capacitacion-documentada/evaluacion/calificaciones/cuadro-de-honor.mdx', 'administrativo/capacitacion-documentada/evaluacion/calificaciones/cuadro-de-honor-2.mdx'],
  ['administrativo/capacitacion-documentada/evaluacion/calificaciones/calificacion-definitiva-directa.mdx', 'administrativo/capacitacion-documentada/evaluacion/calificaciones/a-calificacion-definitiva-directa.mdx'],
  ['administrativo/capacitacion-documentada/evaluacion/informes-de-evaluacion.mdx', 'administrativo/capacitacion-documentada/evaluacion/informes-evaluacion/informes-evaluacion.mdx'],
  ['administrativo/capacitacion-documentada/seguimiento/inasistencias/consolidado-individual-de-inasistencias.mdx', 'administrativo/capacitacion-documentada/seguimiento/inasistencias/consolidado-individual-de-inasistencia.mdx'],
  ['administrativo/capacitacion-documentada/seguimiento/inasistencias/consolidado-de-inasistencias-por-asignaturas.mdx', 'administrativo/capacitacion-documentada/seguimiento/inasistencias/consolidado-de-inasistencia-por-asignatura.mdx'],
  ['administrativo/capacitacion-documentada/seguimiento/f-observador/version-anterior/valoracion-individual-y-grupo.mdx', 'administrativo/capacitacion-documentada/seguimiento/f-observador/valoracion-individual-y-grupo.mdx'],
  ['administrativo/capacitacion-documentada/seguimiento/f-observador/version-anterior/reportes-de-caracterizacion.mdx', 'administrativo/capacitacion-documentada/seguimiento/f-observador/reportes-de-caracterizacion.mdx'],
  ['administrativo/capacitacion-documentada/seguimiento/f-observador/version-anterior/ficha-observador-del-estudiante.mdx', 'administrativo/capacitacion-documentada/seguimiento/f-observador/a-ficha-observador-del-estudiante.mdx'],
  ['administrativo/capacitacion-documentada/seguimiento/f-observador/version-anterior/configuracion-de-aspectos-y-criterios.mdx', 'administrativo/capacitacion-documentada/seguimiento/f-observador/configuracion-de-aspectos-y-criterios.mdx'],
  ['administrativo/capacitacion-documentada/seguimiento/f-observador/version-anterior/caracterizacion-adicional.mdx', 'administrativo/capacitacion-documentada/seguimiento/f-observador/caracterizacion-adicional.mdx'],
  ['administrativo/capacitacion-documentada/seguimiento/f-observador/version-actualizada.mdx', 'administrativo/capacitacion-documentada/seguimiento/f-observador/nueva-version-ficha-observador.mdx'],
  ['administrativo/capacitacion-documentada/establecimiento/institucion/configuracion-de-la-institucion.mdx', 'administrativo/capacitacion-documentada/establecimiento/institucion/institucion-configuracion-de-la-institucion.mdx'],
  ['administrativo/capacitacion-documentada/establecimiento/grupos/disponibilidad-de-cupos.mdx', 'administrativo/capacitacion-documentada/establecimiento/grupos/grupos-disponibilidad-de-cupos.mdx'],
  ['administrativo/capacitacion-documentada/establecimiento/configuracion-academica/configuracion-de-componentes.mdx', 'administrativo/capacitacion-documentada/establecimiento/configuracion-academica/configuracion-componentes.mdx'],
  ['administrativo/capacitacion-documentada/promocion/trasladar-matricula/trasladar-matricula-por-grupo.mdx', 'administrativo/capacitacion-documentada/promocion/trasladar-matricula/por-grupo.mdx'],
  ['administrativo/capacitacion-documentada/establecimiento/areas-y-asignatura.mdx', 'administrativo/capacitacion-documentada/establecimiento/areas-y-asignaturas/areas-y-asignaturas.mdx'],
  ['administrativo/capacitacion-documentada/promocion/promocion/procesos-promocion.mdx', 'administrativo/capacitacion-documentada/promocion/promocion/procesar-promocion.mdx'],
  ['administrativo/capacitacion-documentada/promocion/informes-de-promocion.mdx', 'administrativo/capacitacion-documentada/promocion/informes-promocion/informes-promocion.mdx'],
  ['administrativo/capacitacion-documentada/matricula/listados/lista-de-estudiantes-por-grupo.mdx', 'administrativo/capacitacion-documentada/matricula/listados/a-lista-por-grupos.mdx'],
  ['administrativo/capacitacion-documentada/matricula/informes-de-matricula/libros-de-matricula.mdx', 'administrativo/capacitacion-documentada/matricula/informes-de-matricula/a-libros-de-matricula.mdx'],
  ['administrativo/capacitacion-documentada/matricula/informes-de-matricula/informes-de-matricula.mdx', 'administrativo/capacitacion-documentada/matricula/informes-de-matricula/a-informes.mdx'],
  ['administrativo/capacitacion-documentada/planeacion/planeacion-curricular/planeacion-de-clases-version-estandar.mdx', 'administrativo/capacitacion-documentada/planeacion/planeacion-curricular/a-planeacion-de-clases-version-estandar.mdx'],
  ['administrativo/capacitacion-documentada/planeacion/planeacion-curricular/planeacion-de-clases-version-archivo-adjunto.mdx', 'administrativo/capacitacion-documentada/planeacion/planeacion-curricular/planeacion-de-clases-archivo-adjunto.mdx'],
];

const drops = [
  'administrativo/capacitacion-documentada/establecimiento/institucion/configuracion-de-la-institucion-2.mdx',
  'administrativo/capacitacion-documentada/matricula/listados/estudiantes-desplazados.mdx',
];

function absolute(relative) {
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw new Error(`Ruta fuera de content/docs: ${relative}`);
  return target;
}

function titleOf(content) {
  return content.match(/^title:\s*["'](.*?)["']\s*$/m)?.[1];
}

async function allMeta(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await allMeta(entryPath));
    else if (entry.name === 'meta.json') result.push(entryPath);
  }
  return result;
}

const removedSources = [];
for (const [targetRelative, sourceRelative, mode = 'move'] of repairs) {
  const target = absolute(targetRelative);
  const source = absolute(sourceRelative);
  if (!existsSync(target) || !existsSync(source)) throw new Error(`Falta un archivo: ${targetRelative} <- ${sourceRelative}`);
  const placeholder = await readFile(target, 'utf8');
  if (!placeholder.includes(placeholderMarker)) throw new Error(`El destino ya no es provisional: ${targetRelative}`);
  const targetTitle = titleOf(placeholder);
  let content = await readFile(source, 'utf8');
  if (targetTitle) content = content.replace(/^title:.*$/m, `title: ${JSON.stringify(targetTitle)}`);
  await writeFile(target, content, 'utf8');
  if (mode === 'move') {
    await rm(source);
    removedSources.push(source);
  }
}

for (const relative of drops) {
  const target = absolute(relative);
  const content = await readFile(target, 'utf8');
  if (!content.includes(placeholderMarker)) throw new Error(`La página a retirar ya no es provisional: ${relative}`);
  await rm(target);
  removedSources.push(target);
}

// Remove navigation entries whose files were consolidated, while retaining
// the canonical placeholder slug that now owns the recovered content.
for (const metaPath of await allMeta(root)) {
  const meta = JSON.parse(await readFile(metaPath, 'utf8'));
  if (!Array.isArray(meta.pages)) continue;
  const directory = path.dirname(metaPath);
  const filtered = meta.pages.filter((entry) => {
    const file = path.join(directory, `${entry}.mdx`);
    const folder = path.join(directory, entry);
    return existsSync(file) || existsSync(folder) || entry === 'index';
  });
  meta.pages = [...new Set(filtered)];
  await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
}

// Remove temporary or now-empty source folders after every path has been
// resolved and checked inside content/docs.
const candidateFolders = new Set([
  path.join(root, 'administrativo', '__repair_faq'),
  ...removedSources.map((file) => path.dirname(file)),
]);
for (const folder of candidateFolders) {
  if (!folder.startsWith(root + path.sep) || !existsSync(folder)) continue;
  const entries = await readdir(folder);
  if (entries.length === 0 || (entries.length === 1 && entries[0] === 'meta.json')) {
    await rm(folder, { recursive: true });
  }
}

console.log(`Páginas recuperadas: ${repairs.length}; provisionales retiradas: ${drops.length}`);
