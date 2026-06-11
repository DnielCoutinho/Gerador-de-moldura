/**
 * ===================================================
 * FRAME STUDIO PRO - EXIF Reader
 * Parser EXIF Robusto com Fallbacks Profissionais
 * ===================================================
 */

class ExifReaderPro {
    constructor() {
        this.cache = new Map();
        this.exifTags = this.buildExifTagMap();
        this.brandParsers = this.buildBrandParsers();
    }

    /**
     * Mapa completo de tags EXIF
     */
    buildExifTagMap() {
        return {
            // IFD0 - Main Image Tags
            0x010F: { name: 'camera_make', display: 'Marca', category: 'camera' },
            0x0110: { name: 'camera_model', display: 'Câmera', category: 'camera' },
            0x0112: { name: 'orientation', display: 'Orientação', category: 'image' },
            0x011A: { name: 'xResolution', display: 'Resolução X', category: 'image' },
            0x011B: { name: 'yResolution', display: 'Resolução Y', category: 'image' },
            0x0131: { name: 'software', display: 'Software', category: 'software' },
            0x0132: { name: 'datetime', display: 'Data/Hora', category: 'date' },
            0x0103: { name: 'compression', display: 'Compressão', category: 'image' },
            
            // ExifIFD Tags (0x8825 pointer)
            0x9000: { name: 'exifVersion', display: 'Versão EXIF', category: 'exif' },
            0x9003: { name: 'datetime_original', display: 'Data Original', category: 'date' },
            0x9004: { name: 'datetime_digitized', display: 'Data Digitalizada', category: 'date' },
            0x8827: { name: 'iso', display: 'ISO', category: 'photo' },
            0x8828: { name: 'exif_offset', display: 'Offset EXIF', category: 'exif' },
            0x8830: { name: 'sensitivity_type', display: 'Tipo Sensibilidade', category: 'photo' },
            0x8832: { name: 'iso_speed', display: 'Velocidade ISO', category: 'photo' },
            0x8833: { name: 'iso_speedlatitude', display: 'ISO Latitude', category: 'photo' },
            0x8834: { name: 'iso_speedlongitude', display: 'ISO Longitude', category: 'photo' },
            0x8835: { name: 'iso_speedrating', display: 'ISO Rating', category: 'photo' },
            
            // Photo Tags
            0x882A: { name: 'speed_of_light', display: 'Velocidade Luz', category: 'photo' },
            0x882B: { name: 'exposure_time', display: 'Tempo Exposição', category: 'photo' },
            0x882C: { name: 'digital_zoom', display: 'Zoom Digital', category: 'photo' },
            0x882D: { name: 'exposure_bias', display: 'Viés Exposição', category: 'photo' },
            0x882E: { name: 'max_aperture', display: 'Máx Abertura', category: 'photo' },
            0x882F: { name: 'lightness', display: 'Claridade', category: 'photo' },
            0x8829: { name: 'f_number', display: 'F-Number', category: 'photo' },
            0x9201: { name: 'shutter_speed', display: 'Velocidade Obturador', category: 'photo' },
            0x9202: { name: 'aperture', display: 'Abertura', category: 'photo' },
            0x9203: { name: 'brightness', display: 'Brilho', category: 'photo' },
            0x9204: { name: 'exposure_bias_value', display: 'Viés Exposição Valor', category: 'photo' },
            0x9205: { name: 'max_aperture_value', display: 'Valor Max Abertura', category: 'photo' },
            0x9206: { name: 'subject_distance', display: 'Distância Sujeito', category: 'photo' },
            0x9207: { name: 'metering_mode', display: 'Modo Medição', category: 'photo' },
            0x9208: { name: 'light_source', display: 'Fonte Luz', category: 'photo' },
            0x9209: { name: 'flash', display: 'Flash', category: 'photo' },
            0x920A: { name: 'focal_length', display: 'Distância Focal', category: 'photo' },
            0x9214: { name: 'subject_area', display: 'Área Sujeito', category: 'photo' },
            0xA405: { name: 'focal_length_35mm', display: 'Distância Focal 35mm', category: 'photo' },
            0xA408: { name: 'aspect_ratio', display: 'Proporção', category: 'photo' },
            0xA409: { name: 'rendering', display: 'Renderização', category: 'photo' },
            0xA40A: { name: 'exposure_mode', display: 'Modo Exposição', category: 'photo' },
            0xA40B: { name: 'white_balance', display: 'Balanço Branco', category: 'photo' },
            0xA40C: { name: 'digital_zoom_ratio', display: 'Taxa Zoom Digital', category: 'photo' },
            0xA40D: { name: 'focal_plane_x_resolution', display: 'Resolução X Plano Focal', category: 'photo' },
            0xA40E: { name: 'focal_plane_y_resolution', display: 'Resolução Y Plano Focal', category: 'photo' },
            0xA40F: { name: 'focal_plane_resolution_unit', display: 'Unidade Resolução Plano Focal', category: 'photo' },
            0xA420: { name: 'image_unique_id', display: 'ID Única Imagem', category: 'image' },
            
            // GPS Tags (0x8825 pointer)
            0x0000: { name: 'gps_version', display: 'Versão GPS', category: 'gps' },
            0x0001: { name: 'gps_latitude_ref', display: 'Ref Latitude GPS', category: 'gps' },
            0x0002: { name: 'gps_latitude', display: 'Latitude GPS', category: 'gps' },
            0x0003: { name: 'gps_longitude_ref', display: 'Ref Longitude GPS', category: 'gps' },
            0x0004: { name: 'gps_longitude', display: 'Longitude GPS', category: 'gps' },
            0x0005: { name: 'gps_altitude_ref', display: 'Ref Altitude GPS', category: 'gps' },
            0x0006: { name: 'gps_altitude', display: 'Altitude GPS', category: 'gps' },
        };
    }

