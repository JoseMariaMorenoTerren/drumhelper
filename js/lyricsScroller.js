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
        this.concertGotoTopBtn = document.getElementById('concert-goto-top-btn');
        this.concertPlayBtn = document.getElementById('concert-play-btn');
        this.prompterPrevBtn = document.getElementById('prompter-prev-btn');
        this.prompterNextBtn = document.getElementById('prompter-next-btn');
        this.prompterGotoTopBtn = document.getElementById('prompter-goto-top-btn');
        this.prompterPlayBtn = document.getElementById('prompter-play-btn');
        this.prompterSongTitle = document.getElementById('prompter-song-title');
        this.prompterTitleText = document.getElementById('prompter-title-text');
        this.generalPrevBtn = document.getElementById('general-prev-btn');
        this.generalNextBtn = document.getElementById('general-next-btn');
        
        this.isAutoScrolling = true;
        this.scrollSpeed = 5;
        this.scrollPosition = 0;
        this.autoScrollInterval = null;
        this.currentBPM = 120;
        this.fontSize = 2.4; // Tamaño inicial en rem (doble del original)
        this.currentMode = 'edition'; // Modos: 'edition', 'concert', 'prompter'
        this.modes = ['edition', 'concert', 'prompter'];
        /*
        this.modeLabels = {
            'edition': '📝 Edición',
            'concert': '🎵 Concierto', 
            'prompter': '📺 Prompter'
        };*/
        this.modeLabels = {
            'edition': 'Edición',
            'concert': 'Concierto', 
            'prompter': 'Prompter'
        };
        this.songlistVisible = true;
        this.timerRunning = false;
        this.timerInterval = null;
        this.elapsedTime = 0; // En segundos
        this.isRecording = false;
        this.recordingEvents = []; // Array para capturar eventos durante la grabación
        this.isPlaying = false;
        this.playbackEvents = []; // Eventos a reproducir
        this.playbackTimeouts = []; // Timeouts programados para la reproducción
        this.isCountdown = false; // Modo cuenta atrás
        this.countdownTime = 0; // Tiempo de cuenta atrás en segundos
        
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
        
        this.concertGotoTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });
        
        this.concertPlayBtn.addEventListener('click', () => {
            this.toggleTimer();
        });
        
        this.prompterPrevBtn.addEventListener('click', () => {
            this.goToPreviousSong();
        });
        
        this.prompterNextBtn.addEventListener('click', () => {
            this.goToNextSong();
        });
        
        this.prompterGotoTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });
        
        this.prompterPlayBtn.addEventListener('click', () => {
            this.toggleTimer();
        });
        
        this.generalPrevBtn.addEventListener('click', () => {
            this.goToPreviousSong();
        });
        
        this.generalNextBtn.addEventListener('click', () => {
            this.goToNextSong();
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
        
        // Permitir scroll manual con la rueda del mouse (no interferir con touch)
        this.lyricsContainer.addEventListener('wheel', (e) => {
            // Solo interceptar eventos de mouse wheel, no de touch
            if (e.deltaMode === WheelEvent.DOM_DELTA_LINE || e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
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
            }
        });
        
        // Manejar scroll táctil en dispositivos móviles
        let isUserScrolling = false;
        let scrollTimeout;
        
        this.lyricsContainer.addEventListener('scroll', () => {
            // El usuario está haciendo scroll manual
            if (this.isAutoScrolling) {
                isUserScrolling = true;
                this.pauseAutoScroll();
                
                // Resetear flag después de que pare el scroll
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isUserScrolling = false;
                }, 1000); // 1 segundo sin scroll para considerar que paró
            }
        }, { passive: true });
        
        // Detectar inicio de touch para pausar auto-scroll
        this.lyricsContainer.addEventListener('touchstart', () => {
            if (this.isAutoScrolling) {
                this.pauseAutoScroll();
            }
        }, { passive: true });
        
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
                case 'ArrowLeft':
                    e.preventDefault();
                    this.goToPreviousSong();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.goToNextSong();
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
        // Procesar imágenes primero (patrón //img=archivo.jpg)
        let processedText = text.replace(/\/\/img=([^\s]+\.(jpg|jpeg|png|gif|webp))/gi, (match, filename) => {
            return `<img src="imagenes/${filename}" alt="${filename}" onerror="this.style.display='none'" loading="lazy">`;
        });
        
        // Convertir texto entre /0 y 0/ a HTML resaltado amarillo
        processedText = processedText.replace(/\/0(.*?)0\//g, '<span class="highlight-yellow">$1</span>');
        // Convertir texto entre /1 y 1/ a HTML resaltado azul
        processedText = processedText.replace(/\/1(.*?)1\//g, '<span class="highlight-blue">$1</span>');
        // Convertir texto entre /3 y 3/ a HTML resaltado verde
        processedText = processedText.replace(/\/3(.*?)3\//g, '<span class="highlight-green">$1</span>');
        
        // Aplicar colores cuando el código está al principio de línea (sin cierre)
        // /0 al principio = resto de línea en amarillo
        processedText = processedText.replace(/^\/0(.*)$/gm, '<span class="highlight-yellow">$1</span>');
        // /1 al principio = resto de línea en azul
        processedText = processedText.replace(/^\/1(.*)$/gm, '<span class="highlight-blue">$1</span>');
        // /3 al principio = resto de línea en verde
        processedText = processedText.replace(/^\/3(.*)$/gm, '<span class="highlight-green">$1</span>');
        
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
        
        // Capturar evento durante la grabación (pero no durante reproducción)
        if (this.isRecording && !this.isPlaying) {
            this.recordScrollEvent('up');
        }
    }
    
    scrollDown() {
        this.scrollPosition += 30;
        this.updateScrollPosition();
        
        // Capturar evento durante la grabación (pero no durante reproducción)
        if (this.isRecording && !this.isPlaying) {
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
            this.concertGotoTopBtn.style.display = 'none';
            this.concertPlayBtn.style.display = 'none';
            this.prompterPrevBtn.style.display = 'block';
            this.prompterNextBtn.style.display = 'block';
            this.prompterGotoTopBtn.style.display = 'block';
            this.prompterPlayBtn.style.display = 'block';
            this.prompterSongTitle.style.display = 'block';
            this.generalPrevBtn.style.display = 'none';
            this.generalNextBtn.style.display = 'none';
            this.updatePrompterTitle();
        } else if (this.currentMode === 'concert') {
            body.classList.add('concert-mode');
            this.songlistToggleBtn.style.display = 'block';
            this.concertGotoTopBtn.style.display = 'block';
            this.concertPlayBtn.style.display = 'block';
            this.prompterPrevBtn.style.display = 'none';
            this.prompterNextBtn.style.display = 'none';
            this.prompterGotoTopBtn.style.display = 'none';
            this.prompterPlayBtn.style.display = 'none';
            this.prompterSongTitle.style.display = 'none';
            this.generalPrevBtn.style.display = 'block';
            this.generalNextBtn.style.display = 'block';
            
            // Aplicar el estado actual de la lista de canciones
            if (!this.songlistVisible) {
                body.classList.add('hide-songlist');
            }
        } else {
            // Modo edición - mostrar todo
            this.songlistToggleBtn.style.display = 'none';
            this.concertGotoTopBtn.style.display = 'none';
            this.concertPlayBtn.style.display = 'none';
            this.prompterPrevBtn.style.display = 'none';
            this.prompterNextBtn.style.display = 'none';
            this.prompterGotoTopBtn.style.display = 'none';
            this.prompterPlayBtn.style.display = 'none';
            this.prompterSongTitle.style.display = 'none';
            this.generalPrevBtn.style.display = 'block';
            this.generalNextBtn.style.display = 'block';
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
            this.startPlayback();
        }
    }
    
    startTimer() {
        this.timerRunning = true;
        this.playPauseBtn.textContent = '⏸️';
        this.concertPlayBtn.textContent = '⏸️';
        
        this.timerInterval = setInterval(() => {
            if (this.isCountdown) {
                // Modo cuenta atrás
                this.countdownTime--;
                this.updateTimerDisplay();
                
                // Si llega a cero, parar el timer
                if (this.countdownTime <= 0) {
                    this.pauseTimer();
                    this.isCountdown = false;
                    this.countdownTime = 0;
                    this.updateTimerDisplay();
                }
            } else {
                // Modo normal
                this.elapsedTime++;
                this.updateTimerDisplay();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.timerRunning = false;
        this.playPauseBtn.textContent = '▶️';
        this.concertPlayBtn.textContent = '▶️';
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    startCountdown() {
        // Iniciar cuenta atrás de 3 minutos y 50 segundos (230 segundos)
        this.isCountdown = true;
        this.countdownTime = 3 * 60 + 50; // 3:50 en segundos
        this.elapsedTime = 0; // Resetear también el tiempo transcurrido
        
        console.log('⏰ Iniciando cuenta atrás de 3:50');
        
        // Volver al comienzo
        this.scrollPosition = 0;
        this.updateScrollPosition();
        
        // Iniciar el temporizador
        this.startTimer();
    }
    
    updateTimerDisplay() {
        let timeToShow, minutes, seconds;
        
        if (this.isCountdown) {
            // Mostrar cuenta atrás
            timeToShow = this.countdownTime;
            minutes = Math.floor(timeToShow / 60);
            seconds = timeToShow % 60;
        } else {
            // Mostrar tiempo transcurrido normal
            timeToShow = this.elapsedTime;
            minutes = Math.floor(timeToShow / 60);
            seconds = timeToShow % 60;
        }
        
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
    
    startPlayback() {
        // Obtener los eventos de grabación de la canción actual
        const currentSong = window.songManager ? window.songManager.getCurrentSong() : null;
        
        if (!currentSong || !currentSong.recordings || currentSong.recordings.length === 0) {
            console.log('ℹ️ No hay datos de grabación para esta canción - iniciando cuenta atrás');
            this.startCountdown();
            return;
        }
        
        // Usar la grabación más reciente
        const latestRecording = currentSong.recordings[currentSong.recordings.length - 1];
        this.playbackEvents = [...latestRecording.events];
        
        if (this.playbackEvents.length === 0) {
            console.log('ℹ️ No hay eventos en la grabación');
            alert('La grabación está vacía. No hay movimientos para reproducir.');
            return;
        }
        
        console.log(`▶️ Iniciando reproducción de ${this.playbackEvents.length} eventos`);
        console.log('📊 Eventos a reproducir:', this.playbackEvents);
        
        // Volver al comienzo
        this.scrollPosition = 0;
        this.updateScrollPosition();
        
        // Iniciar el temporizador
        this.isPlaying = true;
        this.startTimer();
        
        // Programar la reproducción de cada evento
        this.schedulePlaybackEvents();
    }
    
    schedulePlaybackEvents() {
        // Limpiar timeouts anteriores
        this.clearPlaybackTimeouts();
        
        this.playbackEvents.forEach((event, index) => {
            const timeout = setTimeout(() => {
                this.executePlaybackEvent(event);
            }, event.timestamp * 1000); // Convertir segundos a milisegundos
            
            this.playbackTimeouts.push(timeout);
        });
    }
    
    executePlaybackEvent(event) {
        console.log(`🎬 Reproduciendo evento: ${event.direction} a los ${event.timestamp}s`);
        
        if (event.direction === 'up') {
            // Ejecutar scroll hacia arriba sin grabar
            this.scrollPosition -= 30;
            this.updateScrollPosition();
        } else if (event.direction === 'down') {
            // Ejecutar scroll hacia abajo sin grabar
            this.scrollPosition += 30;
            this.updateScrollPosition();
        }
    }
    
    pauseTimer() {
        this.timerRunning = false;
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️';
        this.concertPlayBtn.textContent = '▶️';
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Limpiar reproducción programada
        this.clearPlaybackTimeouts();
        
        if (this.isPlaying) {
            console.log('⏸️ Reproducción pausada');
        }
    }
    
    clearPlaybackTimeouts() {
        this.playbackTimeouts.forEach(timeout => clearTimeout(timeout));
        this.playbackTimeouts = [];
    }
    
    restartTimer() {
        this.pauseTimer();
        this.elapsedTime = 0;
        this.isCountdown = false;
        this.countdownTime = 0;
        this.updateTimerDisplay();
        
        // Volver al comienzo también - mover letras arriba del todo
        this.scrollPosition = 0;
        this.updateScrollPosition();
        
        console.log('🔄 Timer reiniciado - volviendo al inicio');
    }
    
    goToPreviousSong() {
        if (window.songManager) {
            window.songManager.selectPreviousSong();
        }
    }
    
    goToNextSong() {
        if (window.songManager) {
            window.songManager.selectNextSong();
        }
    }
    
    updatePrompterTitle() {
        if (window.songManager && window.songManager.currentSong) {
            const song = window.songManager.currentSong;
            let titleText = song.title;
            if (song.artist) {
                titleText += ` - ${song.artist}`;
            }
            this.prompterTitleText.textContent = titleText;
        } else {
            this.prompterTitleText.textContent = 'Sin canción seleccionada';
        }
    }
}

// Exportar para uso global
window.LyricsScroller = LyricsScroller;
