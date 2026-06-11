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

    cacheElements() {
        this.elements = {
            uploadZone: document.getElementById('uploadZone'),
            uploadBtn: document.getElementById('uploadBtn'),
            fileInput: document.getElementById('fileInput'),
            gallerySection: document.getElementById('gallerySection'),
            gallery: document.getElementById('gallery'),
            exifSection: document.getElementById('exifSection'),
            exifData: document.getElementById('exifData'),
            previewContainer: document.getElementById('previewContainer'),
            emptyState: document.getElementById('emptyState'),
            previewCanvas: document.getElementById('previewCanvas'),
            zoomIn: document.getElementById('zoomIn'),
            zoomOut: document.getElementById('zoomOut'),
            zoomLevel: document.getElementById('zoomLevel'),
            presetsContainer: document.getElementById('presetsContainer'),
            ratioButtons: document.getElementById('ratioButtons'),
            frameColor: document.getElementById('frameColor'),
            frameWidth: document.getElementById('frameWidth'),
            frameWidthSlider: document.getElementById('frameWidthSlider'),
            frameWidthDecrement: document.getElementById('frameWidthDecrement'),
            frameWidthIncrement: document.getElementById('frameWidthIncrement'),
            bottomSpacing: document.getElementById('bottomSpacing'),
            bottomSpacingSlider: document.getElementById('bottomSpacingSlider'),
            bottomSpacingDecrement: document.getElementById('bottomSpacingDecrement'),
            bottomSpacingIncrement: document.getElementById('bottomSpacingIncrement'),
            textColor: document.getElementById('textColor'),
            fontFamily: document.getElementById('fontFamily'),
            textSize: document.getElementById('textSize'),
            textSizeSlider: document.getElementById('textSizeSlider'),
            textSizeDecrement: document.getElementById('textSizeDecrement'),
            textSizeIncrement: document.getElementById('textSizeIncrement'),
            alignButtons: document.querySelectorAll('.btn-align'),
            exportBtn: document.getElementById('exportBtn'),
            clearGalleryBtn: document.getElementById('clearGalleryBtn'),
            themeToggle: document.getElementById('themeToggle'),
            toast: document.getElementById('toast'),
            loadingOverlay: document.getElementById('loadingOverlay'),
        };
    }

    createPresets() {
        return {
            editorial: {
                name: 'Editorial',
                description: 'Profissional e moderno',
                config: {
                    frameColor: '#FFFFFF',
                    frameWidth: 50,
                    bottomSpacing: 120,
                    textColor: '#000000',
                    textSize: 24,
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
                    textSize: 24,
                    textAlign: 'center'
                }
            },
            minimal: {
                name: 'Minimal',
                description: 'Simples e clean',
                config: {
                    frameColor: '#FFFFFF',
                    frameWidth: 20,
                    bottomSpacing: 60,
                    textColor: '#1A1A1A',
                    textSize: 20,
                    textAlign: 'left'
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
                    textSize: 24,
                    textAlign: 'left'
                }
            }
        };
    }

    setupEventListeners() {
        this.elements.zoomIn?.addEventListener('click', () => {
            window.previewManager?.zoomIn();
            this.updateZoomLevel();
        });

        this.elements.zoomOut?.addEventListener('click', () => {
            window.previewManager?.zoomOut();
            this.updateZoomLevel();
        });

        document.querySelectorAll('.btn-ratio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-ratio').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.triggerPreviewUpdate();
            });
        });

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

        this.elements.textColor?.addEventListener('input', () => this.triggerPreviewUpdate());
        this.elements.fontFamily?.addEventListener('change', () => this.triggerPreviewUpdate());

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
            const val = Math.min(48, parseInt(this.elements.textSize.value) + 2);
            this.elements.textSize.value = val;
            this.elements.textSizeSlider.value = val;
            this.triggerPreviewUpdate();
        });

        this.elements.alignButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.alignButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.triggerPreviewUpdate();
            });
        });

        this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
    }

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
        if (this.elements.fontFamily && config.fontFamily) this.elements.fontFamily.value = config.fontFamily;
        if (this.elements.textSize) {
            this.elements.textSize.value = config.textSize;
            this.elements.textSizeSlider.value = config.textSize;
        }
        
        this.elements.alignButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.align === config.textAlign) {
                btn.classList.add('active');
            }
        });
        
        this.triggerPreviewUpdate();
    }

    getConfig() {
        const align = document.querySelector('.btn-align.active')?.dataset.align || 'center';
        const ratio = document.querySelector('.btn-ratio.active')?.dataset.ratio || 'original';
        
        return {
            frameColor: this.elements.frameColor?.value || '#FFFFFF',
            frameWidth: parseInt(this.elements.frameWidth?.value || '40'),
            bottomSpacing: parseInt(this.elements.bottomSpacing?.value || '100'),
            textColor: this.elements.textColor?.value || '#000000',
            fontFamily: this.elements.fontFamily?.value || 'Courier New',
            textSize: parseInt(this.elements.textSize?.value || '24'),
            textAlign: align,
            aspectRatio: ratio
        };
    }

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

    removeImageFromGallery(index) {
        const items = this.elements.gallery?.querySelectorAll('.gallery-item');
        items?.[index]?.remove();
    }

    clearGallery() {
        this.elements.gallery.innerHTML = '';
    }

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

    showGallery() {
        if (this.elements.gallerySection) this.elements.gallerySection.style.display = '';
    }

    hideGallery() {
        if (this.elements.gallerySection) this.elements.gallerySection.style.display = 'none';
    }

    showPreview() {
        if (this.elements.previewContainer) this.elements.previewContainer.style.display = '';
        if (this.elements.emptyState) this.elements.emptyState.style.display = 'none';
        if (this.elements.exifSection) this.elements.exifSection.style.display = '';
    }

    hidePreview() {
        if (this.elements.previewContainer) this.elements.previewContainer.style.display = 'none';
        if (this.elements.emptyState) this.elements.emptyState.style.display = '';
        if (this.elements.exifSection) this.elements.exifSection.style.display = 'none';
    }

    updateZoomLevel() {
        if (this.elements.zoomLevel && window.previewManager) {
            const percent = Math.round(window.previewManager.zoomLevel * 100);
            this.elements.zoomLevel.textContent = `${percent}%`;
        }
    }

    toast(message, type = 'default') {
        if (!this.elements.toast) return;
        
        this.elements.toast.textContent = message;
        this.elements.toast.className = `toast show ${type}`;
        
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }

    showLoading(show) {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = show ? '' : 'none';
        }
    }

    showConfirmation(title, message, callback) {
        if (confirm(`${title}\n\n${message}`)) {
            callback();
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
}