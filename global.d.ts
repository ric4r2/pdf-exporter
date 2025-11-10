declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any);
    internal: any;
    addImage(...args: any[]): void;
    text(...args: any[]): void;
    setFont(font: string, style?: string): void;
    setFontSize(size: number): void;
    setTextColor(r: number, g: number, b: number): void;
    setFillColor(r: number, g: number, b: number): void;
    rect(x: number, y: number, width: number, height: number, style?: string): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    setDrawColor(r: number, g: number, b: number): void;
    addPage(): void;
    putTotalPages(placeholder: string): void;
    output(type: string): any;
    save(fileName: string): void;
  }
}

declare module 'jspdf-autotable' {
  export interface CellStyles {
    fillColor?: [number, number, number];
    fontStyle?: string;
    halign?: 'left' | 'center' | 'right';
    textColor?: [number, number, number];
  }

  export interface RowHook {
    index: number;
  }

  export interface Cell {
    styles: CellStyles;
  }

  export interface CellHookData {
    section: 'head' | 'body' | 'foot';
    row: RowHook;
    cell: Cell;
    pageNumber: number;
  }

  export type CellInput =
    | string
    | number
    | null
    | undefined
    | {
        content: string | number | null | undefined;
        colSpan?: number;
        rowSpan?: number;
        styles?: CellStyles;
      };

  export type RowInput = CellInput[];

  const autoTable: (doc: any, options: any) => void;

  export default autoTable;
}