    /**
     * Parsers específicos por marca de câmera
     */
    buildBrandParsers() {
        return {
            'Canon': this.parseCanon.bind(this),
            'Nikon': this.parseNikon.bind(this),
            'Sony': this.parseSony.bind(this),
            'FUJIFILM': this.parseFuji.bind(this),
            'Panasonic': this.parsePanasonic.bind(this),
            'Olympus': this.parseOlympus.bind(this),
        };
    }

    /**
     * Extrai EXIF de arquivo
     */
    async extractEXIF(file) {
        const cacheKey = `${file.name}|${file.size}|${file.lastModified}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const exifData = this.parseBuffer(arrayBuffer);
            const formatted = this.formatExifData(exifData);
            
            this.cache.set(cacheKey, formatted);
            return formatted;
        } catch (error) {
            console.warn('Erro ao extrair EXIF:', error);
            return this.getEmptyExif();
        }
    }

    /**
     * Parse do buffer da imagem
     */
    parseBuffer(buffer) {
        const data = new DataView(buffer);
        const exif = {};

        try {
            // Verificar se é JPEG (SOI marker: 0xFFD8)
            if (data.byteLength < 4 || 
                data.getUint8(0) !== 0xFF || 
                data.getUint8(1) !== 0xD8) {
                // Tentar PNG
                if (data.byteLength > 8 && 
                    data.getUint32(0) === 0x89504E47) {
                    return this.parsePNG(data);
                }
                // Tentar WebP
                if (data.byteLength > 12 &&
                    String.fromCharCode(data.getUint8(0), data.getUint8(1), data.getUint8(2), data.getUint8(3)) === 'RIFF') {
                    return this.parseWebP(data);
                }
                return exif;
            }

            // Parse JPEG EXIF
            let offset = 2;
            while (offset < data.byteLength - 8) {
                if (data.getUint8(offset) !== 0xFF) {
                    offset++;
                    continue;
                }

                const marker = data.getUint8(offset + 1);

                if (marker === 0xE1) { // APP1 - EXIF
                    const length = data.getUint16(offset + 2, false);
                    const exifStart = offset + 4;
                    
                    if (length >= 6) {
                        const header = String.fromCharCode(
                            data.getUint8(exifStart),
                            data.getUint8(exifStart + 1),
                            data.getUint8(exifStart + 2),
                            data.getUint8(exifStart + 3)
                        );

                        if (header === 'Exif') {
                            const tiffStart = exifStart + 6;
                            const littleEndian = data.getUint16(tiffStart, true) === 0x4949;
                            
                            try {
                                this.parseTIFF(data, tiffStart, littleEndian, exif);
                            } catch (e) {
                                console.warn('Erro ao parse TIFF:', e);
                            }
                        }
                    }
                    break;
                } else if (marker === 0xD9 || marker === 0x00) {
                    break;
                } else {
                    const segmentLength = data.getUint16(offset + 2, false);
                    offset += segmentLength + 2;
                }
            }
        } catch (error) {
            console.warn('Erro ao fazer parse JPEG:', error);
        }

        return exif;
    }

    /**
     * Parse do formato TIFF
     */
    parseTIFF(data, tiffStart, littleEndian, exif) {
        if (tiffStart + 8 > data.byteLength) return;

        const byteOrder = data.getUint16(tiffStart, littleEndian);
        if (byteOrder !== 0x4949 && byteOrder !== 0x4D4D) return;

        const ifdOffset = data.getUint32(tiffStart + 4, littleEndian);
        if (ifdOffset < 8 || tiffStart + ifdOffset > data.byteLength) return;

        this.parseIFD(data, tiffStart, tiffStart + ifdOffset, littleEndian, exif, 0);
    }

    /**
     * Parse da IFD (Image File Directory)
     */
    parseIFD(data, tiffStart, ifdOffset, littleEndian, exif, depth = 0) {
        if (depth > 5 || ifdOffset > data.byteLength - 2) return;

        try {
            let offset = ifdOffset;
            const entryCount = data.getUint16(offset, littleEndian);
            
            if (entryCount === 0 || entryCount > 10000) return;

            offset += 2;

            for (let i = 0; i < entryCount; i++) {
                if (offset + 12 > data.byteLength) break;

                const tag = data.getUint16(offset, littleEndian);
                const type = data.getUint16(offset + 2, littleEndian);
                const count = data.getUint32(offset + 4, littleEndian);
                const valueOffset = offset + 8;

                try {
                    // Processar tag principal
                    if (this.exifTags[tag]) {
                        const tagInfo = this.exifTags[tag];
                        const value = this.parseTagValue(data, type, count, valueOffset, littleEndian, tiffStart);
                        
                        if (value !== null && value !== undefined && value !== '') {
                            exif[tagInfo.name] = {
                                display: tagInfo.display,
                                value: value,
                                category: tagInfo.category
                            };
                        }
                    }

                    // Processar sub-IFD de EXIF (tag 0x8825)
                    if (tag === 0x8825) {
                        const exifIFDOffset = data.getUint32(valueOffset, littleEndian);
                        if (exifIFDOffset > 0 && exifIFDOffset < data.byteLength) {
                            this.parseIFD(data, tiffStart, tiffStart + exifIFDOffset, littleEndian, exif, depth + 1);
                        }
                    }

                    // Processar sub-IFD de GPS (tag 0x8825)
                    if (tag === 0x8825 && !exif.gps_version) {
                        const gpsIFDOffset = data.getUint32(valueOffset, littleEndian);
                        if (gpsIFDOffset > 0 && gpsIFDOffset < data.byteLength) {
                            this.parseIFD(data, tiffStart, tiffStart + gpsIFDOffset, littleEndian, exif, depth + 1);
                        }
                    }
                } catch (e) {
                    // Continuar no próximo
                }

                offset += 12;
            }

            // Processar próxima IFD (thumbnail)
            if (offset + 4 <= data.byteLength) {
                const nextIFDOffset = data.getUint32(offset, littleEndian);
                if (nextIFDOffset > 0 && nextIFDOffset !== ifdOffset && depth < 2) {
                    this.parseIFD(data, tiffStart, tiffStart + nextIFDOffset, littleEndian, exif, depth + 1);
                }
            }
        } catch (error) {
            console.warn('Erro ao parse IFD:', error);
        }
    }

    /**
     * Parse de valor EXIF
     */
    parseTagValue(data, type, count, valueOffset, littleEndian, tiffStart) {
        try {
            switch (type) {
                case 1: // BYTE
                    if (count === 1) return data.getUint8(valueOffset);
                    const bytes = [];
                    for (let i = 0; i < Math.min(count, 4); i++) {
                        bytes.push(data.getUint8(valueOffset + i));
                    }
                    return bytes.join(', ');

                case 2: // ASCII
                    let result = '';
                    let offset = valueOffset;
                    if (count > 4) {
                        offset = tiffStart + data.getUint32(valueOffset, littleEndian);
                        if (offset > data.byteLength - count) return '';
                    }
                    for (let i = 0; i < count; i++) {
                        const byte = data.getUint8(offset + i);
                        if (byte === 0) break;
                        result += String.fromCharCode(byte);
                    }
                    return result.trim();

                case 3: // SHORT
                    if (count === 1) return data.getUint16(valueOffset, littleEndian);
                    const shorts = [];
                    for (let i = 0; i < Math.min(count, 2); i++) {
                        shorts.push(data.getUint16(valueOffset + i * 2, littleEndian));
                    }
                    return shorts.join(', ');

                case 4: // LONG
                    if (count === 1) return data.getUint32(valueOffset, littleEndian);
                    const longs = [];
                    for (let i = 0; i < Math.min(count, 1); i++) {
                        longs.push(data.getUint32(valueOffset + i * 4, littleEndian));
                    }
                    return longs.join(', ');

                case 5: // RATIONAL
                    const numerator = data.getUint32(valueOffset, littleEndian);
                    const denominator = data.getUint32(valueOffset + 4, littleEndian);
                    if (denominator === 0) return '0';
                    return (numerator / denominator).toFixed(2);

                case 10: // SRATIONAL
                    const sNumerator = data.getInt32(valueOffset, littleEndian);
                    const sDenominator = data.getInt32(valueOffset + 4, littleEndian);
                    if (sDenominator === 0) return '0';
                    return (sNumerator / sDenominator).toFixed(2);

                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    }

    /**
     * Formata dados EXIF para exibição humanizada
     */
    formatExifData(exifData) {
        const formatted = {};

        // Câmera
        if (exifData.camera_make?.value) {
            formatted.camera_make = exifData.camera_make.value.trim();
        }
        if (exifData.camera_model?.value) {
            formatted.camera_model = exifData.camera_model.value.trim();
        }

        // ISO
        if (exifData.iso?.value) {
            formatted.iso = `ISO ${exifData.iso.value}`;
        } else if (exifData.iso_speed?.value) {
            formatted.iso = `ISO ${exifData.iso_speed.value}`;
        }

        // Abertura
        if (exifData.aperture?.value) {
            const apValue = parseFloat(exifData.aperture.value);
            if (!isNaN(apValue)) {
                const fNumber = Math.pow(2, apValue / 2);
                formatted.aperture = `ƒ/${fNumber.toFixed(1)}`;
            }
        } else if (exifData.f_number?.value) {
            formatted.aperture = `ƒ/${exifData.f_number.value}`;
        }

        // Velocidade do obturador
        if (exifData.shutter_speed?.value) {
            const shutterValue = parseFloat(exifData.shutter_speed.value);
            if (!isNaN(shutterValue)) {
                const shutterSpeed = Math.pow(2, -shutterValue);
                if (shutterSpeed >= 1) {
                    formatted.shutter = `${shutterSpeed.toFixed(0)}"`;
                } else {
                    formatted.shutter = `1/${(1 / shutterSpeed).toFixed(0)}`;
                }
            }
        } else if (exifData.exposure_time?.value) {
            formatted.shutter = exifData.exposure_time.value + 's';
        }

        // Distância focal
        if (exifData.focal_length?.value) {
            const fl = parseFloat(exifData.focal_length.value);
            if (!isNaN(fl)) {
                formatted.focal_length = `${fl.toFixed(0)}mm`;
            }
        } else if (exifData.focal_length_35mm?.value) {
            formatted.focal_length = `${exifData.focal_length_35mm.value}mm`;
        }

        // Data
        let dateString = exifData.datetime_original?.value || 
                        exifData.datetime?.value ||
                        exifData.datetime_digitized?.value;
        
        if (dateString) {
            formatted.datetime = this.formatDateString(dateString);
        }

        // Software
        if (exifData.software?.value) {
            formatted.software = exifData.software.value;
        }

        return formatted;
    }

    /**
     * Formata string de data EXIF
     */
    formatDateString(dateStr) {
        try {
            const match = dateStr.match(/(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
            if (match) {
                const [, year, month, day, hour, minute, second] = match;
                const date = new Date(year, month - 1, day, hour, minute, second);
                return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
            }
        } catch (e) {
            return dateStr;
        }
        return dateStr;
    }

    /**
     * Retorna EXIF vazio
     */
    getEmptyExif() {
        return {
            empty: true,
            message: 'Esta imagem não possui metadados EXIF disponíveis.'
        };
    }

    // Parsers específicos por marca (para futuras extensões)
    parseCanon(exif) { return exif; }
    parseNikon(exif) { return exif; }
    parseSony(exif) { return exif; }
    parseFuji(exif) { return exif; }
    parsePanasonic(exif) { return exif; }
    parseOlympus(exif) { return exif; }
    parsePNG(data) { return {}; }
    parseWebP(data) { return {}; }

    /**
     * Limpa cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Instância global
const exifReaderPro = new ExifReaderPro();
