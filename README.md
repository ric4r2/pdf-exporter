# PDF Exporter PCF Control# PDF Exporter PCF Control



A Power Apps Component Framework (PCF) control that exports table data to PDF format, designed to complement ag-grid tables using the same data format.## Overview

This Power Apps Component Framework (PCF) control provides a button that generates PDF reports from JSON table data. It uses the PDF export logic from the ag-grid project with advanced formatting, styling, and column configuration support.

## Overview

## Features

This control provides a customizable button that accepts data in ag-grid format (separate JSON inputs for data, column configuration, and grouped columns) and generates a formatted PDF document.- ✅ Export JSON data to formatted PDF documents

- ✅ Support for column configurations (formatting, widths, visibility)

## Features- ✅ Data type formatting (numbers, currency, dates, percentages)

- ✅ Grouped column headers

- **Ag-Grid Compatible**: Uses the same data format as ag-grid (ApiUrl, ColumnConfig, ColumnGroups)- ✅ Summary/total rows with special styling

- **Customizable PDF Styling**: Control header colors, font sizes, and table appearance- ✅ Custom logos, titles, subtitles, and footnotes

- **Button Interaction States**: Supports normal, hover, and pressed states with custom colors- ✅ Responsive column widths

- **Advanced Formatting**: Supports currency (MXN, USD, EUR), dates, percentages, and numbers- ✅ Customizable button appearance

- **Grouped Headers**: Display multi-level column headers in the PDF- ✅ Open in new tab and/or auto-download options

- **Auto-Download**: Opens PDF in new tab and triggers automatic download

## Build

## Properties

```bash

### PDF File Relatednpm install

| Property | Type | Required | Description |npm run build

|----------|------|----------|-------------|```

| `pdfFileName` | Text | No | Name of the generated PDF file (without extension) |

| `pdfExportTitle` | Text | No | Title displayed in the PDF header |## Deployment

| `pdfExportSubtitle` | Text | No | Subtitle displayed below the title |

After building, the control bundle will be available in the `out` directory. You can then:

### Data Sources (ag-grid format)

| Property | Type | Required | Description |1. Create a solution in Power Apps

|----------|------|----------|-------------|2. Add the PCF control to your solution

| `apiUrl` | Multiple (JSON) | **Yes** | JSON array with row data objects |3. Publish to your environment

| `columnConfig` | Multiple (JSON) | **Yes** | JSON array with column configuration |

| `columnGroups` | Multiple (JSON) | No | JSON array with grouped columns structure |## Usage in Power Apps



### PDF Table Styling### Input Properties

| Property | Type | Required | Default | Description |

|----------|------|----------|---------|-------------|#### Required

| `headerFill` | Text | No | `#712d3d` | Background color for table headers (hex format) |- **tableData** (Multiple lines of text): JSON string containing your data

| `headerColor` | Text | No | `#ffffff` | Text color for table headers (hex format) |

| `fontSize` | Number | No | `10` | Font size for table content in points |#### Optional - PDF Content

- **pdfTitle**: Title displayed in the PDF header (default: "Grid Export")

### Button Styling (Normal State)- **pdfSubtitle**: Subtitle text below the title

| Property | Type | Required | Default | Description |- **pdfLogo**: Base64-encoded image to display in header (uses default logo if not provided)

|----------|------|----------|---------|-------------|- **pdfFootnote**: Text displayed at the bottom of the PDF

| `fill` | Text | No | `#712d3d` | Background color of the button |

| `color` | Text | No | `#ffffff` | Text color of the button |#### Optional - Button Styling

| `borderColor` | Text | No | `#712d3d` | Border color of the button |- **buttonText**: Text on the button (default: "Export PDF")

| `borderThickness` | Number | No | `1` | Border thickness in pixels |- **buttonWidth**: Button width in pixels (default: 140)

- **buttonHeight**: Button height in pixels (default: 44)

### Button Styling (Hover State)- **buttonColor**: Background color (default: "#712d3d")

| Property | Type | Required | Default | Description |- **buttonTextColor**: Text color (default: "#ffffff")

|----------|------|----------|---------|-------------|- **buttonFontSize**: Font size in pixels (default: 14)

| `hoverFill` | Text | No | `#5a2431` | Background color when hovering |- **buttonBorderRadius**: Border radius in pixels (default: 6)

