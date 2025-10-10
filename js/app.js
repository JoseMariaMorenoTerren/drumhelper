// Aplicación principal - Inicialización y coordinación de componentes
class DrumHelperApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        
        // Prevenir zoom por doble toque en dispositivos táctiles
        this.preventDoubleTabZoom();
        
        // Registrar Service Worker para PWA
        registerServiceWorker();
        
        this.init();
    }
    
    init() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }
    
    initializeComponents() {
        try {
            console.log('Inicializando Drum Helper...');
            
            // Inicializar componentes en orden
            this.components.metronome = new Metronome();
            this.components.lyricsScroller = new LyricsScroller();
            this.components.songManager = new SongManager();
            
            // Hacer componentes disponibles globalmente
            window.metronome = this.components.metronome;
            window.lyricsScroller = this.components.lyricsScroller;
            window.songManager = this.components.songManager;
            
            this.setupGlobalEventListeners();
            this.initializeKeyboardShortcuts();
            
            this.isInitialized = true;
            console.log('Drum Helper inicializado correctamente');
            
            // Mostrar mensaje de bienvenida - Deshabilitado
            // this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Error inicializando la aplicación:', error);
            this.showError('Error al inicializar la aplicación. Por favor, recarga la página.');
        }
    }

    preventDoubleTabZoom() {
        // Prevenir zoom por doble toque en toda la aplicación EXCEPTO en área de letras
        let lastTouchEnd = 0;
        
        document.addEventListener('touchend', function (event) {
            // Permitir scroll normal en el área de letras
            if (event.target.closest('.lyrics-container') || event.target.closest('.lyrics-content')) {
                return;
            }
            
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // Prevenir zoom con gestos de pellizco EXCEPTO en área de letras
        document.addEventListener('touchstart', function (event) {
            // Permitir gestos táctiles normales en el área de letras
            if (event.target.closest('.lyrics-container') || event.target.closest('.lyrics-content')) {
                return;
            }
            
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });

        // Prevenir contexto de menú en iOS
        document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });

        // Prevenir selección de texto arrastrada accidentalmente
        document.addEventListener('selectstart', function (event) {
            // Permitir selección solo en inputs y textareas
            if (!event.target.matches('input, textarea')) {
                event.preventDefault();
            }
        });

        console.log('🚫 Protección contra zoom activada para dispositivos táctiles');
    }
    
    setupGlobalEventListeners() {
        // Eventos de cambio de visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.components.metronome.isPlaying) {
                // Pausar metrónomo cuando se cambia de pestaña para ahorrar recursos
                // (opcional, se puede comentar si no se desea este comportamiento)
                // this.components.metronome.pause();
            }
        });
        
        // Eventos de redimensionamiento
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        // Prevenir cierre accidental
        window.addEventListener('beforeunload', (e) => {
            if (this.components.metronome && this.components.metronome.isPlaying) {
                e.preventDefault();
                e.returnValue = '¿Estás seguro de que quieres cerrar? El metrónomo está reproduciéndose.';
            }
        });
    }
    
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignorar si está escribiendo en un input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Atajos de teclado globales
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (e.ctrlKey || e.metaKey) {
                        // Ctrl/Cmd + Espacio: Toggle metrónomo
                        this.components.metronome.togglePlayPause();
                    } else {
                        // Espacio: Toggle auto-scroll
                        this.components.lyricsScroller.toggleAutoScroll();
                    }
                    break;
                    
                case 'Escape':
                    // Escape: Parar metrónomo
                    this.components.metronome.stop();
                    break;
                    
                case 'KeyT':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Ctrl/Cmd + T: Tap tempo
                        this.components.metronome.tapTempo();
                    }
                    break;
                    
                case 'KeyN':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Ctrl/Cmd + N: Nueva canción
                        this.components.songManager.openAddSongModal();
                    }
                    break;
                    
                case 'ArrowLeft':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Ctrl/Cmd + Flecha izquierda: -1 BPM
                        this.components.metronome.changeBPM(-1);
                    } else if (e.shiftKey) {
                        e.preventDefault();
                        // Shift + Flecha izquierda: -10 BPM
                        this.components.metronome.changeBPM(-10);
                    }
                    break;
                    
                case 'ArrowRight':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Ctrl/Cmd + Flecha derecha: +1 BPM
                        this.components.metronome.changeBPM(1);
                    } else if (e.shiftKey) {
                        e.preventDefault();
                        // Shift + Flecha derecha: +10 BPM
                        this.components.metronome.changeBPM(10);
                    }
                    break;
                    
                case 'Equal':
                case 'NumpadAdd':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Ctrl/Cmd + + : Aumentar tamaño de fuente
                        this.components.lyricsScroller.changeFontSize(0.2);
                    }
                    break;
                    
                case 'Minus':
                case 'NumpadSubtract':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Ctrl/Cmd + - : Reducir tamaño de fuente
                        this.components.lyricsScroller.changeFontSize(-0.2);
                    }
                    break;
                    
                case 'KeyS':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Ctrl/Cmd + S: Exportar canciones
                        this.components.songManager.exportSongs();
                    }
                    break;
                    
                case 'KeyO':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Ctrl/Cmd + O: Importar canciones
                        this.components.songManager.importBtn.click();
                    }
                    break;
                    
                case 'KeyE':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Ctrl/Cmd + E: Editar canción actual
                        const currentSong = this.components.songManager.getCurrentSong();
                        if (currentSong) {
                            this.components.songManager.openEditSongModal(currentSong);
                        } else {
                            this.components.songManager.showNotification('No hay canción seleccionada para editar', 'info');
                        }
                    }
                    break;
            }
        });
    }
    
    handleWindowResize() {
        // Ajustar scroll de letras después del redimensionamiento
        if (this.components.lyricsScroller) {
            setTimeout(() => {
                this.components.lyricsScroller.updateScrollPosition();
            }, 100);
        }
    }
    
    showWelcomeMessage() {
        // Mostrar mensaje temporal de bienvenida (opcional)
        const message = document.createElement('div');
        message.className = 'welcome-toast';
        message.innerHTML = `
            <div>¡Bienvenido a Drum Helper!</div>
            <div style="font-size: 0.9rem; margin-top: 5px;">
                Atajos: Espacio (auto-scroll) • Ctrl+Espacio (metrónomo) • Ctrl+T (tap tempo)<br>
                Ctrl+←/→ (±1 BPM) • Shift+←/→ (±10 BPM) • Ctrl+±/- (tamaño letra)<br>
                Ctrl+S (exportar) • Ctrl+O (importar) • Ctrl+E (editar canción)
            </div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ff4444;
            z-index: 1000;
            max-width: 300px;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(message);
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 5000);
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.textContent = message;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
            max-width: 300px;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // Métodos públicos para interacción externa
    getComponents() {
        return this.components;
    }
    
    isReady() {
        return this.isInitialized;
    }
}

// Estilos adicionales para los toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .welcome-toast, .error-toast {
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideInNotification {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification {
        transition: all 0.3s ease;
    }
    
    .section-header {
        font-weight: bold;
        color: #ff4444;
        margin: 20px 0 10px 0;
        font-size: 1.1em;
        text-transform: uppercase;
    }
    
    .special-line {
        color: #ff8800;
        font-weight: bold;
        margin: 8px 0;
        line-height: 1.8;
        text-shadow: 0 0 2px rgba(255, 136, 0, 0.3);
    }
    
    .lyric-line {
        margin: 8px 0;
        line-height: 1.8;
    }
`;
document.head.appendChild(toastStyles);

// Funcionalidad del modal de ayuda
function initializeHelpModal() {
    const helpBtn = document.getElementById('help-btn');
    const versionCode = document.getElementById('version-code');
    const helpModal = document.getElementById('help-modal');
    const helpClose = document.querySelector('.help-close');
    
    if (helpBtn && helpModal && helpClose) {
        // Abrir modal con botón de ayuda
        helpBtn.addEventListener('click', () => {
            helpModal.style.display = 'block';
        });
        
        // Abrir modal con código de versión
        if (versionCode) {
            let clickCount = 0;
            versionCode.addEventListener('click', () => {
                clickCount++;
                if (clickCount === 1) {
                    setTimeout(() => {
                        if (clickCount === 1) {
                            // Un clic - abrir ayuda
                            helpModal.style.display = 'block';
                        } else if (clickCount === 2) {
                            // Doble clic - forzar actualización
                            forceAppUpdate();
                        }
                        clickCount = 0;
                    }, 300);
                }
            });
        }
        
        // Cerrar modal con X
        helpClose.addEventListener('click', () => {
            helpModal.style.display = 'none';
        });
        
        // Cerrar modal clickeando fuera
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
        
        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && helpModal.style.display === 'block') {
                helpModal.style.display = 'none';
            }
        });
    }
}

