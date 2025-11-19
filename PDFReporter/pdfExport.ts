import jsPDF from 'jspdf';
import autoTable, { type CellHookData, type RowInput } from 'jspdf-autotable';
import { logoBase64 as defaultLogoBase64 } from './logo';

type JsPDFInstance = InstanceType<typeof jsPDF>;

export interface ColumnPropiedades {
  EsEditable?: boolean;
  EsExportable?: boolean;
  EstaOculta?: boolean;
  ColorDefondo?: string;
  ColorDeLetra?: string;
  TamanoDeLetra?: string;
  Formato?: string;
  DecimalesdeRedondeo?: number;
}

export interface PrintConfig {
  Printable?: boolean;
  WidthPercentage?: string;
}

export interface ColumnConfig {
  NombreColumna: string;
  NombreMostrar?: string;
  TipoColumna?: string;
  PropiedadesColumna?: ColumnPropiedades;
  WidthDefault?: string;
  WidthMinima?: string;
  Print?: PrintConfig;
}

export interface ColumnDefinition {
  headerName?: string;
  field?: string;
  colId?: string;
  hide?: boolean;
  children?: ColumnDefinition[];
}

export type RowType = 'data' | 'groupHeader' | 'groupTotal' | 'total' | 'subtotal';

export interface ColumnGroup {
  headerName: string;
  children: string[];
  marryChildren?: boolean;
  openByDefault?: boolean;
}

export interface ExportOptions {
  apiUrl: Record<string, unknown>[]; // Array of row data
  columnConfig: ColumnConfig[]; // Column configuration
  columnGroups?: ColumnGroup[]; // Optional grouped columns
  pdfFileName?: string;
  pdfExportTitle?: string;
  pdfExportSubtitle?: string;
  logoBase64?: string; // Custom base64 logo
  headerFill?: string; // hex color
  headerColor?: string; // hex color
  fontSize?: number;
  landscapeOrientation?: boolean; // true for landscape, false for portrait
  linkTextColumn?: string; // Column name whose text will be clickable
  linkUrlColumn?: string; // Column name containing URLs (not printed)
}

interface PrintableColumn {
  header: string;
  dataKey: string;
  columnConfig?: ColumnConfig;
}

interface ParsedArray {
  def: ColumnDefinition;
  parents: string[];
}

interface RowMetadata {
  type: RowType;
}

interface InternalDoc {
  pageSize: {
    getWidth: () => number;
    getHeight: () => number;
  };
  getNumberOfPages: () => number;
}

interface JsPDFWithInternal extends JsPDFInstance {
  internal: InternalDoc;
}

const TOTAL_ROW_COLOR: [number, number, number] = [230, 230, 230];
const GROUP_ROW_COLOR: [number, number, number] = [242, 242, 242];
const EVEN_ROW_COLOR: [number, number, number] = [255, 255, 255];
const ODD_ROW_COLOR: [number, number, number] = [249, 249, 249];

const TOTAL_PAGES_PLACEHOLDER = '{total_pages_count_string}';

const DATA_ROW_TYPES: Record<string, RowType> = {
  data: 'data',
  default: 'data',
  group: 'groupHeader',
  groupheader: 'groupHeader',
  grouptotal: 'groupTotal',
  subtotal: 'groupTotal',
  total: 'total',
  grandtotal: 'total'
};

const hexToRgb = (hex: string): [number, number, number] => {
  const cleaned = hex.replace(/^#/, '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

const sanitizeBase64 = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'none') {
    return null;
  }
  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }
  return `data:image/png;base64,${trimmed.replace(/[\r\n]/g, '')}`;
};

const getFlatColumns = (columnDefs: ColumnDefinition[]): ColumnDefinition[] => {
  const flat: ColumnDefinition[] = [];
  const visit = (defs: ColumnDefinition[]): void => {
    defs.forEach(def => {
      if (Array.isArray(def.children) && def.children.length > 0) {
        visit(def.children);
      } else if (def.field || def.colId || def.headerName) {
        flat.push(def);
      }
    });
  };
  visit(columnDefs);
  return flat;
};

const inferColumnType = (rows: Record<string, unknown>[], key: string): string => {
  for (const row of rows) {
    const value = row[key];
    if (value === null || value === undefined) {
      continue;
    }
    if (value instanceof Date) {
      return 'Fecha';
    }
    const valueType = typeof value;
    if (valueType === 'number') {
      return 'number';
    }
    if (valueType === 'boolean') {
      return 'boolean';
    }
    if (valueType === 'string') {
      const stringValue = value as string;
      if (/\d{4}-\d{2}-\d{2}/.test(stringValue)) {
        return 'Fecha';
      }
      return 'String';
    }
  }
  return 'String';
};

