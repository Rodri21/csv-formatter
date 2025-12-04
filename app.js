class ExcelProcessor {
    constructor() {
        this.dataFile = null;
        this.templateData = null;
        this.processedWorkbook = null;
        
        // Mapeo de columnas Input -> Output
        this.columnMapping = {
            // Modo columnas (letras)
            columns: {
                'A': ['A', 'L'],  // stock # -> Unique ID y Stock Number
                'D': ['B'],       // category -> Class
                'G': ['C'],       // manufacturer -> Make
                'H': ['D'],       // model -> Model
                'F': ['F'],       // year -> Year
                'P': ['G'],       // vin# -> VIN/Serial Number
                'Q': ['J'],       // condition -> New/Used
                'S': ['I'],       // description -> Description
                'BN': ['K'],      // color -> Primary Color
                'K': ['M'],       // price -> Price ($)
                'T': ['AJ'],      // length -> Length
                'U': ['AK'],      // width -> Width
                'V': ['AL'],      // height -> Height
                'X': ['AA'],      // gvwr (lbs) -> GVWR
                'Z': ['AB'],      // payload capacity (lbs) -> Payload Capacity
                'DF': ['PHOTOS']  // images -> Photo 1, Photo 2, etc... (manejado especialmente)
            },
            // Modo headers (nombres de columnas)
            headers: {
                'stock #': ['Unique ID', 'Stock Number'],
                'category': ['Class'],
                'manufacturer': ['Make'],
                'model': ['Model'],
                'year': ['Year'],
                'vin#': ['VIN/Serial Number'],
                'condition': ['New/Used'],
                'description': ['Description'],
                'color': ['Primary Color'],
                'price': ['Price ($)'],
                'length': ['Length'],
                'width': ['Width'],
                'height': ['Height'],
                'gvwr (lbs)': ['GVWR'],
                'payload capacity (lbs)': ['Payload Capacity'],
                'images': ['PHOTOS']  // images -> Photo 1, Photo 2, etc... (manejado especialmente)
            }
        };
        
        this.initializeEventListeners();
        this.loadTemplate();
    }

    initializeEventListeners() {
        const dataFileInput = document.getElementById('dataFile');
        const processBtn = document.getElementById('processBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        dataFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        processBtn.addEventListener('click', () => this.processFiles());
        downloadBtn.addEventListener('click', () => this.downloadProcessedFile());
    }

    async loadTemplate() {
        try {
            this.showStatus('Cargando template...', 'info');
            const response = await fetch('./assets/trailer-template.csv');
            if (!response.ok) {
                throw new Error(`No se pudo cargar el template: ${response.statusText}`);
            }
            const csvText = await response.text();
            const workbook = XLSX.read(csvText, { type: 'string' });
            const sheetName = workbook.SheetNames[0];
            this.templateData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
            this.showStatus('✓ Template cargado correctamente', 'success');
            this.updateProcessButtonState();
        } catch (error) {
            console.error('Error loading template:', error);
            this.showStatus(`❌ Error cargando template: ${error.message}`, 'error');
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileInfoElement = document.getElementById('dataFileInfo');
        this.dataFile = file;
        fileInfoElement.textContent = `✓ ${file.name}`;
        this.updateProcessButtonState();
    }

    updateProcessButtonState() {
        const processBtn = document.getElementById('processBtn');
        processBtn.disabled = !(this.dataFile && this.templateData);
    }

    async processFiles() {
        try {
            this.showStatus('Procesando archivos...', 'info');
            this.showProgress(true);
            this.updateProgress(10);

            // Leer archivo de datos
            const dataWorkbook = await this.readExcelFile(this.dataFile);
            this.updateProgress(50);

            // Procesar datos usando el template cargado
            const processedData = this.processData(dataWorkbook, this.templateData);
            this.updateProgress(80);

            // Crear nuevo workbook
            this.processedWorkbook = this.createProcessedWorkbook(processedData);
            this.updateProgress(100);

            this.showStatus('✓ Archivos procesados exitosamente', 'success');
            this.showProgress(false);
            this.showDownloadSection(true);

        } catch (error) {
            console.error('Error processing files:', error);
            this.showStatus(`❌ Error: ${error.message}`, 'error');
            this.showProgress(false);
        }
    }

    readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const text = e.target.result;
                    // Convertir CSV a workbook usando XLSX
                    const workbook = XLSX.read(text, { type: 'string' });
                    resolve(workbook);
                } catch (error) {
                    reject(new Error(`Error leyendo archivo CSV: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error('Error leyendo el archivo'));
            reader.readAsText(file);
        });
    }

    processData(dataWorkbook, templateData) {
        // Obtener la primera hoja de datos
        const dataSheetName = dataWorkbook.SheetNames[0];
        const dataSheet = dataWorkbook.Sheets[dataSheetName];
        
        // Convertir a JSON para facilitar el procesamiento
        const rawData = XLSX.utils.sheet_to_json(dataSheet, { header: 1 });
        
        // Determinar el modo de mapeo
        const useHeaders = document.getElementById('useHeaders').checked;
        
        // Procesar los datos según el mapeo
        const processedData = this.transformDataWithMapping(rawData, templateData, useHeaders);
        
        return processedData;
    }

    transformDataWithMapping(rawData, templateData, useHeaders) {
        if (rawData.length === 0) return [];
        
        const convertFtToIn = document.getElementById('convertFtToIn').checked;
        const inputHeaders = rawData[0] || []; // Primera fila como headers
        let outputHeaders = [...(templateData[0] || [])]; // Headers del template (copia)
        
        // Primer paso: encontrar el máximo número de fotos en todo el dataset
        let maxPhotos = 0;
        const photosSourceKey = useHeaders ? 'images' : 'DF';
        
        for (let rowIndex = 1; rowIndex < rawData.length; rowIndex++) {
            const inputRow = rawData[rowIndex];
            if (!inputRow || inputRow.length === 0) continue;
            
            let sourceValue = '';
            if (useHeaders) {
                const sourceIndex = inputHeaders.findIndex(header => 
                    header && header.toString().toLowerCase().trim() === photosSourceKey.toLowerCase()
                );
                sourceValue = sourceIndex >= 0 ? inputRow[sourceIndex] : '';
            } else {
                const sourceIndex = this.columnLetterToIndex(photosSourceKey);
                sourceValue = sourceIndex < inputRow.length ? inputRow[sourceIndex] : '';
            }
            
            const photos = this.splitPhotos(sourceValue);
            maxPhotos = Math.max(maxPhotos, photos.length);
        }
        
        // Segundo paso: asegurar que tenemos suficientes headers para fotos
        if (maxPhotos > 0) {
            outputHeaders = this.ensurePhotoHeaders(outputHeaders, maxPhotos);
        }
        
        // Crear mapeo de índices
        let columnIndexMapping = {};
        
        if (useHeaders) {
            // Modo headers: buscar por nombre de header
            columnIndexMapping = this.createHeaderMapping(inputHeaders, outputHeaders);
        } else {
            // Modo columnas: usar letras de columnas
            columnIndexMapping = this.createColumnMapping(outputHeaders);
        }
        
        // Procesar solo las filas de datos (desde la segunda fila)
        const processedData = [];
        
        // Agregar la fila de headers actualizada
        processedData.push(outputHeaders);
        
        // Procesar cada fila de datos (empezando desde la segunda fila)
        for (let rowIndex = 1; rowIndex < rawData.length; rowIndex++) {
            const inputRow = rawData[rowIndex];
            if (!inputRow || inputRow.length === 0) continue;
            
            // Crear una nueva fila basada en el template
            const outputRow = new Array(outputHeaders.length).fill('');
            
            // Mapear los datos según el mapeo definido
            for (const [sourceKey, targetIndices] of Object.entries(columnIndexMapping)) {
                let sourceValue = '';
                
                if (useHeaders) {
                    // Buscar el índice de la columna por header
                    const sourceIndex = inputHeaders.findIndex(header => 
                        header && header.toString().toLowerCase().trim() === sourceKey.toLowerCase()
                    );
                    sourceValue = sourceIndex >= 0 ? inputRow[sourceIndex] : '';
                } else {
                    // Usar el índice de columna directamente
                    const sourceIndex = this.columnLetterToIndex(sourceKey);
                    sourceValue = sourceIndex < inputRow.length ? inputRow[sourceIndex] : '';
                }
                
                // Manejo especial para fotos
                if (targetIndices.includes('PHOTOS') || (targetIndices.length === 1 && targetIndices[0] === 'PHOTOS')) {
                    this.processPhotos(sourceValue, outputRow, outputHeaders);
                } else {
                    // Asignar a todas las columnas de destino normales
                    targetIndices.forEach(targetIndex => {
                        if (targetIndex < outputRow.length && targetIndex !== 'PHOTOS') {
                            // Obtener el nombre de la columna de destino para formateo
                            const targetColumnName = outputHeaders[targetIndex] || '';
                            
                            // Procesar el valor con el nombre de columna para formateo específico
                            const processedValue = this.processCellValue(sourceValue, convertFtToIn, targetColumnName);
                            outputRow[targetIndex] = processedValue;
                        }
                    });
                }
            }
            
            processedData.push(outputRow);
        }
        
        return processedData;
    }
    
    createHeaderMapping(inputHeaders, outputHeaders) {
        const mapping = {};
        const headerMap = this.columnMapping.headers;
        
        for (const [inputHeader, outputHeaderNames] of Object.entries(headerMap)) {
            const targetIndices = [];
            
            if (outputHeaderNames.includes('PHOTOS')) {
                // Caso especial para fotos
                targetIndices.push('PHOTOS');
            } else {
                outputHeaderNames.forEach(outputHeaderName => {
                    const targetIndex = outputHeaders.findIndex(header => 
                        header && header.toString().toLowerCase().trim() === outputHeaderName.toLowerCase()
                    );
                    if (targetIndex >= 0) {
                        targetIndices.push(targetIndex);
                    }
                });
            }
            
            if (targetIndices.length > 0) {
                mapping[inputHeader] = targetIndices;
            }
        }
        
        return mapping;
    }
    
    createColumnMapping(outputHeaders) {
        const mapping = {};
        const columnMap = this.columnMapping.columns;
        
        for (const [inputColumn, outputColumns] of Object.entries(columnMap)) {
            const targetIndices = [];
            
            if (outputColumns.includes('PHOTOS')) {
                // Caso especial para fotos
                targetIndices.push('PHOTOS');
            } else {
                outputColumns.forEach(outputColumn => {
                    const targetIndex = this.columnLetterToIndex(outputColumn);
                    if (targetIndex < outputHeaders.length) {
                        targetIndices.push(targetIndex);
                    }
                });
            }
            
            if (targetIndices.length > 0) {
                mapping[inputColumn] = targetIndices;
            }
        }
        
        return mapping;
    }
    
    columnLetterToIndex(letter) {
        let result = 0;
        for (let i = 0; i < letter.length; i++) {
            result = result * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
        }
        return result - 1; // Convertir a índice base 0
    }
    
    processCellValue(value, convertFtToIn, columnName = '') {
        if (value === null || value === undefined) return '';
        
        let processedValue = value;
        
        // Convertir dimensiones (length, width, height) de pies a pulgadas si está habilitado
        if (convertFtToIn && this.isDimensionColumn(columnName)) {
            processedValue = this.convertDimensionToInches(processedValue);
        }
        // Conversión general de pies a pulgadas para otros campos (comportamiento anterior)
        else if (convertFtToIn && this.isFeetValue(processedValue)) {
            processedValue = this.convertFeetToInches(processedValue);
        }
        
        // Limpiar description si es la columna de descripción
        if (this.isDescriptionColumn(columnName)) {
            processedValue = this.cleanDescription(processedValue);
        }
        
        // Formatear como moneda si es la columna de precio
        if (this.isPriceColumn(columnName)) {
            processedValue = this.formatAsCurrency(processedValue);
        }
        
        // Remover valores cero de columnas de peso (GVWR, Payload Capacity)
        if (this.isWeightColumn(columnName)) {
            processedValue = this.removeZeroValues(processedValue);
        }
        
        // Limpiar y formatear datos
        processedValue = this.formatCellValue(processedValue);
        
        return processedValue;
    }
    
    isDescriptionColumn(columnName) {
        const descriptionColumns = ['Description', 'description'];
        return descriptionColumns.some(col => 
            col.toLowerCase() === columnName.toLowerCase().trim()
        );
    }
    
    cleanDescription(value) {
        if (value === null || value === undefined || value === '') return '';
        
        let cleanedValue = value.toString();
        
        // Remover SOLO los caracteres "#" y "*"
        cleanedValue = cleanedValue.replace(/#/g, '');  // Remover todos los #
        cleanedValue = cleanedValue.replace(/\*/g, ''); // Remover todos los *
        
        // NO modificar espacios ni otros caracteres - mantener todo lo demás intacto
        
        return cleanedValue;
    }
    
    isDimensionColumn(columnName) {
        const dimensionColumns = ['Length', 'Width', 'Height', 'length', 'width', 'height'];
        return dimensionColumns.some(col => 
            col.toLowerCase() === columnName.toLowerCase().trim()
        );
    }
    
    isWeightColumn(columnName) {
        const weightColumns = ['GVWR', 'Payload Capacity', 'gvwr', 'payload capacity', 'gvwr (lbs)', 'payload capacity (lbs)'];
        return weightColumns.some(col => 
            col.toLowerCase() === columnName.toLowerCase().trim()
        );
    }
    
    removeZeroValues(value) {
        if (value === null || value === undefined || value === '') return '';
        
        const valueStr = value.toString().trim();
        
        // Si está vacío, devolver vacío
        if (!valueStr) return '';
        
        // Extraer valor numérico
        const numericValue = parseFloat(valueStr.replace(/[^0-9.-]/g, ''));
        
        // Si es cero (incluyendo "0", "0.0", "0.00", etc.), devolver cadena vacía
        if (!isNaN(numericValue) && numericValue === 0) {
            return '';
        }
        
        // Si no es cero, devolver el valor original
        return valueStr;
    }
    
    convertDimensionToInches(value) {
        if (value === null || value === undefined || value === '') return '';
        
        const valueStr = value.toString().trim();
        
        // Si ya está vacío, devolver vacío
        if (!valueStr) return '';
        
        // Verificar si ya está en pulgadas (contiene "in")
        if (valueStr.toLowerCase().includes('in')) {
            // Ya está en pulgadas, devolver tal como está
            return valueStr;
        }
        
        // Verificar si está en pies (contiene "ft")
        if (valueStr.toLowerCase().includes('ft')) {
            // Extraer el número
            const numStr = valueStr.replace(/[^0-9.]/g, '');
            const feet = parseFloat(numStr);
            
            if (isNaN(feet)) return valueStr; // Si no se puede convertir, devolver original
            
            const inches = feet * 12;
            return `${inches.toFixed(0)} in`; // Sin decimales para dimensiones
        }
        
        // Si no tiene unidad específica, asumir que son pies y convertir
        const numMatch = valueStr.match(/^(\d+(?:\.\d+)?)/);
        if (numMatch) {
            const feet = parseFloat(numMatch[1]);
            if (!isNaN(feet)) {
                const inches = feet * 12;
                return `${inches.toFixed(0)} in`;
            }
        }
        
        // Si no se puede procesar, devolver el valor original
        return valueStr;
    }
    
    isPhotosColumn(columnName) {
        const photosColumns = ['images', 'Photos', 'photos'];
        return photosColumns.some(col => 
            col.toLowerCase() === columnName.toLowerCase().trim()
        ) || columnName === 'PHOTOS'; // Identificador especial
    }
    
    splitPhotos(value) {
        if (value === null || value === undefined || value === '') return [];
        
        const photoUrls = value.toString().split(',');
        
        // Limpiar cada URL (quitar espacios en blanco)
        return photoUrls.map(url => url.trim()).filter(url => url.length > 0);
    }
    
    ensurePhotoHeaders(outputHeaders, maxPhotos) {
        // Buscar el índice de la primera columna de fotos (Photo 1)
        let firstPhotoIndex = outputHeaders.findIndex(header => 
            header && header.toLowerCase().includes('photo 1')
        );
        
        if (firstPhotoIndex === -1) {
            // Si no existe Photo 1, buscar donde debería estar (después de la columna AL)
            firstPhotoIndex = this.columnLetterToIndex('AM');
        }
        
        // Asegurar que tenemos suficientes headers para todas las fotos
        const currentPhotoHeaders = outputHeaders.slice(firstPhotoIndex).filter(header => 
            header && header.toLowerCase().startsWith('photo ')
        ).length;
        
        const headersToAdd = Math.max(0, maxPhotos - currentPhotoHeaders);
        
        if (headersToAdd > 0) {
            // Agregar headers que faltan
            const newHeaders = [...outputHeaders];
            
            for (let i = 1; i <= headersToAdd; i++) {
                const photoNumber = currentPhotoHeaders + i;
                const headerIndex = firstPhotoIndex + photoNumber - 1;
                
                if (headerIndex >= newHeaders.length) {
                    // Extender el array si es necesario
                    while (newHeaders.length <= headerIndex) {
                        newHeaders.push('');
                    }
                }
                
                newHeaders[headerIndex] = `Photo ${photoNumber}`;
            }
            
            return newHeaders;
        }
        
        return outputHeaders;
    }
    
    processPhotos(photoString, outputRow, outputHeaders) {
        const photos = this.splitPhotos(photoString);
        
        // Encontrar el índice de la primera columna de fotos
        let firstPhotoIndex = outputHeaders.findIndex(header => 
            header && header.toLowerCase().includes('photo 1')
        );
        
        if (firstPhotoIndex === -1) {
            // Si no se encuentra, usar la columna AM como fallback
            firstPhotoIndex = this.columnLetterToIndex('AM');
        }
        
        // Colocar cada foto en su columna correspondiente
        photos.forEach((photoUrl, index) => {
            const targetIndex = firstPhotoIndex + index;
            if (targetIndex < outputRow.length) {
                outputRow[targetIndex] = photoUrl;
            }
        });
    }
    
    isPriceColumn(columnName) {
        const priceColumns = ['Price ($)', 'price'];
        return priceColumns.some(col => 
            col.toLowerCase() === columnName.toLowerCase().trim()
        );
    }
    
    formatAsCurrency(value) {
        if (value === null || value === undefined || value === '') return '';
        
        // Extraer solo números del valor
        const numericValue = this.extractNumericValue(value);
        if (isNaN(numericValue)) return value;
        
        // Para CSV, devolver el valor numérico sin formato
        // El formato se aplicará al crear el Excel
        return numericValue;
    }
    
    extractNumericValue(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Remover todo excepto números, puntos y comas
            const cleaned = value.replace(/[^0-9.,]/g, '');
            // Convertir a número
            return parseFloat(cleaned.replace(/,/g, ''));
        }
        return NaN;
    }

    isFeetValue(value) {
        if (typeof value !== 'string') return false;
        
        // Buscar patrones como "5ft", "5 ft", "5'", etc.
        const feetPatterns = [
            /^\d+(\.\d+)?\s*ft$/i,
            /^\d+(\.\d+)?\s*feet$/i,
            /^\d+(\.\d+)?'$/,
            /^\d+(\.\d+)?\s*pies?$/i
        ];
        
        return feetPatterns.some(pattern => pattern.test(value.toString().trim()));
    }

    convertFeetToInches(value) {
        const numStr = value.toString().replace(/[^0-9.]/g, '');
        const feet = parseFloat(numStr);
        
        if (isNaN(feet)) return value;
        
        const inches = feet * 12;
        return `${inches.toFixed(2)} in`;
    }

    formatCellValue(value) {
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return value.trim();
        return value.toString();
    }

    createProcessedWorkbook(processedData) {
        // Crear un nuevo workbook
        const newWorkbook = XLSX.utils.book_new();
        
        // Crear una hoja con los datos procesados
        const worksheet = XLSX.utils.aoa_to_sheet(processedData);
        
        // Aplicar formato de moneda a la columna de precios
        this.applyCurrencyFormatting(worksheet, processedData);
        
        // Agregar la hoja al workbook
        XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Datos Procesados');
        
        return newWorkbook;
    }
    
    applyCurrencyFormatting(worksheet, data) {
        if (data.length === 0) return;
        
        const headers = data[0];
        
        // Buscar la columna de precio
        const priceColumnIndex = headers.findIndex(header => 
            this.isPriceColumn(header)
        );
        
        if (priceColumnIndex === -1) return;
        
        // Aplicar formato de moneda desde la segunda fila
        for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
            const cellAddress = XLSX.utils.encode_cell({
                r: rowIndex,
                c: priceColumnIndex
            });
            
            if (worksheet[cellAddress]) {
                // Aplicar formato de moneda
                worksheet[cellAddress].z = '"$"#,##0.00';
                
                // Asegurar que el valor sea numérico para el formato
                const cellValue = data[rowIndex][priceColumnIndex];
                const numericValue = this.extractNumericValue(cellValue);
                if (!isNaN(numericValue)) {
                    worksheet[cellAddress].v = numericValue;
                    worksheet[cellAddress].t = 'n'; // tipo numérico
                }
            }
        }
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
        statusElement.style.display = 'block';
    }

    downloadProcessedFile() {
        if (!this.processedWorkbook) {
            this.showStatus('❌ No hay archivo procesado para descargar', 'error');
            return;
        }

        try {
            const wbout = XLSX.write(this.processedWorkbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `processed_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.showStatus('✓ Archivo Excel descargado exitosamente con formato de moneda', 'success');
            
        } catch (error) {
            console.error('Error downloading file:', error);
            this.showStatus(`❌ Error descargando archivo: ${error.message}`, 'error');
        }
    }

    showProgress(show) {
        const progressElement = document.getElementById('progress');
        progressElement.style.display = show ? 'block' : 'none';
        if (!show) {
            this.updateProgress(0);
        }
    }

    updateProgress(percentage) {
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${percentage}%`;
    }

    showDownloadSection(show) {
        const downloadSection = document.getElementById('downloadSection');
        downloadSection.style.display = show ? 'block' : 'none';
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ExcelProcessor();
});
