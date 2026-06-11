# 🎨 Frame Studio - Molduras EXIF Profissionais

Uma aplicação web premium para fotógrafos gerarem molduras elegantes com dados EXIF automaticamente.

## ✨ Características

### Design Premium
- **Interface Minimalista**: Design clean e moderno
- **Paleta Sofisticada**: Tons terrosos profissionais
- **Responsivo**: Perfeito em todos os dispositivos
- **Dark Mode**: Suporte completo para modo escuro
- **Animações Suaves**: Transições elegantes e fluidas

### Funcionalidades Principais
- 📸 **Upload Múltiplo**: Drag and drop ou seleção tradicional
- 📊 **Leitura EXIF**: Extração automática de dados fotográficos
- 🎨 **Editor Interativo**: Controle total da moldura
- 🎯 **6 Presets**: Minimal, Editorial, Fine Art, Wedding, Dark, Luxury
- 👁️ **Preview em Tempo Real**: Atualização instantânea
- 💾 **Exportação**: JPG, PNG, WebP em alta qualidade
- ♿ **Acessível**: ARIA labels e navegação por teclado

### Performance
- Sem bibliotecas pesadas (HTML5, CSS3, JS Vanilla)
- Código modular e otimizado
- Cache inteligente de imagens
- Rendering eficiente no Canvas
- Baixo consumo de memória

## 📦 Estrutura do Projeto

```
gerador-de-moldura/
├── index.html
├── css/
│   ├── style.css           # Estilos globais e sistema de design
│   ├── components.css      # Componentes específicos
│   └── responsive.css      # Media queries e responsividade
├── js/
│   ├── exif.js            # Leitura de dados EXIF
│   ├── canvas.js          # Geração de molduras
│   ├── ui.js              # Gerenciamento de interface
│   └── app.js             # Orquestração principal
└── README.md
```

## 🚀 Como Usar

### Instalação
Simplesmente abra o arquivo `index.html` em um navegador moderno.

```bash
# Usar com Live Server (VS Code)
Clique com botão direito em index.html > Open with Live Server

# Ou abra diretamente
file:///caminho/para/gerador-de-moldura/index.html
```

### Primeiros Passos
1. **Upload**: Arraste imagens ou clique para selecionar
2. **Visualize EXIF**: Dados automáticos aparecem no painel
3. **Customize**: Use os controles ou aplique um preset
4. **Preview**: Veja mudanças em tempo real
5. **Exporte**: Baixe em alta qualidade

## 🎨 Paleta de Cores

| Nome | Hex | Uso |
|------|-----|-----|
| Bege | #F5F1EA | Fundo primário |
| Areia | #DCCBB3 | Moldura padrão |
| Marrom Café | #6B4F3A | Primária |
| Terracota | #B66A50 | Destaques |
| Preto Suave | #1A1A1A | Texto |

## 📱 Responsividade

Testado e otimizado para:
- 📱 Smartphones (< 640px)
- 📱 Tablets (640px - 1024px)
- 💻 Notebooks (1024px - 1536px)
- 🖥️ Ultrawide (> 1536px)

## ⚙️ Presets Disponíveis

### Minimal
- Limpo e moderno
- Moldura fina (20px)
- Texto pequeno

### Editorial
- Profissional
- Moldura média (50px)
- Texto centralizado

### Fine Art
- Elegante
- Moldura grossa (60px)
- Cores sofisticadas

### Wedding
- Luxuoso
- Moldura média (45px)
- Fundo terracota

### Dark
- Dramático
- Moldura preta
- Texto claro

### Luxury
- Premium
- Moldura extra grossa (80px)
- Espaçamento generoso

## 🛠️ Personalizações

### Controles Disponíveis
- **Cor da Moldura**: Picker color customizado
- **Espessura**: 0-200px
- **Espaço Inferior**: 0-300px
- **Cor do Texto**: Picker color
- **Fonte**: Poppins, Cormorant Garamond, Georgia, Courier New
- **Tamanho do Texto**: 8-32px
- **Alinhamento**: Esquerda, Centro, Direita

### Zoom do Preview
- Aumentar/Diminuir com botões
- Visualizar em 10% - 300%
- Reset para 100%

## 📊 Dados EXIF Suportados

A aplicação extrai automaticamente:
- 📷 **Câmera**: Marca e modelo
- 🎯 **Fotografia**: ISO, Abertura, Velocidade obturador, Distância focal
- 📅 **Data/Hora**: Registro de captura

Se não houver dados EXIF, exibe mensagem amigável.

## 🔧 Tecnologias

- **HTML5**: Semântica moderna
- **CSS3**: Grid, Flexbox, Custom Properties
- **JavaScript ES6+**: Classes, async/await, Canvas API
- **Tipografia**: Google Fonts (Poppins, Cormorant Garamond)

## ⚡ Performance

### Otimizações Implementadas
- ✅ Sem dependências externas pesadas
- ✅ Código modular e lazy loading
- ✅ Cache inteligente de imagens
- ✅ Debouncing em atualizações
- ✅ Canvas rendering otimizado
- ✅ Media queries fluidas
- ✅ Compressão de exportação

### Métricas
- **Tamanho**: < 100KB (HTML + CSS + JS)
- **Inicial Load**: < 1s
- **Preview Update**: < 200ms
- **Memória**: Otimizada para múltiplas imagens

## ♿ Acessibilidade

Segue WCAG 2.1 Level AA:
- ✅ Labels acessíveis em formulários
- ✅ ARIA atributos apropriados
- ✅ Navegação por teclado
- ✅ Contraste adequado
- ✅ Suporte a screen readers
- ✅ Prefers reduced motion

## 🌙 Dark Mode

Detecta preferência do sistema e permite toggle manual:
- Sistema operacional: Respeitado por padrão
- Manual: Botão no header
- Persistência: Salvem localStorage

## 📤 Exportação

### Formatos Suportados
- **JPG**: Alta qualidade (95%), padrão recomendado
- **PNG**: Sem perda, ideal para transparência
- **WebP**: Moderno e comprimido

### Resolução
- Mantém dimensões originais
- Adiciona moldura e EXIF
- Otimizado para web e impressão

## 🐛 Troubleshooting

### "Sem dados EXIF"
- Normal se a imagem não contiver metadados
- Aplicação funciona sem EXIF também

### Preview em branco
- Verifique navegador compatível (Chrome, Firefox, Safari 13+)
- Tente recarregar página

### Imagem muito grande
- Máximo 50MB por arquivo
- Reduza resolução se necessário

## 🌐 Navegadores Suportados

| Navegador | Versão | Status |
|-----------|--------|--------|
| Chrome | 90+ | ✅ Suportado |
| Firefox | 88+ | ✅ Suportado |
| Safari | 13+ | ✅ Suportado |
| Edge | 90+ | ✅ Suportado |

## 📄 Licença

Desenvolvido com ❤️ para fotógrafos profissionais.

## 📞 Suporte

Para dúvidas ou sugestões, verifique o console do navegador (F12) para mensagens de erro.

---

**Frame Studio v1.0** - Premium Frame Generation for Photographers
