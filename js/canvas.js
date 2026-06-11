/**
 * =====================================================
 * FRAME STUDIO - CANVAS.JS
 * Geração de molduras em canvas
 * =====================================================
 */

class FrameGenerator {
    /**
     * Construtor do gerador de molduras
     */
    constructor() {
        this.canvas = null;
        this.ctx = null;
        
        // Configurações padrão
        this.config = {
            frameColor: '#DCCBB3',
            textColor: '#1A1A1A',
            frameWidth: 40,
            bottomSpacing: 100,
            fontFamily: 'Poppins',
            textSize: 14,
            textAlign: 'left',
            backgroundColor: '#FFFFFF'
        };

        // Cache de imagens carregadas
        this.imageCache = new Map();
    }

    /**
     * Carrega uma imagem para processamento
     * @param {File|Blob|string} imageSource - Arquivo, Blob ou URL da imagem
     * @returns {Promise<HTMLImageElement>} Imagem carregada
     */
    async loadImage(imageSource) {
        try {
            let url;

            if (imageSource instanceof File || imageSource instanceof Blob) {
                // Se for File ou Blob, criar URL
                url = URL.createObjectURL(imageSource);
            } else if (typeof imageSource === 'string') {
                // Se for URL, usar diretamente
                url = imageSource;
            } else {
                throw new Error('Tipo de imagem não suportado');
            }

            // Verificar cache
            if (this.imageCache.has(url)) {
                return this.imageCache.get(url);
            }

            // Carregar imagem
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                    this.imageCache.set(url, img);
                    resolve(img);
                };

                img.onerror = () => {
                    reject(new Error('Erro ao carregar imagem'));
                };

                img.src = url;
            });
        } catch (error) {
            console.error('Erro ao carregar imagem:', error);
            throw error;
        }
    }

    /**
     * Gera moldura com EXIF na imagem
     * @param {HTMLImageElement} image - Imagem carregada
     * @param {Object} exifData - Dados EXIF da imagem
     * @param {Object} frameConfig - Configuração da moldura
     * @returns {Promise<Canvas>} Canvas com moldura gerada
     */
    async generateFrame(image, exifData, frameConfig = {}) {
        try {
            // Mesclar configurações
            const config = { ...this.config, ...frameConfig };

            // Criar canvas
            const width = image.width + (config.frameWidth * 2);
            const height = image.height + config.frameWidth + config.bottomSpacing;

            this.canvas = document.createElement('canvas');
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext('2d', { alpha: false });

            // Preencher fundo com cor da moldura
            this.ctx.fillStyle = config.frameColor;
            this.ctx.fillRect(0, 0, width, height);

            // Desenhar imagem
            this.ctx.drawImage(
                image,
                config.frameWidth,
                config.frameWidth,
                image.width,
                image.height
            );

            // Desenhar EXIF no espaço inferior
            if (Object.keys(exifData).length > 0) {
                this.drawEXIFInfo(exifData, config, image);
            }

            return this.canvas;
        } catch (error) {
            console.error('Erro ao gerar moldura:', error);
            throw error;
        }
    }

    /**
     * Desenha informações EXIF no canvas
     * @param {Object} exifData - Dados EXIF
     * @param {Object} config - Configuração
     * @param {HTMLImageElement} image - Imagem original
     * @private
     */
    drawEXIFInfo(exifData, config, image) {
        const x = config.frameWidth;
        const y = config.frameWidth + image.height;
        const width = image.width;
        const height = config.bottomSpacing;

        // Desenhar background do texto
        this.ctx.fillStyle = config.frameColor;
        this.ctx.fillRect(x, y, width, height);

        // Configurar fonte
        this.ctx.font = `${config.textSize}px "${config.fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        this.ctx.fillStyle = config.textColor;
        this.ctx.textBaseline = 'top';

        // Definir alinhamento
        switch (config.textAlign) {
            case 'center':
                this.ctx.textAlign = 'center';
                this.textX = x + width / 2;
                break;
            case 'right':
                this.ctx.textAlign = 'right';
                this.textX = x + width - 15;
                break;
            default: // left
                this.ctx.textAlign = 'left';
                this.textX = x + 15;
        }

        // Montando linhas de texto
        const lines = this.buildEXIFLines(exifData);
        let textY = y + 15;

        // Desenhar linhas
        lines.forEach(line => {
            if (textY + config.textSize <= y + height - 10) {
                this.ctx.fillText(line, this.textX, textY);
                textY += config.textSize + 5;
            }
        });
    }

    /**
     * Constrói linhas de texto com dados EXIF
     * @param {Object} exifData - Dados EXIF
     * @returns {Array<string>} Linhas de texto
     * @private
     */
    buildEXIFLines(exifData) {
        const lines = [];

        // Dados primários
        if (exifData.camera_make) {
            let model = exifData.camera_model || 'Unknown';
            lines.push(`${exifData.camera_make} ${model}`.trim());
        }

        // Dados fotográficos em uma linha
        const photoData = [];
        if (exifData.iso) photoData.push(exifData.iso);
        if (exifData.aperture) photoData.push(exifData.aperture);
        if (exifData.shutter) photoData.push(exifData.shutter);
        if (exifData.focallength) photoData.push(exifData.focallength);

        if (photoData.length > 0) {
            lines.push(photoData.join(' • '));
        }

        // Data
        if (exifData.datetime) {
            lines.push(exifData.datetime);
        }

        return lines;
    }

    /**
     * Exporta canvas como imagem
     * @param {string} format - Formato de exportação ('jpeg', 'png', 'webp')
     * @param {number} quality - Qualidade (0-1) para JPEG/WebP
     * @returns {Blob} Blob da imagem exportada
     */
    exportImage(format = 'jpeg', quality = 0.95) {
        if (!this.canvas) {
            throw new Error('Nenhum canvas gerado');
        }

        return new Promise((resolve, reject) => {
            try {
                const mimeType = `image/${format}`;
                this.canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Erro ao exportar imagem'));
                        }
                    },
                    mimeType,
                    quality
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Gera URL para download da imagem
     * @param {string} format - Formato de exportação
     * @param {number} quality - Qualidade
     * @returns {Promise<string>} URL de download
     */
    async getDownloadURL(format = 'jpeg', quality = 0.95) {
        const blob = await this.exportImage(format, quality);
        return URL.createObjectURL(blob);
    }

    /**
     * Limpa o canvas
     */
    clear() {
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Limpa cache de imagens
     */
    clearCache() {
        this.imageCache.forEach((_, url) => {
            try {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            } catch (e) {
                // Ignorar erros ao revogar URLs
            }
        });
        this.imageCache.clear();
    }

    /**
     * Obtém dimensões da moldura final
     * @param {number} originalWidth - Largura original da imagem
     * @param {number} originalHeight - Altura original da imagem
     * @param {Object} config - Configuração
     * @returns {Object} Objeto com width e height
     */
    getFrameDimensions(originalWidth, originalHeight, config = {}) {
        const cfg = { ...this.config, ...config };
        return {
            width: originalWidth + (cfg.frameWidth * 2),
            height: originalHeight + cfg.frameWidth + cfg.bottomSpacing
        };
    }
}

/**
 * Classe para gerenciar previsualizações em tempo real
 */
class PreviewManager {
    /**
     * Construtor do gerenciador de preview
     * @param {HTMLCanvasElement} canvasElement - Elemento canvas
     */
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.generator = new FrameGenerator();
        
        this.currentImage = null;
        this.currentExifData = {};
        this.currentConfig = {};
        this.zoomLevel = 1;
        
        this.isRendering = false;
        this.renderQueue = null;
    }

    /**
     * Atualiza a preview
     * @param {HTMLImageElement} image - Imagem
     * @param {Object} exifData - Dados EXIF
     * @param {Object} config - Configuração
     * @returns {Promise<void>}
     */
    async updatePreview(image, exifData, config) {
        this.currentImage = image;
        this.currentExifData = exifData;
        this.currentConfig = config;

        // Se já está renderizando, fila a próxima atualização
        if (this.isRendering) {
            this.renderQueue = { image, exifData, config };
            return;
        }

        this.isRendering = true;

        try {
            const framedImage = await this.generator.generateFrame(image, exifData, config);
            this.renderToCanvas(framedImage);

            // Se há fila, processar próxima atualização
            if (this.renderQueue) {
                const queue = this.renderQueue;
                this.renderQueue = null;
                await this.updatePreview(queue.image, queue.exifData, queue.config);
            }
        } catch (error) {
            console.error('Erro ao atualizar preview:', error);
        } finally {
            this.isRendering = false;
        }
    }

    /**
     * Renderiza imagem framedImage no canvas da preview
     * @param {HTMLCanvasElement} framedCanvas - Canvas com a moldura
     * @private
     */
    renderToCanvas(framedCanvas) {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        // Calcular escala para caber no canvas
        const scaleX = displayWidth / framedCanvas.width;
        const scaleY = displayHeight / framedCanvas.height;
        const scale = Math.min(scaleX, scaleY, 1);

        // Aplicar zoom
        const finalScale = scale * this.zoomLevel;

        // Dimensões finais
        const finalWidth = framedCanvas.width * finalScale;
        const finalHeight = framedCanvas.height * finalScale;

        // Posição centralizada
        const x = (displayWidth - finalWidth) / 2;
        const y = (displayHeight - finalHeight) / 2;

        // Limpar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenhar background
        this.ctx.fillStyle = getComputedStyle(this.canvas).backgroundColor || '#F5F1EA';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenhar imagem
        this.ctx.drawImage(framedCanvas, x, y, finalWidth, finalHeight);
    }

    /**
     * Define nível de zoom
     * @param {number} level - Nível de zoom (0.5 = 50%, 2 = 200%)
     */
    setZoom(level) {
        this.zoomLevel = Math.max(0.1, Math.min(level, 3));
        if (this.currentImage) {
            this.updatePreview(this.currentImage, this.currentExifData, this.currentConfig);
        }
    }

    /**
     * Aumenta zoom
     */
    zoomIn() {
        this.setZoom(this.zoomLevel + 0.1);
    }

    /**
     * Diminui zoom
     */
    zoomOut() {
        this.setZoom(this.zoomLevel - 0.1);
    }

    /**
     * Reset zoom
     */
    resetZoom() {
        this.setZoom(1);
    }

    /**
     * Exporta imagem do preview
     * @param {string} format - Formato
     * @param {number} quality - Qualidade
     * @returns {Promise<Blob>}
     */
    async exportImage(format = 'jpeg', quality = 0.95) {
        return this.generator.exportImage(format, quality);
    }

    /**
     * Limpa resources
     */
    destroy() {
        this.generator.clearCache();
    }
}

// Instâncias globais
const frameGenerator = new FrameGenerator();
