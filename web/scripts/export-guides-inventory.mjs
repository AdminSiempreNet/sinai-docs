import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "../content/docs");
const outputPath = path.resolve(__dirname, "../../Inventario-guias-SINAI.xls");

const ROLE_LABELS = {
  administrativo: "Administrativo",
  docente: "Docente",
  estudiante: "Estudiante",
  generales: "Generales",
};

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".mdx")) acc.push(full);
  }
  return acc;
}

function readMetaTitle(dir) {
  const metaPath = path.join(dir, "meta.json");
  if (!fs.existsSync(metaPath)) return null;
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    return typeof meta.title === "string" ? meta.title : null;
  } catch {
    return null;
  }
}

function humanizeSlug(slug) {
  return slug
    .replace(/-capacitacion-documentada$/g, "")
    .replace(/-procesos-de-temporada$/g, "")
    .replace(/-desktop$/g, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function classifyAreaAndProcess(relPosix) {
  const parts = relPosix.replace(/\.mdx$/, "").split("/");
  const roleKey = parts[0];
  const rest = parts.slice(1, -1);

  if (roleKey === "generales") {
    return { area: "Generales", proceso: "Generales" };
  }

  const first = rest[0] ?? "";
  if (first === "capacitacion-documentada") {
    const processSlug = rest[1];
    if (!processSlug) {
      return { area: "Capacitación documentada", proceso: "Capacitación documentada" };
    }
    const processDir = path.join(docsRoot, roleKey, "capacitacion-documentada", processSlug);
    return {
      area: "Capacitación documentada",
      proceso: readMetaTitle(processDir) || humanizeSlug(processSlug),
    };
  }

  if (first === "procesos-de-temporada") {
    const processSlug = rest[1];
    if (!processSlug) {
      return { area: "Procesos de temporada", proceso: "Procesos de temporada" };
    }
    const processDir = path.join(docsRoot, roleKey, "procesos-de-temporada", processSlug);
    return {
      area: "Procesos de temporada",
      proceso: readMetaTitle(processDir) || humanizeSlug(processSlug),
    };
  }

  return {
    area: humanizeSlug(first || roleKey),
    proceso: humanizeSlug(rest[1] || first || roleKey),
  };
}

function classifyContent(raw) {
  const fm = raw.match(/^---[\s\S]*?---/);
  const body = fm ? raw.slice(fm[0].length) : raw;
  const titleMatch = raw.match(/^title:\s*"([^"]+)"/m) || raw.match(/^title:\s*'([^']+)'/m);
  const title = titleMatch ? titleMatch[1] : "";
  const hasVideo = /<YouTube\b/.test(body) || /<GuideVideoPlaylist/.test(body);

  const faqIdx = body.search(/^## Preguntas frecuentes/m);
  const stepIdx = body.search(/^## Gu.a paso a paso/m);
  let main = faqIdx >= 0 ? body.slice(0, faqIdx) : body;
  if (stepIdx >= 0) main = body.slice(stepIdx, faqIdx >= 0 ? faqIdx : undefined);

  const hasImages = /<GuideImage/.test(main);
  const hasSteps = /(^|\n)\s*\d+\.\s+\S/.test(main);
  const text = main
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const letters = (text.match(/[A-Za-zÁÉÍÓÚáéíóúñÑ]/g) || []).length;
  const videoPointer =
    /videotutorial|este v[ií]deo|v[ií]deo tutorial|en este tutorial podr[aá]n|en este v[ií]deo/i.test(
      text,
    );
  const pointerOnly = videoPointer && !hasImages && !hasSteps && letters < 280;
  const empty = letters < 40 && !hasImages && !hasSteps;
  const hasWritten = !empty && !pointerOnly;

  return { title, hasVideo, hasWritten };
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cell(value, type = "String") {
  return `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
}

function headerCell(value) {
  return `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

function dataCell(value, styleId) {
  const style = styleId ? ` ss:StyleID="${styleId}"` : "";
  return `<Cell${style}><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

const files = walk(docsRoot)
  .map((full) => {
    const rel = path.relative(docsRoot, full).replaceAll("\\", "/");
    return { full, rel };
  })
  .filter(({ rel }) => !rel.endsWith("/index.mdx") && rel !== "index.mdx")
  .filter(({ rel }) => !rel.endsWith("preguntas-frecuentes.mdx"));

const rows = files
  .map(({ full, rel }) => {
    const raw = fs.readFileSync(full, "utf8");
    const { title, hasVideo, hasWritten } = classifyContent(raw);
    const roleKey = rel.split("/")[0];
    const { area, proceso } = classifyAreaAndProcess(rel);
    const urlPath = `/docs/${rel.replace(/\.mdx$/, "")}`;

    return {
      rol: ROLE_LABELS[roleKey] || roleKey,
      area,
      proceso,
      titulo: title || path.basename(rel, ".mdx"),
      tieneVideo: hasVideo ? "Sí" : "No",
      tieneGuia: hasWritten ? "Sí" : "No",
      url: `http://localhost:3000${urlPath}`,
      roleOrder: ["Administrativo", "Docente", "Estudiante", "Generales"].indexOf(
        ROLE_LABELS[roleKey] || roleKey,
      ),
    };
  })
  .sort((a, b) => {
    if (a.roleOrder !== b.roleOrder) return a.roleOrder - b.roleOrder;
    if (a.area !== b.area) return a.area.localeCompare(b.area, "es");
    if (a.proceso !== b.proceso) return a.proceso.localeCompare(b.proceso, "es");
    return a.titulo.localeCompare(b.titulo, "es");
  });

const summaryMap = new Map();
for (const row of rows) {
  const key = `${row.rol}|${row.area}|${row.proceso}`;
  const current = summaryMap.get(key) || {
    rol: row.rol,
    area: row.area,
    proceso: row.proceso,
    total: 0,
    conVideo: 0,
    conGuia: 0,
    sinVideo: 0,
    sinGuia: 0,
    ambosFaltantes: 0,
  };
  current.total += 1;
  if (row.tieneVideo === "Sí") current.conVideo += 1;
  else current.sinVideo += 1;
  if (row.tieneGuia === "Sí") current.conGuia += 1;
  else current.sinGuia += 1;
  if (row.tieneVideo === "No" && row.tieneGuia === "No") current.ambosFaltantes += 1;
  summaryMap.set(key, current);
}

const summary = [...summaryMap.values()];

const guideRowsXml = rows
  .map((row) => {
    const videoStyle = row.tieneVideo === "No" ? "No" : "Yes";
    const guideStyle = row.tieneGuia === "No" ? "No" : "Yes";
    return `<Row>
      ${dataCell(row.rol)}
      ${dataCell(row.area)}
      ${dataCell(row.proceso)}
      ${dataCell(row.titulo)}
      ${dataCell(row.tieneVideo, videoStyle)}
      ${dataCell(row.tieneGuia, guideStyle)}
      ${dataCell(row.url)}
    </Row>`;
  })
  .join("\n");

const summaryRowsXml = summary
  .map(
    (row) => `<Row>
      ${cell(row.rol)}
      ${cell(row.area)}
      ${cell(row.proceso)}
      ${cell(row.total, "Number")}
      ${cell(row.conVideo, "Number")}
      ${cell(row.sinVideo, "Number")}
      ${cell(row.conGuia, "Number")}
      ${cell(row.sinGuia, "Number")}
      ${cell(row.ambosFaltantes, "Number")}
    </Row>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1F4E79" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Yes">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#166534"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="No">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#991B1B"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Guías">
  <Table ss:ExpandedColumnCount="7" ss:ExpandedRowCount="${rows.length + 1}">
   <Column ss:Width="110"/>
   <Column ss:Width="160"/>
   <Column ss:Width="170"/>
   <Column ss:Width="280"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="420"/>
   <Row ss:StyleID="Header">
    ${headerCell("ROL")}
    ${headerCell("Área")}
    ${headerCell("Proceso")}
    ${headerCell("Título")}
    ${headerCell("Tiene vídeo")}
    ${headerCell("Tiene guía")}
    ${headerCell("URL del local")}
   </Row>
   ${guideRowsXml}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>1</SplitHorizontal>
   <TopRowBottomPane>1</TopRowBottomPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>
  <AutoFilter x:Range="R1C1:R${rows.length + 1}C7" xmlns="urn:schemas-microsoft-com:office:excel"/>
 </Worksheet>
 <Worksheet ss:Name="Resumen">
  <Table ss:ExpandedColumnCount="9" ss:ExpandedRowCount="${summary.length + 1}">
   <Column ss:Width="110"/>
   <Column ss:Width="160"/>
   <Column ss:Width="170"/>
   <Column ss:Width="70"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Row ss:StyleID="Header">
    ${headerCell("ROL")}
    ${headerCell("Área")}
    ${headerCell("Proceso")}
    ${headerCell("Total")}
    ${headerCell("Con vídeo")}
    ${headerCell("Sin vídeo")}
    ${headerCell("Con guía")}
    ${headerCell("Sin guía")}
    ${headerCell("Sin ambos")}
   </Row>
   ${summaryRowsXml}
  </Table>
  <AutoFilter x:Range="R1C1:R${summary.length + 1}C9" xmlns="urn:schemas-microsoft-com:office:excel"/>
 </Worksheet>
</Workbook>
`;

fs.writeFileSync(outputPath, xml, "utf8");

const totals = {
  total: rows.length,
  sinVideo: rows.filter((r) => r.tieneVideo === "No").length,
  sinGuia: rows.filter((r) => r.tieneGuia === "No").length,
  porRol: Object.fromEntries(
    ["Administrativo", "Docente", "Estudiante", "Generales"].map((rol) => [
      rol,
      rows.filter((r) => r.rol === rol).length,
    ]),
  ),
};

console.log(JSON.stringify({ outputPath, ...totals }, null, 2));