| `hoverColor` | Text | No | `#ffffff` | Text color when hovering |

| `hoverBorderColor` | Text | No | `#5a2431` | Border color when hovering |#### Optional - Behavior

- **pdfFileName**: Name of the downloaded PDF file (default: "grid-export.pdf")

### Button Styling (Pressed State)- **openInNewTab**: Open PDF in new browser tab (default: true)

| Property | Type | Required | Default | Description |- **autoDownload**: Trigger automatic download (default: true)

|----------|------|----------|---------|-------------|

| `pressedFill` | Text | No | `#451c26` | Background color when pressed |### JSON Data Format

| `pressedColor` | Text | No | `#ffffff` | Text color when pressed |

| `pressedBorderColor` | Text | No | `#451c26` | Border color when pressed |The `tableData` property accepts JSON in the following formats:



## JSON Format#### Simple Format (Array of Objects)

```json

### ApiUrl (Data)[

Array of objects where each object represents a row:  {

    "name": "John Doe",

```json    "age": 30,

[    "salary": 50000

  {  },

    "nombreEmpleado": "Juan Pérez",  {

    "edad": 28,    "name": "Jane Smith",

    "salario": 25000.50,    "age": 28,

    "fechaIngreso": "2023-01-15",    "salary": 55000

    "departamento": "TI"  }

  }]

]```

```

#### Advanced Format (With Configuration)

### ColumnConfig (Column Configuration)```json

Array of column configuration objects:{

  "title": "Employee Report",

```json  "subtitle": "Q4 2025",

[  "rows": [

  {    {

    "NombreColumna": "nombreEmpleado",      "nombreEmpleado": "Juan Pérez",

    "TipoColumna": "String",      "edad": 35,

    "NombreMostrar": "Nombre Empleado",      "salario": 45000,

    "PropiedadesColumna": {      "fechaIngreso": "2020-03-15"

      "EsEditable": true,    }

      "EsExportable": true,  ],

      "EstaOculta": false  "summaryRows": [

    },    {

    "WidthDefault": "200",      "__rowType": "total",

    "Print": {      "nombreEmpleado": "TOTAL",

      "Printable": true,      "salario": 45000

      "WidthPercentage": "30"    }

    }  ],

  }  "columnConfigs": [

]    {

```      "NombreColumna": "nombreEmpleado",

      "NombreMostrar": "Employee Name",

**Important ColumnConfig Properties for PDF:**      "TipoColumna": "String",

- `NombreColumna`: Field name matching data keys (required)      "Print": {

- `NombreMostrar`: Display name in header (optional, defaults to NombreColumna)        "Printable": true,

- `TipoColumna`: Data type (String, number, Fecha, Choices, etc.)        "WidthPercentage": "30"

- `PropiedadesColumna.Formato`: Format type (Dinero, DineroUSD, DineroEUR, numero, Porcentaje, FechaCorta, etc.)      }

- `PropiedadesColumna.DecimalesdeRedondeo`: Decimal places for numbers    },

- `PropiedadesColumna.EstaOculta`: Hide column from display    {

- `Print.Printable`: Whether to include in PDF (false hides column)      "NombreColumna": "salario",

- `Print.WidthPercentage`: Relative width in PDF table      "NombreMostrar": "Salary",

- `WidthDefault`: Default width (used if WidthPercentage not specified)      "TipoColumna": "number",

      "PropiedadesColumna": {

**Supported Format Types:**        "Formato": "Dinero",

- **Currency**: `Dinero` (MXN), `DineroUSD`, `DineroEUR`        "DecimalesdeRedondeo": 2

- **Numbers**: `numero` (no decimals), `numeroDosDecimales` (2 decimals)      },

- **Percentages**: `Porcentaje` (with %), `PorcentajeSimple` (number with %)      "Print": {

- **Dates**: `FechaCorta` (dd/MM/yyyy), `FechaLarga` (full date), `FechaHora` (date + time)        "Printable": true,

        "WidthPercentage": "20"

### ColumnGroups (Optional Grouped Headers)      }

Array defining column grouping:    }

  ],