const deriveColumnConfigs = (rows: Record<string, unknown>[]): ColumnConfig[] => {
  if (!rows || rows.length === 0) {
    return [];
  }
  const firstRow = rows.find(item => !!item) ?? rows[0];
  const keys = Object.keys(firstRow).filter(key => !key.startsWith('__'));
  const weight = keys.length > 0 ? (100 / keys.length) : 100;

  return keys.map(key => ({
    NombreColumna: key,
    TipoColumna: inferColumnType(rows, key),
    PropiedadesColumna: {
      EsExportable: true,
      EstaOculta: false
    },
    WidthDefault: '120',
    WidthMinima: '80',
    Print: {
      Printable: true,
      WidthPercentage: weight.toFixed(2)
    }
  }));
};

const buildPrintableColumns = (
  columnConfigs: ColumnConfig[],
  columnDefs: ColumnDefinition[] | undefined
): PrintableColumn[] => {
  const columnOrderMap = new Map<string, number>();
  columnConfigs.forEach((config, index) => {
    columnOrderMap.set(config.NombreColumna, index);
  });

  const configMap = new Map<string, ColumnConfig>();
  columnConfigs.forEach(config => {
    configMap.set(config.NombreColumna, config);
  });

  let flatDefs: ColumnDefinition[] = [];
  if (columnDefs && columnDefs.length > 0) {
    flatDefs = getFlatColumns(columnDefs);
  }

  // Fallback to configs if no defs were supplied
  if (flatDefs.length === 0) {
    flatDefs = columnConfigs.map(config => ({
      field: config.NombreColumna,
      headerName: config.NombreMostrar ?? config.NombreColumna,
      hide: config.PropiedadesColumna?.EstaOculta
    }));
  }

  const seen = new Set<string>();

  const columnsFromDefs = flatDefs
    .map(def => {
      const key = def.field ?? def.colId ?? def.headerName ?? '';
      if (!key) {
        return undefined;
      }
      const normalizedKey = key;
      const columnConfig = configMap.get(normalizedKey);
      const hiddenInConfig = columnConfig?.PropiedadesColumna?.EstaOculta === true;
      const printableOverride = columnConfig?.Print?.Printable === true;
      const printableDisabled = columnConfig?.Print?.Printable === false;
      const hiddenInDef = def.hide === true;

      if (!columnConfig && hiddenInDef) {
        return undefined;
      }

      if (!printableOverride && (hiddenInConfig || hiddenInDef)) {
        return undefined;
      }

      if (printableDisabled) {
        return undefined;
      }

      if (seen.has(normalizedKey)) {
        return undefined;
      }
      seen.add(normalizedKey);

      const header = columnConfig?.NombreMostrar ?? def.headerName ?? normalizedKey;

      return {
        header,
        dataKey: normalizedKey,
        columnConfig
      } as PrintableColumn;
    })
    .filter((column): column is PrintableColumn => !!column);

  // Include configs that did not appear in the defs (custom fields)
  const columnsFromConfigs = columnConfigs
    .filter(config => !seen.has(config.NombreColumna) && config.Print?.Printable !== false)
    .map(config => {
      seen.add(config.NombreColumna);
      return {
        header: config.NombreMostrar ?? config.NombreColumna,
        dataKey: config.NombreColumna,
        columnConfig: config
      } as PrintableColumn;
    });

  const unsortedColumns = [...columnsFromDefs, ...columnsFromConfigs];

  const fallbackColumns = unsortedColumns.length > 0
    ? unsortedColumns
    : columnConfigs.map(config => ({
        header: config.NombreMostrar ?? config.NombreColumna,
        dataKey: config.NombreColumna,
        columnConfig: config
      }));

  return fallbackColumns.sort((a, b) => {
    const orderA = columnOrderMap.get(a.dataKey) ?? Number.MAX_SAFE_INTEGER;
    const orderB = columnOrderMap.get(b.dataKey) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
};

const generateGroupHeaders = (
  columnDefs: ColumnDefinition[] | undefined,
  printableColumns: PrintableColumn[],
  headerFillRGB?: [number, number, number],
  headerColorRGB?: [number, number, number]
): {
  headers: RowInput[];
  hasGroupHeaders: boolean;
} => {
  if (!columnDefs || columnDefs.length === 0) {
    return {
      headers: [printableColumns.map(col => col.header)],
      hasGroupHeaders: false
    };
  }

  // Use provided colors or defaults
  const fillColor = headerFillRGB ?? [113, 45, 61];
  const textColor = headerColorRGB ?? [255, 255, 255];

  const groupPathCache = new Map<string, string | undefined>();

  const findGroupName = (defs: ColumnDefinition[], dataKey: string): string | undefined => {
    const cached = groupPathCache.get(dataKey);
    if (cached !== undefined) {
      return cached;
    }

    const stack: ParsedArray[] = defs.map(def => ({
      def,
      parents: []
    }));

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        break;
      }
      const { def, parents } = current;
      const field = def.field ?? def.colId;
      const header = def.headerName;

      if (Array.isArray(def.children) && def.children.length > 0) {
        const nextParents = header ? [...parents, header] : parents;
        def.children.forEach(child => {
          stack.push({ def: child, parents: nextParents });
        });
      } else if (field === dataKey || (field ?? header) === dataKey) {
        const groupName = parents.length > 0 ? parents[parents.length - 1] : undefined;
        groupPathCache.set(dataKey, groupName);
        return groupName;
      }
    }

    groupPathCache.set(dataKey, undefined);
    return undefined;
  };

  const groupNames = printableColumns.map(col => findGroupName(columnDefs, col.dataKey) ?? '');
  const hasGroups = groupNames.some(name => !!name);

  if (!hasGroups) {
    return {
      headers: [printableColumns.map(col => col.header)],
      hasGroupHeaders: false
    };
  }

  const groupHeaderRow: RowInput = [];
  for (let index = 0; index < groupNames.length; ) {
    const currentName = groupNames[index];
    if (!currentName) {
      // Use same color as normal headers for non-grouped columns
      groupHeaderRow.push({ content: '', colSpan: 1, styles: { fillColor: fillColor } });
      index += 1;
      continue;
    }

    let span = 1;
    for (let offset = index + 1; offset < groupNames.length; offset += 1) {
      if (groupNames[offset] === currentName) {
        span += 1;
      } else {
        break;
      }
    }

    groupHeaderRow.push({
      content: currentName,
      colSpan: span,
      styles: {
        fillColor: fillColor,
        fontStyle: 'bold',
        halign: 'center',
        textColor: textColor
      }
    });
    index += span;
  }

  const normalHeaderRow: RowInput = printableColumns.map(col => ({
    content: col.header,
    styles: { fontStyle: 'bold' }
  }));

  return {
    headers: [groupHeaderRow, normalHeaderRow],
    hasGroupHeaders: true
  };
};

