# PCF Component - PDF Exporter

## Propiedades del Componente

### Configuración del Archivo PDF

#### PDF File Name
- **Tipo:** Texto
- **Descripción:** Nombre del archivo PDF generado (sin extensión)
- **Valor por defecto:** `grid-export`
- **Ejemplo:** `"Reporte_Ventas"`

#### PDF Export Title
- **Tipo:** Texto
- **Descripción:** Título principal que aparecerá en el encabezado del PDF
- **Valor por defecto:** `Grid Export`
- **Ejemplo:** `"Reporte de Ventas Mensual"`

#### PDF Export Subtitle
- **Tipo:** Texto
- **Descripción:** Subtítulo que aparecerá debajo del título principal
- **Opcional:** Sí
- **Ejemplo:** `"Departamento de Ventas - Región Norte"`

#### Sorting/Grouping Info
- **Tipo:** Texto
- **Descripción:** Texto descriptivo sobre el ordenamiento y agrupación aplicados. Se muestra debajo de la fecha en el PDF
- **Opcional:** Sí
- **Ejemplo:** `"Agrupado por: Región | Ordenado por: Fecha descendente"`

#### Logo Base64
- **Tipo:** Texto (Base64)
- **Descripción:** Logo que se insertará en el PDF. Debe ser una imagen codificada en Base64
- **Opcional:** Sí (usa logo por defecto si no se proporciona)
- **Ejemplo:** `"iVBORw0KGgoAAAANSUhEUgAA..."`

#### Landscape Orientation
- **Tipo:** Switch (Booleano)
- **Descripción:** Define la orientación del documento
  - **ON (true):** Formato horizontal (landscape)
  - **OFF (false):** Formato vertical (portrait)
- **Valor por defecto:** `true`

### Configuración de Enlaces

#### Link Text Column
- **Tipo:** Texto
- **Descripción:** Nombre de la columna cuyo texto se convertirá en enlaces clicables
- **Opcional:** Sí
- **Ejemplo:** `"NombreProducto"`

#### Link URL Column
- **Tipo:** Texto
- **Descripción:** Nombre de la columna que contiene las URLs para los enlaces (esta columna no se imprime)
- **Opcional:** Sí
- **Ejemplo:** `"URLProducto"`

### Configuración de Agrupación

#### Pivot Column
- **Tipo:** Texto
- **Descripción:** Nombre de la columna por la cual se agruparán las filas. Todas las filas con el mismo valor en esta columna se agruparán juntas
- **Opcional:** Sí
- **Ejemplo:** `"Region"` o `"Categoria"`

### Configuración de Datos

#### API URL (JSON)
- **Tipo:** JSON (Multiple)
- **Descripción:** Datos de la tabla en formato JSON. Cada objeto representa una fila
- **Formato:** Array de objetos con pares `nombreColumna: valor`
- **Obligatorio:** Sí
- **Ejemplo:**
```json
[
  {
    "Nombre": "Producto A",
    "Precio": 100,
    "Categoria": "Electrónica"
  },
  {
    "Nombre": "Producto B",
    "Precio": 200,
    "Categoria": "Hogar"
  }
]
```

#### Column Config (JSON)
- **Tipo:** JSON (Multiple)
- **Descripción:** Configuración de columnas. Similar al formato de AG-Grid, con propiedades adicionales para impresión
- **Obligatorio:** Sí
- **Propiedades principales:**
  - `NombreColumna`: Nombre identificador de la columna (obligatorio)
  - `NombreMostrar`: Texto que se mostrará en el encabezado (opcional)
  - `TipoColumna`: Tipo de dato (`text`, `number`, `date`, `datetime`, etc.)
  - `PropiedadesColumna`: Objeto con propiedades adicionales
    - `Formato`: Formato de visualización (`currency`, `percentage`, etc.)
    - `DecimalesdeRedondeo`: Número de decimales para números
    - `ColorDefondo`: Color de fondo de la celda (hex)
    - `ColorDeLetra`: Color del texto (hex)
    - `TamanoDeLetra`: Tamaño de letra
  - `Print`: **Configuración de impresión (importante)**
    - `Printable`: (boolean) Si es `true`, la columna se incluye en el PDF
    - `WidthPercentage`: (string) Porcentaje del ancho de la tabla que ocupará la columna

