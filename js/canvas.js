/**
 * =====================================================
 * FRAME STUDIO - CANVAS.JS (Versão Otimizada V3)
 * =====================================================
 */

class FrameGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.imageCache = new Map();
        
        this.config = {
            frameColor: '#FFFFFF',
            textColor: '#000000',
            frameWidth: 40,
            bottomSpacing: 100,
            fontFamily: 'Courier New',
            textSize: 14,
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            isPreview: false
        };
    }

    async loadImage(imageSource) {
        try {
            let url = (imageSource instanceof File || imageSource instanceof Blob) 
                ? URL.createObjectURL(imageSource) 
                : imageSource;

            if (this.imageCache.has(url)) return this.imageCache.get(url);

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
            throw error;
        }
    }

    async generateFrame(image, exifData, frameConfig = {}) {
        const config = { ...this.config, ...frameConfig };
        let displayWidth = image.width;
        let displayHeight = image.height;

        // CORREÇÃO DE PERFORMANCE: Se for pré-visualização, reduzimos a resolução base para parar de travar
        if (config.isPreview) {
            const maxPreviewSize = 1000; // Resolução suficiente para a tela, mas 10x mais rápida
            if (displayWidth > maxPreviewSize || displayHeight > maxPreviewSize) {
                const ratio = Math.min(maxPreviewSize / displayWidth, maxPreviewSize / displayHeight);
                displayWidth = Math.round(displayWidth * ratio);
                displayHeight = Math.round(displayHeight * ratio);
            }
        }

        // CORREÇÃO: Escala relativa baseada na largura (garante que texto e borda apareçam)
        const scale = displayWidth / 1000;
        const scaledConfig = {
            ...config,
            frameWidth: config.frameWidth * scale,
            bottomSpacing: config.bottomSpacing * scale,
            textSize: config.textSize * scale
        };

        const width = displayWidth + (scaledConfig.frameWidth * 2);
        const height = displayHeight + scaledConfig.frameWidth + scaledConfig.bottomSpacing;

        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        // Desenhar Fundo
        this.ctx.fillStyle = scaledConfig.frameColor;
        this.ctx.fillRect(0, 0, width, height);

        // Desenhar Foto
        this.ctx.drawImage(image, scaledConfig.frameWidth, scaledConfig.frameWidth, displayWidth, displayHeight);

        // Desenhar Textos EXIF
        if (Object.keys(exifData).length > 0) {
            this.drawEXIFInfo(exifData, scaledConfig, displayWidth, displayHeight);
        }

        return this.canvas;
    }

    drawEXIFInfo(exifData, config, displayWidth, displayHeight) {
        const x = config.frameWidth;
        const y = config.frameWidth + displayHeight;
        const height = config.bottomSpacing;

        this.ctx.fillStyle = config.textColor;
        this.ctx.textBaseline = 'middle';

        // Definir Posição X pelo Alinhamento
        if (config.textAlign === 'center') {
            this.ctx.textAlign = 'center';
            this.textX = x + displayWidth / 2;
        } else if (config.textAlign === 'right') {
            this.ctx.textAlign = 'right';
            this.textX = x + displayWidth - config.textSize;
        } else {
            this.ctx.textAlign = 'left';
            this.textX = x + config.textSize;
        }

        const lines = this.buildEXIFLines(exifData);
        
        // Desenhar "Shot on Câmera" (Linha 1 - Bold)
        if (lines[0]) {
            this.ctx.font = `bold ${config.textSize}px "${config.fontFamily}", monospace, sans-serif`;
            this.ctx.fillText(lines[0], this.textX, y + (height * 0.4));
        }

        // Desenhar "50mm  f/1.8  1/200s  ISO100" (Linha 2 - Normal)
        if (lines[1]) {
            this.ctx.font = `normal ${config.textSize * 0.85}px "${config.fontFamily}", monospace, sans-serif`;
            this.ctx.fillText(lines[1], this.textX, y + (height * 0.65));
        }
    }

    buildEXIFLines(exifData) {
        const lines = [];

        // FORMATO IDÊNTICO AO EXEMPLO 3
        // Linha 1: Shot on Canon EOS R100
        if (exifData.camera_make || exifData.camera_model) {
            let make = exifData.camera_make || '';
            let model = exifData.camera_model || '';
            let cameraName = model.startsWith(make) ? model : `${make} ${model}`;
            lines.push(`Shot on ${cameraName}`.trim());
        }

        // Linha 2: 35mm    f/4.0    1/1000s    ISO100
        const photoData = [];
        if (exifData.focal_length) photoData.push(exifData.focal_length);
        if (exifData.aperture) photoData.push(exifData.aperture);
        if (exifData.shutter) photoData.push(exifData.shutter);
        if (exifData.iso) photoData.push(exifData.iso);

        if (photoData.length > 0) {
            lines.push(photoData.join('    ')); // Quatro espaços para dar o visual retrô limpo
        }

        return lines;
    }

    exportImage(format = 'jpeg', quality = 0.95) {
        if (!this.canvas) throw new Error('Nenhum canvas gerado');
        return new Promise((resolve, reject) => {
            this.canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Erro')), `image/${format}`, quality);
        });
    }

    clearCache() {
        this.imageCache.clear();
    }
}