const formatValue = (value: unknown, columnConfig?: ColumnConfig): string => {
  if (value === null || value === undefined) {
    return '';
  }

  // Helper to safely stringify any value
  const safeStringify = (val: unknown): string => {
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    // Clean string to remove problematic characters that might cause vertical text
    const str = String(val);
    // Remove or replace problematic characters (control characters and non-printable)
    // eslint-disable-next-line no-control-regex
    return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
  };

  const config = columnConfig?.PropiedadesColumna;
  const formato = config?.Formato;
  const decimales = config?.DecimalesdeRedondeo ?? 2;

  try {
    switch (columnConfig?.TipoColumna) {
      case 'number': {
        const numericValue = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(numericValue)) {
          return safeStringify(value);
        }
        switch (formato) {
          case 'Dinero':
            return new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: decimales
            }).format(numericValue);
          case 'DineroUSD':
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: decimales
            }).format(numericValue);
          case 'DineroEUR':
            return new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: decimales
            }).format(numericValue);
          case 'numero':
            return new Intl.NumberFormat('es-MX', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(numericValue);
          case 'numeroDosDecimales':
            return new Intl.NumberFormat('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(numericValue);
          case 'Porcentaje':
            return new Intl.NumberFormat('es-MX', {
              style: 'percent',
              minimumFractionDigits: decimales,
              maximumFractionDigits: decimales
            }).format(numericValue / 100);
          case 'PorcentajeSimple':
            return new Intl.NumberFormat('es-MX', {
              minimumFractionDigits: decimales,
              maximumFractionDigits: decimales
            }).format(numericValue) + '%';
          default:
            return new Intl.NumberFormat('es-MX', {
              minimumFractionDigits: decimales,
              maximumFractionDigits: decimales
            }).format(numericValue);
        }
      }
      case 'Fecha': {
        const dateValue = value instanceof Date ? value : new Date(value as string);
        if (Number.isNaN(dateValue.getTime())) {
          return safeStringify(value);
        }
        switch (formato) {
          case 'FechaCorta':
            return dateValue.toLocaleDateString('es-MX');
          case 'FechaLarga':
            return dateValue.toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          case 'FechaHora':
            return dateValue.toLocaleString('es-MX');
          case 'FechaHoraDetallada':
            return dateValue.toLocaleString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          default:
            return dateValue.toLocaleDateString('es-MX');
        }
      }
      case 'boolean':
        return value ? 'Sí' : 'No';
      case 'String':
      default:
        return safeStringify(value);
    }
  } catch (error) {
    console.error('Error formatting value for PDF export:', error);
    return safeStringify(value);
  }
};

