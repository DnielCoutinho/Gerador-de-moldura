/**
 * =====================================================
 * FRAME STUDIO - UI.JS
 * Gerenciamento da interface de usuário
 * =====================================================
 */

class UIManager {
    /**
     * Construtor do gerenciador de UI
     */
    constructor() {
        this.elements = {};
        this.toastTimeout = null;
        this.isDarkMode = this.detectDarkMode();
        this.initialize();
    }

    /**
     * Inicializa elementos da UI
     * @private
     */
    initialize() {
        // Elementos principais
        this.elements = {
            // Upload
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            gallery: document.getElementById('gallery'),
            galleryGrid: document.getElementById('galleryGrid'),
            clearGalleryBtn: document.getElementById('clearGallery'),

            // Preview
            previewCard: document.getElementById('previewCard'),
            previewCanvas: document.getElementById('previewCanvas'),
            zoomIn: document.getElementById('zoomIn'),
            zoomOut: document.getElementById('zoomOut'),
            zoomLevel: document.getElementById('zoomLevel'),

            // EXIF
            exifInfo: document.getElementById('exifInfo'),
            exifGrid: document.getElementById('exifGrid'),
            exifEmpty: document.getElementById('exifEmpty'),

            // Editor
            editorPanel: document.getElementById('editorPanel'),
            editorContent: document.getElementById('editorContent'),
            toggleEditor: document.getElementById('toggleEditor'),
            
            // Editor Controls
            frameColor: document.getElementById('frameColor'),
            frameWidth: document.getElementById('frameWidth'),
            frameWidthValue: document.getElementById('frameWidthValue'),
            bottomSpacing: document.getElementById('bottomSpacing'),
            bottomSpacingValue: document.getElementById('bottomSpacingValue'),
            textColor: document.getElementById('textColor'),
            fontFamily: document.getElementById('fontFamily'),
            textSize: document.getElementById('textSize'),
            textSizeValue: document.getElementById('textSizeValue'),
            presetsGrid: document.getElementById('presetsGrid'),
            exportBtn: document.getElementById('exportBtn'),

            // Toast e Loading
            toast: document.getElementById('toast'),
            loadingSpinner: document.getElementById('loadingSpinner'),

            // Theme
            themeToggle: document.getElementById('themeToggle')
        };

        // Presets disponíveis
        this.presets = {
            minimal: {
                name: 'Minimal',
                description: 'Limpo e moderno',
                config: {
                    frameColor: '#F5F1EA',
                    frameWidth: 20,
                    bottomSpacing: 60,
                    textSize: 12,
                    textAlign: 'left',
                    textColor: '#1A1A1A',
                    fontFamily: 'Poppins'
                }
            },
            editorial: {
                name: 'Editorial',
                description: 'Profissional',
                config: {
                    frameColor: '#DCCBB3',
                    frameWidth: 50,
                    bottomSpacing: 120,
                    textSize: 14,
                    textAlign: 'center',
                    textColor: '#6B4F3A',
                    fontFamily: 'Cormorant Garamond'
                }
            },
            fineart: {
                name: 'Fine Art',
                description: 'Elegante',
                config: {
                    frameColor: '#6B4F3A',
                    frameWidth: 60,
                    bottomSpacing: 150,
                    textSize: 16,
                    textAlign: 'center',
                    textColor: '#F5F1EA',
                    fontFamily: 'Cormorant Garamond'
                }
            },
            wedding: {
                name: 'Wedding',
                description: 'Luxuoso',
                config: {
                    frameColor: '#B66A50',
                    frameWidth: 45,
                    bottomSpacing: 130,
                    textSize: 13,
                    textAlign: 'center',
                    textColor: '#FFFFFF',
                    fontFamily: 'Cormorant Garamond'
                }
            },
            dark: {
                name: 'Dark',
                description: 'Dramático',
                config: {
                    frameColor: '#1A1A1A',
                    frameWidth: 40,
                    bottomSpacing: 100,
                    textSize: 13,
                    textAlign: 'left',
                    textColor: '#F5F1EA',
                    fontFamily: 'Poppins'
                }
            },
            luxury: {
                name: 'Luxury',
                description: 'Premium',
                config: {
                    frameColor: '#DCCBB3',
                    frameWidth: 80,
                    bottomSpacing: 200,
                    textSize: 15,
                    textAlign: 'center',
                    textColor: '#6B4F3A',
                    fontFamily: 'Georgia'
                }
            }
        };

        this.currentPreset = null;
        this.setupEventListeners();
        this.renderPresets();
        this.updateTheme();
    }

