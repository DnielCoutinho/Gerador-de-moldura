/**
 * ===================================================
 * FRAME STUDIO PRO - UI Manager
 * Gerenciamento de interface profissional
 * ===================================================
 */

class UIManagerPro {
    constructor() {
        this.isDarkMode = true;
        this.toastTimeout = null;
        this.elements = {};
        this.presets = this.createPresets();
        
        this.cacheElements();
        this.setupEventListeners();
        this.renderPresets();
    }

    /**
     * Cache todos os elementos do DOM
     */
    cacheElements() {
        this.elements = {
            // Zones
            uploadZone: document.getElementById('uploadZone'),
            uploadBtn: document.getElementById('uploadBtn'),
            fileInput: document.getElementById('fileInput'),
            
            // Gallery
            gallerySection: document.getElementById('gallerySection'),
            gallery: document.getElementById('gallery'),
            
            // EXIF
            exifSection: document.getElementById('exifSection'),
            exifData: document.getElementById('exifData'),
            
            // Preview
            previewContainer: document.getElementById('previewContainer'),
            emptyState: document.getElementById('emptyState'),
            
            // Canvas
            previewCanvas: document.getElementById('previewCanvas'),
            zoomIn: document.getElementById('zoomIn'),
            zoomOut: document.getElementById('zoomOut'),
            zoomLevel: document.getElementById('zoomLevel'),
            
            // Controls
            presetsContainer: document.getElementById('presetsContainer'),
            ratioButtons: document.getElementById('ratioButtons'),
            
            // Frame
            frameColor: document.getElementById('frameColor'),
            frameWidth: document.getElementById('frameWidth'),
            frameWidthSlider: document.getElementById('frameWidthSlider'),
            frameWidthDecrement: document.getElementById('frameWidthDecrement'),
            frameWidthIncrement: document.getElementById('frameWidthIncrement'),
            
            // Spacing
            bottomSpacing: document.getElementById('bottomSpacing'),
            bottomSpacingSlider: document.getElementById('bottomSpacingSlider'),
            bottomSpacingDecrement: document.getElementById('bottomSpacingDecrement'),
            bottomSpacingIncrement: document.getElementById('bottomSpacingIncrement'),
            
            // Text
            textColor: document.getElementById('textColor'),
            textSize: document.getElementById('textSize'),
            textSizeSlider: document.getElementById('textSizeSlider'),
            textSizeDecrement: document.getElementById('textSizeDecrement'),
            textSizeIncrement: document.getElementById('textSizeIncrement'),
            
            // Alignment
            alignButtons: document.querySelectorAll('.btn-align'),
            
            // Buttons
            exportBtn: document.getElementById('exportBtn'),
            clearGalleryBtn: document.getElementById('clearGalleryBtn'),
            themeToggle: document.getElementById('themeToggle'),
            
            // Notifications
            toast: document.getElementById('toast'),
            loadingOverlay: document.getElementById('loadingOverlay'),
        };
    }

    /**
     * Cria presets disponíveis
     */
    createPresets() {
        return {
            editorial: {
                name: 'Editorial',
                description: 'Profissional e moderno',
                config: {
                    frameColor: '#B48A68',
                    frameWidth: 50,
                    bottomSpacing: 120,
                    textColor: '#FFFFFF',
                    textSize: 14,
                    textAlign: 'center'
                }
            },
            fineart: {
                name: 'Fine Art',
                description: 'Elegante e minimalista',
                config: {
                    frameColor: '#4A4238',
                    frameWidth: 60,
                    bottomSpacing: 150,
                    textColor: '#F5F1EA',
                    textSize: 16,
                    textAlign: 'center'
                }
            },
            wedding: {
                name: 'Wedding',
                description: 'Luxuoso e sofisticado',
                config: {
                    frameColor: '#C89B75',
                    frameWidth: 45,
                    bottomSpacing: 130,
                    textColor: '#FFFFFF',
                    textSize: 13,
                    textAlign: 'center'
                }
            },
            minimal: {
                name: 'Minimal',
                description: 'Simples e clean',
                config: {
                    frameColor: '#2A251F',
                    frameWidth: 20,
                    bottomSpacing: 60,
                    textColor: '#B8AFA5',
                    textSize: 12,
                    textAlign: 'left'
                }
            },
            luxury: {
                name: 'Luxury',
                description: 'Premium e refinado',
                config: {
                    frameColor: '#B48A68',
                    frameWidth: 80,
                    bottomSpacing: 200,
                    textColor: '#FFFFFF',
                    textSize: 15,
                    textAlign: 'center'
                }
            },
            dark: {
                name: 'Dark',
                description: 'Drama e contraste',
                config: {
                    frameColor: '#171411',
                    frameWidth: 40,
                    bottomSpacing: 100,
                    textColor: '#F5F1EA',
                    textSize: 13,
                    textAlign: 'left'
                }
            }
        };
    }