const parseRowType = (row: Record<string, unknown>): RowType => {
  const rawType = (row.__rowType ?? row.__rowtype ?? row.__type ?? row.rowType ?? row.rowtype) as string | undefined;
  if (!rawType) {
    return 'data';
  }
  const normalized = typeof rawType === 'string' ? rawType.trim().toLowerCase() : String(rawType).trim().toLowerCase();
  return DATA_ROW_TYPES[normalized] ?? 'data';
};

interface LinkData {
  rowIndex: number;
  columnIndex: number;
  url: string;
}

const buildBodyRows = (
  printableColumns: PrintableColumn[],
  rows: Record<string, unknown>[],
  summaryRows: Record<string, unknown>[] | undefined,
  linkTextColumn?: string,
  linkUrlColumn?: string
): { body: RowInput[]; metadata: RowMetadata[]; linkData: LinkData[] } => {
  const metadata: RowMetadata[] = [];
  const body: RowInput[] = [];
  const linkData: LinkData[] = [];

  // Find the column index for the link text column
  const linkTextColIndex = linkTextColumn 
    ? printableColumns.findIndex(col => col.dataKey === linkTextColumn)
    : -1;

  const allRows = summaryRows && summaryRows.length > 0 ? [...rows, ...summaryRows] : rows;

  allRows.forEach((rawRow, rowIndex) => {
    const rowType = parseRowType(rawRow);
    metadata.push({ type: rowType });

    const formattedRow = printableColumns.map((column, columnIndex) => {
      if (rowType === 'groupHeader' && columnIndex > 0) {
        return '';
      }
      if (rowType === 'groupHeader' && columnIndex === 0) {
        const label = (rawRow.__groupLabel ?? rawRow.__groupName ?? rawRow.groupLabel ?? rawRow.groupName) as string | undefined;
        const count = (rawRow.__groupCount ?? rawRow.count ?? rawRow.rows) as number | undefined;
        if (label) {
          return count ? `${label} (${count})` : label;
        }
      }

      const value = rawRow[column.dataKey];
      const formattedValue = formatValue(value, column.columnConfig);
      
      // Store link data if this is the link text column and URL column is provided
      if (linkTextColIndex === columnIndex && linkUrlColumn) {
        const url = rawRow[linkUrlColumn];
        if (url && typeof url === 'string' && url.trim()) {
          linkData.push({
            rowIndex,
            columnIndex,
            url: url.trim()
          });
        }
      }
      
      // Return as object with content to ensure proper rendering
      // This prevents vertical text issues
      return formattedValue;
    });

    body.push(formattedRow);
  });

  return { body, metadata, linkData };
};

const applyRowStyling = (
  data: CellHookData,
  metadata: RowMetadata[]
): void => {
  if (data.section !== 'body') {
    return;
  }
  const rowInfo = metadata[data.row.index];
  if (!rowInfo) {
    return;
  }

  const currentFill = data.row.index % 2 === 0 ? EVEN_ROW_COLOR : ODD_ROW_COLOR;
  data.cell.styles.fillColor = currentFill;

  if (rowInfo.type === 'groupHeader') {
    data.cell.styles.fillColor = GROUP_ROW_COLOR;
    data.cell.styles.fontStyle = 'bold';
  }

  if (rowInfo.type === 'groupTotal' || rowInfo.type === 'total' || rowInfo.type === 'subtotal') {
    data.cell.styles.fillColor = TOTAL_ROW_COLOR;
    data.cell.styles.fontStyle = 'bold';
  }
};