class PreviewManager {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.generator = new FrameGenerator();
        this.zoomLevel = 1;
        this.isRendering = false;
        this.renderQueue = null;
    }

    async updatePreview(image, exifData, config) {
        if (this.isRendering) {
            this.renderQueue = { image, exifData, config };
            return;
        }
        this.isRendering = true;

        try {
            // Passa a flag de pré-visualização para não travar o PC
            const framedImage = await this.generator.generateFrame(image, exifData, { ...config, isPreview: true });
            this.renderToCanvas(framedImage);

            if (this.renderQueue) {
                const queue = this.renderQueue;
                this.renderQueue = null;
                await this.updatePreview(queue.image, queue.exifData, queue.config);
            }
        } finally {
            this.isRendering = false;
        }
    }

    renderToCanvas(framedCanvas) {
        const container = this.canvas.parentElement;
        let displayWidth = container?.clientWidth || 600;
        let displayHeight = container?.clientHeight || 600;

        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;

        const scaleX = displayWidth / framedCanvas.width;
        const scaleY = displayHeight / framedCanvas.height;
        
        // CORREÇÃO DE DISTÂNCIA: Mudado de 0.9 para 1.0 para a imagem ocupar todo o espaço possível
        const scale = Math.min(scaleX, scaleY, 1) * 1.0; 
        const finalScale = scale * this.zoomLevel;

        const finalWidth = framedCanvas.width * finalScale;
        const finalHeight = framedCanvas.height * finalScale;

        const x = (displayWidth - finalWidth) / 2;
        const y = (displayHeight - finalHeight) / 2;

        this.ctx.fillStyle = getComputedStyle(this.canvas).backgroundColor || '#0E0D0B';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Sombra suave para separar do fundo
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 5;
        this.ctx.drawImage(framedCanvas, x, y, finalWidth, finalHeight);
        this.ctx.shadowColor = 'transparent';
    }

    setZoom(level) {
        this.zoomLevel = Math.max(0.1, Math.min(level, 3));
        if (window.app) window.app.updatePreview();
    }

    zoomIn() { this.setZoom(this.zoomLevel + 0.1); }
    zoomOut() { this.setZoom(this.zoomLevel - 0.1); }
    
    // O exportImage daqui vai pedir para o gerador rodar sem a tag isPreview
    async exportImage(image, exifData, config, format = 'jpeg', quality = 0.95) {
        // Gera o quadro na resolução original MÁXIMA
        await this.generator.generateFrame(image, exifData, { ...config, isPreview: false });
        return this.generator.exportImage(format, parseFloat(quality));
    }
}