    /**
     * Configura event listeners
     * @private
     */
    setupEventListeners() {
        // Upload
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('dragover');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('dragover');
        });

        // Gallery
        this.elements.clearGalleryBtn?.addEventListener('click', () => {
            this.showConfirmation('Limpar galeria?', 'Todas as imagens serão removidas.', () => {
                this.clearGallery();
            });
        });

        // Zoom
        this.elements.zoomIn?.addEventListener('click', () => {
            if (window.previewManager) {
                window.previewManager.zoomIn();
                this.updateZoomLevel();
            }
        });

        this.elements.zoomOut?.addEventListener('click', () => {
            if (window.previewManager) {
                window.previewManager.zoomOut();
                this.updateZoomLevel();
            }
        });

        // Editor
        this.elements.toggleEditor?.addEventListener('click', () => {
            this.elements.editorContent.style.display = 
                this.elements.editorContent.style.display === 'none' ? 'flex' : 'none';
        });

        // Controles do Editor
        if (this.elements.frameColor) {
            this.elements.frameColor.addEventListener('input', () => {
                this.currentPreset = null;
                this.updateAllPresets();
                this.triggerPreviewUpdate();
            });
        }

        if (this.elements.frameWidth) {
            this.elements.frameWidth.addEventListener('input', (e) => {
                this.elements.frameWidthValue.textContent = e.target.value;
                this.currentPreset = null;
                this.updateAllPresets();
                this.triggerPreviewUpdate();
            });
        }

        if (this.elements.bottomSpacing) {
            this.elements.bottomSpacing.addEventListener('input', (e) => {
                this.elements.bottomSpacingValue.textContent = e.target.value;
                this.currentPreset = null;
                this.updateAllPresets();
                this.triggerPreviewUpdate();
            });
        }

        if (this.elements.textColor) {
            this.elements.textColor.addEventListener('input', () => {
                this.currentPreset = null;
                this.updateAllPresets();
                this.triggerPreviewUpdate();
            });
        }

        if (this.elements.textSize) {
            this.elements.textSize.addEventListener('input', (e) => {
                this.elements.textSizeValue.textContent = e.target.value;
                this.currentPreset = null;
                this.updateAllPresets();
                this.triggerPreviewUpdate();
            });
        }

        if (this.elements.fontFamily) {
            this.elements.fontFamily.addEventListener('change', () => {
                this.currentPreset = null;
                this.updateAllPresets();
                this.triggerPreviewUpdate();
            });
        }

        // Alignment buttons
        document.querySelectorAll('.btn-alignment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-alignment').forEach(b => b.classList.remove('active'));
                e.target.closest('.btn-alignment')?.classList.add('active');
                this.currentPreset = null;
                this.updateAllPresets();
                this.triggerPreviewUpdate();
            });
        });

        // Aspect Ratio buttons
        document.querySelectorAll('.btn-aspect-ratio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-aspect-ratio').forEach(b => b.classList.remove('active'));
                const button = e.target.closest('.btn-aspect-ratio');
                button?.classList.add('active');
                this.currentPreset = null;
                this.updateAllPresets();
                this.triggerPreviewUpdate();
            });
        });

        // Export
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => {
                this.handleExport();
            });
        }

        // Theme
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }
    }

    /**
     * Renderiza presets
     * @private
     */
    renderPresets() {
        this.elements.presetsGrid.innerHTML = '';

        Object.entries(this.presets).forEach(([key, preset]) => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.innerHTML = `
                <div class="preset-btn__name">${preset.name}</div>
                <div class="preset-btn__desc">${preset.description}</div>
            `;

            btn.addEventListener('click', () => {
                this.applyPreset(key, preset);
            });

            this.elements.presetsGrid.appendChild(btn);
        });
    }

    /**
     * Aplica preset
     * @param {string} presetKey - Chave do preset
     * @param {Object} preset - Objeto do preset
     */
    applyPreset(presetKey, preset) {
        this.currentPreset = presetKey;

        // Atualizar todos os controles
        this.elements.frameColor.value = preset.config.frameColor;
        this.elements.frameWidth.value = preset.config.frameWidth;
        this.elements.frameWidthValue.textContent = preset.config.frameWidth;
        this.elements.bottomSpacing.value = preset.config.bottomSpacing;
        this.elements.bottomSpacingValue.textContent = preset.config.bottomSpacing;
        this.elements.textColor.value = preset.config.textColor;
        this.elements.textSize.value = preset.config.textSize;
        this.elements.textSizeValue.textContent = preset.config.textSize;
        this.elements.fontFamily.value = preset.config.fontFamily;

        // Atualizar alignment buttons
        document.querySelectorAll('.btn-alignment').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.align === preset.config.textAlign) {
                btn.classList.add('active');
            }
        });

        // Atualizar preset buttons
        document.querySelectorAll('.preset-btn').forEach((btn, index) => {
            btn.classList.remove('active');
        });

        const presetIndex = Object.keys(this.presets).indexOf(presetKey);
        document.querySelectorAll('.preset-btn')[presetIndex]?.classList.add('active');

        this.updateAllPresets();
        this.triggerPreviewUpdate();
        this.showToast(`Preset "${preset.name}" aplicado!`);
    }

    /**
     * Atualiza indicador visual de presets
     * @private
     */
    updateAllPresets() {
        document.querySelectorAll('.preset-btn').forEach((btn, index) => {
            if (Object.keys(this.presets)[index] === this.currentPreset) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Obtém configuração atual do editor
     * @returns {Object} Configuração
     */
    getEditorConfig() {
        return {
            frameColor: this.elements.frameColor.value,
            frameWidth: parseInt(this.elements.frameWidth.value),
            bottomSpacing: parseInt(this.elements.bottomSpacing.value),
            textColor: this.elements.textColor.value,
            textSize: parseInt(this.elements.textSize.value),
            fontFamily: this.elements.fontFamily.value,
            textAlign: document.querySelector('.btn-alignment.active')?.dataset.align || 'left',
            aspectRatio: document.querySelector('.btn-aspect-ratio.active')?.dataset.ratio || 'original'
        };
    }

    /**
     * Mostra imagem na galeria
     * @param {File} file - Arquivo da imagem
     * @param {number} index - Índice
     */
    addImageToGallery(file, index) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.index = index;

            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            item.appendChild(img);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'gallery-item__remove';
            removeBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
            removeBtn.addEventListener('click', () => {
                if (window.app) {
                    window.app.removeImage(index);
                }
            });
            item.appendChild(removeBtn);

            item.addEventListener('click', () => {
                if (window.app) {
                    window.app.selectImage(index);
                }
            });

            this.elements.galleryGrid.appendChild(item);
        };

        reader.readAsDataURL(file);
    }

    /**
     * Marca imagem como selecionada
     * @param {number} index - Índice
     */
    selectImageInGallery(index) {
        document.querySelectorAll('.gallery-item').forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Mostra galeria
     */
    showGallery() {
        this.elements.gallery.style.display = 'block';
        this.elements.uploadArea.style.display = 'none';
    }

    /**
     * Esconde galeria
     */
    hideGallery() {
        this.elements.gallery.style.display = 'none';
        this.elements.uploadArea.style.display = 'flex';
    }

    /**
     * Limpa galeria
     */
    clearGallery() {
        this.elements.galleryGrid.innerHTML = '';
        this.hideGallery();
        this.elements.previewCard.style.display = 'none';
        this.elements.editorPanel.style.display = 'none';
        this.elements.exifInfo.style.display = 'none';
        this.showToast('Galeria limpa');
    }

    /**
     * Exibe dados EXIF
     * @param {Object} exifData - Dados EXIF
     */
    displayEXIFData(exifData) {
        this.elements.exifInfo.style.display = 'block';
        const hasData = Object.keys(exifData).length > 0;

        if (hasData) {
            this.elements.exifGrid.innerHTML = '';
            this.elements.exifEmpty.style.display = 'none';

            Object.entries(exifData).forEach(([key, value]) => {
                const item = document.createElement('div');
                item.className = 'exif-item';
                item.innerHTML = `
                    <div class="exif-item__label">${key}</div>
                    <div class="exif-item__value">${value}</div>
                `;
                this.elements.exifGrid.appendChild(item);
            });
        } else {
            this.elements.exifGrid.innerHTML = '';
            this.elements.exifEmpty.style.display = 'block';
        }
    }

    /**
     * Exibe preview card
     */
    showPreviewCard() {
        this.elements.previewCard.style.display = 'block';
        this.elements.editorPanel.style.display = 'block';
    }

    /**
     * Atualiza nível de zoom exibido
     * @private
     */
    updateZoomLevel() {
        if (window.previewManager) {
            const percentage = Math.round(window.previewManager.zoomLevel * 100);
            this.elements.zoomLevel.textContent = `${percentage}%`;
        }
    }

    /**
     * Dispara atualização de preview (com debounce)
     * @private
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
     * Manipula exportação
     * @private
     */
    async handleExport() {
        if (!window.previewManager) {
            this.showToast('Nenhuma imagem para exportar', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const blob = await window.previewManager.exportImage('jpeg', 0.95);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `frame-${new Date().getTime()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast('Imagem exportada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.showToast('Erro ao exportar imagem', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Exibe toast notification
     * @param {string} message - Mensagem
     * @param {string} type - Tipo (default, error, success)
     */
    showToast(message, type = 'default') {
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
     * Exibe/esconde loading
     * @param {boolean} show - Mostrar ou esconder
     */
    showLoading(show) {
        this.elements.loadingSpinner.style.display = show ? 'block' : 'none';
    }

    /**
     * Mostra confirmação
     * @param {string} title - Título
     * @param {string} message - Mensagem
     * @param {Function} callback - Callback ao confirmar
     */
    showConfirmation(title, message, callback) {
        // Criar modal simples
        const confirmed = confirm(`${title}\n\n${message}`);
        if (confirmed) {
            callback();
        }
    }

    /**
     * Detecta preferência de dark mode
     * @returns {boolean}
     * @private
     */
    detectDarkMode() {
        return localStorage.getItem('frameStudio:darkMode') === 'true' ||
               (window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    /**
     * Alterna dark mode
     */
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('frameStudio:darkMode', this.isDarkMode);
        this.updateTheme();
    }

    /**
     * Atualiza tema
     * @private
     */
    updateTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
}

// Instância global
const uiManager = new UIManager();
