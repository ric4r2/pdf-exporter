import * as React from 'react';
import type { ColumnConfig, ColumnDefinition, ExportPayload } from './pdfExport';
import { exportJsonToPdf } from './pdfExport';

export interface IPdfExportButtonProps {
  tableData?: string;
  buttonText?: string;
  buttonWidth?: number;
  buttonHeight?: number;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonFontSize?: number;
  buttonBorderRadius?: number;
  pdfFileName?: string;
  pdfTitle?: string;
  pdfSubtitle?: string;
  pdfLogo?: string;
  pdfFootnote?: string;
  openInNewTab?: boolean;
  autoDownload?: boolean;
}

interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

const cleanJsonString = (raw: string): string => {
  let cleaned = raw.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith('\'') && cleaned.endsWith('\''))) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.replace(/\\"/g, '"')
    .replace(/\\'/g, '\'')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r');
  return cleaned;
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const coerceColumnConfigs = (value: unknown): ColumnConfig[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const results: ColumnConfig[] = [];
  value.forEach(item => {
    if (isRecord(item)) {
      const candidate = item as Partial<ColumnConfig>;
      if (typeof candidate.NombreColumna === 'string') {
        results.push(candidate as ColumnConfig);
      }
    }
  });
  return results.length > 0 ? results : undefined;
};

const coerceColumnDefs = (value: unknown): ColumnDefinition[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const results: ColumnDefinition[] = [];
  value.forEach(item => {
    if (isRecord(item)) {
      const candidate = item as Partial<ColumnDefinition>;
      if (typeof candidate.field === 'string' || typeof candidate.colId === 'string' || typeof candidate.headerName === 'string') {
        results.push(candidate as ColumnDefinition);
      }
    }
  });
  return results.length > 0 ? results : undefined;
};

const coerceRows = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRecord);
};

const parseTableData = (tableData: string): ExportPayload => {
  const cleaned = cleanJsonString(tableData);
  const parsed = JSON.parse(cleaned) as unknown;

  if (Array.isArray(parsed)) {
    return { rows: coerceRows(parsed) };
  }

  if (isRecord(parsed)) {
    const rows = coerceRows(parsed.rows ?? parsed.data ?? parsed.items);
    if (!rows) {
      throw new Error('El JSON debe incluir una colección "rows", "data" o ser un arreglo de objetos.');
    }

    const columnConfigs = coerceColumnConfigs(parsed.columnConfigs ?? parsed.columnConfig ?? parsed.columns);
    const columnDefs = coerceColumnDefs(parsed.columnDefs ?? parsed.columnDefinitions ?? parsed.columnGroups);
    const summaryRows = coerceRows(parsed.summaryRows ?? parsed.totals);

    return {
      rows,
      columnConfigs,
      columnDefs,
      summaryRows: summaryRows.length > 0 ? summaryRows : undefined,
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : undefined,
      logoBase64: typeof parsed.logoBase64 === 'string' ? parsed.logoBase64 : undefined,
      footnote: typeof parsed.footnote === 'string' ? parsed.footnote : undefined
    };
  }

  throw new Error('Formato de JSON no soportado.');
};

export const PdfExportButton: React.FC<IPdfExportButtonProps> = (props) => {
  const {
    tableData,
    buttonText = 'Export PDF',
    buttonWidth = 140,
    buttonHeight = 44,
    buttonColor = '#712d3d',
    buttonTextColor = '#ffffff',
    buttonFontSize = 14,
    buttonBorderRadius = 6,
    pdfFileName,
    pdfTitle,
    pdfSubtitle,
    pdfLogo,
    pdfFootnote,
    openInNewTab = true,
    autoDownload = true
  } = props;

  const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);

  React.useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleExport = React.useCallback(() => {
    if (!tableData || tableData.trim().length === 0) {
      setFeedback({ type: 'error', message: 'No hay datos para exportar. Proporciona un JSON válido.' });
      return;
    }

    try {
      const parsedPayload = parseTableData(tableData);
      if (!parsedPayload.rows || parsedPayload.rows.length === 0) {
        setFeedback({ type: 'error', message: 'El JSON no contiene filas para exportar.' });
        return;
      }

      const payload: ExportPayload = {
        ...parsedPayload,
        title: pdfTitle ?? parsedPayload.title,
        subtitle: pdfSubtitle ?? parsedPayload.subtitle,
        logoBase64: pdfLogo ?? parsedPayload.logoBase64,
        footnote: pdfFootnote ?? parsedPayload.footnote
      };

      const doc = exportJsonToPdf(payload);
      const safeTitle = (payload.title ?? 'grid-export').replace(/\s+/g, '-').toLowerCase();
      const fileName = pdfFileName?.trim() ?? `${safeTitle}.pdf`;

      if (openInNewTab) {
        const blobUrl = doc.output('bloburl') as string;
        window.open(blobUrl, '_blank');
      }

      if (autoDownload) {
        doc.save(fileName);
      }

      setFeedback({ type: 'success', message: 'PDF generado correctamente.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido generando el PDF.';
      console.error('Error exporting PDF:', error);
      setFeedback({ type: 'error', message });
    }
  }, [autoDownload, openInNewTab, pdfFileName, pdfFootnote, pdfLogo, pdfSubtitle, pdfTitle, tableData]);

  const buttonStyle: React.CSSProperties = React.useMemo(() => ({
    width: `${buttonWidth}px`,
    height: `${buttonHeight}px`,
    backgroundColor: buttonColor,
    color: buttonTextColor,
    fontSize: `${buttonFontSize}px`,
    borderRadius: `${buttonBorderRadius}px`,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  }), [buttonBorderRadius, buttonColor, buttonFontSize, buttonHeight, buttonTextColor, buttonWidth]);

  return (
    <div style={{ padding: '10px', fontFamily: 'Segoe UI, sans-serif' }}>
      <button
        type="button"
        style={buttonStyle}
        onClick={handleExport}
        onMouseEnter={(event) => {
          event.currentTarget.style.opacity = '0.92';
          event.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.opacity = '1';
          event.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {buttonText}
      </button>
      {feedback && (
        <div
          style={{
            marginTop: '8px',
            color: feedback.type === 'success' ? '#107c10' : '#a4262c',
            fontSize: '12px'
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
};
