/**
 * =====================================================
 * FRAME STUDIO - EXIF.JS
 * Leitura e extração de dados EXIF das imagens
 * =====================================================
 */

class EXIFReader {
    /**
     * Construtor do leitor EXIF
     * Inicializa com configurações padrão
     */
    constructor() {
        // Mapeamento de tags EXIF para nomes legíveis
        this.exifTags = {
            0x010F: { name: 'Marca', category: 'camera' },
            0x0110: { name: 'Modelo', category: 'camera' },
            0x0112: { name: 'Orientação', category: 'image' },
            0x011A: { name: 'Resolução X', category: 'image' },
            0x011B: { name: 'Resolução Y', category: 'image' },
            0x011C: { name: 'Unidade Resolução', category: 'image' },
            0x0131: { name: 'Software', category: 'software' },
            0x0132: { name: 'Data/Hora', category: 'date' },
            0x8825: { name: 'GPS Info', category: 'gps' }
        };

        // Mapeamento de tags EXIF IFD
        this.exifIFDTags = {
            0x9000: { name: 'EXIF Version', category: 'exif' },
            0x9003: { name: 'Data Original', category: 'date' },
            0x9004: { name: 'Data Digitalização', category: 'date' },
            0x9101: { name: 'Componentes', category: 'exif' },
            0x9102: { name: 'Compressão', category: 'exif' },
            0x927C: { name: 'Maker Note', category: 'maker' },
            0x9286: { name: 'User Comment', category: 'comment' },
            0xA002: { name: 'Largura Imagem', category: 'image' },
            0xA003: { name: 'Altura Imagem', category: 'image' },
            0xA20E: { name: 'Luminância Branca', category: 'light' },
            0xA20F: { name: 'Luminância Preta', category: 'light' }
        };

        // Tags fotográficas importantes
        this.photoTags = {
            0x8827: { name: 'ISO', category: 'photo', display: 'iso' },
            0x8828: { name: 'Velocidade Obturador', category: 'photo', display: 'shutter' },
            0x8829: { name: 'Abertura', category: 'photo', display: 'aperture' },
            0x882A: { name: 'Velocidade Luz', category: 'photo' },
            0x882B: { name: 'Tempo Exposição', category: 'photo', display: 'exposuretime' },
            0x882C: { name: 'Compressão Digital', category: 'photo' },
            0x882D: { name: 'Viés Exposição', category: 'photo' },
            0x882E: { name: 'Máx Abertura', category: 'photo' },
            0x882F: { name: 'Lightness', category: 'photo' },
            0x8830: { name: 'Cena', category: 'photo' },
            0x8831: { name: 'Tipo Exposição', category: 'photo' },
            0x8832: { name: 'ISO', category: 'photo', display: 'iso' },
            0x8833: { name: 'Sensibilidade Padrão', category: 'photo' },
            0x8834: { name: 'Tempo Exposição', category: 'photo' },
            0x8835: { name: 'Modo Sensibilidade', category: 'photo' },
            0x9004: { name: 'Data Hora Original', category: 'date' },
            0x9205: { name: 'Distância Focal', category: 'photo', display: 'focallength' },
            0xA405: { name: 'Focal Length In 35mm Film', category: 'photo', display: 'focallength35' }
        };

        // Cache de EXIF lido
        this.cache = new Map();
    }

