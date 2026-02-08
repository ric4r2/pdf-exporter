# PCF Component - PDF Exporter

## Component Properties

### PDF File Configuration

#### PDF File Name
- **Type:** Text
- **Description:** Name of the generated PDF file (without extension).
- **Default Value:** `grid-export`
- **Example:** `"Sales_Report"`

#### PDF Export Title
- **Type:** Text
- **Description:** Main title appearing in the PDF header.
- **Default Value:** `Grid Export`
- **Example:** `"Monthly Sales Report"`

#### PDF Export Subtitle
- **Type:** Text
- **Description:** Subtitle appearing below the main title.
- **Optional:** Yes
- **Example:** `"Sales Department - Northern Region"`

#### Sorting/Grouping Info
- **Type:** Text
- **Description:** Descriptive text regarding applied sorting and grouping. Displayed below the date in the PDF.
- **Optional:** Yes
- **Example:** `"Grouped by: Region | Sorted by: Date descending"`

#### Logo Base64
- **Type:** Text (Base64)
- **Description:** Logo to be inserted into the PDF. Must be a Base64 encoded image.
- **Optional:** Yes (uses default logo if not provided).
- **Example:** `"iVBORw0KGgoAAAANSUhEUgAA..."`

#### Landscape Orientation
- **Type:** Switch (Boolean)
- **Description:** Defines the document orientation.
  - **ON (true):** Landscape format.
  - **OFF (false):** Portrait format.
- **Default Value:** `true`

### Link Configuration

#### Link Text Column
- **Type:** Text
- **Description:** Name of the column whose text will be converted into clickable links.
- **Optional:** Yes
- **Example:** `"ProductName"`

#### Link URL Column
- **Type:** Text
- **Description:** Name of the column containing the URLs for the links (this column is not printed).
- **Optional:** Yes
- **Example:** `"ProductURL"`

### Grouping Configuration

#### Pivot Column
- **Type:** Text
- **Description:** Name of the column by which rows will be grouped. All rows with the same value in this column will be grouped together.
- **Optional:** Yes
- **Example:** `"Region"` or `"Category"`

### Data Configuration

#### API URL (JSON)
- **Type:** JSON (Multiple)
- **Description:** Table data in JSON format. Each object represents a row.
- **Format:** Array of objects with `columnName: value` pairs.
- **Required:** Yes
- **Example:**
```json
[
  {
    "Name": "Product A",
    "Price": 100,
    "Category": "Electronics"
  },
  {
    "Name": "Product B",
    "Price": 200,
    "Category": "Home"
  }
]
```

#### Column Config (JSON)
- **Type:** JSON (Multiple)
- **Description:** Column configuration. Similar to AG-Grid format, with additional properties for printing.
- **Required:** Yes
- **Main Properties:**
  - `NombreColumna`: Identifier name of the column (required).
  - `NombreMostrar`: Text to display in the header (optional).
  - `TipoColumna`: Data type (`text`, `number`, `Fecha` (date), `datetime`, `boolean`, `String`).
  - `PropiedadesColumna`: Object with additional properties.
    - `Formato`: Display format. Options: `Dinero` (Currency MXN), `DineroUSD` (Currency USD), `DineroEUR` (Currency EUR), `numero` (Number), `Porcentaje` (Percentage), `FechaCorta` (Short Date), `FechaLarga` (Long Date).
    - `DecimalesdeRedondeo`: Number of decimal places for numbers.
    - `ColorDefondo`: Cell background color (hex).
    - `ColorDeLetra`: Text color (hex).
    - `TamanoDeLetra`: Font size.
  - `Print`: **Print configuration (important).**
    - `Printable`: (boolean) If `true`, the column is included in the PDF.
    - `WidthPercentage`: (string) Percentage of the table width the column will occupy.

**Example:**
```json
[
  {
    "NombreColumna": "name",
    "NombreMostrar": "Product Name",
    "TipoColumna": "text",
    "Print": {
      "Printable": true,
      "WidthPercentage": "30"
    }
  },
  {
    "NombreColumna": "price",
    "NombreMostrar": "Price",
    "TipoColumna": "number",
    "PropiedadesColumna": {
      "Formato": "Dinero",
      "DecimalesdeRedondeo": 2
    },
    "Print": {
      "Printable": true,
      "WidthPercentage": "15"
    }
  },
  {
    "NombreColumna": "internal_id",
    "TipoColumna": "number",
    "Print": {
      "Printable": false
    }
  }
]
```

#### Column Groups (JSON)
- **Type:** JSON (Multiple)
- **Description:** Grouping of columns under common headers. Uses the same format as AG-Grid.
- **Optional:** Yes
- **Properties:**
  - `headerName`: Name of the column group.
  - `children`: Array with the names of the columns belonging to the group.
  - `marryChildren`: (optional) If true, keeps columns together.

**Example:**
```json
[
  {
    "headerName": "Product Information",
    "children": ["code", "name", "description"],
    "marryChildren": true
  },
  {
    "headerName": "Financial Data",
    "children": ["price", "cost", "margin"],
    "marryChildren": true
  }
]
```