// Función para registrar Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    console.log('Service Worker registrado correctamente:', registration.scope);
                    
                    // Verificar actualizaciones cada 30 segundos
                    setInterval(() => {
                        registration.update();
                    }, 30000);
                    
                    // Manejar actualizaciones del Service Worker
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // Nueva versión disponible
                                    console.log('Nueva versión disponible - recargando...');
                                    showUpdateNotification();
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.log('Error registrando Service Worker:', error);
                });
        });
        
        // Escuchar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'CACHE_UPDATED') {
                console.log('Cache actualizado - recargando página...');
                window.location.reload();
            }
        });
    }
}

// Mostrar notificación de actualización
function showUpdateNotification() {
    const updateDiv = document.createElement('div');
    updateDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            text-align: center;
        ">
            <div style="font-weight: bold; margin-bottom: 8px;">¡Nueva versión disponible!</div>
            <button onclick="window.location.reload()" style="
                background: white;
                color: #4CAF50;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">Actualizar ahora</button>
        </div>
    `;
    
    document.body.appendChild(updateDiv);
    
    // Auto-actualizar después de 5 segundos
    setTimeout(() => {
        window.location.reload();
    }, 5000);
}

// Forzar actualización de la aplicación
function forceAppUpdate() {
    console.log('Forzando actualización de la aplicación...');
    
    // Mostrar mensaje de actualización
    const updateDiv = document.createElement('div');
    updateDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #333;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            font-family: Arial, sans-serif;
            text-align: center;
        ">
            <div style="font-size: 1.2em; margin-bottom: 10px;">🔄 Actualizando aplicación...</div>
            <div style="color: #ccc;">Limpiando cache y recargando</div>
        </div>
    `;
    document.body.appendChild(updateDiv);
    
    // Limpiar todos los caches
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('Eliminando cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('Todos los caches eliminados');
            // Desregistrar Service Worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => {
                        registration.unregister();
                    });
                    // Recargar después de limpiar todo
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 1000);
                });
            } else {
                // Recargar sin Service Worker
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            }
        });
    } else {
        // Sin soporte de cache, solo recargar
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    }
}

// Inicializar modal de ayuda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeHelpModal);

// Inicializar la aplicación
const app = new DrumHelperApp();

// Hacer la aplicación disponible globalmente para debugging
window.drumHelperApp = app;
