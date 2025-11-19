# PDF Exporter PCF Control

A Power Apps Component Framework (PCF) control that generates PDF reports from JSON table data with customizable styling and formatting.

## Features

- Export JSON data to formatted PDF documents
- Support for column configurations (formatting, widths, visibility)
- Data type formatting (numbers, currency, dates, percentages)
- Grouped column headers
- Summary/total rows with special styling
- Clickable links in PDF cells
- Custom logos, titles, and subtitles
- Customizable button appearance with hover/pressed states
- Portrait or landscape orientation
- Opens in new tab with automatic download

## Build

```bash
npm install
npm run build
```

## Properties

### PDF File Related
- `pdfFileName` (Text): Name of the PDF file without extension (default: "grid-export")
- `pdfExportTitle` (Text): Title in PDF header (default: "Grid Export")
- `pdfExportSubtitle` (Text): Subtitle below the title
- `logoBase64` (Multiple): Base64 encoded logo image (uses default if empty)
- `landscapeOrientation` (Yes/No): True for landscape, false for portrait (default: true)
- `linkTextColumn` (Text): Column name whose text will be clickable links
- `linkUrlColumn` (Text): Column name containing URLs (not printed in PDF)

### Data Sources (Required)
- `apiUrl` (Multiple/JSON): Array of row data objects
- `columnConfig` (Multiple/JSON): Array of column configurations
- `columnGroups` (Multiple/JSON): Optional grouped columns structure

### PDF Table Styling
- `headerFill` (Text): Header background color hex (default: "#712d3d")
- `headerColor` (Text): Header text color hex (default: "#ffffff")
- `fontSize` (Number): Font size in points (default: 10)

### Button Styling
- `fill`, `color`, `borderColor`: Normal state colors
- `hoverFill`, `hoverColor`, `hoverBorderColor`: Hover state colors
- `pressedFill`, `pressedColor`, `pressedBorderColor`: Pressed state colors
- `borderThickness`, `borderRadius`, `buttonFontSize`, `buttonFontWeight`: Button dimensions

## JSON Data Format

### ApiUrl (Data)
Array of row objects:

```json
[
  {
    "name": "John Doe",
    "age": 30,
    "salary": 50000
  }
]
```

### ColumnConfig (Configuration)
Array of column configurations:

```json
[
  {
    "NombreColumna": "name",
    "NombreMostrar": "Employee Name",
    "TipoColumna": "String",
    "PropiedadesColumna": {
      "EstaOculta": false
    },
    "Print": {
      "Printable": true,
      "WidthPercentage": "30"
    }
  },
  {
    "NombreColumna": "salary",
    "TipoColumna": "number",
    "PropiedadesColumna": {
      "Formato": "Dinero",
      "DecimalesdeRedondeo": 2
    },
    "Print": {
      "Printable": true,
      "WidthPercentage": "20"
    }
  }
]
```

**Key Properties:**
- `NombreColumna`: Field name (required)
- `NombreMostrar`: Display name in header
- `TipoColumna`: String, number, Fecha, boolean
- `PropiedadesColumna.Formato`: Dinero (MXN), DineroUSD, DineroEUR, numero, Porcentaje, FechaCorta
- `PropiedadesColumna.DecimalesdeRedondeo`: Decimal places
- `Print.Printable`: Include in PDF (false hides column)
- `Print.WidthPercentage`: Relative width in table

### ColumnGroups (Optional)
Array defining grouped headers:

```json
[
  {
    "headerName": "Personal Info",
    "children": ["name", "age"]
  },
  {
    "headerName": "Work Info",
    "children": ["department", "salary"]
  }
]
```

## Clickable Links

To add clickable links in PDF cells:

1. Set `linkTextColumn` to the column containing display text
2. Set `linkUrlColumn` to the column containing URLs
3. The URL column will not be printed in the PDF
4. Links appear in blue and are clickable in the PDF

**Example:**
- Column "DocumentName" has text: "View Report"
- Column "DocumentURL" has: "https://example.com/report.pdf"
- Set `linkTextColumn` = "DocumentName"
- Set `linkUrlColumn` = "DocumentURL"
- PDF shows "View Report" in blue as a clickable link

**Note:** PDF links open in the same tab. This is standard PDF behavior and controlled by the PDF viewer, not the document.

## Row Types

Mark special rows using `__rowType` property:
- `data` or `default`: Normal row
- `groupHeader` or `group`: Group header
- `groupTotal` or `subtotal`: Subtotal row
- `total` or `grandtotal`: Grand total row

## Deployment

After building, the control is available in the `out` directory:

1. Create a solution in Power Apps
2. Add the PCF control to your solution
3. Publish to your environment

## Technical Notes

- Default PDF format: Letter size (11" x 8.5")
- Default margins: Top 100pt, Left/Right 30pt, Bottom 50pt
- Tables auto-handle text wrapping, column width distribution, row striping, and page breaks
- Headers repeat on each page
- Current date displayed automatically

## Dependencies

- React 16.14.0
- jsPDF 2.5.1
- jspdf-autotable 3.5.31
- TypeScript 5.8.3
- FluentUI 8.29.0
