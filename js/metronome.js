class Metronome {
    constructor() {
        this.bpm = 120;
        this.isPlaying = false;
        this.intervalId = null;
        this.beatCount = 0;
        this.tapTimes = [];
        
        this.beatIndicator = document.getElementById('beat-indicator');
        this.bpmInput = document.getElementById('bpm-input');
        this.bpmText = document.getElementById('bpm-text');
        this.tapTempoBtn = document.getElementById('tap-tempo-btn');
        this.bpmMinus1Btn = document.getElementById('bpm-minus-1');
        this.bpmMinus10Btn = document.getElementById('bpm-minus-10');
        this.bpmPlus1Btn = document.getElementById('bpm-plus-1');
        this.bpmPlus10Btn = document.getElementById('bpm-plus-10');
        
        this.initializeEventListeners();
        this.createAudioContext();
        
        // Inicializar el texto BPM en el círculo
        if (this.bpmText) {
            this.bpmText.textContent = this.bpm;
        }
    }
    
    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API no disponible, usando fallback visual');
            this.audioContext = null;
        }
    }
    
    initializeEventListeners() {
        this.bpmInput.addEventListener('input', (e) => {
            this.setBPM(parseInt(e.target.value));
        });
        
        this.tapTempoBtn.addEventListener('click', () => {
            this.tapTempo();
        });
        
        // Beat indicator como botón de play/pause (clic) y stop (doble clic)
        this.beatIndicator.addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        this.beatIndicator.addEventListener('dblclick', () => {
            this.stop();
        });
        
        // Botones de incremento/decremento BPM
        this.bpmMinus1Btn.addEventListener('click', () => {
            this.changeBPM(-1);
        });
        
        this.bpmMinus10Btn.addEventListener('click', () => {
            this.changeBPM(-10);
        });
        
        this.bpmPlus1Btn.addEventListener('click', () => {
            this.changeBPM(1);
        });
        
        this.bpmPlus10Btn.addEventListener('click', () => {
            this.changeBPM(10);
        });
    }
    
    setBPM(bpm) {
        if (bpm >= 40 && bpm <= 300) {
            this.bpm = bpm;
            this.bpmInput.value = bpm;
            
            // Actualizar información en el header
            document.getElementById('current-bpm').textContent = `BPM: ${bpm}`;
            
            // Actualizar el texto dentro del círculo del metrónomo
            const bpmText = document.getElementById('bpm-text');
            if (bpmText) {
                bpmText.textContent = bpm;
            }
            
            // Si está reproduciendo, reiniciar con el nuevo tempo
            if (this.isPlaying) {
                this.stop();
                this.play();
            }
            
            // Notificar a otros componentes del cambio de BPM
            this.dispatchBPMChange();
        }
    }
    
    changeBPM(delta) {
        const newBPM = this.bpm + delta;
        this.setBPM(newBPM);
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            
            // Reanudar el contexto de audio si está suspendido
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const interval = (60 / this.bpm) * 1000; // Convertir BPM a milisegundos
            
            this.intervalId = setInterval(() => {
                this.beat();
            }, interval);
            
            // Ejecutar el primer beat inmediatamente
            this.beat();
        }
    }
    
    pause() {
        if (this.isPlaying) {
            this.isPlaying = false;
            
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
    }
    
    stop() {
        this.pause();
        this.beatCount = 0;
        this.resetBeatIndicator();
    }
    
    beat() {
        this.beatCount++;
        this.visualBeat();
        this.audioBeat();
        
        // Notificar a otros componentes del beat
        window.dispatchEvent(new CustomEvent('metronome-beat', {
            detail: { 
                beatCount: this.beatCount,
                bpm: this.bpm,
                isStrongBeat: false // Todos los beats son iguales
            }
        }));
    }
    
    visualBeat() {
        this.beatIndicator.classList.add('active');
        setTimeout(() => {
            this.beatIndicator.classList.remove('active');
        }, 100);
    }
    
    audioBeat() {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Frecuencia igual para todos los beats
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            
            // Volumen
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Error reproduciendo sonido del metrónomo:', error);
        }
    }
    
    resetBeatIndicator() {
        this.beatIndicator.classList.remove('active');
    }
    
    tapTempo() {
        const now = Date.now();
        this.tapTimes.push(now);
        
        // Mantener solo los últimos 5 taps
        if (this.tapTimes.length > 5) {
            this.tapTimes.shift();
        }
        
        // Calcular BPM si tenemos al menos 2 taps
        if (this.tapTimes.length >= 2) {
            const intervals = [];
            for (let i = 1; i < this.tapTimes.length; i++) {
                intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
            }
            
            const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const calculatedBPM = Math.round(60000 / averageInterval);
            
            if (calculatedBPM >= 40 && calculatedBPM <= 300) {
                this.setBPM(calculatedBPM);
            }
        }
        
        // Limpiar taps antiguos (más de 3 segundos)
        setTimeout(() => {
            this.tapTimes = this.tapTimes.filter(time => now - time < 3000);
        }, 3000);
    }
    
    dispatchBPMChange() {
        window.dispatchEvent(new CustomEvent('bpm-change', {
            detail: { bpm: this.bpm }
        }));
    }
}

// Exportar para uso global
window.Metronome = Metronome;