    /**
     * Extrai dados EXIF de um arquivo de imagem
     * @param {File} file - Arquivo de imagem
     * @returns {Promise<Object>} Dados EXIF encontrados
     */
    async extractEXIF(file) {
        // Verificar cache
        const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const exifData = this.parseEXIF(arrayBuffer);
            
            // Formatar dados para exibição
            const formatted = this.formatEXIFData(exifData);
            
            // Armazenar em cache
            this.cache.set(cacheKey, formatted);
            
            return formatted;
        } catch (error) {
            console.warn('Erro ao extrair EXIF:', error);
            return {};
        }
    }

    /**
     * Parse dos dados binários EXIF
     * @param {ArrayBuffer} buffer - Buffer da imagem
     * @returns {Object} Dados EXIF parseados
     * @private
     */
    parseEXIF(buffer) {
        const data = new DataView(buffer);
        const exif = {};

        try {
            // Verificar se é JPEG (SOI marker)
            if (data.getUint8(0) !== 0xFF || data.getUint8(1) !== 0xD8) {
                return exif;
            }

            let offset = 2;
            while (offset < data.byteLength) {
                // Procurar APP1 marker (0xFFE1) para EXIF
                if (data.getUint8(offset) === 0xFF) {
                    const marker = data.getUint8(offset + 1);
                    
                    if (marker === 0xE1) {
                        // Encontrou EXIF
                        const length = data.getUint16(offset + 2, false);
                        const exifStart = offset + 4;

                        // Verificar EXIF header "Exif\0\0"
                        const exifHeader = String.fromCharCode(
                            data.getUint8(exifStart),
                            data.getUint8(exifStart + 1),
                            data.getUint8(exifStart + 2),
                            data.getUint8(exifStart + 3)
                        );

                        if (exifHeader === 'Exif') {
                            const tiffStart = exifStart + 6;
                            const littleEndian = data.getUint16(tiffStart, true) === 0x4949;
                            
                            this.parseTIFF(data, tiffStart, littleEndian, exif);
                        }
                        break;
                    } else if (marker === 0xD9 || marker === 0x00) {
                        // EOI ou marker desconhecido
                        break;
                    } else {
                        const segmentLength = data.getUint16(offset + 2, false);
                        offset += segmentLength + 2;
                    }
                } else {
                    offset++;
                }
            }
        } catch (error) {
            console.warn('Erro ao fazer parse EXIF:', error);
        }

        return exif;
    }

    /**
     * Parse do formato TIFF dentro de EXIF
     * @param {DataView} data - DataView do buffer
     * @param {number} tiffStart - Início dos dados TIFF
     * @param {boolean} littleEndian - Endianness
     * @param {Object} exif - Objeto para armazenar dados
     * @private
     */
    parseTIFF(data, tiffStart, littleEndian, exif) {
        try {
            const ifdOffset = data.getUint32(tiffStart + 4, littleEndian);
            this.parseIFD(data, tiffStart + ifdOffset, littleEndian, exif);
        } catch (error) {
            console.warn('Erro ao fazer parse TIFF:', error);
        }
    }

    /**
     * Parse da IFD (Image File Directory)
     * @param {DataView} data - DataView do buffer
     * @param {number} ifdOffset - Offset da IFD
     * @param {boolean} littleEndian - Endianness
     * @param {Object} exif - Objeto para armazenar dados
     * @private
     */
    parseIFD(data, ifdOffset, littleEndian, exif) {
        try {
            let offset = ifdOffset;
            const entryCount = data.getUint16(offset, littleEndian);
            offset += 2;

            for (let i = 0; i < entryCount; i++) {
                const tag = data.getUint16(offset, littleEndian);
                const type = data.getUint16(offset + 2, littleEndian);
                const count = data.getUint32(offset + 4, littleEndian);
                const valueOffset = offset + 8;

                // Processas tags fotográficas principais
                if (this.photoTags[tag]) {
                    const tagInfo = this.photoTags[tag];
                    const value = this.parseTagValue(data, type, count, valueOffset, littleEndian);
                    exif[tagInfo.display || tagInfo.name] = {
                        name: tagInfo.name,
                        value: value,
                        category: tagInfo.category
                    };
                }

                // Processar IFD de EXIF
                if (tag === 0x8825) {
                    const exifIFDOffset = data.getUint32(valueOffset, littleEndian);
                    this.parseExifSubIFD(data, ifdOffset + exifIFDOffset, littleEndian, exif);
                }

                offset += 12;
            }

            // Processar IFD de GPS se existir
            if (exif.gps) {
                // GPS pode ser adicionado aqui se necessário
            }
        } catch (error) {
            console.warn('Erro ao fazer parse IFD:', error);
        }
    }

    /**
     * Parse do sub-IFD de EXIF
     * @param {DataView} data - DataView do buffer
     * @param {number} ifdOffset - Offset do sub-IFD
     * @param {boolean} littleEndian - Endianness
     * @param {Object} exif - Objeto para armazenar dados
     * @private
     */
    parseExifSubIFD(data, ifdOffset, littleEndian, exif) {
        try {
            let offset = ifdOffset;
            const entryCount = data.getUint16(offset, littleEndian);
            offset += 2;

            for (let i = 0; i < entryCount; i++) {
                const tag = data.getUint16(offset, littleEndian);
                const type = data.getUint16(offset + 2, littleEndian);
                const count = data.getUint32(offset + 4, littleEndian);
                const valueOffset = offset + 8;

                // Processar tags específicas do EXIF
                if (this.exifIFDTags[tag]) {
                    const tagInfo = this.exifIFDTags[tag];
                    const value = this.parseTagValue(data, type, count, valueOffset, littleEndian);
                    exif[tagInfo.name] = {
                        name: tagInfo.name,
                        value: value,
                        category: tagInfo.category
                    };
                }

                offset += 12;
            }
        } catch (error) {
            console.warn('Erro ao fazer parse sub-IFD:', error);
        }
    }

    /**
     * Parse do valor de uma tag EXIF
     * @param {DataView} data - DataView do buffer
     * @param {number} type - Tipo TIFF
     * @param {number} count - Contagem
     * @param {number} valueOffset - Offset do valor
     * @param {boolean} littleEndian - Endianness
     * @returns {any} Valor parseado
     * @private
     */
    parseTagValue(data, type, count, valueOffset, littleEndian) {
        try {
            // Tipos TIFF
            // 1: BYTE, 2: ASCII, 3: SHORT, 4: LONG, 5: RATIONAL
            // 6: SBYTE, 7: UNDEFINED, 8: SSHORT, 9: SLONG
            // 10: SRATIONAL, 11: FLOAT, 12: DOUBLE

            switch (type) {
                case 2: // ASCII
                    let result = '';
                    for (let i = 0; i < count; i++) {
                        const byte = data.getUint8(valueOffset + i);
                        if (byte === 0) break;
                        result += String.fromCharCode(byte);
                    }
                    return result.trim();

                case 3: // SHORT
                    if (count === 1) {
                        return data.getUint16(valueOffset, littleEndian);
                    }
                    const shorts = [];
                    for (let i = 0; i < count; i++) {
                        shorts.push(data.getUint16(valueOffset + i * 2, littleEndian));
                    }
                    return shorts;

                case 4: // LONG
                    if (count === 1) {
                        return data.getUint32(valueOffset, littleEndian);
                    }
                    const longs = [];
                    for (let i = 0; i < count; i++) {
                        longs.push(data.getUint32(valueOffset + i * 4, littleEndian));
                    }
                    return longs;

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
                    return '';
            }
        } catch (error) {
            console.warn('Erro ao fazer parse de valor:', error);
            return '';
        }
    }

    /**
     * Formata dados EXIF para exibição legível
     * @param {Object} exifData - Dados EXIF brutos
     * @returns {Object} Dados formatados
     * @private
     */
    formatEXIFData(exifData) {
        const formatted = {};

        // Dados de câmera
        if (exifData.camera_make || exifData.Marca) {
            formatted.camera_make = exifData.camera_make?.value || exifData.Marca?.value || 'Desconhecido';
        }

        if (exifData.camera_model || exifData.Modelo) {
            formatted.camera_model = exifData.camera_model?.value || exifData.Modelo?.value || 'Desconhecido';
        }

        // Dados fotográficos
        if (exifData.iso) {
            formatted.iso = `ISO ${exifData.iso.value}`;
        }

        if (exifData.shutter) {
            formatted.shutter = `${exifData.shutter.value}s`;
        }

        if (exifData.aperture) {
            const apertureValue = exifData.aperture.value;
            formatted.aperture = `ƒ/${parseFloat(apertureValue).toFixed(1)}`;
        }

        if (exifData.focallength) {
            const focalLength = exifData.focallength.value;
            formatted.focallength = `${focalLength}mm`;
        }

        if (exifData.focallength35) {
            const focalLength35 = exifData.focallength35.value;
            formatted.focallength35 = `${focalLength35}mm (35mm)`;
        }

        // Data
        if (exifData.datetime || exifData['Data/Hora']) {
            const dateString = exifData.datetime?.value || exifData['Data/Hora']?.value;
            if (dateString) {
                formatted.datetime = this.formatDate(dateString);
            }
        }

        return formatted;
    }

    /**
     * Formata data EXIF para formato legível
     * @param {string} dateString - String de data em formato EXIF
     * @returns {string} Data formatada
     * @private
     */
    formatDate(dateString) {
        // Formato EXIF: YYYY:MM:DD HH:MM:SS
        const match = dateString.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
        if (match) {
            const [, year, month, day, hour, minute, second] = match;
            const date = new Date(year, month - 1, day, hour, minute, second);
            return date.toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return dateString;
    }

    /**
     * Limpar cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Instância global do leitor EXIF
const exifReader = new EXIFReader();