export const exportJsonToPdf = (options: ExportOptions): JsPDFInstance => {
  const {
    apiUrl,
    columnConfig,
    columnGroups,
    pdfExportTitle,
    pdfExportSubtitle,
    logoBase64,
    landscapeOrientation,
    linkTextColumn,
    linkUrlColumn,
    headerFill,
    headerColor,
    fontSize
  } = options;

  // Validate required inputs
  if (!apiUrl || apiUrl.length === 0) {
    throw new Error('No se proporcionaron datos (apiUrl). Verifique la entrada.');
  }

  if (!columnConfig || columnConfig.length === 0) {
    throw new Error('No se proporcionó la configuración de columnas (columnConfig). Verifique la entrada.');
  }

  // Convert columnGroups to columnDefs format if provided
  const columnDefs: ColumnDefinition[] | undefined = columnGroups?.map(group => ({
    headerName: group.headerName,
    children: group.children.map(childName => ({
      field: childName,
      headerName: childName
    }))
  }));

  const printableColumns = buildPrintableColumns(columnConfig, columnDefs);
  if (printableColumns.length === 0) {
    throw new Error('No hay columnas visibles para exportar. Ajusta la configuración de impresión.');
  }

  const documentTitle = pdfExportTitle?.trim() ?? 'Grid Export';
  const documentSubtitle = pdfExportSubtitle?.trim();
  // Use custom logo if provided, otherwise use the default from logo.ts
  const logoToUse = logoBase64?.trim() ?? defaultLogoBase64;
  const preparedLogo = sanitizeBase64(logoToUse);

  // Use landscapeOrientation parameter, default to true (landscape) if not specified
  const orientation = (landscapeOrientation ?? true) ? 'landscape' : 'portrait';
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'letter' }) as JsPDFWithInternal;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  // Increased top margin to 100 to prevent date from overlapping with table
  // Reduced side margins from 36 to 30 to give more space for table content
  const margin = { top: 100, right: 30, bottom: 50, left: 30 };
  const availableWidth = pageWidth - margin.left - margin.right;
  console.log("====availableWidth: " + availableWidth);

  // Parse custom colors (defaults if not provided) - moved before generateGroupHeaders
  const headerFillRGB = hexToRgb(headerFill ?? '#712d3d');
  const headerColorRGB = hexToRgb(headerColor ?? '#ffffff');
  const tableFontSize = fontSize ?? 10;

  const { headers, hasGroupHeaders } = generateGroupHeaders(columnDefs, printableColumns, headerFillRGB, headerColorRGB);
  const { body, metadata, linkData } = buildBodyRows(printableColumns, apiUrl, undefined, linkTextColumn, linkUrlColumn);

  // Use numeric indices for columnStyles (jsPDF-autoTable requirement)
  const columnStyles: Record<number, { cellWidth?: number; halign?: 'left' | 'center' | 'right'; overflow?: 'linebreak' }> = {};

  printableColumns.forEach((column, index) => {
    const alignment = (() => {
      const columnType = column.columnConfig?.TipoColumna;
      if (columnType === 'number') {
        return 'right' as const;
      }
      if (columnType === 'Fecha') {
        return 'center' as const;
      }
      return 'left' as const;
    })();

    const widthPercentage = column.columnConfig?.Print?.WidthPercentage;
    
    columnStyles[index] = {
      ...(widthPercentage && {
        cellWidth: (parseFloat(widthPercentage) / 100) * availableWidth
      }),
      halign: alignment,
      overflow: 'linebreak'
    };

    console.log(`Column [${index}] ${column.dataKey}: WidthPercentage=${widthPercentage}, cellWidth=${columnStyles[index].cellWidth}`);
  });



  const currentDate = new Date().toLocaleDateString('es-MX');

  const didDrawPage = (data: CellHookData): void => {
    const pageNumber: number = doc.internal.getNumberOfPages();

    // Header background - extended to accommodate larger margin
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, margin.top - 10, 'F');

    // Always draw the logo from logo.ts
    if (preparedLogo) {
      const logoWidth = 120;
      const logoHeight = logoWidth * (4972 / 16000);
      const logoX = pageWidth - logoWidth - margin.right;
      const logoY = 20;
      try {
        doc.addImage(preparedLogo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (error) {
        console.warn('No se pudo renderizar el logotipo en el PDF:', error);
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(documentTitle, margin.left, 32);

    if (documentSubtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(documentSubtitle, margin.left, 50);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    // Positioned date further down to avoid overlap with table (at 68 or 84)
    doc.text(`Fecha: ${currentDate}`, margin.left, documentSubtitle ? 68 : 50);

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(margin.left, pageHeight - margin.bottom + 15, pageWidth - margin.right, pageHeight - margin.bottom + 15);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Página ${String(data.pageNumber)} de ${TOTAL_PAGES_PLACEHOLDER}`,
      pageWidth / 2,
      pageHeight - margin.bottom + 32,
      { align: 'center' }
    );
  };

  // Create a callback to add links after cells are drawn
  const didDrawCell = (data: CellHookData): void => {
    // Only process body cells
    if (data.section !== 'body') {
      return;
    }

    // Type assertion for extended cell data that includes position and column info
    // jsPDF-autoTable's CellHookData type doesn't include all runtime properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const cellData = data as any;

    // Get column index - the data object should have column information
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const columnIndex = cellData.column?.index as number | undefined ?? -1;

    if (columnIndex === -1) {
      return;
    }

    const linkInfo = linkData.find(
      link => link.rowIndex === data.row.index && link.columnIndex === columnIndex
    );

    if (!linkInfo?.url) {
      return;
    }

    // Access cell position properties
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cellX = cellData.cell.x as number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cellY = cellData.cell.y as number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cellWidth = cellData.cell.width as number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cellHeight = cellData.cell.height as number | undefined;

    if (cellX !== undefined && cellY !== undefined && cellWidth !== undefined && cellHeight !== undefined) {
      // Add a clickable link annotation to the cell using jsPDF's link method
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (doc as any).link(cellX, cellY, cellWidth, cellHeight, { url: linkInfo.url });

      // Optional: Change text color to blue to indicate it's a link
      data.cell.styles.textColor = [0, 0, 255]; // Blue color for links
    }
  };

  // Create a callback to add links after cells are drawn
  const didDrawCell = (data: CellHookData): void => {
    // Only process body cells
    if (data.section !== 'body') {
      return;
    }

    // Type assertion for extended cell data that includes position and column info
    // jsPDF-autoTable's CellHookData type doesn't include all runtime properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const cellData = data as any;

    // Get column index - the data object should have column information
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const columnIndex = cellData.column?.index as number | undefined ?? -1;

    if (columnIndex === -1) {
      return;
    }

    const linkInfo = linkData.find(
      link => link.rowIndex === data.row.index && link.columnIndex === columnIndex
    );

    if (!linkInfo?.url) {
      return;
    }

    // Access cell position properties
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cellX = cellData.cell.x as number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cellY = cellData.cell.y as number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cellWidth = cellData.cell.width as number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cellHeight = cellData.cell.height as number | undefined;

    if (cellX !== undefined && cellY !== undefined && cellWidth !== undefined && cellHeight !== undefined) {
      // Add a clickable link annotation to the cell using jsPDF's link method
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (doc as any).link(cellX, cellY, cellWidth, cellHeight, { url: linkInfo.url });

      // Optional: Change text color to blue to indicate it's a link
      data.cell.styles.textColor = [0, 0, 255]; // Blue color for links
    }
  };

  autoTable(doc, {
    head: headers,
    body,
    startY: margin.top,
    margin: margin,
    styles: {
      font: 'helvetica',
      fontSize: tableFontSize - 2,
      cellPadding: 4,
      overflow: 'linebreak',
      minCellHeight: 15,
      valign: 'top',
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
      halign: 'left'
    },
    headStyles: {
      fillColor: headerFillRGB,
      textColor: headerColorRGB,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: tableFontSize,
      minCellHeight: 20,
      valign: 'middle',
      overflow: 'linebreak'
    },
    columnStyles: columnStyles,
    showHead: 'everyPage',
    horizontalPageBreak: false,
    rowPageBreak: 'avoid',
    theme: 'grid',
    willDrawCell: undefined,
    didParseCell: (data: CellHookData) => applyRowStyling(data, metadata),
    didDrawCell: linkData.length > 0 ? didDrawCell : undefined,
    didDrawPage
  });

  doc.putTotalPages(TOTAL_PAGES_PLACEHOLDER);

  // Remove footnote logic - not needed for ag-grid format

  return doc;
};
