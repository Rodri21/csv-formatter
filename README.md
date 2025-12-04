# Procesador de CSV/Excel

Una aplicación web que funciona completamente en el navegador para procesar archivos CSV, mapeando datos de un archivo fuente a un template específico y realizando conversiones automáticas.

🌐 **[Usar la aplicación en línea](https://tu-usuario.github.io/importExcel/)**

## Características

- 📊 Procesa archivos CSV y Excel (.csv, .xlsx, .xls)
- 🔄 Convierte automáticamente pies (ft) a pulgadas (in) en dimensiones
- 📋 Mapea datos usando un template predefinido
- 🎯 Dos modos de mapeo: por letras de columna o por headers
- 💰 Formateo automático de precios como moneda
- 🖼️ Manejo inteligente de múltiples fotos
- 🌐 Funciona completamente en el navegador (sin backend)
- 📱 Interfaz responsive

## Cómo usar

### Acceso directo
Simplemente visita: **[https://tu-usuario.github.io/importExcel/](https://tu-usuario.github.io/importExcel/)**

### Desarrollo local
Para ejecutar localmente, solo necesitas abrir `index.html` en tu navegador o usar un servidor local simple.

### Uso de la aplicación

1. **Cargar archivo de datos:**
   - Selecciona tu archivo CSV con los datos a procesar
   - El template se carga automáticamente desde `assets/trailer-template.csv`

2. **Configurar opciones:**
   - **Conversión ft→in**: Convierte automáticamente dimensiones de pies a pulgadas
   - **Modo de mapeo**: 
     - *Letras de columna*: Usa referencias como A, B, C...
     - *Headers*: Usa nombres de columna de la primera fila

3. **Procesar:**
   - Haz click en "Procesar Archivos"
   - Espera a que termine el procesamiento

4. **Descargar:**
   - Descarga el archivo Excel procesado con formato aplicado

## Funcionalidades de procesamiento

### Mapeo de columnas
La aplicación mapea automáticamente las columnas según la configuración predefinida:
- **Stock #** → Unique ID y Stock Number
- **Category** → Class  
- **Manufacturer** → Make
- **Model** → Model
- **Year** → Year
- **VIN#** → VIN/Serial Number
- **Condition** → New/Used
- **Description** → Description (limpia caracteres # y *)
- **Color** → Primary Color
- **Price** → Price ($) con formato de moneda
- **Dimensiones** → Length, Width, Height (con conversión ft→in)
- **Peso** → GVWR, Payload Capacity (elimina valores cero)
- **Images** → Photo 1, Photo 2, Photo 3... (separa URLs por comas)

### Conversiones automáticas

#### Dimensiones (Length, Width, Height)
- `20ft` → `240 in`
- `8.5 ft` → `102 in`  
- `6'` → `72 in`

#### Limpieza de descripción
- Elimina caracteres `#` y `*` automáticamente
- Preserva el resto del texto intacto

#### Formateo de precios
- Convierte valores a formato de moneda en Excel
- Detecta y extrae valores numéricos automáticamente

#### Manejo de fotos
- Separa URLs múltiples por comas
- Crea columnas Photo 1, Photo 2, etc. dinámicamente
- Ajusta el template según el número máximo de fotos

## Estructura del proyecto

```
importExcel/
├── index.html                  # Interfaz de usuario principal
├── app.js                     # Lógica de procesamiento
├── styles.css                 # Estilos CSS
├── assets/
│   └── trailer-template.csv   # Template predefinido
├── .gitignore                 # Archivos a ignorar en Git
└── README.md                  # Documentación
```

## Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Librería**: [SheetJS/XLSX](https://sheetjs.com/) (vía CDN)
- **Hosting**: GitHub Pages
- **APIs del navegador**: FileReader, Blob, URL APIs

## Despliegue

Esta aplicación está diseñada para GitHub Pages:

1. **Fork o clona** este repositorio
2. **Habilita GitHub Pages** en Settings → Pages
3. **Selecciona** rama `main` como fuente  
4. **Accede** a tu aplicación en `https://tu-usuario.github.io/importExcel/`

No requiere build process ni instalación de dependencias.

## Limitaciones

- Procesa archivos CSV y Excel (.csv, .xlsx, .xls)  
- El template está predefinido en `assets/trailer-template.csv`
- Funciona solo en navegadores modernos con soporte para ES6+
- Procesamiento limitado por la memoria del navegador

## Personalización

Para modificar el mapeo de columnas o agregar nuevas conversiones, edita `app.js`:

- **`columnMapping`**: Define el mapeo entre columnas de entrada y salida
- **`processCellValue()`**: Agrega nuevas reglas de procesamiento  
- **`isDimensionColumn()`**: Define qué columnas son dimensiones
- **`isWeightColumn()`**: Define qué columnas son de peso
- **`cleanDescription()`**: Personaliza limpieza de texto

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es de uso libre. Puedes usarlo, modificarlo y distribuirlo según tus necesidades.
