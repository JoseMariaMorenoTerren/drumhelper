class LyricsScroller {
    constructor() {
        this.lyricsContainer = document.getElementById('lyrics-container');
        this.lyricsContent = document.getElementById('lyrics-content');
        this.scrollUpBtn = document.getElementById('scroll-up-btn');
        this.scrollDownBtn = document.getElementById('scroll-down-btn');
        this.autoScrollBtn = document.getElementById('auto-scroll-btn');
        this.scrollSpeedInput = document.getElementById('scroll-speed');
        this.fontSizeMinusBtn = document.getElementById('font-size-minus');
        this.fontSizePlusBtn = document.getElementById('font-size-plus');
        
        this.isAutoScrolling = true;
        this.scrollSpeed = 5;
        this.scrollPosition = 0;
        this.autoScrollInterval = null;
        this.currentBPM = 120;
        this.fontSize = 2.4; // Tamaño inicial en rem (doble del original)
        
        this.initializeEventListeners();
        this.loadFontSizePreference();
    }
    
    initializeEventListeners() {
        this.scrollUpBtn.addEventListener('click', () => {
            this.scrollUp();
        });
        
        this.scrollDownBtn.addEventListener('click', () => {
            this.scrollDown();
        });
        
        this.autoScrollBtn.addEventListener('click', () => {
            this.toggleAutoScroll();
        });
        
        this.scrollSpeedInput.addEventListener('input', (e) => {
            this.setScrollSpeed(parseInt(e.target.value));
        });
        
        this.fontSizeMinusBtn.addEventListener('click', () => {
            this.changeFontSize(-0.2);
        });
        
        this.fontSizePlusBtn.addEventListener('click', () => {
            this.changeFontSize(0.2);
        });
        
        // Escuchar eventos del metrónomo
        window.addEventListener('metronome-beat', (e) => {
            if (this.isAutoScrolling && e.detail.isStrongBeat) {
                this.autoScroll();
            }
        });
        
        window.addEventListener('bpm-change', (e) => {
            this.currentBPM = e.detail.bpm;
            this.updateAutoScrollSpeed();
        });
        
        // Permitir scroll manual con la rueda del mouse
        this.lyricsContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            if (e.deltaY > 0) {
                this.scrollDown();
            } else {
                this.scrollUp();
            }
            
            // Desactivar auto-scroll temporalmente
            if (this.isAutoScrolling) {
                this.pauseAutoScroll();
            }
        });
        
        // Permitir scroll con teclado
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return; // No procesar si está escribiendo en un input
            }
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.scrollUp();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.scrollDown();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoScroll();
                    break;
            }
        });
    }
    
    loadLyrics(lyrics) {
        if (!lyrics || lyrics.trim() === '') {
            this.lyricsContent.innerHTML = `
                <p class="welcome-message">
                    Esta canción no tiene letras disponibles.
                    <br><br>
                    Puedes editarla haciendo clic derecho en la lista de canciones.
                </p>
            `;
        } else {
            // Procesar las letras para mejor visualización
            const processedLyrics = this.processLyrics(lyrics);
            this.lyricsContent.innerHTML = processedLyrics;
        }
        
        this.resetScroll();
    }
    
    processTextHighlights(text) {
        // Convertir texto entre /0 y 0/ a HTML resaltado amarillo
        let processedText = text.replace(/\/0(.*?)0\//g, '<span class="highlight-yellow">$1</span>');
        // Convertir texto entre /1 y 1/ a HTML resaltado azul
        processedText = processedText.replace(/\/1(.*?)1\//g, '<span class="highlight-blue">$1</span>');
        // Convertir texto entre /3 y 3/ a HTML resaltado verde
        processedText = processedText.replace(/\/3(.*?)3\//g, '<span class="highlight-green">$1</span>');
        return processedText;
    }
    
    processLyrics(lyrics) {
        // Dividir por líneas y procesar
        const lines = lyrics.split('\n');
        const processedLines = lines.map(line => {
            const trimmedLine = line.trim();
            
            if (trimmedLine === '') {
                return '<br>';
            }
            
            // Detectar líneas especiales que empiecen con ::
            if (trimmedLine.startsWith('::')) {
                const content = trimmedLine.substring(2).trim(); // Remover :: y espacios
                const highlightedContent = this.processTextHighlights(content);
                return `<div class="special-line">${highlightedContent}</div>`;
            }
            
            // Detectar coros o secciones especiales
            if (trimmedLine.match(/^\[.*\]$/) || trimmedLine.match(/^[\(\[]?(Chorus|Verse|Bridge|Intro|Outro)[\)\]]?:?/i)) {
                const highlightedLine = this.processTextHighlights(trimmedLine);
                return `<div class="section-header">${highlightedLine}</div>`;
            }
            
            // Aplicar resaltado a líneas normales también
            const highlightedLine = this.processTextHighlights(trimmedLine);
            return `<div class="lyric-line">${highlightedLine}</div>`;
        });
        
        return processedLines.join('');
    }
    
    clearLyrics() {
        this.lyricsContent.innerHTML = `
            <p class="welcome-message">
                Bienvenido a Drum Helper
                <br><br>
                Selecciona una canción de la lista para ver sus letras.
                <br><br>
                Las letras se desplazarán automáticamente según el tempo del metrónomo.
            </p>
        `;
        this.resetScroll();
    }
    
    scrollUp() {
        this.scrollPosition -= 30;
        this.updateScrollPosition();
    }
    
    scrollDown() {
        this.scrollPosition += 30;
        this.updateScrollPosition();
    }
    
    autoScroll() {
        if (this.isAutoScrolling) {
            // Calcular velocidad basada en BPM y configuración del usuario
            const scrollAmount = this.calculateScrollAmount();
            this.scrollPosition += scrollAmount;
            this.updateScrollPosition();
        }
    }
    
    calculateScrollAmount() {
        // Base: scroll más rápido con BPMs más altos
        const bpmFactor = this.currentBPM / 120; // 120 BPM como base
        const userSpeedFactor = this.scrollSpeed / 5; // Velocidad del usuario (1-10, 5 como base)
        
        return Math.max(1, Math.round(2 * bpmFactor * userSpeedFactor));
    }
    
    updateScrollPosition() {
        // Limitar scroll para no ir más allá del contenido
        const maxScroll = Math.max(0, this.lyricsContent.offsetHeight - this.lyricsContainer.offsetHeight);
        this.scrollPosition = Math.max(0, Math.min(this.scrollPosition, maxScroll));
        
        this.lyricsContent.style.transform = `translateY(-${this.scrollPosition}px)`;
    }
    
    resetScroll() {
        this.scrollPosition = 0;
        this.updateScrollPosition();
    }
    
    toggleAutoScroll() {
        this.isAutoScrolling = !this.isAutoScrolling;
        
        if (this.isAutoScrolling) {
            this.autoScrollBtn.classList.add('active');
            this.autoScrollBtn.textContent = 'AUTO';
        } else {
            this.autoScrollBtn.classList.remove('active');
            this.autoScrollBtn.textContent = 'MANUAL';
        }
    }
    
    pauseAutoScroll() {
        if (this.isAutoScrolling) {
            this.isAutoScrolling = false;
            this.autoScrollBtn.classList.remove('active');
            this.autoScrollBtn.textContent = 'MANUAL';
            
            // Reactivar automáticamente después de 5 segundos de inactividad
            clearTimeout(this.autoScrollResumeTimeout);
            this.autoScrollResumeTimeout = setTimeout(() => {
                this.isAutoScrolling = true;
                this.autoScrollBtn.classList.add('active');
                this.autoScrollBtn.textContent = 'AUTO';
            }, 5000);
        }
    }
    
    setScrollSpeed(speed) {
        this.scrollSpeed = Math.max(1, Math.min(10, speed));
        this.scrollSpeedInput.value = this.scrollSpeed;
    }
    
    updateAutoScrollSpeed() {
        // Método llamado cuando cambia el BPM
        // La velocidad se recalcula automáticamente en calculateScrollAmount()
    }
    
    changeFontSize(delta) {
        const newSize = this.fontSize + delta;
        // Limitar el tamaño entre 1rem y 5rem
        if (newSize >= 1.0 && newSize <= 5.0) {
            this.fontSize = newSize;
            this.updateFontSize();
        }
    }
    
    updateFontSize() {
        this.lyricsContent.style.fontSize = `${this.fontSize}rem`;
        
        // Actualizar también el mensaje de bienvenida si está visible
        const welcomeMessage = this.lyricsContent.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.fontSize = `${this.fontSize * 1.25}rem`; // Un poco más grande para el mensaje
        }
        
        // Recalcular posición de scroll después del cambio de tamaño
        setTimeout(() => {
            this.updateScrollPosition();
        }, 100);
        
        // Guardar preferencia en localStorage
        localStorage.setItem('drumhelper-font-size', this.fontSize.toString());
    }
    
    loadFontSizePreference() {
        const savedSize = localStorage.getItem('drumhelper-font-size');
        if (savedSize) {
            this.fontSize = parseFloat(savedSize);
            this.updateFontSize();
        }
    }
}

// Exportar para uso global
window.LyricsScroller = LyricsScroller;