    /**
     * Setup listeners de eventos
     */
    setupEventListeners() {
        // Zoom
        this.elements.zoomIn?.addEventListener('click', () => {
            window.previewManager?.zoomIn();
            this.updateZoomLevel();
        });

        this.elements.zoomOut?.addEventListener('click', () => {
            window.previewManager?.zoomOut();
            this.updateZoomLevel();
        });

        // Aspect Ratio
        document.querySelectorAll('.btn-ratio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-ratio').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.triggerPreviewUpdate();
            });
        });

        // Frame
        this.elements.frameColor?.addEventListener('input', () => this.triggerPreviewUpdate());
        this.elements.frameWidth?.addEventListener('input', (e) => {
            this.elements.frameWidthSlider.value = e.target.value;
            this.triggerPreviewUpdate();
        });
        this.elements.frameWidthSlider?.addEventListener('input', (e) => {
            this.elements.frameWidth.value = e.target.value;
            this.triggerPreviewUpdate();
        });
        this.elements.frameWidthDecrement?.addEventListener('click', () => {
            const val = Math.max(0, parseInt(this.elements.frameWidth.value) - 5);
            this.elements.frameWidth.value = val;
            this.elements.frameWidthSlider.value = val;
            this.triggerPreviewUpdate();
        });
        this.elements.frameWidthIncrement?.addEventListener('click', () => {
            const val = Math.min(200, parseInt(this.elements.frameWidth.value) + 5);
            this.elements.frameWidth.value = val;
            this.elements.frameWidthSlider.value = val;
            this.triggerPreviewUpdate();
        });

        // Bottom Spacing
        this.elements.bottomSpacing?.addEventListener('input', (e) => {
            this.elements.bottomSpacingSlider.value = e.target.value;
            this.triggerPreviewUpdate();
        });
        this.elements.bottomSpacingSlider?.addEventListener('input', (e) => {
            this.elements.bottomSpacing.value = e.target.value;
            this.triggerPreviewUpdate();
        });
        this.elements.bottomSpacingDecrement?.addEventListener('click', () => {
            const val = Math.max(0, parseInt(this.elements.bottomSpacing.value) - 10);
            this.elements.bottomSpacing.value = val;
            this.elements.bottomSpacingSlider.value = val;
            this.triggerPreviewUpdate();
        });
        this.elements.bottomSpacingIncrement?.addEventListener('click', () => {
            const val = Math.min(300, parseInt(this.elements.bottomSpacing.value) + 10);
            this.elements.bottomSpacing.value = val;
            this.elements.bottomSpacingSlider.value = val;
            this.triggerPreviewUpdate();
        });

        // Text
        this.elements.textColor?.addEventListener('input', () => this.triggerPreviewUpdate());
        this.elements.textSize?.addEventListener('input', (e) => {
            this.elements.textSizeSlider.value = e.target.value;
            this.triggerPreviewUpdate();
        });
        this.elements.textSizeSlider?.addEventListener('input', (e) => {
            this.elements.textSize.value = e.target.value;
            this.triggerPreviewUpdate();
        });
        this.elements.textSizeDecrement?.addEventListener('click', () => {
            const val = Math.max(8, parseInt(this.elements.textSize.value) - 2);
            this.elements.textSize.value = val;
            this.elements.textSizeSlider.value = val;
            this.triggerPreviewUpdate();
        });
        this.elements.textSizeIncrement?.addEventListener('click', () => {
            const val = Math.min(32, parseInt(this.elements.textSize.value) + 2);
            this.elements.textSize.value = val;
            this.elements.textSizeSlider.value = val;
            this.triggerPreviewUpdate();
        });

        // Alignment
        this.elements.alignButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.alignButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.triggerPreviewUpdate();
            });
        });

        // Theme
        this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
    }

    /**
     * Renderiza presets
     */
    renderPresets() {
        if (!this.elements.presetsContainer) return;
        
        this.elements.presetsContainer.innerHTML = '';
        
        Object.entries(this.presets).forEach(([key, preset]) => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <div class="preset-card__name">${preset.name}</div>
                <div class="preset-card__desc">${preset.description}</div>
                <div class="preset-card__preview"></div>
            `;
            
            card.addEventListener('click', () => this.applyPreset(preset));
            this.elements.presetsContainer.appendChild(card);
        });
    }

    /**
     * Aplica preset
     */
    applyPreset(preset) {
        const config = preset.config;
        
        if (this.elements.frameColor) this.elements.frameColor.value = config.frameColor;
        if (this.elements.frameWidth) {
            this.elements.frameWidth.value = config.frameWidth;
            this.elements.frameWidthSlider.value = config.frameWidth;
        }
        if (this.elements.bottomSpacing) {
            this.elements.bottomSpacing.value = config.bottomSpacing;
            this.elements.bottomSpacingSlider.value = config.bottomSpacing;
        }
        if (this.elements.textColor) this.elements.textColor.value = config.textColor;
        if (this.elements.textSize) {
            this.elements.textSize.value = config.textSize;
            this.elements.textSizeSlider.value = config.textSize;
        }
        
        // Atualizar alignment
        this.elements.alignButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.align === config.textAlign) {
                btn.classList.add('active');
            }
        });
        
        this.triggerPreviewUpdate();
    }

    /**
     * Obtém configuração atual
     */
    getConfig() {
        const align = document.querySelector('.btn-align.active')?.dataset.align || 'left';
        const ratio = document.querySelector('.btn-ratio.active')?.dataset.ratio || 'original';
        
        return {
            frameColor: this.elements.frameColor?.value || '#B48A68',
            frameWidth: parseInt(this.elements.frameWidth?.value || '40'),
            bottomSpacing: parseInt(this.elements.bottomSpacing?.value || '100'),
            textColor: this.elements.textColor?.value || '#FFFFFF',
            textSize: parseInt(this.elements.textSize?.value || '14'),
            textAlign: align,
            aspectRatio: ratio
        };
    }

    /**
     * Dispara atualização de preview (com debounce)
     */
    triggerPreviewUpdate() {
        if (window.updatePreviewTimeout) {
            clearTimeout(window.updatePreviewTimeout);
        }
        
        window.updatePreviewTimeout = setTimeout(() => {
            if (window.app) {
                window.app.updatePreview();
            }
        }, 100);
    }

    /**
     * Adiciona imagem à galeria
     */
    addImageToGallery(file, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = index;

        const reader = new FileReader();
        reader.onload = (e) => {
            item.style.backgroundImage = `url(${e.target.result})`;
        };
        reader.readAsDataURL(file);

        item.addEventListener('click', () => {
            if (window.app) {
                window.app.selectImage(index);
            }
        });

        this.elements.gallery?.appendChild(item);
    }

    /**
     * Remove imagem da galeria
     */
    removeImageFromGallery(index) {
        const items = this.elements.gallery?.querySelectorAll('.gallery-item');
        items?.[index]?.remove();
    }

    /**
     * Limpa galeria
     */
    clearGallery() {
        this.elements.gallery.innerHTML = '';
    }

    /**
     * Define imagem ativa
     */
    setActiveImage(index) {
        const items = this.elements.gallery?.querySelectorAll('.gallery-item');
        items?.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Exibe EXIF
     */
    displayEXIF(exifData) {
        if (!this.elements.exifData) return;
        
        this.elements.exifData.innerHTML = '';
        
        if (exifData.empty) {
            const p = document.createElement('p');
            p.className = 'exif-empty';
            p.textContent = exifData.message;
            this.elements.exifData.appendChild(p);
            return;
        }

        const fieldsToShow = ['camera_make', 'camera_model', 'iso', 'aperture', 'shutter', 'focal_length', 'datetime'];
        
        fieldsToShow.forEach(field => {
            if (exifData[field]) {
                const item = document.createElement('div');
                item.className = 'exif-item';
                
                const label = document.createElement('div');
                label.className = 'exif-item__label';
                label.textContent = field.toUpperCase();
                
                const value = document.createElement('div');
                value.className = 'exif-item__value';
                value.textContent = exifData[field];
                
                item.appendChild(label);
                item.appendChild(value);
                this.elements.exifData.appendChild(item);
            }
        });
    }

    /**
     * Mostra galeria
     */
    showGallery() {
        if (this.elements.gallerySection) {
            this.elements.gallerySection.style.display = '';
        }
    }

    /**
     * Esconde galeria
     */
    hideGallery() {
        if (this.elements.gallerySection) {
            this.elements.gallerySection.style.display = 'none';
        }
    }

    /**
     * Mostra preview
     */
    showPreview() {
        if (this.elements.previewContainer) {
            this.elements.previewContainer.style.display = '';
        }
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'none';
        }
        if (this.elements.exifSection) {
            this.elements.exifSection.style.display = '';
        }
    }

    /**
     * Esconde preview
     */
    hidePreview() {
        if (this.elements.previewContainer) {
            this.elements.previewContainer.style.display = 'none';
        }
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = '';
        }
        if (this.elements.exifSection) {
            this.elements.exifSection.style.display = 'none';
        }
    }

    /**
     * Atualiza nível de zoom
     */
    updateZoomLevel() {
        if (this.elements.zoomLevel && window.previewManager) {
            const percent = Math.round(window.previewManager.zoomLevel * 100);
            this.elements.zoomLevel.textContent = `${percent}%`;
        }
    }

    /**
     * Exibe toast
     */
    toast(message, type = 'default') {
        if (!this.elements.toast) return;
        
        this.elements.toast.textContent = message;
        this.elements.toast.className = `toast show ${type}`;
        
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        
        this.toastTimeout = setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Mostra loading
     */
    showLoading(show) {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = show ? '' : 'none';
        }
    }

    /**
     * Exibe confirmação
     */
    showConfirmation(title, message, callback) {
        if (confirm(`${title}\n\n${message}`)) {
            callback();
        }
    }

    /**
     * Toggle tema
     */
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
}
