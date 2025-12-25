class MIDIHandler {
    constructor() {
        this.midiAccess = null;
        this.inputs = [];
        this.outputs = [];
        this.listeners = [];
        this.isSupported = false;
        this.isEnabled = false;
        
        this.init();
    }
    
    async init() {
        // Verificar si el navegador soporta Web MIDI API
        if (!navigator.requestMIDIAccess) {
            console.warn('⚠️ Web MIDI API no soportada en este navegador');
            this.isSupported = false;
            return;
        }
        
        this.isSupported = true;
        console.log('✅ Web MIDI API soportada');
    }
    
    async enable() {
        if (!this.isSupported) {
            alert('Tu navegador no soporta Web MIDI API. Prueba con Chrome, Edge o Opera.');
            return false;
        }
        
        try {
            // Solicitar acceso a dispositivos MIDI
            this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
            
            console.log('✅ Acceso MIDI concedido');
            
            // Obtener entradas MIDI
            this.updateInputs();
            this.updateOutputs();
            
            // Escuchar cambios en dispositivos MIDI (conectar/desconectar)
            this.midiAccess.onstatechange = (e) => {
                console.log('🔄 Estado MIDI cambiado:', e.port.name, e.port.state);
                this.updateInputs();
                this.updateOutputs();
                this.notifyDeviceChange();
            };
            
            this.isEnabled = true;
            return true;
            
        } catch (error) {
            console.error('❌ Error al acceder a MIDI:', error);
            alert('No se pudo acceder a dispositivos MIDI. Asegúrate de dar permiso en el navegador.');
            return false;
        }
    }
    
    updateInputs() {
        if (!this.midiAccess) return;
        
        this.inputs = [];
        const inputs = this.midiAccess.inputs.values();
        
        for (let input of inputs) {
            console.log('🎹 Entrada MIDI detectada:', input.name);
            this.inputs.push(input);
            
            // Asignar listener a cada entrada
            input.onmidimessage = (message) => this.handleMIDIMessage(message);
        }
        
        if (this.inputs.length === 0) {
            console.log('⚠️ No se detectaron entradas MIDI');
        }
    }
    
    updateOutputs() {
        if (!this.midiAccess) return;
        
        this.outputs = [];
        const outputs = this.midiAccess.outputs.values();
        
        for (let output of outputs) {
            console.log('🎵 Salida MIDI detectada:', output.name);
            this.outputs.push(output);
        }
    }
    
    handleMIDIMessage(message) {
        const [status, note, velocity] = message.data;
        const command = status >> 4; // Los primeros 4 bits indican el tipo de mensaje
        const channel = status & 0x0f; // Los últimos 4 bits indican el canal
        
        const midiEvent = {
            command: command,
            channel: channel,
            note: note,
            velocity: velocity,
            timestamp: message.timeStamp,
            raw: message.data
        };
        
        // Tipos de comandos MIDI más comunes:
        // 8 = Note Off
        // 9 = Note On
        // 11 = Control Change
        // 12 = Program Change
        // 14 = Pitch Bend
        
        const commandNames = {
            8: 'Note Off',
            9: 'Note On',
            10: 'Aftertouch',
            11: 'Control Change',
            12: 'Program Change',
            13: 'Channel Pressure',
            14: 'Pitch Bend'
        };
        
        console.log(`🎹 MIDI ${commandNames[command] || 'Unknown'}:`, 
            `Canal ${channel + 1}, Nota ${note}, Velocity ${velocity}`);
        
        // Notificar a todos los listeners registrados
        this.notifyListeners(midiEvent);
    }
    
    // Registrar un listener para eventos MIDI
    addListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            console.log('✅ Listener MIDI registrado');
        }
    }
    
    // Eliminar un listener
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
            console.log('🗑️ Listener MIDI eliminado');
        }
    }
    
    // Notificar a todos los listeners
    notifyListeners(midiEvent) {
        this.listeners.forEach(listener => {
            try {
                listener(midiEvent);
            } catch (error) {
                console.error('❌ Error en listener MIDI:', error);
            }
        });
    }
    
    // Notificar cambio en dispositivos
    notifyDeviceChange() {
        const deviceInfo = {
            inputs: this.inputs.map(i => i.name),
            outputs: this.outputs.map(o => o.name)
        };
        console.log('📱 Dispositivos MIDI:', deviceInfo);
    }
    
    // Enviar mensaje MIDI (para salidas)
    sendMessage(outputIndex, data) {
        if (outputIndex >= 0 && outputIndex < this.outputs.length) {
            this.outputs[outputIndex].send(data);
            console.log('📤 Mensaje MIDI enviado:', data);
        } else {
            console.error('❌ Índice de salida MIDI inválido');
        }
    }
    
    // Obtener información del estado
    getStatus() {
        return {
            supported: this.isSupported,
            enabled: this.isEnabled,
            inputCount: this.inputs.length,
            outputCount: this.outputs.length,
            inputs: this.inputs.map(i => ({ id: i.id, name: i.name, manufacturer: i.manufacturer })),
            outputs: this.outputs.map(o => ({ id: o.id, name: o.name, manufacturer: o.manufacturer }))
        };
    }
    
    disable() {
        if (this.midiAccess) {
            // Desconectar todos los inputs
            this.inputs.forEach(input => {
                input.onmidimessage = null;
            });
            
            this.inputs = [];
            this.outputs = [];
            this.listeners = [];
            this.midiAccess = null;
            this.isEnabled = false;
            
            console.log('🔌 MIDI deshabilitado');
        }
    }
}

// Exportar instancia global
window.midiHandler = new MIDIHandler();