```json  "footnote": "Confidential information"

[}

  {```

    "headerName": "Información Personal",

    "children": ["nombreEmpleado", "edad"]### Column Configuration Options

  },

  {**TipoColumna** (Column Type):

    "headerName": "Información Laboral",- `String`: Text data

    "children": ["departamento", "salario", "fechaIngreso"]- `number`: Numeric data

  }- `Fecha`: Date data

]- `boolean`: True/False values

```

**Formato** (Format) for numbers:

## Sample Files- `Dinero`: Mexican Peso currency (MXN)

- `DineroUSD`: US Dollar currency

The project includes sample JSON files for testing:- `DineroEUR`: Euro currency

- `sample-apiurl.json` - Example data array- `numero`: Whole number

- `sample-columnconfig.json` - Example column configuration- `numeroDosDecimales`: Two decimal places

- `sample-columngroups.json` - Example grouped columns- `Porcentaje`: Percentage (divides by 100)

- `PorcentajeSimple`: Percentage (no division)

## Usage in Power Apps

**Formato** for dates:

1. Add the control to your form/canvas- `FechaCorta`: Short date (dd/mm/yyyy)

2. Bind `apiUrl` to your data source (convert to JSON)- `FechaLarga`: Long date with day name

3. Configure `columnConfig` with your column definitions- `FechaHora`: Date and time

4. (Optional) Add `columnGroups` for multi-level headers- `FechaHoraDetallada`: Detailed date and time

5. Customize styling properties as needed

6. Users click the button to generate and download PDF### Row Types



## DevelopmentYou can mark special rows using the `__rowType` property:

- `data` or `default`: Normal data row

### Build- `groupHeader` or `group`: Group header row

```bash- `groupTotal` or `subtotal`: Subtotal row

npm run build- `total` or `grandtotal`: Grand total row

```

### Grouped Column Headers

### Watch Mode

```bashYou can create grouped column headers (parent columns) using the `columnDefs` property. This allows you to organize related columns under a common header.

npm start watch

```**Example with Column Groups:**

```json

### Test Harness{

```bash  "rows": [

npm start    { "q1Sales": 1000, "q2Sales": 1200, "q1Profit": 200, "q2Profit": 300 }

```  ],

  "columnDefs": [

## Dependencies    {

      "headerName": "First Half Performance",

- React 16.14.0      "children": [

- jsPDF 2.5.1        { "field": "q1Sales", "headerName": "Q1 Sales" },

- jspdf-autotable 3.5.31        { "field": "q2Sales", "headerName": "Q2 Sales" }

- TypeScript 5.8.3      ]

- FluentUI 8.29.0    },

    {

## Technical Notes      "headerName": "Profitability",

      "children": [

- PDF orientation: Landscape, Letter size (11" x 8.5")        { "field": "q1Profit", "headerName": "Q1 Profit" },

- Default margins: Top 100pt, Left/Right 30pt, Bottom 50pt        { "field": "q2Profit", "headerName": "Q2 Profit" }

- Table automatically handles:      ]

  - Multi-line text wrapping    }

  - Column width distribution based on weights  ],

  - Row striping (alternating colors)  "columnConfigs": [

  - Page breaks with header repetition    { "NombreColumna": "q1Sales", "TipoColumna": "number", "PropiedadesColumna": { "Formato": "Dinero" } },

    { "NombreColumna": "q2Sales", "TipoColumna": "number", "PropiedadesColumna": { "Formato": "Dinero" } },

## Integration with Ag-Grid    { "NombreColumna": "q1Profit", "TipoColumna": "number", "PropiedadesColumna": { "Formato": "Dinero" } },

    { "NombreColumna": "q2Profit", "TipoColumna": "number", "PropiedadesColumna": { "Formato": "Dinero" } }

This control is designed to work seamlessly with ag-grid tables:  ]

}

1. **Same Data Format**: Both use the same JSON structure for data and columns```

2. **Compatible Configuration**: ColumnConfig properties match ag-grid column definitions

3. **Complementary Functionality**: Ag-grid provides interactive table, this control provides PDF exportThe `columnDefs` structure:

- **headerName**: The parent/group column name that appears in the header

You can use the same data flows for both components, ensuring consistency across your application.- **children**: Array of child columns under this group

  - **field**: The data field name (matches row property)

## License  - **headerName**: The column header text



See LICENSE file for details.This creates a two-row header:

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
