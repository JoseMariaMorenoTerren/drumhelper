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

        // Ajustes de sonido y destello (persistentes en este dispositivo)
        this.soundOptions = [
            { id: 'seno',    label: 'Seno 400 Hz',  wave: 'sine',     freq: 400 },
            { id: 'agudo',   label: 'Agudo 800 Hz', wave: 'sine',     freq: 800 },
            { id: 'grave',   label: 'Grave 220 Hz', wave: 'sine',     freq: 220 },
            { id: 'madera',  label: 'Madera',       wave: 'triangle', freq: 600 },
            { id: 'cencerro', label: 'Cencerro',    wave: 'square',   freq: 540 }
        ];
        this.settingsKey = 'drumhelper-metronome-settings';
        this.settings = this.loadSettings();

        this.beatIndicator = document.getElementById('beat-indicator');
        this.beatFrame = document.getElementById('beat-frame');
        this.compactBtn = document.getElementById('metronome-compact-btn');
        this.bpmTextCompact = document.getElementById('bpm-text-compact');
        this.bpmInput = document.getElementById('bpm-input');
        this.bpmText = document.getElementById('bpm-text');
        this.tapTempoBtn = document.getElementById('tap-tempo-btn');
        this.bpmMinus1Btn = document.getElementById('bpm-minus-1');
        this.bpmMinus10Btn = document.getElementById('bpm-minus-10');
        this.bpmPlus1Btn = document.getElementById('bpm-plus-1');
        this.bpmPlus10Btn = document.getElementById('bpm-plus-10');

        this.initializeEventListeners();
        this.createAudioContext();

        // Inicializar el texto BPM en el círculo y en el botón compacto
        if (this.bpmText) {
            this.bpmText.textContent = this.bpm;
        }
        if (this.bpmTextCompact) {
            this.bpmTextCompact.textContent = this.bpm;
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
            if (!isNaN(v)) {
                if (this.bpmText) this.bpmText.textContent = v;
                if (this.bpmTextCompact) this.bpmTextCompact.textContent = v;
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

        // Botón compacto (móvil): mismas interacciones que el círculo
        if (this.compactBtn) {
            this.compactBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });

            this.compactBtn.addEventListener('dblclick', () => {
                this.stop();
            });
        }

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
        if (this.bpmTextCompact) this.bpmTextCompact.textContent = bpm;

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
            this.updatePlayingState();
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
        this.updatePlayingState();
        this.nextNoteTime = this.audioContext.currentTime + 0.05; // pequeño lead-in
        this.scheduler();
        this.schedulerTimerId = setInterval(() => this.scheduler(), this.lookahead);
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        this.updatePlayingState();

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

            const snd = this.getSound();
            osc.type = snd.wave;
            osc.frequency.setValueAtTime(snd.freq, time);
            const vol = Math.max(0.001, this.settings.volume);
            gain.gain.setValueAtTime(vol, time);
            gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol / 30), time + 0.1);

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

    // El beat se ilumina en el marco alrededor de la pantalla (móvil, tablet y PC)
    visualBeat() {
        if (!this.beatFrame || !this.settings.flash) return;
        this.beatFrame.classList.add('active');
        setTimeout(() => {
            this.beatFrame.classList.remove('active');
        }, 100);
    }

    resetBeatIndicator() {
        if (this.beatFrame) this.beatFrame.classList.remove('active');
        this.beatIndicator.classList.remove('active');
    }

    // Refleja el estado play/pausa en el círculo y en el botón compacto
    updatePlayingState() {
        if (this.beatIndicator) {
            this.beatIndicator.classList.toggle('playing', this.isPlaying);
        }
        if (this.compactBtn) {
            this.compactBtn.classList.toggle('playing', this.isPlaying);
        }
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

    // ---------- Ajustes ----------
    loadSettings() {
        const defaults = { sound: 'seno', volume: 0.3, flash: true };
        try {
            const saved = JSON.parse(localStorage.getItem(this.settingsKey) || '{}');
            const merged = { ...defaults, ...saved };
            if (!this.soundOptions.some(o => o.id === merged.sound)) merged.sound = defaults.sound;
            merged.volume = Math.min(1, Math.max(0, Number(merged.volume)));
            if (isNaN(merged.volume)) merged.volume = defaults.volume;
            merged.flash = merged.flash !== false;
            return merged;
        } catch (e) {
            return defaults;
        }
    }

    updateSettings(partial) {
        this.settings = { ...this.settings, ...partial };
        try { localStorage.setItem(this.settingsKey, JSON.stringify(this.settings)); } catch (e) { /* sin almacenamiento */ }
    }

    getSound() {
        return this.soundOptions.find(o => o.id === this.settings.sound) || this.soundOptions[0];
    }

    // Un click de prueba (también arranca el contexto de audio si estaba suspendido)
    playTestClick() {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') this.audioContext.resume();
        this.scheduleTestClick(this.audioContext.currentTime + 0.02);
        this.visualBeat();
    }

    scheduleTestClick(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        const snd = this.getSound();
        osc.type = snd.wave;
        osc.frequency.setValueAtTime(snd.freq, time);
        const vol = Math.max(0.001, this.settings.volume);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol / 30), time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    dispatchBPMChange() {
        window.dispatchEvent(new CustomEvent('bpm-change', {
            detail: { bpm: this.bpm }
        }));
    }
}

// Exportar para uso global
window.Metronome = Metronome;