#### Aggregation Function Config (JSON)
- **Type:** JSON (Multiple)
- **Description:** Configuration of aggregation functions for grouped columns. Compatible with AG-Grid.
- **Optional:** Yes
- **Properties:**
  - `ColumnConfigName`: Name of the column to which aggregation is applied (required).
  - `aggFuncColumnsAllowed`: (boolean) If aggregation functions are allowed on this column.
  - `aggFuncColumnsDefault`: (string) Default aggregation function to apply.
  - `RowGroupColumnsDefault`: (boolean) If the column is grouped by rows.
  - `GroupColumnsDefault`: (boolean) If the column is grouped.

**Available Aggregation Functions:**
- `sum`: Sum of numeric values.
- `avg`: Average of values.
- `min`: Minimum value.
- `max`: Maximum value.
- `count`: Count of items.
- `first`: First value of the group.
- `last`: Last value of the group.

**Example:**
```json
[
  {
    "ColumnConfigName": "price",
    "aggFuncColumnsAllowed": true,
    "aggFuncColumnsDefault": "sum",
    "RowGroupColumnsDefault": false
  },
  {
    "ColumnConfigName": "quantity",
    "aggFuncColumnsAllowed": true,
    "aggFuncColumnsDefault": "avg"
  },
  {
    "ColumnConfigName": "maxSale",
    "aggFuncColumnsAllowed": true,
    "aggFuncColumnsDefault": "max"
  }
]
```

### Table Style

#### Header Fill Color
- **Type:** Text (Hexadecimal)
- **Description:** Background color of table headers.
- **Default Value:** `#712d3d`
- **Example:** `"#0078D4"`, `"#FF5733"`

#### Header Text Color
- **Type:** Text (Hexadecimal)
- **Description:** Text color in table headers.
- **Default Value:** `#ffffff`
- **Example:** `"#FFFFFF"`, `"#000000"`

#### Font Size
- **Type:** Number
- **Description:** Font size of table content (in points).
- **Default Value:** `8`
- **Example:** `10`, `12`

### Button Style - Normal State

#### Button Fill Color
- **Type:** Text (Hexadecimal)
- **Description:** Button fill color in normal state.
- **Default Value:** `#712d3d`
- **Example:** `"#0078D4"`

#### Button Text Color
- **Type:** Text (Hexadecimal)
- **Description:** Text color within the button.
- **Default Value:** `#ffffff`
- **Example:** `"#FFFFFF"`

#### Button Border Color
- **Type:** Text (Hexadecimal)
- **Description:** Button border color.
- **Default Value:** `#712d3d`
- **Example:** `"#0078D4"`

#### Button Border Thickness
- **Type:** Number
- **Description:** Button border thickness (in pixels).
- **Default Value:** `1`
- **Example:** `2`, `3`

#### Button Border Radius
- **Type:** Number
- **Description:** Button border radius (rounded corners, in pixels).
- **Default Value:** `6`
- **Example:** `4`, `10`

#### Button Font Size
- **Type:** Number
- **Description:** Text size within the button (in pixels).
- **Default Value:** `14`
- **Example:** `12`, `16`

#### Button Font Weight
- **Type:** Number
- **Description:** Text thickness within the button (100-900).
- **Default Value:** `600`
- **Example:** `400` (normal), `700` (bold), `900` (extra bold)

### Button Style - Hover State

#### Button Hover Fill
- **Type:** Text (Hexadecimal)
- **Description:** Button fill color when pointer is over it.
- **Optional:** Yes (uses normal color if not specified).
- **Example:** `"#005A9E"`

#### Button Hover Text Color
- **Type:** Text (Hexadecimal)
- **Description:** Text color when pointer is over the button.
- **Optional:** Yes
- **Example:** `"#FFFFFF"`

#### Button Hover Border Color
- **Type:** Text (Hexadecimal)
- **Description:** Border color when pointer is over the button.
- **Optional:** Yes
- **Example:** `"#005A9E"`

### Button Style - Pressed State

#### Button Pressed Fill
- **Type:** Text (Hexadecimal)
- **Description:** Button fill color when pressed.
- **Optional:** Yes
- **Example:** `"#004578"`

#### Button Pressed Text Color
- **Type:** Text (Hexadecimal)
- **Description:** Text color when the button is pressed.
- **Optional:** Yes
- **Example:** `"#FFFFFF"`

#### Button Pressed Border Color
- **Type:** Text (Hexadecimal)
- **Description:** Border color when the button is pressed.
- **Optional:** Yes
- **Example:** `"#004578"`

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
- `NombreColumna`: Field name (required).
- `NombreMostrar`: Display name in header.
- `TipoColumna`: `String`, `number`, `Fecha` (date), `boolean`.
- `PropiedadesColumna.Formato`: `Dinero` (MXN), `DineroUSD`, `DineroEUR`, `numero`, `Porcentaje`, `FechaCorta` (ShortDate).
- `PropiedadesColumna.DecimalesdeRedondeo`: Decimal places.
- `Print.Printable`: Include in PDF (false hides column).
- `Print.WidthPercentage`: Relative width in table.

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

