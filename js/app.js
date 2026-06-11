/**
 * =====================================================
 * FRAME STUDIO - APP.JS
 * Orquestração principal da aplicação
 * =====================================================
 */

class FrameStudioApp {
    /**
     * Construtor da aplicação
     */
    constructor() {
        this.images = [];
        this.currentImageIndex = -1;
        this.previewManager = null;
        this.initialized = false;

        this.initialize();
    }

    /**
     * Inicializa a aplicação
     * @private
     */
    async initialize() {
        try {
            // Preparar canvas de preview
            const previewCanvas = document.getElementById('previewCanvas');
            if (previewCanvas) {
                this.previewManager = new PreviewManager(previewCanvas);
                window.previewManager = this.previewManager;
            }

            // Setup input de arquivo
            this.setupFileInput();

            // Permitir drop no upload area
            this.setupDragAndDrop();

            this.initialized = true;
            uiManager.showToast('Frame Studio pronto!');
        } catch (error) {
            console.error('Erro ao inicializar:', error);
            uiManager.showToast('Erro ao inicializar aplicação', 'error');
        }
    }

    /**
     * Configura input de arquivo
     * @private
     */
    setupFileInput() {
        const fileInput = document.getElementById('fileInput');
        
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            e.target.value = ''; // Reset para permitir re-upload
        });
    }

    /**
     * Configura drag and drop
     * @private
     */
    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Manipula arquivos selecionados
     * @param {FileList} files - Lista de arquivos
     * @private
     */
    async handleFiles(files) {
        if (!files.length) return;

        uiManager.showLoading(true);

        try {
            // Validar e adicionar imagens
            let validCount = 0;

            for (const file of files) {
                // Validar tipo
                if (!file.type.startsWith('image/')) {
                    uiManager.showToast(`${file.name} não é uma imagem válida`, 'error');
                    continue;
                }

                // Validar tamanho (máx 50MB)
                if (file.size > 50 * 1024 * 1024) {
                    uiManager.showToast(`${file.name} é muito grande (máx 50MB)`, 'error');
                    continue;
                }

                // Adicionar à lista
                this.images.push(file);
                uiManager.addImageToGallery(file, this.images.length - 1);
                validCount++;
            }

            if (validCount > 0) {
                uiManager.showGallery();
                
                // Selecionar primeira imagem
                if (this.currentImageIndex === -1) {
                    this.selectImage(0);
                }

                uiManager.showToast(`${validCount} imagem(ns) adicionada(s)!`, 'success');
            }
        } catch (error) {
            console.error('Erro ao manipular arquivos:', error);
            uiManager.showToast('Erro ao processar imagens', 'error');
        } finally {
            uiManager.showLoading(false);
        }
    }

    /**
     * Seleciona imagem da galeria
     * @param {number} index - Índice da imagem
     */
    async selectImage(index) {
        if (index < 0 || index >= this.images.length) {
            return;
        }

        this.currentImageIndex = index;
        uiManager.selectImageInGallery(index);

        uiManager.showLoading(true);

        try {
            // Carregar imagem
            const imageFile = this.images[index];
            const imageElement = await this.previewManager.generator.loadImage(imageFile);

            // Extrair EXIF
            const exifData = await exifReader.extractEXIF(imageFile);

            // Exibir EXIF
            uiManager.displayEXIFData(exifData);

            // Mostrar preview
            uiManager.showPreviewCard();

            // Atualizar preview
            await this.updatePreview();
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            uiManager.showToast('Erro ao processar imagem', 'error');
        } finally {
            uiManager.showLoading(false);
        }
    }

    /**
     * Remove imagem da galeria
     * @param {number} index - Índice da imagem
     */
    removeImage(index) {
        if (index < 0 || index >= this.images.length) {
            return;
        }

        // Remover do array
        this.images.splice(index, 1);

        // Atualizar galeria
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems[index]?.remove();

        // Se era a imagem selecionada
        if (this.currentImageIndex === index) {
            if (this.images.length > 0) {
                // Selecionar anterior ou próxima
                const newIndex = Math.min(index, this.images.length - 1);
                this.selectImage(newIndex);
            } else {
                // Nenhuma imagem restante
                this.currentImageIndex = -1;
                uiManager.hideGallery();
                uiManager.elements.previewCard.style.display = 'none';
                uiManager.elements.editorPanel.style.display = 'none';
                uiManager.elements.exifInfo.style.display = 'none';
                this.previewManager.generator.clear();
            }
        } else if (this.currentImageIndex > index) {
            // Ajustar índice
            this.currentImageIndex--;
        }

        uiManager.showToast('Imagem removida');
    }

    /**
     * Atualiza preview
     * @private
     */
    async updatePreview() {
        if (this.currentImageIndex < 0 || this.currentImageIndex >= this.images.length) {
            return;
        }

        try {
            const imageFile = this.images[this.currentImageIndex];
            const imageElement = await this.previewManager.generator.loadImage(imageFile);
            const exifData = await exifReader.extractEXIF(imageFile);
            const config = uiManager.getEditorConfig();

            await this.previewManager.updatePreview(imageElement, exifData, config);
        } catch (error) {
            console.error('Erro ao atualizar preview:', error);
        }
    }

    /**
     * Exporta imagem atual
     */
    async exportImage() {
        if (this.currentImageIndex < 0) {
            uiManager.showToast('Selecione uma imagem para exportar', 'error');
            return;
        }

        uiManager.showLoading(true);

        try {
            const blob = await this.previewManager.exportImage('jpeg', 0.95);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `frame-${new Date().getTime()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            uiManager.showToast('Imagem exportada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            uiManager.showToast('Erro ao exportar imagem', 'error');
        } finally {
            uiManager.showLoading(false);
        }
    }

    /**
     * Limpeza de recursos
     */
    destroy() {
        if (this.previewManager) {
            this.previewManager.destroy();
        }
        exifReader.clearCache();
    }
}

// =====================================================
// Inicialização da Aplicação
// =====================================================

let app = null;

// Esperar DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
    });
} else {
    initializeApp();
}

/**
 * Inicializa aplicação
 */
function initializeApp() {
    try {
        // Criar instância global
        app = new FrameStudioApp();
        window.app = app;

        // Melhor suporte a toque
        if ('ontouchstart' in window) {
            document.addEventListener('touchstart', () => {}, { passive: true });
        }

        // Log de inicialização
        console.log('🎨 Frame Studio initialized successfully');
    } catch (error) {
        console.error('Erro ao inicializar Frame Studio:', error);
    }
}

// Limpeza ao descarregar
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});

// Service Worker (opcional - para offline)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service Worker não disponível
    });
}

// Prevenção de comportamentos indesejados
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Mensagens úteis no console
console.log('%c🎨 Frame Studio Pro', 'font-size: 20px; font-weight: bold; color: #B66A50;');
console.log('%cFerramenta profissional para geração de molduras EXIF', 'font-size: 14px; color: #6B4F3A;');
console.log('%cVersão 1.0 | Made with ❤️ for photographers', 'font-size: 12px; color: #DCCBB3;');
