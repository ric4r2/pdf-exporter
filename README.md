# PDF Exporter PCF Control

## Overview
This Power Apps Component Framework (PCF) control provides a button that generates PDF reports from JSON table data. It uses the PDF export logic from the ag-grid project with advanced formatting, styling, and column configuration support.

## Features
- ✅ Export JSON data to formatted PDF documents
- ✅ Support for column configurations (formatting, widths, visibility)
- ✅ Data type formatting (numbers, currency, dates, percentages)
- ✅ Grouped column headers
- ✅ Summary/total rows with special styling
- ✅ Custom logos, titles, subtitles, and footnotes
- ✅ Responsive column widths
- ✅ Customizable button appearance
- ✅ Open in new tab and/or auto-download options

## Build

```bash
npm install
npm run build
```

## Deployment

After building, the control bundle will be available in the `out` directory. You can then:

1. Create a solution in Power Apps
2. Add the PCF control to your solution
3. Publish to your environment

## Usage in Power Apps

### Input Properties

#### Required
- **tableData** (Multiple lines of text): JSON string containing your data

#### Optional - PDF Content
- **pdfTitle**: Title displayed in the PDF header (default: "Grid Export")
- **pdfSubtitle**: Subtitle text below the title
- **pdfLogo**: Base64-encoded image to display in header (uses default logo if not provided)
- **pdfFootnote**: Text displayed at the bottom of the PDF

#### Optional - Button Styling
- **buttonText**: Text on the button (default: "Export PDF")
- **buttonWidth**: Button width in pixels (default: 140)
- **buttonHeight**: Button height in pixels (default: 44)
- **buttonColor**: Background color (default: "#712d3d")
- **buttonTextColor**: Text color (default: "#ffffff")
- **buttonFontSize**: Font size in pixels (default: 14)
- **buttonBorderRadius**: Border radius in pixels (default: 6)

#### Optional - Behavior
- **pdfFileName**: Name of the downloaded PDF file (default: "grid-export.pdf")
- **openInNewTab**: Open PDF in new browser tab (default: true)
- **autoDownload**: Trigger automatic download (default: true)

### JSON Data Format

The `tableData` property accepts JSON in the following formats:

#### Simple Format (Array of Objects)
```json
[
  {
    "name": "John Doe",
    "age": 30,
    "salary": 50000
  },
  {
    "name": "Jane Smith",
    "age": 28,
    "salary": 55000
  }
]
```

#### Advanced Format (With Configuration)
```json
{
  "title": "Employee Report",
  "subtitle": "Q4 2025",
  "rows": [
    {
      "nombreEmpleado": "Juan Pérez",
      "edad": 35,
      "salario": 45000,
      "fechaIngreso": "2020-03-15"
    }
  ],
  "summaryRows": [
    {
      "__rowType": "total",
      "nombreEmpleado": "TOTAL",
      "salario": 45000
    }
  ],
  "columnConfigs": [
    {
      "NombreColumna": "nombreEmpleado",
      "NombreMostrar": "Employee Name",
      "TipoColumna": "String",
      "Print": {
        "Printable": true,
        "WidthPercentage": "30"
      }
    },
    {
      "NombreColumna": "salario",
      "NombreMostrar": "Salary",
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
  ],
  "footnote": "Confidential information"
}
```

### Column Configuration Options

**TipoColumna** (Column Type):
- `String`: Text data
- `number`: Numeric data
- `Fecha`: Date data
- `boolean`: True/False values

**Formato** (Format) for numbers:
- `Dinero`: Mexican Peso currency (MXN)
- `DineroUSD`: US Dollar currency
- `DineroEUR`: Euro currency
- `numero`: Whole number
- `numeroDosDecimales`: Two decimal places
- `Porcentaje`: Percentage (divides by 100)
- `PorcentajeSimple`: Percentage (no division)

**Formato** for dates:
- `FechaCorta`: Short date (dd/mm/yyyy)
- `FechaLarga`: Long date with day name
- `FechaHora`: Date and time
- `FechaHoraDetallada`: Detailed date and time

### Row Types

You can mark special rows using the `__rowType` property:
- `data` or `default`: Normal data row
- `groupHeader` or `group`: Group header row
- `groupTotal` or `subtotal`: Subtotal row
- `total` or `grandtotal`: Grand total row

### Grouped Column Headers

You can create grouped column headers (parent columns) using the `columnDefs` property. This allows you to organize related columns under a common header.

**Example with Column Groups:**
```json
{
  "rows": [
    { "q1Sales": 1000, "q2Sales": 1200, "q1Profit": 200, "q2Profit": 300 }
  ],
  "columnDefs": [
    {
      "headerName": "First Half Performance",
      "children": [
        { "field": "q1Sales", "headerName": "Q1 Sales" },
        { "field": "q2Sales", "headerName": "Q2 Sales" }
      ]
    },
    {
      "headerName": "Profitability",
      "children": [
        { "field": "q1Profit", "headerName": "Q1 Profit" },
        { "field": "q2Profit", "headerName": "Q2 Profit" }
      ]
    }
  ],
  "columnConfigs": [
    { "NombreColumna": "q1Sales", "TipoColumna": "number", "PropiedadesColumna": { "Formato": "Dinero" } },
    { "NombreColumna": "q2Sales", "TipoColumna": "number", "PropiedadesColumna": { "Formato": "Dinero" } },
    { "NombreColumna": "q1Profit", "TipoColumna": "number", "PropiedadesColumna": { "Formato": "Dinero" } },
    { "NombreColumna": "q2Profit", "TipoColumna": "number", "PropiedadesColumna": { "Formato": "Dinero" } }
  ]
}
```

The `columnDefs` structure:
- **headerName**: The parent/group column name that appears in the header
- **children**: Array of child columns under this group
  - **field**: The data field name (matches row property)
  - **headerName**: The column header text

This creates a two-row header:
- Top row: Parent column names spanning multiple columns
- Bottom row: Individual column names

### Table Layout Features

✅ **Centered Tables**: Tables are automatically centered horizontally on the page
✅ **Text Wrapping**: Long text wraps within cells instead of being cut off
✅ **No Horizontal Overflow**: Content stays within page boundaries
✅ **Multi-line Cells**: Text can span multiple lines within the same row

## Sample Data

See `sample-data.json` for a complete example with all features.

## Integration with PFCGallery

The PFCGallery project contains a presentation control that can be used to trigger this PDF export. Simply pass the JSON data from your gallery to this control's `tableData` property.

## Credits

Based on the PDF export functionality from the Ag-Grid-In-PCF project, adapted for standalone use as a PCF control.
