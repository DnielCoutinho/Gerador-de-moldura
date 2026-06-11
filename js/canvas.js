/**
 * =====================================================
 * FRAME STUDIO - CANVAS.JS
 * Geração de molduras em canvas (Com Proporção Relativa)
 * =====================================================
 */

class FrameGenerator {
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

        this.imageCache = new Map();
    }

    async loadImage(imageSource) {
        try {
            let url;
            if (imageSource instanceof File || imageSource instanceof Blob) {
                url = URL.createObjectURL(imageSource);
            } else if (typeof imageSource === 'string') {
                url = imageSource;
            } else {
                throw new Error('Tipo de imagem não suportado');
            }

            if (this.imageCache.has(url)) {
                return this.imageCache.get(url);
            }

            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                    this.imageCache.set(url, img);
                    resolve(img);
                };
                img.onerror = () => reject(new Error('Erro ao carregar imagem'));
                img.src = url;
            });
        } catch (error) {
            console.error('Erro ao carregar imagem:', error);
            throw error;
        }
    }

    async generateFrame(image, exifData, frameConfig = {}) {
        try {
            const config = { ...this.config, ...frameConfig };

            let processedImage = image;
            let displayWidth = image.width;
            let displayHeight = image.height;

            if (config.aspectRatio && config.aspectRatio !== 'original') {
                const { width, height } = this.calculateAspectRatioDimensions(
                    image.width,
                    image.height,
                    config.aspectRatio
                );
                displayWidth = width;
                displayHeight = height;
                processedImage = await this.cropImageToAspectRatio(image, displayWidth, displayHeight);
            }

            // CORREÇÃO CRÍTICA: Escala relativa baseada na resolução da imagem.
            // Usamos 1000px como base para que os sliders (0-200) façam sentido.
            const scale = displayWidth / 1000;
            const scaledConfig = {
                ...config,
                frameWidth: config.frameWidth * scale,
                bottomSpacing: config.bottomSpacing * scale,
                textSize: config.textSize * scale
            };

            // Criar canvas com os tamanhos escalados
            const width = displayWidth + (scaledConfig.frameWidth * 2);
            const height = displayHeight + scaledConfig.frameWidth + scaledConfig.bottomSpacing;

            this.canvas = document.createElement('canvas');
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext('2d', { alpha: false });

            // Preencher fundo com cor da moldura
            this.ctx.fillStyle = scaledConfig.frameColor;
            this.ctx.fillRect(0, 0, width, height);

            // Desenhar imagem
            this.ctx.drawImage(
                processedImage,
                scaledConfig.frameWidth,
                scaledConfig.frameWidth,
                displayWidth,
                displayHeight
            );

            // Desenhar EXIF no espaço inferior
            if (Object.keys(exifData).length > 0) {
                this.drawEXIFInfo(exifData, scaledConfig, displayWidth, displayHeight);
            }

            return this.canvas;
        } catch (error) {
            console.error('Erro ao gerar moldura:', error);
            throw error;
        }
    }

    calculateAspectRatioDimensions(originalWidth, originalHeight, aspectRatio) {
        const [ratioWidth, ratioHeight] = aspectRatio.split(':').map(Number);
        const targetRatio = ratioWidth / ratioHeight;
        const currentRatio = originalWidth / originalHeight;

        let newWidth, newHeight;

        if (currentRatio > targetRatio) {
            newHeight = originalHeight;
            newWidth = Math.round(originalHeight * targetRatio);
        } else {
            newWidth = originalWidth;
            newHeight = Math.round(originalWidth / targetRatio);
        }
        return { width: newWidth, height: newHeight };
    }

    async cropImageToAspectRatio(image, targetWidth, targetHeight) {
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = targetWidth;
        cropCanvas.height = targetHeight;
        const cropCtx = cropCanvas.getContext('2d');

        const sourceX = (image.width - targetWidth) / 2;
        const sourceY = (image.height - targetHeight) / 2;

        cropCtx.drawImage(
            image,
            Math.max(0, sourceX),
            Math.max(0, sourceY),
            targetWidth,
            targetHeight,
            0,
            0,
            targetWidth,
            targetHeight
        );

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                resolve(img);
            };
            img.src = cropCanvas.toDataURL();
        });
    }

    drawEXIFInfo(exifData, config, displayWidth, displayHeight) {
        const x = config.frameWidth;
        const y = config.frameWidth + displayHeight;
        const width = displayWidth;
        const height = config.bottomSpacing;

        this.ctx.fillStyle = config.frameColor;
        this.ctx.fillRect(x, y, width, height);

        // Fonte ajustada com o tamanho escalado da câmera
        this.ctx.font = `${config.textSize}px "${config.fontFamily}", -apple-system, sans-serif`;
        this.ctx.fillStyle = config.textColor;
        this.ctx.textBaseline = 'top';

        switch (config.textAlign) {
            case 'center':
                this.ctx.textAlign = 'center';
                this.textX = x + width / 2;
                break;
            case 'right':
                this.ctx.textAlign = 'right';
                this.textX = x + width - (config.textSize);
                break;
            default: // left
                this.ctx.textAlign = 'left';
                this.textX = x + (config.textSize);
        }

        const lines = this.buildEXIFLines(exifData);
        
        // Calcula o espaçamento vertical centralizado no bottomSpacing
        const totalTextHeight = lines.length * (config.textSize * 1.4);
        let textY = y + (height - totalTextHeight) / 2;

        lines.forEach(line => {
            this.ctx.fillText(line, this.textX, textY);
            textY += config.textSize * 1.4; // Altura de linha proporcional
        });
    }

    buildEXIFLines(exifData) {
        const lines = [];

        if (exifData.camera_make) {
            let model = exifData.camera_model || 'Unknown';
            lines.push(`${exifData.camera_make} ${model}`.trim());
        }

        const photoData = [];
        if (exifData.iso) photoData.push(exifData.iso);
        if (exifData.aperture) photoData.push(exifData.aperture);
        if (exifData.shutter) photoData.push(exifData.shutter);
        if (exifData.focal_length) photoData.push(exifData.focal_length);

        if (photoData.length > 0) {
            lines.push(photoData.join(' • '));
        }

        if (exifData.datetime) {
            lines.push(exifData.datetime);
        }

        return lines;
    }

    exportImage(format = 'jpeg', quality = 0.95) {
        if (!this.canvas) throw new Error('Nenhum canvas gerado');

        return new Promise((resolve, reject) => {
            try {
                const mimeType = `image/${format}`;
                this.canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error('Erro export')),
                    mimeType,
                    quality
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    clear() {
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    clearCache() {
        this.imageCache.forEach((_, url) => {
            try {
                if (url.startsWith('blob:')) URL.revokeObjectURL(url);
            } catch (e) {}
        });
        this.imageCache.clear();
    }
}

class PreviewManager {
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

    async updatePreview(image, exifData, config) {
        this.currentImage = image;
        this.currentExifData = exifData;
        this.currentConfig = config;

        if (this.isRendering) {
            this.renderQueue = { image, exifData, config };
            return;
        }

        this.isRendering = true;

        try {
            const framedImage = await this.generator.generateFrame(image, exifData, config);
            this.renderToCanvas(framedImage);

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

    renderToCanvas(framedCanvas) {
        const container = this.canvas.parentElement;
        let displayWidth = this.canvas.clientWidth || container?.clientWidth || 600;
        let displayHeight = this.canvas.clientHeight || container?.clientHeight || 600;

        displayWidth = Math.max(displayWidth, 300);
        displayHeight = Math.max(displayHeight, 300);

        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;

        const scaleX = displayWidth / framedCanvas.width;
        const scaleY = displayHeight / framedCanvas.height;
        // Ajuste no zoom para preencher melhor a visualização
        const scale = Math.min(scaleX, scaleY, 1) * 0.9; 

        const finalScale = scale * this.zoomLevel;
        const finalWidth = framedCanvas.width * finalScale;
        const finalHeight = framedCanvas.height * finalScale;

        const x = (displayWidth - finalWidth) / 2;
        const y = (displayHeight - finalHeight) / 2;

        this.ctx.fillStyle = getComputedStyle(this.canvas).backgroundColor || '#0E0D0B';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Sombreamento para destacar a moldura
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 10;
        
        this.ctx.drawImage(framedCanvas, x, y, finalWidth, finalHeight);
        
        this.ctx.shadowColor = 'transparent';
    }

    setZoom(level) {
        this.zoomLevel = Math.max(0.1, Math.min(level, 3));
        if (this.currentImage) {
            this.updatePreview(this.currentImage, this.currentExifData, this.currentConfig);
        }
    }

    zoomIn() { this.setZoom(this.zoomLevel + 0.1); }
    zoomOut() { this.setZoom(this.zoomLevel - 0.1); }
    resetZoom() { this.setZoom(1); }

    async exportImage(format = 'jpeg', quality = 0.95) {
        return this.generator.exportImage(format, quality);
    }

    destroy() {
        this.generator.clearCache();
    }
}

const frameGenerator = new FrameGenerator();