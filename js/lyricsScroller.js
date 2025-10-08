class LyricsScroller {
    constructor() {
        this.lyricsContainer = document.getElementById('lyrics-container');
        this.lyricsContent = document.getElementById('lyrics-content');
        this.scrollUpBtn = document.getElementById('scroll-up-btn');
        this.scrollDownBtn = document.getElementById('scroll-down-btn');
        this.autoScrollBtn = document.getElementById('auto-scroll-btn');
        this.scrollToTopBtn = document.getElementById('scroll-to-top-btn');
        this.scrollSpeedInput = document.getElementById('scroll-speed');
        this.fontSizeMinusBtn = document.getElementById('font-size-minus');
        this.fontSizePlusBtn = document.getElementById('font-size-plus');
        this.modeToggleBtn = document.getElementById('mode-toggle-btn');
        this.songlistToggleBtn = document.getElementById('songlist-toggle-btn');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.recordBtn = document.getElementById('record-btn');
        this.timerText = document.getElementById('timer-text');
        
        this.isAutoScrolling = true;
        this.scrollSpeed = 5;
        this.scrollPosition = 0;
        this.autoScrollInterval = null;
        this.currentBPM = 120;
        this.fontSize = 2.4; // Tamaño inicial en rem (doble del original)
        this.currentMode = 'edition'; // Modos: 'edition', 'concert', 'prompter'
        this.modes = ['edition', 'concert', 'prompter'];
        this.modeLabels = {
            'edition': '📝 Edición',
            'concert': '🎵 Concierto', 
            'prompter': '📺 Prompter'
        };
        this.songlistVisible = true;
        this.timerRunning = false;
        this.timerInterval = null;
        this.elapsedTime = 0; // En segundos
        this.isRecording = false;
        this.recordingEvents = []; // Array para capturar eventos durante la grabación
        
        this.initializeEventListeners();
        this.loadFontSizePreference();
        this.loadModePreferences();
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
        
        this.scrollToTopBtn.addEventListener('click', () => {
            this.scrollToTop();
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
        
        this.modeToggleBtn.addEventListener('click', () => {
            this.toggleMode();
        });
        
        this.songlistToggleBtn.addEventListener('click', () => {
            this.toggleSonglist();
        });
        
        this.playPauseBtn.addEventListener('click', () => {
            this.toggleTimer();
        });
        
        this.restartBtn.addEventListener('click', () => {
            this.restartTimer();
        });
        
        this.recordBtn.addEventListener('click', () => {
            this.toggleRecording();
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
        
        // Capturar evento durante la grabación
        if (this.isRecording) {
            this.recordScrollEvent('up');
        }
    }
    
    scrollDown() {
        this.scrollPosition += 30;
        this.updateScrollPosition();
        
        // Capturar evento durante la grabación
        if (this.isRecording) {
            this.recordScrollEvent('down');
        }
    }
    
    scrollToTop() {
        this.scrollPosition = 0;
        this.updateScrollPosition();
        
        // Pausar auto-scroll temporalmente cuando se usa el botón
        if (this.isAutoScrolling) {
            this.pauseAutoScroll();
        }
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
            this.autoScrollBtn.textContent = 'A';
        } else {
            this.autoScrollBtn.classList.remove('active');
            this.autoScrollBtn.textContent = 'M';
        }
    }
    
    pauseAutoScroll() {
        if (this.isAutoScrolling) {
            this.isAutoScrolling = false;
            this.autoScrollBtn.classList.remove('active');
            this.autoScrollBtn.textContent = 'A';
            
            // Reactivar automáticamente después de 5 segundos de inactividad
            clearTimeout(this.autoScrollResumeTimeout);
            this.autoScrollResumeTimeout = setTimeout(() => {
                this.isAutoScrolling = true;
                this.autoScrollBtn.classList.add('active');
                this.autoScrollBtn.textContent = 'A';
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
            this.saveCurrentSongFontSize();
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
    }
    
    loadFontSizePreference() {
        const savedSize = localStorage.getItem('drumhelper-font-size');
        if (savedSize) {
            this.fontSize = parseFloat(savedSize);
            this.updateFontSize();
        }
    }
    
    loadSongFontSize(song) {
        if (song && song.fontSize) {
            this.fontSize = song.fontSize;
            this.updateFontSize();
        } else {
            // Si la canción no tiene fontSize, usar el por defecto
            this.fontSize = 2.4;
            this.updateFontSize();
        }
    }
    
    saveCurrentSongFontSize() {
        // Notificar al songManager para actualizar el fontSize de la canción actual
        if (window.songManager) {
            window.songManager.updateCurrentSongFontSize(this.fontSize);
        }
    }
    
    toggleMode() {
        const currentIndex = this.modes.indexOf(this.currentMode);
        const nextIndex = (currentIndex + 1) % this.modes.length;
        this.currentMode = this.modes[nextIndex];
        
        this.applyMode();
        this.updateModeButton();
        
        // Guardar preferencia de modo
        localStorage.setItem('drumhelper-mode', this.currentMode);
    }
    
    applyMode() {
        const body = document.body;
        
        // Remover todas las clases de modo
        body.classList.remove('prompter-mode', 'concert-mode', 'hide-songlist');
        
        // Aplicar el modo correspondiente
        if (this.currentMode === 'prompter') {
            body.classList.add('prompter-mode');
            this.songlistToggleBtn.style.display = 'none';
        } else if (this.currentMode === 'concert') {
            body.classList.add('concert-mode');
            this.songlistToggleBtn.style.display = 'block';
            
            // Aplicar el estado actual de la lista de canciones
            if (!this.songlistVisible) {
                body.classList.add('hide-songlist');
            }
        } else {
            // Modo edición - mostrar todo
            this.songlistToggleBtn.style.display = 'none';
            this.songlistVisible = true;
        }
    }
    
    updateModeButton() {
        this.modeToggleBtn.textContent = this.modeLabels[this.currentMode];
    }
    
    toggleSonglist() {
        if (this.currentMode === 'concert') {
            this.songlistVisible = !this.songlistVisible;
            const body = document.body;
            
            if (this.songlistVisible) {
                body.classList.remove('hide-songlist');
                this.songlistToggleBtn.textContent = '📋 Ocultar';
            } else {
                body.classList.add('hide-songlist');
                this.songlistToggleBtn.textContent = '📋 Mostrar';
            }
        }
    }
    
    loadModePreferences() {
        const savedMode = localStorage.getItem('drumhelper-mode');
        if (savedMode && this.modes.includes(savedMode)) {
            this.currentMode = savedMode;
        }
        
        this.applyMode();
        this.updateModeButton();
        
        // Configurar el botón de lista según el modo
        if (this.currentMode === 'concert') {
            this.songlistToggleBtn.textContent = this.songlistVisible ? '📋 Ocultar' : '📋 Mostrar';
        }
    }
    
    toggleTimer() {
        if (this.timerRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        this.timerRunning = true;
        this.playPauseBtn.textContent = '⏸️';
        
        this.timerInterval = setInterval(() => {
            this.elapsedTime++;
            this.updateTimerDisplay();
        }, 1000);
    }
    
    pauseTimer() {
        this.timerRunning = false;
        this.playPauseBtn.textContent = '▶️';
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    restartTimer() {
        this.pauseTimer();
        this.elapsedTime = 0;
        this.updateTimerDisplay();
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerText.textContent = formattedTime;
    }
    
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        this.isRecording = true;
        this.recordBtn.classList.add('recording');
        this.recordBtn.textContent = '⏹️';
        
        // Limpiar array de eventos anteriores
        this.recordingEvents = [];
        
        // Volver al comienzo de las letras
        this.scrollPosition = 0;
        this.updateScrollPosition();
        
        // Reiniciar siempre el temporizador desde 0 cuando se inicie la grabación
        this.restartTimer();
        this.startTimer();
        
        console.log('🔴 Grabación iniciada - Capturando eventos de scroll');
    }
    
    stopRecording() {
        this.isRecording = false;
        this.recordBtn.classList.remove('recording');
        this.recordBtn.textContent = '🔴';
        
        // Pausar el temporizador cuando se detenga la grabación
        this.pauseTimer();
        
        // Mostrar eventos capturados en consola
        console.log('⏹️ Grabación detenida');
        console.log('📊 Eventos de scroll capturados:', this.recordingEvents);
        
        // Enviar eventos al songManager si existe
        if (window.songManager && this.recordingEvents.length > 0) {
            window.songManager.addRecordingEventsToCurrentSong(this.recordingEvents);
        }
    }
    
    recordScrollEvent(direction) {
        const event = {
            type: 'scroll',
            direction: direction, // 'up' o 'down'
            timestamp: this.elapsedTime, // Tiempo en segundos desde el inicio de la grabación
            position: this.scrollPosition // Posición actual del scroll
        };
        
        this.recordingEvents.push(event);
        
        console.log(`📝 Evento capturado: ${direction} a los ${this.elapsedTime}s (posición: ${this.scrollPosition}px)`);
    }
}

// Exportar para uso global
window.LyricsScroller = LyricsScroller;