**Ejemplo:**
```json
[
  {
    "NombreColumna": "nombre",
    "NombreMostrar": "Nombre del Producto",
    "TipoColumna": "text",
    "Print": {
      "Printable": true,
      "WidthPercentage": "30"
    }
  },
  {
    "NombreColumna": "precio",
    "NombreMostrar": "Precio",
    "TipoColumna": "number",
    "PropiedadesColumna": {
      "Formato": "currency",
      "DecimalesdeRedondeo": 2
    },
    "Print": {
      "Printable": true,
      "WidthPercentage": "15"
    }
  },
  {
    "NombreColumna": "id_interno",
    "TipoColumna": "number",
    "Print": {
      "Printable": false
    }
  }
]
```

#### Column Groups (JSON)
- **Tipo:** JSON (Multiple)
- **Descripción:** Agrupación de columnas bajo encabezados comunes. Utiliza el mismo formato que AG-Grid
- **Opcional:** Sí
- **Propiedades:**
  - `headerName`: Nombre del grupo de columnas
  - `children`: Array con los nombres de las columnas que pertenecen al grupo
  - `marryChildren`: (opcional) Si es true, mantiene las columnas juntas

**Ejemplo:**
```json
[
  {
    "headerName": "Información del Producto",
    "children": ["codigo", "nombre", "descripcion"],
    "marryChildren": true
  },
  {
    "headerName": "Datos Financieros",
    "children": ["precio", "costo", "margen"],
    "marryChildren": true
  }
]
```

#### Aggregation Function Config (JSON)
- **Tipo:** JSON (Multiple)
- **Descripción:** Configuración de funciones de agregación para columnas agrupadas. Compatible con AG-Grid
- **Opcional:** Sí
- **Propiedades:**
  - `ColumnConfigName`: Nombre de la columna a la que se aplica la agregación (obligatorio)
  - `aggFuncColumnsAllowed`: (boolean) Si se permiten funciones de agregación en esta columna
  - `aggFuncColumnsDefault`: (string) Función de agregación por defecto a aplicar
  - `RowGroupColumnsDefault`: (boolean) Si la columna se agrupa por filas
  - `GroupColumnsDefault`: (boolean) Si la columna se agrupa

**Funciones de agregación disponibles:**
- `sum`: Suma de valores numéricos
- `avg`: Promedio de valores
- `min`: Valor mínimo
- `max`: Valor máximo
- `count`: Conteo de elementos
- `first`: Primer valor del grupo
- `last`: Último valor del grupo

**Ejemplo:**
```json
[
  {
    "ColumnConfigName": "precio",
    "aggFuncColumnsAllowed": true,
    "aggFuncColumnsDefault": "sum",
    "RowGroupColumnsDefault": false
  },
  {
    "ColumnConfigName": "cantidad",
    "aggFuncColumnsAllowed": true,
    "aggFuncColumnsDefault": "avg"
  },
  {
    "ColumnConfigName": "ventaMaxima",
    "aggFuncColumnsAllowed": true,
    "aggFuncColumnsDefault": "max"
  }
]
```

### Estilo de la Tabla

#### Header Fill Color
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color de fondo de los encabezados de la tabla
- **Valor por defecto:** `#712d3d`
- **Ejemplo:** `"#0078D4"`, `"#FF5733"`

#### Header Text Color
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color del texto en los encabezados de la tabla
- **Valor por defecto:** `#ffffff`
- **Ejemplo:** `"#FFFFFF"`, `"#000000"`

