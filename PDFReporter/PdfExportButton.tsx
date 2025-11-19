import * as React from 'react';
import type { ColumnConfig, ColumnGroup, ExportOptions } from './pdfExport';
import { exportJsonToPdf } from './pdfExport';

export interface IPdfExportButtonProps {
  pdfFileName?: string;
  pdfExportTitle?: string;
  pdfExportSubtitle?: string;
  logoBase64?: string;
  apiUrl?: string;
  columnConfig?: string;
  columnGroups?: string;
  headerFill?: string;
  headerColor?: string;
  fontSize?: number;
  fill?: string;
  color?: string;
  borderColor?: string;
  borderThickness?: number;
  borderRadius?: number;
  buttonFontSize?: number;
  buttonFontWeight?: number;
  hoverFill?: string;
  hoverColor?: string;
  hoverBorderColor?: string;
  pressedFill?: string;
  pressedColor?: string;
  pressedBorderColor?: string;
}

interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

const cleanJsonString = (raw: string): string => {
  let cleaned = raw.trim();
  // Only remove outer quotes if the JSON is wrapped in extra quotes from Power Apps
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith('\'') && cleaned.endsWith('\''))) {
    cleaned = cleaned.slice(1, -1);
  }
  // Don't process escape sequences - JSON.parse will handle them correctly
  return cleaned;
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const parseApiUrl = (apiUrl: string): Record<string, unknown>[] => {
  const cleaned = cleanJsonString(apiUrl);
  const parsed = JSON.parse(cleaned) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('apiUrl debe ser un array JSON de objetos de datos.');
  }
  return parsed.filter(isRecord);
};

const parseColumnConfig = (columnConfig: string): ColumnConfig[] => {
  const cleaned = cleanJsonString(columnConfig);
  const parsed = JSON.parse(cleaned) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('columnConfig debe ser un array JSON de configuraciones de columna.');
  }
  const results: ColumnConfig[] = [];
  parsed.forEach(item => {
    if (isRecord(item)) {
      const candidate = item as Partial<ColumnConfig>;
      if (typeof candidate.NombreColumna === 'string') {
        results.push(candidate as ColumnConfig);
      }
    }
  });
  if (results.length === 0) {
    throw new Error('columnConfig no contiene configuraciones válidas (debe incluir NombreColumna).');
  }
  return results;
};

const parseColumnGroups = (columnGroups: string): ColumnGroup[] => {
  const cleaned = cleanJsonString(columnGroups);
  const parsed = JSON.parse(cleaned) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('columnGroups debe ser un array JSON de grupos de columnas.');
  }
  const results: ColumnGroup[] = [];
  parsed.forEach(item => {
    if (isRecord(item)) {
      const candidate = item as Partial<ColumnGroup>;
      if (typeof candidate.headerName === 'string' && Array.isArray(candidate.children)) {
        results.push(candidate as ColumnGroup);
      }
    }
  });
  return results;
};

export const PdfExportButton: React.FC<IPdfExportButtonProps> = (props) => {
  const [feedback, setFeedback] = React.useState<FeedbackState | undefined>(undefined);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const lastClickTime = React.useRef<number>(0);

  const handleExport = React.useCallback((): void => {
    // Debounce: prevent multiple clicks within 2 seconds
    const now = Date.now();
    if (now - lastClickTime.current < 2000 || isGenerating) {
      return;
    }
    lastClickTime.current = now;
    setIsGenerating(true);
    
    // Use setTimeout to allow UI to update before heavy processing
    setTimeout(() => {
      try {
        if (!props.apiUrl?.trim()) {
          throw new Error('No se proporcionó el parámetro apiUrl (datos de la tabla).');
        }
        if (!props.columnConfig?.trim()) {
          throw new Error('No se proporcionó el parámetro columnConfig (configuración de columnas).');
        }
        const parsedApiUrl = parseApiUrl(props.apiUrl);
        const parsedColumnConfig = parseColumnConfig(props.columnConfig);
        const parsedColumnGroups = props.columnGroups?.trim() ? parseColumnGroups(props.columnGroups) : undefined;
        const exportOptions: ExportOptions = {
          apiUrl: parsedApiUrl,
          columnConfig: parsedColumnConfig,
          columnGroups: parsedColumnGroups,
          pdfFileName: props.pdfFileName?.trim(),
          pdfExportTitle: props.pdfExportTitle?.trim(),
          pdfExportSubtitle: props.pdfExportSubtitle?.trim(),
          logoBase64: props.logoBase64?.trim(),
          headerFill: props.headerFill?.trim(),
          headerColor: props.headerColor?.trim(),
          fontSize: props.fontSize
        };
        const doc = exportJsonToPdf(exportOptions);
        const fileName = (props.pdfFileName?.trim() ?? 'grid-export') + '.pdf';
        // Try to open preview in new window - may fail with large PDFs
        try {
          const blobUrl = doc.output('bloburl') as string;
          window.open(blobUrl, '_blank');
        } catch (previewError) {
          console.warn('Preview in new window failed (possibly due to large file size):', previewError);
        }
        doc.save(fileName);
        // Reset after successful generation
        setTimeout(() => setIsGenerating(false), 500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setFeedback({ type: 'error', message: `Error al generar el PDF: ${errorMessage}` });
        console.error('Error al exportar PDF:', error);
        setIsGenerating(false);
      }
    }, 100);
  }, [props, isGenerating]);

  React.useEffect(() => {
    if (feedback) {
      const timerId = setTimeout(() => { setFeedback(undefined); }, 5000);
      return () => { clearTimeout(timerId); };
    }
    return undefined;
  }, [feedback]);

  const currentFill = isPressed ? (props.pressedFill ?? props.fill ?? '#712d3d') : isHovered ? (props.hoverFill ?? props.fill ?? '#712d3d') : (props.fill ?? '#712d3d');
  const currentColor = isPressed ? (props.pressedColor ?? props.color ?? '#ffffff') : isHovered ? (props.hoverColor ?? props.color ?? '#ffffff') : (props.color ?? '#ffffff');
  const currentBorderColor = isPressed ? (props.pressedBorderColor ?? props.borderColor ?? '#712d3d') : isHovered ? (props.hoverBorderColor ?? props.borderColor ?? '#712d3d') : (props.borderColor ?? '#712d3d');

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: currentFill,
    color: currentColor,
    border: `${props.borderThickness ?? 1}px solid ${currentBorderColor}`,
    padding: '10px 20px',
    fontSize: `${props.buttonFontSize ?? 14}px`,
    fontWeight: props.buttonFontWeight ?? 600,
    borderRadius: `${props.borderRadius ?? 6}px`,
    cursor: isGenerating ? 'wait' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box',
    opacity: isGenerating ? 0.6 : 1
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    padding: '4px',
    boxSizing: 'border-box',
    position: 'relative',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const feedbackStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    right: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: feedback?.type === 'success' ? '#d4edda' : '#f8d7da',
    color: feedback?.type === 'success' ? '#155724' : '#721c24',
    border: `1px solid ${feedback?.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
    zIndex: 1000,
    pointerEvents: 'none'
  };

  return (
    <div style={containerStyle}>
      <button
        type="button"
        onClick={handleExport}
        onMouseEnter={() => !isGenerating && setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
        onMouseDown={() => !isGenerating && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        style={buttonStyle}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generando...' : 'Exportar a PDF'}
      </button>
    </div>
  );
};