## Important Notes

### About Colors
- All colors must be in hexadecimal format with the `#` symbol.
- Valid example: `#FF5733`
- Invalid example: `FF5733` or `rgb(255, 87, 51)`

### About JSON
- Ensure all JSONs are correctly formatted.
- Property names must be enclosed in double quotes.
- String values must also be enclosed in double quotes.
- Power Apps may require escaping quotes: use `""` instead of `"` within strings.

### About Columns
- If a column has `Print.Printable: false`, it will not appear in the PDF.
- The sum of `WidthPercentage` for all visible columns should be approximately 100%.

### About Links
- For links to work, you must specify both `Link Text Column` and `Link URL Column`.
- The URL column will not be printed in the PDF; it is only used for the links.
- Links are clickable in the generated PDF and appear in blue.

**Link Example:**
- "DocumentName" column has text: "View Report"
- "DocumentURL" column has: "https://example.com/report.pdf"
- Set `linkTextColumn` = "DocumentName"
- Set `linkUrlColumn` = "DocumentURL"
- PDF will show "View Report" in blue as a clickable link.

### About Grouping
- Grouping with `Pivot Column` groups consecutive rows with the same value.
- Aggregation functions are applied to groups if `Aggregation Function Config` is specified.

## Special Row Types

Mark special rows using the `__rowType` property:
- `data` or `default`: Normal row.
- `groupHeader` or `group`: Group header.
- `groupTotal` or `subtotal`: Subtotal row.
- `total` or `grandtotal`: Grand total row.

These rows automatically receive special styles (bold, background colors, etc.).

## Complete Configuration Example

### Column Config
```json
[
  {
    "NombreColumna": "code",
    "NombreMostrar": "Code",
    "TipoColumna": "text",
    "Print": {
      "Printable": true,
      "WidthPercentage": "10"
    }
  },
  {
    "NombreColumna": "product",
    "NombreMostrar": "Product",
    "TipoColumna": "text",
    "Print": {
      "Printable": true,
      "WidthPercentage": "30"
    }
  },
  {
    "NombreColumna": "category",
    "NombreMostrar": "Category",
    "TipoColumna": "text",
    "Print": {
      "Printable": true,
      "WidthPercentage": "20"
    }
  },
  {
    "NombreColumna": "price",
    "NombreMostrar": "Price",
    "TipoColumna": "number",
    "PropiedadesColumna": {
      "Formato": "Dinero",
      "DecimalesdeRedondeo": 2
    },
    "Print": {
      "Printable": true,
      "WidthPercentage": "15"
    }
  },
  {
    "NombreColumna": "quantity",
    "NombreMostrar": "Quantity",
    "TipoColumna": "number",
    "Print": {
      "Printable": true,
      "WidthPercentage": "10"
    }
  },
  {
    "NombreColumna": "total",
    "NombreMostrar": "Total",
    "TipoColumna": "number",
    "PropiedadesColumna": {
      "Formato": "Dinero",
      "DecimalesdeRedondeo": 2
    },
    "Print": {
      "Printable": true,
      "WidthPercentage": "15"
    }
  }
]
```

### API URL (Data)
```json
[
  {
    "code": "P001",
    "product": "Laptop Dell XPS 15",
    "category": "Electronics",
    "price": 15000,
    "quantity": 5,
    "total": 75000
  },
  {
    "code": "P002",
    "product": "Mouse Logitech MX Master",
    "category": "Accessories",
    "price": 1200,
    "quantity": 10,
    "total": 12000
  },
  {
    "code": "P003",
    "product": "Mechanical Keyboard",
    "category": "Accessories",
    "price": 2500,
    "quantity": 8,
    "total": 20000
  }
]
```

### Column Groups
```json
[
  {
    "headerName": "Product Information",
    "children": ["code", "product", "category"]
  },
  {
    "headerName": "Financial Data",
    "children": ["price", "quantity", "total"]
  }
]
```

### Aggregation Function Config
```json
[
  {
    "ColumnConfigName": "quantity",
    "aggFuncColumnsAllowed": true,
    "aggFuncColumnsDefault": "sum"
  },
  {
    "ColumnConfigName": "total",
    "aggFuncColumnsAllowed": true,
    "aggFuncColumnsDefault": "sum"
  }
]
```

## Supported Column Types

- `text`: Simple text.
- `number`: Numbers.
- `Fecha`: Dates (format dd/mm/yyyy).
- `datetime`: Date and time.
- `boolean`: Yes/No.

## Available Formats

In `PropiedadesColumna.Formato`:
- `Dinero`: Currency format ($X,XXX.XX).
- `Porcentaje`: Percentage format (XX.XX%).
- `FechaCorta`: Short date format.
- `FechaHora`: Date and time format.
- `numero`: Standard numeric format.

## Version

1.2.1
