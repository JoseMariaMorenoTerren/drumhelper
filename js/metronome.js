class Metronome {
    constructor() {
        this.bpm = 120;
        this.isPlaying = false;
        this.beatCount = 0;
        this.tapTimes = [];

        // --- Scheduler (Web Audio lookahead) ---
        // Basado en el patrón de Chris Wilson "A Tale of Two Clocks".
        this.lookahead = 25.0;          // ms: cada cuánto corre el scheduler
        this.scheduleAheadTime = 0.1;   // s: cuánto futuro programar por adelantado
        this.nextNoteTime = 0.0;        // s: tiempo absoluto del próximo beat (audioContext.currentTime)
        this.schedulerTimerId = null;   // setInterval del scheduler
        this.scheduledVisuals = [];     // timeouts pendientes para parpadeo visual

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
        // 'change' evita que cada keystroke reinicie el metrónomo.
        // Para feedback visual mientras se teclea, actualizamos el círculo en 'input'
        // pero sólo aplicamos un setBPM real en 'change'.
        this.bpmInput.addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && this.bpmText) {
                this.bpmText.textContent = v;
            }
        });

        this.bpmInput.addEventListener('change', (e) => {
            this.setBPM(parseInt(e.target.value));
        });

        this.tapTempoBtn.addEventListener('click', () => {
            this.tapTempo();
        });

        this.beatIndicator.addEventListener('click', () => {
            this.togglePlayPause();
        });

        this.beatIndicator.addEventListener('dblclick', () => {
            this.stop();
        });

        this.bpmMinus1Btn.addEventListener('click', () => { this.changeBPM(-1); });
        this.bpmMinus10Btn.addEventListener('click', () => { this.changeBPM(-10); });
        this.bpmPlus1Btn.addEventListener('click', () => { this.changeBPM(1); });
        this.bpmPlus10Btn.addEventListener('click', () => { this.changeBPM(10); });
    }

    setBPM(bpm) {
        if (isNaN(bpm) || bpm < 40 || bpm > 300) return;

        this.bpm = bpm;
        this.bpmInput.value = bpm;

        const currentBpm = document.getElementById('current-bpm');
        if (currentBpm) currentBpm.textContent = `BPM: ${bpm}`;
        if (this.bpmText) this.bpmText.textContent = bpm;

        // El scheduler usa this.bpm directamente cada tick, así que el cambio
        // se aplica sin reiniciar el reloj de audio (sin clicks ni glitches).

        this.dispatchBPMChange();
    }

    changeBPM(delta) {
        this.setBPM(this.bpm + delta);
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.isPlaying) return;
        if (!this.audioContext) {
            // No hay audio - emulamos el ciclo solo para los eventos visuales.
            this.isPlaying = true;
            this.beatCount = 0;
            this._fallbackInterval = setInterval(() => this._fallbackTick(), (60 / this.bpm) * 1000);
            this._fallbackTick();
            return;
        }

        // Reanudar el contexto de audio si está suspendido (autoplay policy).
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isPlaying = true;
        this.beatCount = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.05; // pequeño lead-in
        this.scheduler();
        this.schedulerTimerId = setInterval(() => this.scheduler(), this.lookahead);
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;

        if (this.schedulerTimerId) {
            clearInterval(this.schedulerTimerId);
            this.schedulerTimerId = null;
        }
        if (this._fallbackInterval) {
            clearInterval(this._fallbackInterval);
            this._fallbackInterval = null;
        }

        // Cancelar parpadeos visuales pendientes
        this.scheduledVisuals.forEach(t => clearTimeout(t));
        this.scheduledVisuals = [];
    }

    stop() {
        this.pause();
        this.beatCount = 0;
        this.resetBeatIndicator();
    }

    // Patrón de scheduler con lookahead: programa cada beat usando el reloj de audio
    scheduler() {
        if (!this.audioContext) return;

        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleBeat(this.nextNoteTime);
            this.advanceBeat();
        }
    }

    scheduleBeat(time) {
        // Audio: oscilador programado en tiempo absoluto
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(400, time);
            gain.gain.setValueAtTime(0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

            osc.start(time);
            osc.stop(time + 0.1);
        } catch (error) {
            console.warn('Error programando beat:', error);
        }

        // Visual + evento: se ejecutan cuando el beat suena
        const delayMs = Math.max(0, (time - this.audioContext.currentTime) * 1000);
        const beatCountSnapshot = this.beatCount + 1;
        const bpmSnapshot = this.bpm;

        const visualTimer = setTimeout(() => {
            if (!this.isPlaying) return;
            this.beatCount = beatCountSnapshot;
            this.visualBeat();
            window.dispatchEvent(new CustomEvent('metronome-beat', {
                detail: {
                    beatCount: beatCountSnapshot,
                    bpm: bpmSnapshot,
                    isStrongBeat: false
                }
            }));
        }, delayMs);

        this.scheduledVisuals.push(visualTimer);
        // Limpieza periódica: eliminamos los timers cuya callback ya disparó
        if (this.scheduledVisuals.length > 32) {
            this.scheduledVisuals = this.scheduledVisuals.slice(-16);
        }
    }

    advanceBeat() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat;
    }

    // Camino de fallback cuando no hay AudioContext
    _fallbackTick() {
        this.beatCount++;
        this.visualBeat();
        window.dispatchEvent(new CustomEvent('metronome-beat', {
            detail: { beatCount: this.beatCount, bpm: this.bpm, isStrongBeat: false }
        }));
    }

    visualBeat() {
        this.beatIndicator.classList.add('active');
        setTimeout(() => {
            this.beatIndicator.classList.remove('active');
        }, 100);
    }

    resetBeatIndicator() {
        this.beatIndicator.classList.remove('active');
    }

    tapTempo() {
        const now = Date.now();

        // Descartar taps antiguos (más de 2s desde el último) antes de añadir el nuevo
        if (this.tapTimes.length > 0 && now - this.tapTimes[this.tapTimes.length - 1] > 2000) {
            this.tapTimes = [];
        }

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
    }

    dispatchBPMChange() {
        window.dispatchEvent(new CustomEvent('bpm-change', {
            detail: { bpm: this.bpm }
        }));
    }
}

// Exportar para uso global
window.Metronome = Metronome;
