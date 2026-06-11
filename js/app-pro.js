/**
 * ===================================================
 * FRAME STUDIO PRO - App Manager
 * Gerenciamento central da aplicação
 * ===================================================
 */

class FrameStudioProApp {
    constructor() {
        this.images = [];
        this.currentImageIndex = -1;
        this.previewManager = null;
        this.uiManager = null;

        this.initialize();
    }

    async initialize() {
        try {
            // Inicializar UI Manager
            this.uiManager = new UIManagerPro();
            
            // Inicializar Preview Manager
            const canvas = document.getElementById('previewCanvas');
            if (canvas) {
                this.previewManager = new PreviewManager(canvas);
                window.previewManager = this.previewManager; // CORREÇÃO: Export global
            }

            // Setup listeners
            this.setupFileInput();
            this.setupDragDrop();
            this.setupUIListeners();

            this.uiManager.toast('Frame Studio Pro carregado!', 'success');
        } catch (error) {
            console.error('Erro ao inicializar:', error);
            this.uiManager?.toast('Erro ao inicializar aplicação', 'error');
        }
    }

    setupFileInput() {
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadZone = document.getElementById('uploadZone');

        fileInput?.addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        // CORREÇÃO: Fazer a área inteira de upload ser clicável
        uploadZone?.addEventListener('click', (e) => {
            if (e.target !== fileInput) fileInput?.click();
        });

        uploadZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.opacity = '0.7';
        });

        uploadZone?.addEventListener('dragleave', () => {
            uploadZone.style.opacity = '1';
        });

        uploadZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.opacity = '1';
            this.handleFiles(e.dataTransfer.files);
        });
    }

    setupDragDrop() {
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
        });
    }

    setupUIListeners() {
        const clearBtn = document.getElementById('clearGalleryBtn');
        const exportBtn = document.getElementById('exportBtn');
        const themeToggle = document.getElementById('themeToggle');

        clearBtn?.addEventListener('click', () => this.clearGallery());
        exportBtn?.addEventListener('click', () => this.exportImage());
        themeToggle?.addEventListener('click', () => this.uiManager.toggleTheme());

        // CORREÇÃO: Adiciona escutador no painel para atualizar a pré-visualização em tempo real
        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) {
            // Atualiza imediatamente enquanto você arrasta os sliders numéricos ou muda as cores
            controlPanel.addEventListener('input', () => {
                if (this.currentImageIndex !== -1) {
                    this.updatePreview();
                }
            });
            
            // Atualiza quando você clica nos botões de Proporção, Estilos (Presets) e Alinhamento
            controlPanel.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.closest('.preset-card') || e.target.closest('.btn-ratio')) {
                    // Dá um tempo mínimo (50ms) para os botões mudarem de estado (ex: classe 'active') antes de repintar
                    setTimeout(() => {
                        if (this.currentImageIndex !== -1) {
                            this.updatePreview();
                        }
                    }, 50);
                }
            });
        }
    }

    async handleFiles(files) {
        if (!files.length) return;

        this.uiManager.showLoading(true);

        try {
            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    this.uiManager.toast(`${file.name} não é uma imagem válida`, 'error');
                    continue;
                }

                if (file.size > 50 * 1024 * 1024) {
                    this.uiManager.toast(`${file.name} é muito grande (máx 50MB)`, 'error');
                    continue;
                }

                this.images.push(file);
                this.uiManager.addImageToGallery(file, this.images.length - 1);
            }

            if (this.images.length > 0) {
                this.uiManager.showGallery();
                if (this.currentImageIndex === -1) {
                    this.selectImage(0);
                }
                this.uiManager.toast(`${this.images.length} imagem(ns) adicionada(s)!`, 'success');
            }
        } catch (error) {
            console.error('Erro ao manipular arquivos:', error);
            this.uiManager.toast('Erro ao processar imagens', 'error');
        } finally {
            this.uiManager.showLoading(false);
        }
    }

    async selectImage(index) {
        if (index < 0 || index >= this.images.length) return;

        this.currentImageIndex = index;
        this.uiManager.setActiveImage(index);
        this.uiManager.showLoading(true);

        try {
            const file = this.images[index];
            const img = await this.previewManager.generator.loadImage(file);
            const exif = await exifReaderPro.extractEXIF(file);

            this.uiManager.displayEXIF(exif);
            this.uiManager.showPreview();

            await this.updatePreview();
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            this.uiManager.toast('Erro ao processar imagem', 'error');
        } finally {
            this.uiManager.showLoading(false);
        }
    }

    async updatePreview() {
        if (this.currentImageIndex < 0 || this.currentImageIndex >= this.images.length) return;

        try {
            const file = this.images[this.currentImageIndex];
            const img = await this.previewManager.generator.loadImage(file);
            const exif = await exifReaderPro.extractEXIF(file);
            const config = this.uiManager.getConfig();

            await this.previewManager.updatePreview(img, exif, config);
        } catch (error) {
            console.error('Erro ao atualizar preview:', error);
        }
    }

    removeImage(index) {
        if (index < 0 || index >= this.images.length) return;

        this.images.splice(index, 1);
        this.uiManager.removeImageFromGallery(index);

        if (this.currentImageIndex === index) {
            if (this.images.length > 0) {
                const newIndex = Math.min(index, this.images.length - 1);
                this.selectImage(newIndex);
            } else {
                this.currentImageIndex = -1;
                this.uiManager.hideGallery();
                this.uiManager.hidePreview();
            }
        } else if (this.currentImageIndex > index) {
            this.currentImageIndex--;
        }

        this.uiManager.toast('Imagem removida');
    }

    clearGallery() {
        this.uiManager.showConfirmation('Limpar galeria?', 'Todas as imagens serão removidas.', () => {
            this.images = [];
            this.currentImageIndex = -1;
            this.uiManager.clearGallery();
            this.uiManager.hideGallery();
            this.uiManager.hidePreview();
        });
    }

    async exportImage() {
        if (this.currentImageIndex < 0) {
            this.uiManager.toast('Selecione uma imagem para exportar', 'error');
            return;
        }

        this.uiManager.showLoading(true);

        try {
            const blob = await this.previewManager.generator.exportImage('jpeg', 0.95);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `frame-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.uiManager.toast('Imagem exportada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.uiManager.toast('Erro ao exportar imagem', 'error');
        } finally {
            this.uiManager.showLoading(false);
        }
    }
}

// Instância global
let app;

// Inicializar quando documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new FrameStudioProApp();
        window.app = app; // CORREÇÃO: Export global
    });
} else {
    app = new FrameStudioProApp();
    window.app = app; // CORREÇÃO: Export global
}