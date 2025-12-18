# 📖 Manual de Usuario - Procesador de CSV

## ¿Qué hace esta aplicación?

Esta aplicación te permite convertir tus archivos CSV de inventario al formato específico que necesitas, organizando automáticamente la información y aplicando las conversiones necesarias.

---

## 🚀 Cómo usar la aplicación paso a paso

### Paso 1: Abrir la aplicación
1. Abre tu navegador web (Chrome, Firefox, Safari, etc.)
2. Navega a la aplicación o abre el archivo `index.html`

### Paso 2: Cargar tu archivo
1. Haz clic en **"Examinar"** o **"Seleccionar archivo"** en la sección "Archivo de Datos"
2. Busca y selecciona tu archivo CSV que contiene los datos que quieres procesar
3. Verás el nombre del archivo seleccionado

![Ejemplo de carga de archivo]

### Paso 3: Configurar las opciones

#### ✅ Conversión de medidas
- **Convertir pies a pulgadas**: Deja esta opción marcada si tu archivo tiene medidas en pies (como "20ft" o "8.5 ft") y quieres convertirlas automáticamente a pulgadas

#### 🗂️ Modo de mapeo de columnas
Elige una de estas dos opciones:

- **Usar letras de columnas**: Selecciona esta opción si conoces las letras de las columnas (A, B, C, D...)
- **Usar headers**: Selecciona esta opción si tu archivo tiene nombres de columnas en la primera fila (como "Stock #", "Manufacturer", "Model", etc.)

### Paso 4: Procesar el archivo
1. Haz clic en el botón **"Procesar Archivos"**
2. Espera a que aparezca el mensaje de éxito
3. El procesamiento puede tomar unos segundos dependiendo del tamaño de tu archivo

### Paso 5: Descargar el resultado
1. Cuando termine el procesamiento, se descargará automáticamente un archivo Excel
2. El archivo tendrá el nombre `processed_data_YYYY-MM-DD.xlsx`
3. Busca el archivo en tu carpeta de Descargas

---

## 📋 ¿Qué información procesa?

La aplicación toma la información de tu archivo y la organiza en estas columnas:

| Tu archivo puede tener: | Se convierte en: |
|------------------------|------------------|
| Stock #, Número de stock | Stock Number, Unique ID |
| Category, Categoría | Class |
| Manufacturer, Fabricante | Make |
| Model, Modelo | Model |
| Year, Año | Year |
| VIN#, Número VIN | VIN/Serial Number |
| Condition, Condición | New/Used |
| Description, Descripción | Description (sin símbolos # y *) |
| Color | Primary Color |
| Price, Precio | Price ($) con formato de moneda |
| Medidas (largo, ancho, alto) | Length, Width, Height |
| Peso, capacidad | GVWR, Payload Capacity |
| Fotos, imágenes | Photo 1, Photo 2, Photo 3... |

---

## ⚡ Conversiones automáticas

### 📏 Medidas
- `20ft` se convierte en `240 in`
- `8.5 ft` se convierte en `102 in`
- `6'` se convierte en `72 in`

### 💰 Precios
- Los precios se formatean como moneda en Excel
- Ejemplo: `15000` se muestra como `$15,000.00`

### 🖼️ Fotos
- Si tienes varias URLs de fotos separadas por comas, se crean columnas automáticamente
- Ejemplo: `foto1.jpg, foto2.jpg, foto3.jpg` → Photo 1, Photo 2, Photo 3

---

## 🚨 Solución de problemas comunes

### ❌ El botón "Procesar" está deshabilitado
- **Solución**: Asegúrate de haber seleccionado un archivo CSV

### ❌ Error al cargar el archivo
- **Verifica que**:
  - El archivo sea formato CSV (.csv)
  - El archivo no esté corrupto
  - El archivo no esté muy grande (más de 100MB)

### ❌ Los datos no se ven correctos
- **Revisa que**:
  - Hayas elegido el modo de mapeo correcto (letras vs headers)
  - Tu archivo tenga la estructura esperada
  - Los nombres de las columnas coincidan con lo esperado

### ❌ No se descarga el archivo
- **Intenta**:
  - Verificar la configuración de tu navegador para permitir descargas
  - Usar un navegador diferente (Chrome, Firefox)
  - Revisar la carpeta de Descargas

---

## 💡 Consejos para mejores resultados

### ✅ Prepara tu archivo CSV
- Asegúrate de que la primera fila contenga los nombres de las columnas si usas el modo "headers"
- Revisa que no haya celdas completamente vacías en datos importantes
- Mantén un formato consistente en los datos (especialmente fechas y números)

### ✅ Nombres de columnas recomendados
Si usas el modo "headers", estos nombres funcionan mejor:
- `Stock #` o `Stock Number`
- `Category` o `Class`
- `Manufacturer` o `Make`
- `Model`
- `Year`
- `VIN#` o `VIN`
- `Price`
- `Description`
- `Color`

### ✅ Formato de datos
- **Precios**: Pueden incluir símbolos de moneda ($) o no
- **Medidas**: Usa formatos como "20ft", "8.5 ft", "240 in", "6'"
- **Fotos**: Separa múltiples URLs con comas

---

## 🆘 ¿Necesitas ayuda?

Si tienes problemas o preguntas:

1. **Revisa este manual** para asegurarte de seguir todos los pasos
2. **Verifica tu archivo** - asegúrate de que tenga el formato correcto
3. **Prueba con un archivo más pequeño** para verificar que funciona
4. **Usa un navegador actualizado** (Chrome, Firefox, Safari recientes)

---

## 🎯 Resumen rápido

1. **Carga** tu archivo CSV
2. **Configura** las opciones de conversión y mapeo
3. **Procesa** haciendo clic en el botón
4. **Descarga** el archivo Excel generado
5. **¡Listo!** Tu archivo está organizado y formateado

¡Es así de simple! 🎉