#### Font Size
- **Tipo:** Número
- **Descripción:** Tamaño del texto del contenido de la tabla (en puntos)
- **Valor por defecto:** `8`
- **Ejemplo:** `10`, `12`

### Estilo del Botón - Estado Normal

#### Button Fill Color
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color de relleno del botón en estado normal
- **Valor por defecto:** `#712d3d`
- **Ejemplo:** `"#0078D4"`

#### Button Text Color
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color del texto dentro del botón
- **Valor por defecto:** `#ffffff`
- **Ejemplo:** `"#FFFFFF"`

#### Button Border Color
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color del borde del botón
- **Valor por defecto:** `#712d3d`
- **Ejemplo:** `"#0078D4"`

#### Button Border Thickness
- **Tipo:** Número
- **Descripción:** Grosor del borde del botón (en píxeles)
- **Valor por defecto:** `1`
- **Ejemplo:** `2`, `3`

#### Button Border Radius
- **Tipo:** Número
- **Descripción:** Radio del borde del botón (esquinas redondeadas, en píxeles)
- **Valor por defecto:** `6`
- **Ejemplo:** `4`, `10`

#### Button Font Size
- **Tipo:** Número
- **Descripción:** Tamaño del texto dentro del botón (en píxeles)
- **Valor por defecto:** `14`
- **Ejemplo:** `12`, `16`

#### Button Font Weight
- **Tipo:** Número
- **Descripción:** Grosor del texto dentro del botón (100-900)
- **Valor por defecto:** `600`
- **Ejemplo:** `400` (normal), `700` (negrita), `900` (extra negrita)

### Estilo del Botón - Estado Hover

#### Button Hover Fill
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color de relleno del botón cuando el puntero está sobre él
- **Opcional:** Sí (usa el color normal si no se especifica)
- **Ejemplo:** `"#005A9E"`

#### Button Hover Text Color
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color del texto cuando el puntero está sobre el botón
- **Opcional:** Sí
- **Ejemplo:** `"#FFFFFF"`

#### Button Hover Border Color
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color del borde cuando el puntero está sobre el botón
- **Opcional:** Sí
- **Ejemplo:** `"#005A9E"`

### Estilo del Botón - Estado Pressed

#### Button Pressed Fill
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color de relleno del botón cuando es presionado
- **Opcional:** Sí
- **Ejemplo:** `"#004578"`

#### Button Pressed Text Color
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color del texto cuando el botón es presionado
- **Opcional:** Sí
- **Ejemplo:** `"#FFFFFF"`

#### Button Pressed Border Color
- **Tipo:** Texto (Hexadecimal)
- **Descripción:** Color del borde cuando el botón es presionado
- **Opcional:** Sí
- **Ejemplo:** `"#004578"`

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

## Notas Importantes

### Sobre los Colores
- Todos los colores deben estar en formato hexadecimal con el símbolo `#`
- Ejemplo válido: `#FF5733`
- Ejemplo inválido: `FF5733` o `rgb(255, 87, 51)`

### Sobre los JSON
- Asegúrate de que todos los JSON estén correctamente formateados
- Los nombres de propiedades deben estar entre comillas dobles
- Los valores de texto también deben estar entre comillas dobles
- Power Apps puede requerir escapar las comillas: usar `""` en lugar de `"` dentro de strings

### Sobre las Columnas
- Si una columna tiene `Print.Printable: false`, no aparecerá en el PDF
- La suma de los `WidthPercentage` de todas las columnas visibles debería ser aproximadamente 100%

### Sobre los Enlaces
- Para que funcionen los enlaces, debes especificar tanto `Link Text Column` como `Link URL Column`
- La columna de URL no se imprimirá en el PDF, solo se usa para los enlaces
- Los enlaces son clicables en el PDF generado y aparecen en color azul

