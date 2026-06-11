/**
 * ===================================================
 * FRAME STUDIO PRO - EXIF Reader
 * Parser EXIF Universal (Canon, Nikon, Sony, Fuji, etc)
 * ===================================================
 */

class ExifReaderPro {
    constructor() {
        this.cache = new Map();
        this.exifTags = this.buildExifTagMap();
    }

    buildExifTagMap() {
        return {
            // Tags Básicas
            0x010F: { name: 'camera_make', display: 'Marca', category: 'camera' },
            0x0110: { name: 'camera_model', display: 'Câmera', category: 'camera' },
            0x0112: { name: 'orientation', display: 'Orientação', category: 'image' },
            0x0131: { name: 'software', display: 'Software', category: 'software' },
            0x0132: { name: 'datetime', display: 'Data/Hora', category: 'date' },
            
            // O Ponteiro Mágico: Isso avisa o código onde estão as configs da câmera!
            0x8769: { name: 'exif_offset', display: 'EXIF IFD Pointer', category: 'pointer' },
            
            // Tags Fotográficas (Lidas dentro do 0x8769)
            0x829A: { name: 'exposure_time', display: 'Tempo Exposição', category: 'photo' },
            0x829D: { name: 'f_number', display: 'F-Number', category: 'photo' },
            0x8827: { name: 'iso', display: 'ISO', category: 'photo' },
            0x9201: { name: 'shutter_speed', display: 'Velocidade Obturador', category: 'photo' },
            0x9202: { name: 'aperture', display: 'Abertura', category: 'photo' },
            0x920A: { name: 'focal_length', display: 'Distância Focal', category: 'photo' },
            0xA405: { name: 'focal_length_35mm', display: 'Distância Focal 35mm', category: 'photo' }
        };
    }

