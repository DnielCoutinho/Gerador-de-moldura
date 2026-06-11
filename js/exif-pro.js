/**
 * ===================================================
 * FRAME STUDIO PRO - EXIF Reader
 * Parser EXIF Universal (Canon, Nikon, Sony, Fuji, etc)
 * ===================================================
 */

class ExifReaderPro {
    constructor() {
        this.cache = new Map();
        // Dicionário exato das tags universais
        this.exifTags = {
            0x010F: 'camera_make',
            0x0110: 'camera_model',
            0x0132: 'datetime',
            0x829A: 'exposure_time',
            0x829D: 'f_number',
            0x8827: 'iso',       // ISOSpeedRatings padrão
            0x8833: 'iso',       // ISOSpeed alternativo
            0x920A: 'focal_length'
        };
    }

    async extractEXIF(file) {
        const cacheKey = `${file.name}|${file.size}|${file.lastModified}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const exifRaw = this.parseBuffer(arrayBuffer);
            const formatted = this.formatExifData(exifRaw);
            
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
            // Verifica se é JPEG válido (0xFFD8)
            if (data.byteLength < 4 || data.getUint8(0) !== 0xFF || data.getUint8(1) !== 0xD8) return exif;

            let offset = 2;
            while (offset < data.byteLength) {
                if (data.getUint8(offset) !== 0xFF) { offset++; continue; }
                const marker = data.getUint8(offset + 1);

                if (marker === 0xE1) { // APP1 - Pasta EXIF
                    const tiffStart = offset + 10; // Pula cabeçalho "Exif\0\0"
                    const littleEndian = data.getUint16(tiffStart, true) === 0x4949;
                    this.parseTIFF(data, tiffStart, littleEndian, exif);
                    break;
                }
                offset += data.getUint16(offset + 2, false) + 2;
            }
        } catch (e) {
            console.warn("Falha na leitura dos bytes:", e);
        }

        return exif;
    }

    parseTIFF(data, tiffStart, littleEndian, exif) {
        const ifdOffset = data.getUint32(tiffStart + 4, littleEndian);
        this.parseIFD(data, tiffStart, tiffStart + ifdOffset, littleEndian, exif);
    }

    parseIFD(data, tiffStart, ifdOffset, littleEndian, exif) {
        if (ifdOffset > data.byteLength - 2) return;

        try {
            const entries = data.getUint16(ifdOffset, littleEndian);
            for (let i = 0; i < entries; i++) {
                const offset = ifdOffset + 2 + (i * 12);
                const tag = data.getUint16(offset, littleEndian);
                const type = data.getUint16(offset + 2, littleEndian);
                const count = data.getUint32(offset + 4, littleEndian);
                const valueOffset = offset + 8;

                // O Pulo do Gato: 0x8769 é o ponteiro para os dados Fotográficos!
                if (tag === 0x8769) {
                    const subOffset = data.getUint32(valueOffset, littleEndian);
                    this.parseIFD(data, tiffStart, tiffStart + subOffset, littleEndian, exif);
                    continue;
                }

                if (this.exifTags[tag]) {
                    const name = this.exifTags[tag];
                    const val = this.parseTagValue(data, tiffStart, type, count, valueOffset, littleEndian);
                    if (val !== null) exif[name] = val;
                }
            }
        } catch (e) {
            console.warn("Falha no loop do IFD:", e);
        }
    }

    parseTagValue(data, tiffStart, type, count, valueOffset, littleEndian) {
        let offset = valueOffset;
        const bytesPerType = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
        const bytes = bytesPerType[type] || 0;
        
        // Se o valor ocupar mais de 4 bytes, o valueOffset é um ponteiro
        if (bytes * count > 4) {
            offset = tiffStart + data.getUint32(valueOffset, littleEndian);
            if (offset > data.byteLength) return null;
        }

        switch (type) {
            case 2: // ASCII (Texto)
                let str = '';
                for (let i = 0; i < count - 1; i++) {
                    const char = data.getUint8(offset + i);
                    if (char === 0) break;
                    str += String.fromCharCode(char);
                }
                return str.trim();
            case 3: // SHORT (Inteiro curto, usado no ISO)
                return data.getUint16(offset, littleEndian);
            case 4: // LONG (Inteiro longo)
                return data.getUint32(offset, littleEndian);
            case 5: // RATIONAL (Fração, usado na Lente, Abertura e Obturador)
                return [
                    data.getUint32(offset, littleEndian), // Numerador
                    data.getUint32(offset + 4, littleEndian) // Denominador
                ];
            case 10: // SRATIONAL (Fração com sinal)
                return [
                    data.getInt32(offset, littleEndian),
                    data.getInt32(offset + 4, littleEndian)
                ];
            default:
                return null;
        }
    }

    formatExifData(exif) {
        const formatted = {};

        // Monta a Marca e Modelo da Câmera
        if (exif.camera_make) formatted.camera_make = String(exif.camera_make);
        if (exif.camera_model) formatted.camera_model = String(exif.camera_model);

        // Formata o ISO (Direto)
        if (exif.iso) formatted.iso = `ISO${exif.iso}`;

        // Formata a Abertura da Lente (ex: f/6.3)
        if (exif.f_number) {
            const [num, den] = exif.f_number;
            if (den !== 0) {
                let aperture = (num / den).toFixed(1).replace('.0', '');
                formatted.aperture = `f/${aperture}`;
            }
        }

        // Formata a Velocidade do Obturador (ex: 1/320s)
        if (exif.exposure_time) {
            const [num, den] = exif.exposure_time;
            if (num !== 0 && den !== 0) {
                if (num < den) {
                    formatted.shutter = `1/${Math.round(den / num)}s`;
                } else {
                    formatted.shutter = `${Math.round(num / den)}s`;
                }
            }
        }

        // Formata a Distância Focal (ex: 50mm)
        if (exif.focal_length) {
            const [num, den] = exif.focal_length;
            if (den !== 0) formatted.focal_length = `${Math.round(num / den)}mm`;
        }

        // Mantém a data original por precaução, mesmo que não desenhemos na moldura
        if (exif.datetime) {
            formatted.datetime = String(exif.datetime);
        }

        return formatted;
    }

    clearCache() { this.cache.clear(); }
}

const exifReaderPro = new ExifReaderPro();