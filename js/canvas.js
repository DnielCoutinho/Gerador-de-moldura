/**
 * =====================================================
 * FRAME STUDIO - CANVAS.JS (Versão Otimizada V5 - Idêntica)
 * =====================================================
 */

class FrameGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.imageCache = new Map();
        
        // Padrões atualizados: Fundo branco e texto um pouco maior
        this.config = {
            frameColor: '#FFFFFF',
            textColor: '#000000',
            frameWidth: 40,
            bottomSpacing: 100,
            fontFamily: 'Courier New',
            textSize: 28, 
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

        if (config.isPreview) {
            const maxPreviewSize = 1000;
            if (displayWidth > maxPreviewSize || displayHeight > maxPreviewSize) {
                const ratio = Math.min(maxPreviewSize / displayWidth, maxPreviewSize / displayHeight);
                displayWidth = Math.round(displayWidth * ratio);
                displayHeight = Math.round(displayHeight * ratio);
            }
        }

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

        this.ctx.fillStyle = scaledConfig.frameColor;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.drawImage(image, scaledConfig.frameWidth, scaledConfig.frameWidth, displayWidth, displayHeight);

        if (Object.keys(exifData).length > 0) {
            this.drawEXIFInfo(exifData, scaledConfig, displayWidth, displayHeight);
        }

        return this.canvas;
    }

    getLighterColor(hex, opacity) {
        let r = 0, g = 0, b = 0;
        if (hex.startsWith('#')) {
            let cleanHex = hex.replace('#', '');
            if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
            if (cleanHex.length === 6) {
                r = parseInt(cleanHex.substring(0, 2), 16);
                g = parseInt(cleanHex.substring(2, 4), 16);
                b = parseInt(cleanHex.substring(4, 6), 16);
            }
        }
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    drawEXIFInfo(exifData, config, displayWidth, displayHeight) {
        const x = config.frameWidth;
        const y = config.frameWidth + displayHeight;
        const height = config.bottomSpacing;

        this.ctx.textBaseline = 'middle';
        const lines = this.buildEXIFLines(exifData);
        
        this.textX = x + (displayWidth / 2);
        if (config.textAlign === 'right') this.textX = x + displayWidth - config.textSize;
        if (config.textAlign === 'left') this.textX = x + config.textSize;

        const centerY = y + (height / 2);

        // Linha 1: Shot on Câmera (Fino + Negrito)
        if (lines[0]) {
            const { prefix, boldText } = lines[0];
            
            const normalFont = `normal ${config.textSize}px "${config.fontFamily}", monospace, sans-serif`;
            const boldFont = `bold ${config.textSize}px "${config.fontFamily}", monospace, sans-serif`;
            
            this.ctx.font = normalFont;
            const prefixWidth = this.ctx.measureText(prefix).width;
            
            this.ctx.font = boldFont;
            const boldWidth = this.ctx.measureText(boldText).width;
            
            const totalWidth = prefixWidth + boldWidth;
            
            let startX = this.textX;
            if (config.textAlign === 'center') {
                startX = this.textX - (totalWidth / 2);
                this.ctx.textAlign = 'left'; 
            } else if (config.textAlign === 'right') {
                startX = this.textX - totalWidth;
                this.ctx.textAlign = 'left';
            } else {
                this.ctx.textAlign = 'left';
            }
            
            this.ctx.fillStyle = config.textColor;
            this.ctx.font = normalFont;
            this.ctx.fillText(prefix, startX, centerY - (config.textSize * 0.4));
            
            this.ctx.font = boldFont;
            this.ctx.fillText(boldText, startX + prefixWidth, centerY - (config.textSize * 0.4));
            
            this.ctx.textAlign = config.textAlign; 
        }

        // Linha 2: Lente e Fotometria (Cinza translúcido, sem data)
        if (lines[1]) {
            this.ctx.font = `normal ${config.textSize * 0.75}px "${config.fontFamily}", monospace, sans-serif`;
            this.ctx.fillStyle = this.getLighterColor(config.textColor, 0.45); // 45% opacidade igual a referência
            this.ctx.fillText(lines[1], this.textX, centerY + (config.textSize * 0.8));
        }
    }

    buildEXIFLines(exifData) {
        const lines = [];

        // 1. Câmera
        if (exifData.camera_make || exifData.camera_model) {
            let make = (exifData.camera_make || '').trim();
            let model = (exifData.camera_model || '').trim();
            
            let cameraName = model;
            // Remove o bug da câmera duplicada (Canon Canon EOS R100)
            if (make && !model.toLowerCase().includes(make.toLowerCase())) {
                cameraName = `${make} ${model}`;
            }
            
            lines.push({ prefix: 'Shot on ', boldText: cameraName });
        } else {
            lines.push(null);
        }

        // 2. Configurações Fotográficas
        const photoData = [];
        if (exifData.focal_length) photoData.push(exifData.focal_length);
        if (exifData.aperture) photoData.push(exifData.aperture);
        if (exifData.shutter) photoData.push(exifData.shutter);
        if (exifData.iso) photoData.push(exifData.iso);

        if (photoData.length > 0) {
            // Une com quatro espaços vazios para dar o visual retrô limpo da máquina de escrever
            lines.push(photoData.join('    '));
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
        const scale = Math.min(scaleX, scaleY, 1) * 1.0; 
        const finalScale = scale * this.zoomLevel;

        const finalWidth = framedCanvas.width * finalScale;
        const finalHeight = framedCanvas.height * finalScale;

        const x = (displayWidth - finalWidth) / 2;
        const y = (displayHeight - finalHeight) / 2;

        this.ctx.fillStyle = getComputedStyle(this.canvas).backgroundColor || '#0E0D0B';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
    
    async exportImage(image, exifData, config, format = 'jpeg', quality = 0.95) {
        await this.generator.generateFrame(image, exifData, { ...config, isPreview: false });
        return this.generator.exportImage(format, parseFloat(quality));
    }
}