    async extractEXIF(file) {
        const cacheKey = `${file.name}|${file.size}|${file.lastModified}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const exifData = this.parseBuffer(arrayBuffer);
            const formatted = this.formatExifData(exifData);
            
            this.cache.set(cacheKey, formatted);
            return formatted;
        } catch (error) {
            console.warn('Erro ao extrair EXIF:', error);
            return { empty: true, message: 'Sem metadados EXIF disponíveis.' };
        }
    }

    parseBuffer(buffer) {
        const data = new DataView(buffer);
        const exif = {};

        try {
            // Verifica JPEG
            if (data.byteLength < 4 || data.getUint8(0) !== 0xFF || data.getUint8(1) !== 0xD8) return exif;

            let offset = 2;
            while (offset < data.byteLength - 8) {
                if (data.getUint8(offset) !== 0xFF) { offset++; continue; }
                const marker = data.getUint8(offset + 1);

                if (marker === 0xE1) { 
                    const length = data.getUint16(offset + 2, false);
                    const exifStart = offset + 4;
                    if (length >= 6) {
                        const header = String.fromCharCode(data.getUint8(exifStart), data.getUint8(exifStart + 1), data.getUint8(exifStart + 2), data.getUint8(exifStart + 3));
                        if (header === 'Exif') {
                            const tiffStart = exifStart + 6;
                            const littleEndian = data.getUint16(tiffStart, true) === 0x4949;
                            this.parseTIFF(data, tiffStart, littleEndian, exif);
                        }
                    }
                    break;
                } else if (marker === 0xD9 || marker === 0x00) { break; } 
                else { offset += data.getUint16(offset + 2, false) + 2; }
            }
        } catch (e) {}

        return exif;
    }

    parseTIFF(data, tiffStart, littleEndian, exif) {
        if (tiffStart + 8 > data.byteLength) return;
        const ifdOffset = data.getUint32(tiffStart + 4, littleEndian);
        this.parseIFD(data, tiffStart, tiffStart + ifdOffset, littleEndian, exif, 0);
    }

    parseIFD(data, tiffStart, ifdOffset, littleEndian, exif, depth = 0) {
        if (depth > 5 || ifdOffset > data.byteLength - 2) return;

        try {
            let offset = ifdOffset;
            const entryCount = data.getUint16(offset, littleEndian);
            offset += 2;

            for (let i = 0; i < entryCount; i++) {
                if (offset + 12 > data.byteLength) break;

                const tag = data.getUint16(offset, littleEndian);
                const type = data.getUint16(offset + 2, littleEndian);
                const count = data.getUint32(offset + 4, littleEndian);
                const valueOffset = offset + 8;

                // Extrai as informações e guarda no objeto exif
                if (this.exifTags[tag]) {
                    const tagInfo = this.exifTags[tag];
                    const value = this.parseTagValue(data, type, count, valueOffset, littleEndian, tiffStart);
                    if (value !== null) {
                        exif[tagInfo.name] = { value: value };
                    }
                }

                // O GRANDE SEGREDO: Pular para a pasta de dados fotográficos (0x8769)
                if (tag === 0x8769) {
                    const exifIFDOffset = data.getUint32(valueOffset, littleEndian);
                    if (exifIFDOffset > 0 && exifIFDOffset < data.byteLength) {
                        this.parseIFD(data, tiffStart, tiffStart + exifIFDOffset, littleEndian, exif, depth + 1);
                    }
                }

                offset += 12;
            }
        } catch (e) {}
    }

    parseTagValue(data, type, count, valueOffset, littleEndian, tiffStart) {
        try {
            const bytesPerComponent = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
            const totalBytes = (bytesPerComponent[type] || 1) * count;
            let realOffset = valueOffset;
            
            if (totalBytes > 4) {
                realOffset = tiffStart + data.getUint32(valueOffset, littleEndian);
                if (realOffset + totalBytes > data.byteLength) return null;
            }

            switch (type) {
                case 2: // ASCII
                    let result = '';
                    for (let i = 0; i < count; i++) {
                        const byte = data.getUint8(realOffset + i);
                        if (byte === 0) break;
                        result += String.fromCharCode(byte);
                    }
                    return result.trim();
                case 3: // SHORT
                    return data.getUint16(realOffset, littleEndian);
                case 4: // LONG
                    return data.getUint32(realOffset, littleEndian);
                case 5: // RATIONAL (Crucial para velocidade de obturador e abertura)
                    const numerator = data.getUint32(realOffset, littleEndian);
                    const denominator = data.getUint32(realOffset + 4, littleEndian);
                    if (denominator === 0) return '0';
                    
                    // Lógica para manter o formato 1/320s perfeito
                    if (numerator === 1) return `1/${denominator}`;
                    if (numerator > 0 && numerator < denominator) {
                        return `1/${Math.round(denominator / numerator)}`;
                    }
                    
                    let val = numerator / denominator;
                    return Number.isInteger(val) ? val.toString() : val.toFixed(1);
                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    }

    formatExifData(exifData) {
        const formatted = {};

        // Extrai Câmera
        if (exifData.camera_make?.value) formatted.camera_make = String(exifData.camera_make.value);
        if (exifData.camera_model?.value) formatted.camera_model = String(exifData.camera_model.value);

        // Extrai ISO
        if (exifData.iso?.value) formatted.iso = `ISO${exifData.iso.value}`;

        // Extrai F/
        if (exifData.f_number?.value) {
            formatted.aperture = `f/${exifData.f_number.value}`;
        } else if (exifData.aperture?.value) {
            formatted.aperture = `f/${parseFloat(exifData.aperture.value).toFixed(1)}`;
        }

        // Extrai Velocidade
        if (exifData.exposure_time?.value) {
            formatted.shutter = `${exifData.exposure_time.value}s`;
        }

        // Extrai Distância Lente
        if (exifData.focal_length?.value) {
            formatted.focal_length = `${parseInt(exifData.focal_length.value)}mm`;
        } else if (exifData.focal_length_35mm?.value) {
            formatted.focal_length = `${parseInt(exifData.focal_length_35mm.value)}mm`;
        }

        return formatted;
    }

    clearCache() { this.cache.clear(); }
}

const exifReaderPro = new ExifReaderPro();