**Ejemplo de Enlaces:**
- Columna "NombreDocumento" tiene el texto: "Ver Reporte"
- Columna "URLDocumento" tiene: "https://ejemplo.com/reporte.pdf"
- Configurar `linkTextColumn` = "NombreDocumento"
- Configurar `linkUrlColumn` = "URLDocumento"
- El PDF mostrará "Ver Reporte" en azul como enlace clicable

### Sobre la Agrupación
- La agrupación con `Pivot Column` agrupa filas consecutivas con el mismo valor
- Las funciones de agregación se aplican a grupos si se especifica `Aggregation Function Config`

## Tipos de Fila Especiales

Marca filas especiales usando la propiedad `__rowType`:
- `data` o `default`: Fila normal
- `groupHeader` o `group`: Encabezado de grupo
- `groupTotal` o `subtotal`: Fila de subtotal
- `total` o `grandtotal`: Fila de total general

Estas filas reciben estilos especiales automáticamente (negritas, colores de fondo, etc.)

## Ejemplo Completo de Configuración

### Column Config
```json
[
  {
    "NombreColumna": "codigo",
    "NombreMostrar": "Código",
    "TipoColumna": "text",
    "Print": {
      "Printable": true,
      "WidthPercentage": "10"
    }
  },
  {
    "NombreColumna": "producto",
    "NombreMostrar": "Producto",
    "TipoColumna": "text",
    "Print": {
      "Printable": true,
      "WidthPercentage": "30"
    }
  },
  {
    "NombreColumna": "categoria",
    "NombreMostrar": "Categoría",
    "TipoColumna": "text",
    "Print": {
      "Printable": true,
      "WidthPercentage": "20"
    }
  },
  {
    "NombreColumna": "precio",
    "NombreMostrar": "Precio",
    "TipoColumna": "number",
    "PropiedadesColumna": {
      "Formato": "currency",
      "DecimalesdeRedondeo": 2
    },
    "Print": {
      "Printable": true,
      "WidthPercentage": "15"
    }
  },
  {
    "NombreColumna": "cantidad",
    "NombreMostrar": "Cantidad",
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
      "Formato": "currency",
      "DecimalesdeRedondeo": 2
    },
    "Print": {
      "Printable": true,
      "WidthPercentage": "15"
    }
  }
]
```

### API URL (Datos)
```json
[
  {
    "codigo": "P001",
    "producto": "Laptop Dell XPS 15",
    "categoria": "Electrónica",
    "precio": 15000,
    "cantidad": 5,
    "total": 75000
  },
  {
    "codigo": "P002",
    "producto": "Mouse Logitech MX Master",
    "categoria": "Accesorios",
    "precio": 1200,
    "cantidad": 10,
    "total": 12000
  },
  {
    "codigo": "P003",
    "producto": "Teclado Mecánico",
    "categoria": "Accesorios",
    "precio": 2500,
    "cantidad": 8,
    "total": 20000
  }
]
```

### Column Groups
```json
[
  {
    "headerName": "Información del Producto",
    "children": ["codigo", "producto", "categoria"]
  },
  {
    "headerName": "Datos Financieros",
    "children": ["precio", "cantidad", "total"]
  }
]
```

### Aggregation Function Config
```json
[
  {
    "ColumnConfigName": "cantidad",
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

## Tipos de Columna Soportados

- `text`: Texto simple
- `number`: Números
- `date`: Fechas (formato dd/mm/yyyy)
- `datetime`: Fecha y hora
- `currency`: Moneda (con formato de pesos mexicanos)
- `percentage`: Porcentaje

## Formatos Disponibles

En `PropiedadesColumna.Formato`:
- `currency`: Formato de moneda ($X,XXX.XX)
- `percentage`: Formato de porcentaje (XX.XX%)
- `date`: Formato de fecha corta
- `datetime`: Formato de fecha y hora
- `number`: Formato numérico estándar


## Versión

1.2.0
