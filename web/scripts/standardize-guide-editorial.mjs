import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const docsDirectory = path.resolve('content/docs');
const apply = process.argv.includes('--apply');

async function getMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getMdxFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  }));
  return nested.flat();
}

function lowerFirst(value) {
  return value ? value[0].toLocaleLowerCase('es-CO') + value.slice(1) : value;
}

function sentenceCase(value) {
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized ? normalized[0].toLocaleUpperCase('es-CO') + normalized.slice(1) : normalized;
}

function createDescription(title) {
  const cleanTitle = title.trim().replace(/\s+/g, ' ').replace(/^¿/, '').replace(/[?.:]+$/, '');
  const lowerTitle = lowerFirst(cleanTitle);
  const patterns = [
    [/^Cómo\s+(.+)/i, (_, rest) => `Aprenda cómo ${lowerFirst(rest)} en SINAI.`],
    [/^D[oó]nde\s+(.+)/i, (_, rest) => `Aprenda dónde ${lowerFirst(rest)} en SINAI.`],
    [/^Qu[eé] debo hacer antes de\s+(.+)/i, (_, rest) => `Conozca las verificaciones necesarias antes de ${lowerFirst(rest)} en SINAI.`],
    [/^Configuraci[oó]n de\s+(.+)/i, (_, rest) => `Aprenda a configurar ${lowerFirst(rest)} en SINAI.`],
    [/^Configuraci[oó]n del\s+(.+)/i, (_, rest) => `Aprenda a configurar el ${lowerFirst(rest)} en SINAI.`],
    [/^Configurar\s+(.+)/i, (_, rest) => `Aprenda a configurar ${lowerFirst(rest)} en SINAI.`],
    [/^Registro de\s+(.+)/i, (_, rest) => `Aprenda a registrar ${lowerFirst(rest)} en SINAI.`],
    [/^Registro del\s+(.+)/i, (_, rest) => `Aprenda a registrar el ${lowerFirst(rest)} en SINAI.`],
    [/^Registrar\s+(.+)/i, (_, rest) => `Aprenda a registrar ${lowerFirst(rest)} en SINAI.`],
    [/^Asignaci[oó]n de\s+(.+)/i, (_, rest) => `Aprenda a asignar ${lowerFirst(rest)} en SINAI.`],
    [/^Asignar\s+(.+)/i, (_, rest) => `Aprenda a asignar ${lowerFirst(rest)} en SINAI.`],
    [/^Creaci[oó]n de\s+(.+)/i, (_, rest) => `Aprenda a crear ${lowerFirst(rest)} en SINAI.`],
    [/^Crear\s+(.+)/i, (_, rest) => `Aprenda a crear ${lowerFirst(rest)} en SINAI.`],
    [/^Consulta de\s+(.+)/i, (_, rest) => `Aprenda a consultar ${lowerFirst(rest)} en SINAI.`],
    [/^Consultar\s+(.+)/i, (_, rest) => `Aprenda a consultar ${lowerFirst(rest)} en SINAI.`],
    [/^Gesti[oó]n de\s+(.+)/i, (_, rest) => `Aprenda a gestionar ${lowerFirst(rest)} en SINAI.`],
    [/^Actualizar\s+(.+)/i, (_, rest) => `Aprenda a actualizar ${lowerFirst(rest)} en SINAI.`],
    [/^Modificar\s+(.+)/i, (_, rest) => `Aprenda a modificar ${lowerFirst(rest)} en SINAI.`],
    [/^Generar\s+(.+)/i, (_, rest) => `Aprenda a generar ${lowerFirst(rest)} en SINAI.`],
    [/^Importar\s+(.+)/i, (_, rest) => `Aprenda a importar ${lowerFirst(rest)} en SINAI.`],
    [/^Trasladar\s+(.+)/i, (_, rest) => `Aprenda a trasladar ${lowerFirst(rest)} en SINAI.`],
    [/^Procesar\s+(.+)/i, (_, rest) => `Aprenda a procesar ${lowerFirst(rest)} en SINAI.`],
    [/^Copiar\s+(.+)/i, (_, rest) => `Aprenda a copiar ${lowerFirst(rest)} en SINAI.`],
    [/^Verificaci[oó]n de\s+(.+)/i, (_, rest) => `Aprenda a verificar ${lowerFirst(rest)} en SINAI.`],
    [/^Descargar\s+(.+)/i, (_, rest) => `Aprenda a descargar ${lowerFirst(rest)} desde SINAI.`],
    [/^Informes? de\s+(.+)/i, (_, rest) => `Aprenda a consultar y descargar los informes de ${lowerFirst(rest)} en SINAI.`],
    [/^Informes?$/i, () => 'Aprenda a consultar y descargar los informes disponibles en SINAI.'],
    [/^Copia de seguridad$/i, () => 'Aprenda a generar y consultar copias de seguridad de la información en SINAI.'],
    [/^Recuperar contrase[nñ]a$/i, () => 'Aprenda a recuperar su contraseña y restablecer el acceso a SINAI.'],
    [/^Planta de cargos$/i, () => 'Aprenda a crear las plazas del establecimiento educativo y a asignar los funcionarios correspondientes.'],
    [/^Autoevaluaci[oó]n institucional y encuestas$/i, () => 'Aprenda a responder la autoevaluación institucional y las encuestas activas desde la plataforma SINAI.'],
    [/^Con mesas$/i, () => 'Aprenda a configurar y ejecutar el proceso electoral con mesas de votación en SINAI.'],
    [/^Sin mesas$/i, () => 'Aprenda a configurar y ejecutar el proceso electoral sin mesas de votación en SINAI.'],
    [/^Mensajes$/i, () => 'Aprenda a consultar, enviar y gestionar mensajes desde SINAI.'],
    [/^Inconsistencias$/i, () => 'Aprenda a identificar y resolver inconsistencias registradas en SINAI.'],
    [/^Preguntas frecuentes$/i, () => 'Encuentre respuestas claras a las dudas más frecuentes sobre el uso administrativo de SINAI.'],
  ];

  for (const [pattern, formatter] of patterns) {
    const match = cleanTitle.match(pattern);
    if (match) return formatter(...match);
  }

  return `Conozca las opciones de ${lowerTitle} y siga el procedimiento correspondiente en SINAI.`;
}

function updateFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return content;
  const title = frontmatterMatch[1].match(/^title:\s*["'](.*?)["']\s*$/m)?.[1];
  if (!title) return content;
  const description = createDescription(title)
    .replace(/ en (SINAI|Desktop) en SINAI\./i, ' en $1.')
    .replace(/\bcómo puedo\b/i, 'cómo')
    .replace(/\bmi\b/gi, 'su')
    .replace(/"/g, '\\"');
  const updatedFrontmatter = frontmatterMatch[0].replace(
    /^description:.*$/m,
    `description: "${description}"`,
  );
  return updatedFrontmatter + content.slice(frontmatterMatch[0].length);
}

function simplifyGuideSteps(content) {
  let updated = content.replace(
    /<GuideStep\s+id="([^"]+)"\s+number=\{\d+\}\s+title="([^"]+)">\s*([\s\S]*?)\s*<\/GuideStep>/g,
    (_, id, title, children) => `### ${sentenceCase(title)} {#${id}}\n\n${children.trim()}`,
  );

  // Fumadocs creates stable heading anchors itself. Remove explicit MDX
  // anchor syntax because imported custom TOCs already point to the same ids.
  updated = updated.replace(/^(###\s+.+?)\s+\{#[^}]+\}\s*$/gm, '$1');
  return updated;
}

function normalizeEditorialText(content) {
  const parts = content.split(/(```[\s\S]*?```|<[^>]+>)/g);
  const normalized = parts.map((part, index) => {
    if (index % 2 === 1) return part;
    return part
      .replace(/\u00a0/g, ' ')
      .replace(/\bhaz click\b/gi, 'haga clic')
      .replace(/\bhacer click\b/gi, 'hacer clic')
      .replace(/\bde click\b/gi, 'haga clic')
      .replace(/\bclick\b/gi, 'clic')
      .replace(/\bhaga clic sobre\b/gi, 'haga clic en')
      .replace(/\bem las\b/gi, 'en las')
      .replace(/\be el bot[oó]n\b/gi, 'en el botón')
      .replace(/\blistas desplegable\b/gi, 'listas desplegables')
      .replace(/\bde ser necesarios\b/gi, 'si es necesario')
      .replace(/\bde acuerdo a\b/gi, 'de acuerdo con')
      .replace(/\bcon base a\b/gi, 'con base en')
      .replace(/\bcorreo electrónica\b/gi, 'correo electrónico')
      .replace(/\bnumero de celular\b/gi, 'número de celular')
      .replace(/\bal habla de\b/gi, 'al hablar de')
      .replace(/\blos funcionario\b/gi, 'los funcionarios')
      .replace(/\bputo o coma\b/gi, 'punto o coma')
      .replace(/\bel registro se las calificaciones\b/gi, 'el registro de las calificaciones')
      .replace(/\bA continuaci[oó]n,? explicaremos\b/gi, 'A continuación, se explica')
      .replace(/\bvas a encontrar\b/gi, 'encontrará')
      .replace(/\bpodr[aá]s\b/gi, 'podrá')
      .replace(/\bdeber[aá]s\b/gi, 'deberá')
      .replace(/\bpuedes\b/gi, 'puede')
      .replace(/\bdebes\b/gi, 'debe')
      .replace(/\btienes\b/gi, 'tiene')
      .replace(/\bdeseas\b/gi, 'desea')
      .replace(/\bquieres\b/gi, 'desea')
      .replace(/\bselecciona\b/gi, 'seleccione')
      .replace(/\bingresa\b/gi, 'ingrese')
      .replace(/\bhaz\b/gi, 'haga')
      .replace(/\bpulsa\b/gi, 'seleccione')
      .replace(/\belige\b/gi, 'elija')
      .replace(/\btus\b/gi, 'sus')
      .replace(/\btu\b/gi, 'su')
      .replace(/^(\s*\d+\.\s+)Seleccionar\b/gm, '$1Seleccione')
      .replace(/^(\s*\d+\.\s+)Usar\b/gm, '$1Use')
      .replace(/^(\s*\d+\.\s+)Visualizar\b/gm, '$1Visualice')
      .replace(/^(\s*\d+\.\s+)Consultar\b/gm, '$1Consulte')
      .replace(/^(\s*\d+\.\s+)Ingresar\b/gm, '$1Ingrese')
      .replace(/^(\s*\d+\.\s+)Hacer\b/gm, '$1Haga')
      .replace(/^(\s*\d+\.\s+)Elegir\b/gm, '$1Elija')
      .replace(/^(\s*\d+\.\s+)Diligenciar\b/gm, '$1Diligencie')
      .replace(/^(\s*\d+\.\s+)Guardar\b/gm, '$1Guarde')
      .replace(/^(\s*\d+\.\s+)Verificar\b/gm, '$1Verifique')
      .replace(/^(\s*\d+\.\s+)Escoger\b/gm, '$1Escoja')
      .replace(/^(\s*\d+\.\s+)Ubicar\b/gm, '$1Ubique')
      .replace(/^(\s*\d+\.\s+)Revisar\b/gm, '$1Revise')
      .replace(/^(\s*\d+\.\s+)(?:Pulsar|Presionar)\b/gm, '$1Seleccione')
      .replace(/^(\s*\d+\.\s+)Registrar\b/gm, '$1Registre')
      .replace(/^(\s*\d+\.\s+)Escribir\b/gm, '$1Escriba')
      .replace(/^(\s*\d+\.\s+)Indicar\b/gm, '$1Indique')
      .replace(/^(\s*\d+\.\s+)Marcar\b/gm, '$1Marque')
      .replace(/^(\s*\d+\.\s+)Descargar\b/gm, '$1Descargue')
      .replace(/^(\s*\d+\.\s+)Cargar\b/gm, '$1Cargue')
      .replace(/^(\s*\d+\.\s+)Buscar\b/gm, '$1Busque')
      .replace(/^(\s*\d+\.\s+)Completar\b/gm, '$1Complete')
      .replace(/^(\s*\d+\.\s+)Agregar\b/gm, '$1Agregue')
      .replace(/^(\s*\d+\.\s+)Asignar\b/gm, '$1Asigne')
      .replace(/^(\s*\d+\.\s+)Digitar\b/gm, '$1Digite')
      .replace(/^(\s*\d+\.\s+)Validar\b/gm, '$1Valide')
      .replace(/^(\s*\d+\.\s+)Modificar\b/gm, '$1Modifique')
      .replace(/^(\s*\d+\.\s+)Eliminar\b/gm, '$1Elimine')
      .replace(/^(\s*\d+\.\s+)Acceder\b/gm, '$1Acceda')
      .replace(/^(\s*\d+\.\s+)Abrir\b/gm, '$1Abra')
      .replace(/^(\s*\d+\.\s+)Cerrar\b/gm, '$1Cierre')
      .replace(/^(\s*\d+\.\s+)Continuar\b/gm, '$1Continúe')
      .replace(/^(\s*\d+\.)\s{2,}/gm, '$1 ')
      .replace(/^(\s*[-*])\s{2,}/gm, '$1 ')
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{4,}/g, '\n\n\n');
  }).join('');

  return normalized.replace(/([\p{L}\p{N},.;:])<(strong|em|a)\b/gu, '$1 <$2');
}

function standardizeGuide(content) {
  let updated = updateFrontmatter(content);
  updated = updated.replace(/<GuideVideos(?!\s+compact)>/g, '<GuideVideos compact>');
  updated = simplifyGuideSteps(updated);
  updated = normalizeEditorialText(updated);
  return updated;
}

const files = await getMdxFiles(docsDirectory);
let guides = 0;
let changed = 0;
let descriptions = 0;
let compactVideos = 0;
let simplifiedSteps = 0;

for (const file of files) {
  const original = await readFile(file, 'utf8');
  if (path.basename(file) === 'index.mdx') continue;
  guides++;
  const updated = standardizeGuide(original);
  if (updated === original) continue;
  changed++;
  if ((original.match(/^description:.*$/m)?.[0] ?? '') !== (updated.match(/^description:.*$/m)?.[0] ?? '')) descriptions++;
  if (!/<GuideVideos compact>/.test(original) && /<GuideVideos compact>/.test(updated)) compactVideos++;
  if (/<GuideStep\b/.test(original) && !/<GuideStep\b/.test(updated)) simplifiedSteps++;
  if (apply) await writeFile(file, updated, 'utf8');
}

console.log(`${apply ? 'Guías actualizadas' : 'Guías por actualizar'}: total=${guides}, archivos=${changed}, subtítulos=${descriptions}, videosCompactos=${compactVideos}, pasosSimplificados=${simplifiedSteps}`);
