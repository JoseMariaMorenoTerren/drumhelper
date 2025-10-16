class SongManager {
    constructor() {
        this.songs = [];
        this.currentSong = null;
        this.setlistName = 'Canciones'; // Nombre por defecto
        this.storageKey = 'drumhelper-songs';
        this.repertoiresKey = 'drumhelper-repertoires';
        this.currentRepertoireId = 'default';
        this.repertoires = new Map();
        
        this.songList = document.getElementById('song-list');
        this.orderModeBtn = document.getElementById('order-mode-btn');
        this.resetOrderBtn = document.getElementById('reset-order-btn');
        this.searchInput = document.getElementById('search-input');
        this.addSongBtn = document.getElementById('add-song-btn');
        this.editCurrentSongBtn = document.getElementById('edit-current-song-btn');
        this.modal = document.getElementById('add-song-modal');
        this.addSongForm = document.getElementById('add-song-form');
        this.editModal = document.getElementById('edit-song-modal');
        this.editSongForm = document.getElementById('edit-song-form');
        this.deleteSongBtn = document.getElementById('delete-song-btn');
        this.exportBtn = document.getElementById('export-songs-btn');
        this.importBtn = document.getElementById('import-songs-btn');
        this.importTxtBtn = document.getElementById('import-txt-songs-btn');
        this.dataOptionsBtn = document.getElementById('data-options-btn');
        this.dataOptionsModal = document.getElementById('data-options-modal');
        this.closeDataOptionsModal = document.getElementById('close-data-options-modal');
        this.modalImportJsonBtn = document.getElementById('modal-import-json-btn');
        this.modalImportTxtBtn = document.getElementById('modal-import-txt-btn');
        this.modalImportCompleteBtn = document.getElementById('modal-import-complete-btn');
        this.modalExportJsonBtn = document.getElementById('modal-export-json-btn');
        this.modalClearAllBtn = document.getElementById('modal-clear-all-btn');
        this.importFileInput = document.getElementById('import-file-input');
        this.importTxtFileInput = document.getElementById('import-txt-file-input');
        this.importCompleteFileInput = document.getElementById('import-complete-file-input');
        
        // Elementos de gestión de repertorios
        this.repertoireSelect = document.getElementById('repertoire-select');
        this.repertoireOptionsBtn = document.getElementById('repertoire-options-btn');
        this.repertoireOptionsModal = document.getElementById('repertoire-options-modal');
        this.closeRepertoireOptionsModal = document.getElementById('close-repertoire-options-modal');
        this.currentRepertoireName = document.getElementById('current-repertoire-name');
        this.newRepertoireBtn = document.getElementById('new-repertoire-btn');
        this.duplicateRepertoireBtn = document.getElementById('duplicate-repertoire-btn');
        this.renameRepertoireBtn = document.getElementById('rename-repertoire-btn');
        this.deleteRepertoireBtn = document.getElementById('delete-repertoire-btn');
        this.repertoireList = document.getElementById('repertoire-list');
        this.repertoireNameModal = document.getElementById('repertoire-name-modal');
        this.closeRepertoireNameModal = document.getElementById('close-repertoire-name-modal');
        this.repertoireNameForm = document.getElementById('repertoire-name-form');
        this.repertoireNameInput = document.getElementById('repertoire-name-input');
        this.cancelRepertoireName = document.getElementById('cancel-repertoire-name');
        this.repertoireNameModalTitle = document.getElementById('repertoire-name-modal-title');
        this.showArtistBpmCheckbox = document.getElementById('show-artist-bpm-checkbox');
        this.hideNotesCheckbox = document.getElementById('hide-notes-checkbox');
        
        // Elementos de sincronización Firebase
        this.enableSyncCheckbox = document.getElementById('enable-sync-checkbox');
        this.manualSyncBtn = document.getElementById('manual-sync-btn');
        this.syncStatusBtn = document.getElementById('sync-status-btn');
        this.syncStatusText = document.getElementById('sync-status-text');
        this.authLoginBtn = document.getElementById('auth-login-btn');
        this.authLogoutBtn = document.getElementById('auth-logout-btn');
        this.authStatusText = document.getElementById('auth-status-text');
        this.authStatusDisplay = document.getElementById('auth-status-display');
        this.authModal = document.getElementById('auth-modal');
        this.authForm = document.getElementById('auth-form');
        this.authEmail = document.getElementById('auth-email');
        this.authPassword = document.getElementById('auth-password');
        this.authSubmitBtn = document.getElementById('auth-submit-btn');
        this.authToggleBtn = document.getElementById('auth-toggle-btn');
        this.authStatus = document.getElementById('auth-status');
        this.authClose = document.querySelector('.auth-close');
        this.isSignUpMode = false;
        
        // Elementos de copia de canciones
        this.copyTargetRepertoireSelect = document.getElementById('copy-target-repertoire-select');
        this.copySongBtn = document.getElementById('copy-song-btn');
        
        this.editingSong = null;
        this.isOrderMode = false;
        this.tempOrderCounter = 0; // Variable temporal que empieza en 0
        
        // Inicializar Firebase
        this.firebaseManager = null;
        this.initializeFirebase();
        
        this.initializeEventListeners();
        this.loadRepertoires();
        this.loadSongs();
        this.loadDefaultSongs();
        this.renderSongs();
        
        // Seleccionar canción activa después de un breve delay para asegurar que todos los componentes estén listos
        setTimeout(() => {
            this.selectActiveSong();
        }, 100);
    }
    
    async initializeFirebase() {
        try {
            // Esperar a que Firebase esté disponible
            if (typeof FirebaseManager !== 'undefined') {
                this.firebaseManager = new FirebaseManager();
                console.log('🔥 Firebase Manager inicializado en SongManager');
                
                // Inicializar UI de sincronización después de un breve delay
                setTimeout(() => {
                    this.initializeSyncUI();
                }, 500);
            } else {
                console.warn('🔥 FirebaseManager no disponible');
            }
        } catch (error) {
            console.error('❌ Error inicializando Firebase Manager:', error);
        }
    }
    
    initializeEventListeners() {
        this.searchInput.addEventListener('input', () => {
            this.renderSongs(this.searchInput.value);
        });
        
        this.addSongBtn.addEventListener('click', () => {
            this.openAddSongModal();
        });
        
        this.orderModeBtn.addEventListener('click', () => {
            this.toggleOrderMode();
        });
        
        this.resetOrderBtn.addEventListener('click', () => {
            this.resetAllOrders();
        });
        

        
        this.editCurrentSongBtn.addEventListener('click', () => {
            if (this.currentSong) {
                this.openEditSongModal(this.currentSong);
            }
        });
        
        // Modal events - Add Song
        this.modal.querySelector('.close').addEventListener('click', () => {
            this.closeAddSongModal();
        });
        
        this.modal.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeAddSongModal();
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeAddSongModal();
            }
        });
        
        this.addSongForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSong();
        });
        
        // Modal events - Edit Song
        this.editModal.querySelector('.close').addEventListener('click', () => {
            this.closeEditSongModal();
        });
        
        this.editModal.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeEditSongModal();
        });
        
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.closeEditSongModal();
            }
        });
        
        this.editSongForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateSong();
        });
        
        this.deleteSongBtn.addEventListener('click', () => {
            this.deleteCurrentEditingSong();
        });
        
        // Evento para copiar canción a otro repertorio
        this.copySongBtn.addEventListener('click', () => {
            this.copySongToRepertoire();
        });
        
        // Evento para cambio de repertorio objetivo (habilitar/deshabilitar botón)
        this.copyTargetRepertoireSelect.addEventListener('change', () => {
            this.updateCopyButtonState();
        });
        
        // Eventos de exportar/importar
        // Evento para abrir modal de opciones de datos
        this.dataOptionsBtn.addEventListener('click', () => {
            this.openDataOptionsModal();
        });
        
        // Eventos del modal de opciones de datos
        this.closeDataOptionsModal.addEventListener('click', () => {
            this.closeDataOptionsModalFunc();
        });
        
        this.modalExportJsonBtn.addEventListener('click', () => {
            this.closeDataOptionsModalFunc();
            this.exportSongs();
        });
        
        this.modalImportJsonBtn.addEventListener('click', () => {
            this.closeDataOptionsModalFunc();
            this.importFileInput.click();
        });
        
        this.modalImportTxtBtn.addEventListener('click', () => {
            this.closeDataOptionsModalFunc();
            this.importTxtFileInput.click();
        });
        
        this.modalImportCompleteBtn.addEventListener('click', () => {
            this.closeDataOptionsModalFunc();
            this.importCompleteFileInput.click();
        });
        
        this.modalClearAllBtn.addEventListener('click', () => {
            this.closeDataOptionsModalFunc();
            this.clearAllSongs();
        });
        
        // Cerrar modal al hacer click fuera
        this.dataOptionsModal.addEventListener('click', (e) => {
            if (e.target === this.dataOptionsModal) {
                this.closeDataOptionsModalFunc();
            }
        });
        
        this.importFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importSongs(e.target.files[0]);
            }
        });
        
        this.importTxtFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importTxtSongs(e.target.files[0]);
            }
        });
        
        this.importCompleteFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importCompleteSongsFile(e.target.files[0]);
            }
        });

        // Eventos de gestión de repertorios
        this.repertoireSelect.addEventListener('change', (e) => {
            this.switchRepertoire(e.target.value);
        });

        this.repertoireOptionsBtn.addEventListener('click', () => {
            this.openRepertoireOptionsModal();
        });

        this.closeRepertoireOptionsModal.addEventListener('click', () => {
            this.closeRepertoireOptionsModalFunc();
        });

        this.repertoireOptionsModal.addEventListener('click', (e) => {
            if (e.target === this.repertoireOptionsModal) {
                this.closeRepertoireOptionsModalFunc();
            }
        });

        this.newRepertoireBtn.addEventListener('click', () => {
            this.openNewRepertoireModal();
        });

        this.duplicateRepertoireBtn.addEventListener('click', () => {
            this.duplicateCurrentRepertoire();
        });

        this.renameRepertoireBtn.addEventListener('click', () => {
            this.openRenameRepertoireModal();
        });

        this.deleteRepertoireBtn.addEventListener('click', () => {
            this.deleteCurrentRepertoire();
        });

        // Eventos del modal de nombre de repertorio
        this.closeRepertoireNameModal.addEventListener('click', () => {
            this.closeRepertoireNameModalFunc();
        });

        this.cancelRepertoireName.addEventListener('click', () => {
            this.closeRepertoireNameModalFunc();
        });

        this.repertoireNameModal.addEventListener('click', (e) => {
            if (e.target === this.repertoireNameModal) {
                this.closeRepertoireNameModalFunc();
            }
        });

        this.repertoireNameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRepertoireNameSubmit();
        });

        // Event listener para configuración de visualización
        if (this.showArtistBpmCheckbox) {
            this.showArtistBpmCheckbox.addEventListener('change', () => {
                this.saveDisplaySettings();
            });
        }

        if (this.hideNotesCheckbox) {
            this.hideNotesCheckbox.addEventListener('change', () => {
                this.saveDisplaySettings();
            });
        }

        // Event listeners para sincronización Firebase
        if (this.enableSyncCheckbox) {
            this.enableSyncCheckbox.addEventListener('change', () => {
                this.toggleSync();
            });
        }

        if (this.manualSyncBtn) {
            this.manualSyncBtn.addEventListener('click', () => {
                this.performManualSync();
            });
        }

        if (this.syncStatusBtn) {
            this.syncStatusBtn.addEventListener('click', () => {
                this.toggleSyncStatus();
            });
        }

        // Event listeners para autenticación
        if (this.authLoginBtn) {
            this.authLoginBtn.addEventListener('click', () => {
                this.openAuthModal();
            });
        }

        if (this.authLogoutBtn) {
            this.authLogoutBtn.addEventListener('click', () => {
                this.performLogout();
            });
        }

        if (this.authForm) {
            this.authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuthSubmit();
            });
        }

        if (this.authToggleBtn) {
            this.authToggleBtn.addEventListener('click', () => {
                this.toggleAuthMode();
            });
        }

        if (this.authClose) {
            this.authClose.addEventListener('click', () => {
                this.closeAuthModal();
            });
        }

        // Cerrar modal al hacer clic fuera
        if (this.authModal) {
            this.authModal.addEventListener('click', (e) => {
                if (e.target === this.authModal) {
                    this.closeAuthModal();
                }
            });
        }
    }
    
    loadDefaultSongs() {
        if (this.songs.length === 0) {
            const defaultSongs = [
                {
                    id: 1,
                    title: "We Will Rock You",
                    artist: "Queen",
                    bpm: 114,
                    order: 0,
                    active: true,
                    fontSize: 2.4,
                    notes: "Patrón básico: /0Stomp-Stomp-Clap0/\nMantener tempo constante en /0114 BPM0/\n\n/1Cuidado con la entrada del coro1/\n/3Final con acelerando3/",
                    lyrics: `:: /0Stomp stomp clap0/ - Stomp stomp clap

Buddy, you're a boy, make a big noise
Playing in the street, gonna be a big man someday
You got mud on your face, you big disgrace
Kicking your can all over the place, singin'

:: Chorus - All together now!
/0We will, we will rock you0/
/0We will, we will rock you0/

/1(Build up here)1/
/3(Quiet section)3/

:: Stomp stomp clap - Stomp stomp clap

Buddy, you're a young man, hard man
Shouting in the street, gonna take on the world someday
You got blood on your face, you big disgrace
Waving your banner all over the place

:: Chorus - Sing it!
We will, we will rock you (Sing it!)
We will, we will rock you

Buddy, you're an old man, poor man
Pleading with your eyes, gonna get you some peace someday
You got mud on your face, big disgrace
Somebody better put you back into your place

:: Final Chorus - Louder!
We will, we will rock you (Yeah, yeah, come on)
We will, we will rock you (Alright, louder!)
We will, we will rock you
We will, we will rock you`
                },
                {
                    id: 2,
                    title: "Another One Bites the Dust",
                    artist: "Queen",
                    bpm: 110,
                    order: 0,
                    notes: "Groove de bajo muy marcado\nEnfatizar el /0beat en el bombo0/\n\n/1Cambio de dynamics en verso 21/\n/3Break instrumental3/",
                    lyrics: `Steve walks warily down the street
With the brim pulled way down low
Ain't no sound but the sound of his feet
Machine guns ready to go

Are you ready? Hey, are you ready for this?
Are you hanging on the edge of your seat?
Out of the doorway the bullets rip
To the sound of the beat, yeah

Another one bites the dust
Another one bites the dust
And another one gone, and another one gone
Another one bites the dust, yeah
Hey, I'm gonna get you too
Another one bites the dust`
                },
                {
                    id: 3,
                    title: "Seven Nation Army",
                    artist: "The White Stripes",
                    bpm: 124,
                    notes: "Batería /0minimalista0/. Dejar espacio para el /0riff principal0/ de guitarra. /1Solo de batería en puente1/. /3Crescendo al final3/.",
                    lyrics: `:: Main Riff - E E E E D C B B

I'm gonna fight 'em off
A seven nation army couldn't hold me back
They're gonna rip it off
Taking their time right behind my back

:: Guitar Solo Section

And I'm talking to myself at night
Because I can't forget
Back and forth through my mind
Behind a cigarette

And the message coming from my eyes
Says, "Leave it alone"

:: Build up - Drums enter

Don't want to hear about it
Every single one's got a story to tell
Everyone knows about it
From the Queen of England to the Hounds of Hell

:: Heavy Section

And if I catch it coming back my way
I'm gonna serve it to you
And that ain't what you want to hear
But that's what I'll do

And the feeling coming from my bones
Says, "Find a home"

:: Main Riff Out`
                }
            ];
            
            defaultSongs.forEach(song => {
                this.songs.push(song);
            });
            
            this.saveSongs();
        }
    }
    
    loadSongs() {
        console.log('🎵 Cargando canciones del repertorio actual...');
        
        // Primero verificar si ya tenemos repertorios configurados
        if (this.repertoires.size > 0) {
            console.log('📁 Usando sistema de repertorios');
            const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
            
            if (currentRepertoire) {
                this.songs = [...(currentRepertoire.songs || [])];
                this.setlistName = currentRepertoire.setlistName || 'Canciones';
                console.log(`📂 Cargadas ${this.songs.length} canciones del repertorio "${currentRepertoire.name}"`);
            } else {
                console.log('⚠️ Repertorio actual no encontrado, inicializando vacío');
                this.songs = [];
                this.setlistName = 'Canciones';
            }
        } else {
            // Si no hay repertorios, cargar del formato anterior (migración)
            console.log('🔄 Migrando desde formato anterior...');
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                
                // Si el dato es un array (formato antiguo), convertir al nuevo formato
                if (Array.isArray(data)) {
                    this.songs = data;
                    this.setlistName = 'Canciones';
                } else {
                    // Nuevo formato con setlistName
                    this.songs = data.songs || [];
                    this.setlistName = data.setlistName || 'Canciones';
                }
                
                // Migrar al repertorio por defecto
                if (this.repertoires.has('default')) {
                    const defaultRepertoire = this.repertoires.get('default');
                    defaultRepertoire.songs = [...this.songs];
                    defaultRepertoire.setlistName = this.setlistName;
                    this.saveRepertoires();
                    console.log('✅ Migración completada');
                }
            }
        }
        
        // Añadir propiedades faltantes a canciones existentes
        let hasActiveSong = false;
        let needsSave = false;
        
        this.songs.forEach(song => {
            if (song.active === undefined) {
                song.active = false;
                needsSave = true;
            }
            if (song.notes === undefined) {
                song.notes = '';
                needsSave = true;
            }
            if (song.order === undefined) {
                song.order = 0;
                needsSave = true;
            }
            // Migrar fechas para canciones existentes
            if (!song.createdAt) {
                // Usar el ID como fecha aproximada de creación (si es timestamp)
                const createdDate = (typeof song.id === 'number' && song.id > 1000000000000) 
                    ? new Date(song.id).toISOString() 
                    : new Date().toISOString();
                song.createdAt = createdDate;
                song.lastModified = createdDate;
                needsSave = true;
            }
            if (!song.lastModified && song.createdAt) {
                song.lastModified = song.createdAt;
                needsSave = true;
            }
            if (song.active === true) {
                hasActiveSong = true;
            }
        });
        
        // Guardar cambios de migración si es necesario
        if (needsSave) {
            console.log('📅 Migrando fechas de canciones existentes...');
            this.saveSongs();
        }
        
        // Si no hay ninguna canción activa, marcar la primera como activa
        if (!hasActiveSong && this.songs.length > 0) {
            this.songs[0].active = true;
            this.saveSongs(); // Guardar el cambio
        }
        
        console.log(`🎼 Canciones finales cargadas: ${this.songs.length}`);
    }
    
    saveSongs() {
        // Ordenar las canciones por el campo 'order' antes de guardar
        const sortedSongs = [...this.songs].sort((a, b) => {
            // Primero por orden (ascendente), luego por título si el orden es igual
            if (a.order !== b.order) {
                return a.order - b.order;
            }
            return a.title.localeCompare(b.title);
        });
        
        const data = {
            setlistName: this.setlistName,
            songs: sortedSongs
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        
        // Actualizar el array interno con el orden correcto
        this.songs = sortedSongs;
    }
    
    reorderSongs() {
        // Reordenar las canciones por el campo 'order'
        this.songs.sort((a, b) => {
            if (a.order !== b.order) {
                return a.order - b.order;
            }
            return a.title.localeCompare(b.title);
        });
        
        // Guardar el nuevo orden y re-renderizar
        this.saveSongs();
        this.renderSongs();
        
        console.log('🔄 Canciones reordenadas según el campo order');
    }
    
    scrollToActiveSong() {
        // Buscar el elemento activo en la lista
        const activeElement = document.querySelector('.song-item.active');
        if (!activeElement) return;
        
        // Encontrar el contenedor con scroll
        let scrollContainer = this.songList;
        while (scrollContainer && scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
            scrollContainer = scrollContainer.parentElement;
            if (scrollContainer === document.body) break;
        }
        
        if (scrollContainer && scrollContainer !== document.body) {
            const containerHeight = scrollContainer.clientHeight;
            const containerScrollTop = scrollContainer.scrollTop;
            
            // Posición del elemento relativa al contenedor
            const elementRect = activeElement.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementTop = elementRect.top - containerRect.top + containerScrollTop;
            const elementHeight = activeElement.offsetHeight;
            
            // Calcular la posición para centrar el elemento
            const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);
            
            // Hacer scroll suave hacia la posición calculada
            scrollContainer.scrollTo({
                top: Math.max(0, scrollPosition),
                behavior: 'smooth'
            });
        }
    }

    renderSongs(searchTerm = '') {
        console.log(`🎨 Renderizando canciones. Total: ${this.songs.length}, búsqueda: "${searchTerm}"`);
        
        const filteredSongs = this.songs.filter(song => 
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        console.log(`🔍 Canciones filtradas: ${filteredSongs.length}`);
        
        // Ordenar por campo order (ascendente), luego por título
        filteredSongs.sort((a, b) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            
            // Si tienen el mismo order, ordenar por título
            return a.title.localeCompare(b.title);
        });
        
        // Limpiar la lista actual
        this.songList.innerHTML = '';
        
        // Añadir cada canción
        filteredSongs.forEach(song => {
            const songElement = this.createSongElement(song);
            this.songList.appendChild(songElement);
        });
        
        // Actualizar el título con el contador
        this.updateSongsTitle(filteredSongs.length, searchTerm);
        
        console.log(`✅ Renderizado completo. Elementos en DOM: ${this.songList.children.length}`);
    }
    
    updateSongsTitle(count, searchTerm = '') {
        // Actualizar el placeholder del input de búsqueda con información útil
        let placeholderText = '';
        
        if (searchTerm) {
            // Mostrando resultados de búsqueda
            placeholderText = `${count} de ${this.songs.length} canciones`;
        } else {
            // Mostrando todas las canciones
            placeholderText = `Buscar en ${count} can..`;
        }
        
        // Añadir indicador de modo ordenamiento
        if (this.isOrderMode) {
            placeholderText += ' (Modo ordenamiento)';
        }
        
        this.searchInput.placeholder = placeholderText;
    }

    changeSetlistName(newName) {
        if (newName && newName.trim()) {
            this.setlistName = newName.trim();
            this.saveSongs();
            this.renderSongs();
        }
    }



    createSongElement(song) {
        const li = document.createElement('li');
        li.className = 'song-item';
        li.dataset.songId = song.id;
        li.style.position = 'relative';
        
        if (this.currentSong && this.currentSong.id === song.id) {
            li.classList.add('active');
        }
        
        // Construir el título con order si está en modo ordenamiento
        let titleText = song.title;
        if (this.isOrderMode) {
            const orderValue = song.order || 0;
            titleText = `${song.title} (${orderValue})`;
        }
        
        li.innerHTML = `
            <span class="song-title">${titleText}</span>
            <span class="song-artist">${song.artist}</span>
            <span class="song-bpm">${song.bpm} BPM</span>
        `;
        
        // Event listener para seleccionar canción
        li.addEventListener('click', (e) => {
            this.selectSong(song);
        });
        
        // Agregar menú contextual para opciones adicionales
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const action = confirm(`Opciones para "${song.title}":\n\nOK = Editar\nCancelar = Eliminar`);
            if (action === true) {
                this.openEditSongModal(song);
            } else if (action === false) {
                if (confirm(`¿Eliminar "${song.title}"?`)) {
                    this.deleteSong(song.id);
                }
            }
        });
        
        return li;
    }
    
    selectSong(song) {
        // Si estamos en modo ordenamiento, asignar orden automático
        if (this.isOrderMode) {
            this.tempOrderCounter += 10; // Incrementar primero
            song.order = this.tempOrderCounter; // Asignar el valor resultante
            console.log(`📋 Orden asignado: "${song.title}" = ${song.order}`);
            this.saveSongs();
            this.renderSongs();
            return; // No seleccionar la canción, solo asignar orden
        }
        
        this.currentSong = song;
        
        // Desmarcar la canción anteriormente activa
        this.songs.forEach(s => s.active = false);
        
        // Marcar la nueva canción como activa
        song.active = true;
        
        // Guardar cambios en localStorage
        this.saveSongs();
        
        // Actualizar información en el header
        const songElement = document.getElementById('current-song');
        const bpmElement = document.getElementById('current-bpm');
        const notesElement = document.getElementById('current-notes');
        const titleElement = document.querySelector('.info-panel h1');
        
        if (song.notes && song.notes.trim()) {
            // Si hay notas, ocultar todo y mostrar solo las notas
            songElement.style.display = 'none';
            bpmElement.style.display = 'none';
            titleElement.style.display = 'none';
            notesElement.innerHTML = this.processTextHighlights(song.notes);
            notesElement.style.display = 'block';
        } else {
            // Si no hay notas, mostrar todo normal
            songElement.textContent = `${song.title} - ${song.artist}`;
            songElement.style.display = 'block';
            bpmElement.style.display = 'block';
            titleElement.style.display = 'block';
            notesElement.textContent = '';
            notesElement.style.display = 'none';
        }
        
        // Actualizar BPM del metrónomo
        window.metronome.setBPM(song.bpm);
        
        // Cargar letras
        window.lyricsScroller.loadLyrics(song.lyrics);
        
        // Cargar el tamaño de fuente específico de la canción
        window.lyricsScroller.loadSongFontSize(song);
        
        // Activar el botón de editar
        this.editCurrentSongBtn.disabled = false;
        
        // Actualizar clases activas
        document.querySelectorAll('.song-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-song-id="${song.id}"]`).classList.add('active');
        
        // Desplazar la lista para centrar la canción seleccionada
        setTimeout(() => {
            this.scrollToActiveSong();
        }, 50); // Pequeño delay para asegurar que el DOM se ha actualizado
        
        // Notificar cambio de canción
        window.dispatchEvent(new CustomEvent('song-selected', {
            detail: { song }
        }));
        
        // Actualizar título del prompter si está disponible
        if (window.lyricsScroller && window.lyricsScroller.updatePrompterTitle) {
            window.lyricsScroller.updatePrompterTitle();
        }
    }
    
    selectActiveSong() {
        // Buscar la canción marcada como activa
        const activeSong = this.songs.find(song => song.active === true);
        
        if (activeSong) {
            // Seleccionar la canción activa sin guardar de nuevo (para evitar loop)
            this.currentSong = activeSong;
            
            // Actualizar información en el header
            const songElement = document.getElementById('current-song');
            const bpmElement = document.getElementById('current-bpm');
            const notesElement = document.getElementById('current-notes');
            const titleElement = document.querySelector('.info-panel h1');
            
            if (activeSong.notes && activeSong.notes.trim()) {
                // Si hay notas, ocultar todo y mostrar solo las notas
                songElement.style.display = 'none';
                bpmElement.style.display = 'none';
                titleElement.style.display = 'none';
                notesElement.innerHTML = this.processTextHighlights(activeSong.notes);
                notesElement.style.display = 'block';
            } else {
                // Si no hay notas, mostrar todo normal
                songElement.textContent = `${activeSong.title} - ${activeSong.artist}`;
                songElement.style.display = 'block';
                bpmElement.style.display = 'block';
                titleElement.style.display = 'block';
                notesElement.textContent = '';
                notesElement.style.display = 'none';
            }
            
            // Actualizar BPM del metrónomo
            if (window.metronome) {
                window.metronome.setBPM(activeSong.bpm);
            } else {
                // Si el metrónomo no está listo, intentar de nuevo en un momento
                setTimeout(() => {
                    if (window.metronome) {
                        window.metronome.setBPM(activeSong.bpm);
                    }
                }, 200);
            }
            
            // Cargar letras
            if (window.lyricsScroller) {
                window.lyricsScroller.loadLyrics(activeSong.lyrics);
            } else {
                // Si lyricsScroller no está listo, intentar de nuevo en un momento
                setTimeout(() => {
                    if (window.lyricsScroller) {
                        window.lyricsScroller.loadLyrics(activeSong.lyrics);
                    }
                }, 200);
            }
            
            // Activar el botón de editar
            if (this.editCurrentSongBtn) {
                this.editCurrentSongBtn.disabled = false;
            }
            
            // Actualizar clases activas en la lista
            setTimeout(() => {
                document.querySelectorAll('.song-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                const activeElement = document.querySelector(`[data-song-id="${activeSong.id}"]`);
                if (activeElement) {
                    activeElement.classList.add('active');
                    // Desplazar la lista para centrar la canción seleccionada
                    this.scrollToActiveSong();
                }
            }, 100);
            
            // Notificar cambio de canción (igual que selectSong pero sin guardar)
            window.dispatchEvent(new CustomEvent('song-selected', {
                detail: { song: activeSong }
            }));
        }
    }
    
    processTextHighlights(text) {
        // Procesar imágenes primero (patrón //img=archivo.jpg)
        let processedText = text.replace(/\/\/img=([^\s]+\.(jpg|jpeg|png|gif|webp))/gi, (match, filename) => {
            return `<img src="imagenes/${filename}" alt="${filename}" onerror="this.style.display='none'" loading="lazy">`;
        });
        
        // Procesar instrucciones de espera (patrón //espera=XXX)
        processedText = processedText.replace(/\/\/espera=(\d+)/gi, (match, seconds) => {
            return `<span class="wait-instruction">espera ${seconds}s</span>`;
        });
        
        // Convertir texto entre /0 y 0/ a HTML resaltado amarillo
        processedText = processedText.replace(/\/0(.*?)0\//g, '<span class="highlight-yellow">$1</span>');
        // Convertir texto entre /1 y 1/ a HTML resaltado azul
        processedText = processedText.replace(/\/1(.*?)1\//g, '<span class="highlight-blue">$1</span>');
        // Convertir texto entre /3 y 3/ a HTML resaltado verde
        processedText = processedText.replace(/\/3(.*?)3\//g, '<span class="highlight-green">$1</span>');
        return processedText;
    }
    
    generateId() {
        return Date.now() + Math.random();
    }
    
    openAddSongModal() {
        this.modal.style.display = 'block';
        document.getElementById('song-title').focus();
    }
    
    closeAddSongModal() {
        this.modal.style.display = 'none';
        this.addSongForm.reset();
    }
    
    openEditSongModal(song) {
        this.editingSong = song;
        
        // Llenar el formulario con los datos de la canción
        document.getElementById('edit-song-id').value = song.id;
        document.getElementById('edit-song-title').value = song.title;
        document.getElementById('edit-song-artist').value = song.artist;
        document.getElementById('edit-song-bpm').value = song.bpm;
        document.getElementById('edit-song-order').value = song.order || 0;
        document.getElementById('edit-song-duration').value = song.duration || '';
        document.getElementById('edit-song-notes').value = song.notes || '';
        document.getElementById('edit-song-lyrics').value = song.lyrics;
        
        // Mostrar información de fecha de modificación
        this.updateSongInfoDisplay(song);
        
        // Cargar repertorios disponibles para copia
        this.loadCopyRepertoireOptions();
        
        this.editModal.style.display = 'block';
        document.getElementById('edit-song-title').focus();
    }
    
    closeEditSongModal() {
        this.editModal.style.display = 'none';
        this.editSongForm.reset();
        this.editingSong = null;
    }
    
    addSong() {
        const title = document.getElementById('song-title').value.trim();
        const artist = document.getElementById('song-artist').value.trim();
        const bpm = parseInt(document.getElementById('song-bpm').value);
        const order = parseInt(document.getElementById('song-order').value) || 0;
        const duration = document.getElementById('song-duration').value.trim();
        const lyrics = document.getElementById('song-lyrics').value.trim();
        
        if (!title) {
            alert('El título es obligatorio');
            return;
        }
        
        const now = new Date();
        const newSong = {
            id: Date.now(), // Simple ID basado en timestamp
            title,
            artist: artist || 'Artista desconocido',
            bpm: bpm || 120,
            order: order,
            duration: duration || '', // Duración personalizada (mm:ss)
            lyrics: lyrics || '',
            notes: document.getElementById('song-notes').value.trim() || '',
            fontSize: 2.4, // Tamaño de fuente por defecto
            active: false,
            createdAt: now.toISOString(),
            lastModified: now.toISOString()
        };
        
        this.songs.push(newSong);
        this.saveSongs();
        this.renderSongs();
        this.closeAddSongModal();
        
        // Seleccionar la nueva canción automáticamente
        this.selectSong(newSong);
        
        this.showNotification(`✅ Canción "${title}" agregada correctamente`, 'success');
    }
    
    updateSong() {
        if (!this.editingSong) return;
        
        const title = document.getElementById('edit-song-title').value.trim();
        const artist = document.getElementById('edit-song-artist').value.trim();
        const bpm = parseInt(document.getElementById('edit-song-bpm').value);
        const order = parseInt(document.getElementById('edit-song-order').value) || 0;
        const duration = document.getElementById('edit-song-duration').value.trim();
        const notes = document.getElementById('edit-song-notes').value.trim();
        const lyrics = document.getElementById('edit-song-lyrics').value.trim();
        
        if (!title) {
            alert('El título es obligatorio');
            return;
        }
        
        // Encontrar la canción en el array y actualizarla
        const songIndex = this.songs.findIndex(song => song.id === this.editingSong.id);
        if (songIndex !== -1) {
            const updatedSong = {
                ...this.songs[songIndex],
                title,
                artist: artist || 'Artista desconocido',
                bpm: bpm || 120,
                order: order,
                duration: duration || '', // Duración personalizada
                notes: notes || '',
                lyrics: lyrics || '',
                fontSize: this.songs[songIndex].fontSize || 2.4, // Preservar fontSize existente
                lastModified: new Date().toISOString()
            };
            
            this.songs[songIndex] = updatedSong;
            this.saveSongs();
            this.renderSongs();
            
            // Si era la canción actual, actualizar la interfaz
            if (this.currentSong && this.currentSong.id === this.editingSong.id) {
                this.currentSong = updatedSong;
                this.selectSong(updatedSong);
            }
            
            this.closeEditSongModal();
            this.showNotification(`✅ Canción "${title}" actualizada correctamente`, 'success');
        }
    }
    
    deleteCurrentEditingSong() {
        if (!this.editingSong) return;
        
        const confirmMessage = `¿Estás seguro de que deseas eliminar "${this.editingSong.title}"?\n\nEsta acción no se puede deshacer.`;
        
        if (confirm(confirmMessage)) {
            this.deleteSong(this.editingSong.id);
            this.closeEditSongModal();
            this.showNotification(`✅ Canción "${this.editingSong.title}" eliminada`, 'success');
        }
    }
    
    deleteSong(songId) {
        this.songs = this.songs.filter(song => song.id !== songId);
        this.saveSongs();
        this.renderSongs();
        
        // Si era la canción actual, limpiar selección
        if (this.currentSong && this.currentSong.id === songId) {
            this.currentSong = null;
            document.getElementById('current-song').textContent = 'Selecciona una canción';
            window.lyricsScroller.clearLyrics();
        }
    }
    
    getCurrentSong() {
        return this.currentSong;
    }
    
    exportSongs() {
        try {
            console.log(`🚀 Iniciando exportación JSON...`);
            console.log(`📊 Canciones a exportar: ${this.songs.length}`);
            console.log(`🏷️  Nombre del setlist: "${this.setlistName}"`);
            
            // Validar canciones antes de exportar
            let validSongs = 0;
            let invalidSongs = 0;
            
            this.songs.forEach((song, index) => {
                try {
                    const validationResult = this.validateSong(song);
                    if (validationResult === true) {
                        validSongs++;
                        console.log(`  ✅ Canción ${index + 1}: "${song.title}" - Válida`);
                    } else {
                        invalidSongs++;
                        console.log(`  ⚠️  Canción ${index + 1}: "${song.title}" - Problema: ${validationResult}`);
                    }
                } catch (error) {
                    invalidSongs++;
                    console.error(`  💥 Canción ${index + 1}: Error validando - ${error.message}`);
                }
            });
            
            console.log(`📈 Validación completada: ${validSongs} válidas, ${invalidSongs} con problemas`);
            
            const dataToExport = {
                version: "1.0",
                exportDate: new Date().toISOString(),
                setlistName: this.setlistName,
                songs: this.songs
            };
            
            console.log(`📦 Estructura de datos para exportar:`, {
                version: dataToExport.version,
                exportDate: dataToExport.exportDate,
                setlistName: dataToExport.setlistName,
                songsCount: dataToExport.songs.length
            });
            
            const dataStr = JSON.stringify(dataToExport, null, 2);
            console.log(`📄 JSON generado: ${dataStr.length} caracteres`);
            
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            console.log(`💾 Blob creado: ${dataBlob.size} bytes`);
            
            // Crear un enlace de descarga
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(dataBlob);
            
            // Generar nombre de archivo con setlist, fecha, hora y minutos
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            // Limpiar el nombre del setlist para usar en archivo
            const cleanSetlistName = this.setlistName
                .replace(/[^a-zA-Z0-9\s]/g, '')  // Quitar caracteres especiales
                .replace(/\s+/g, '-')             // Reemplazar espacios por guiones
                .toLowerCase();
            
            const timeStamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
            downloadLink.download = `${cleanSetlistName}-${timeStamp}.json`;
            
            console.log(`📁 Nombre de archivo generado: ${downloadLink.download}`);
            
            // Simular clic para descargar
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Limpiar URL del blob
            URL.revokeObjectURL(downloadLink.href);
            
            console.log(`✅ Exportación completada exitosamente`);
            console.log(`📈 Resumen de exportación:`);
            console.log(`  📁 Archivo: ${downloadLink.download}`);
            console.log(`  🎵 Canciones exportadas: ${this.songs.length}`);
            console.log(`  ✅ Válidas: ${validSongs}`);
            console.log(`  ⚠️  Con problemas: ${invalidSongs}`);
            console.log(`  💾 Tamaño: ${dataBlob.size} bytes`);
            
            let message = `✅ Exportadas ${this.songs.length} canciones a ${downloadLink.download}`;
            if (invalidSongs > 0) {
                message += ` (${invalidSongs} con problemas - ver consola)`;
            }
            
            const notificationType = invalidSongs > 0 ? 'warning' : 'success';
            this.showNotification(message, notificationType);
            
        } catch (error) {
            console.error('💥 Error crítico exportando canciones:', error);
            console.log(`📊 Estado actual:`, {
                songsCount: this.songs.length,
                setlistName: this.setlistName,
                timestamp: new Date().toISOString()
            });
            this.showNotification('❌ Error al exportar las canciones', 'error');
        }
    }
    
    importSongs(file) {
        console.log(`🚀 Iniciando importación JSON del archivo: ${file.name}`);
        console.log(`📊 Tamaño del archivo: ${file.size} bytes`);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                console.log(`📄 Parseando archivo JSON...`);
                const importedData = JSON.parse(e.target.result);
                
                console.log(`📋 Estructura del archivo JSON:`, {
                    version: importedData.version,
                    exportDate: importedData.exportDate,
                    setlistName: importedData.setlistName,
                    songsCount: importedData.songs?.length
                });
                
                // Validar estructura del archivo
                if (!importedData.songs || !Array.isArray(importedData.songs)) {
                    throw new Error('Formato de archivo inválido - falta array de canciones');
                }
                
                console.log(`🎵 Archivo válido con ${importedData.songs.length} canciones`);
                
                // Mostrar confirmación
                const confirmMessage = `¿Deseas importar ${importedData.songs.length} canciones?\n\n` +
                    `Esto ${this.songs.length > 0 ? 'se agregará a' : 'reemplazará'} tu colección actual.\n` +
                    `Fecha de exportación: ${importedData.exportDate ? new Date(importedData.exportDate).toLocaleString() : 'Desconocida'}`;
                
                if (!confirm(confirmMessage)) {
                    console.log(`❌ Importación cancelada por el usuario`);
                    return;
                }
                
                console.log(`🔄 Procesando ${importedData.songs.length} canciones...`);
                
                // Procesar canciones importadas
                let importedCount = 0;
                let skippedCount = 0;
                let errorCount = 0;
                
                importedData.songs.forEach((song, index) => {
                    try {
                        console.log(`🎵 Procesando canción ${index + 1}/${importedData.songs.length}: "${song.title || '[Sin título]'}"`);
                        
                        // Validar estructura de cada canción
                        const validationResult = this.validateSong(song);
                        if (validationResult === true) {
                            // Generar nuevo ID para evitar conflictos
                            const newSong = {
                                ...song,
                                id: Date.now() + Math.random(), // ID único
                                notes: song.notes || '', // Asegurar que tenga el campo notes
                                fontSize: song.fontSize || 2.4, // Asegurar que tenga el campo fontSize
                                active: false // Las canciones importadas no están activas por defecto
                            };
                            
                            this.songs.push(newSong);
                            importedCount++;
                            console.log(`  ✅ Importada: "${song.title}" - Nuevo ID: ${newSong.id}`);
                        } else {
                            skippedCount++;
                            console.log(`  ⏭️  Saltada por validación: "${song.title || '[Sin título]'}" - Razón: ${validationResult || 'Formato inválido'}`);
                        }
                    } catch (error) {
                        errorCount++;
                        console.error(`  💥 Error procesando canción ${index + 1}:`, error.message);
                        console.log(`     Datos problemáticos:`, song);
                    }
                });
                
                // Guardar y actualizar interfaz
                console.log(`💾 Guardando canciones...`);
                this.saveSongs();
                this.renderSongs();
                
                // Si no hay canción activa después del import, activar la primera
                if (!this.songs.find(song => song.active) && this.songs.length > 0) {
                    this.selectSong(this.songs[0]);
                    console.log(`🎯 Activada la primera canción: "${this.songs[0].title}"`);
                }
                
                // Mostrar resultado detallado
                console.log(`📈 Resumen de importación JSON:`);
                console.log(`  ✅ Importadas: ${importedCount}`);
                console.log(`  ⏭️  Saltadas (formato inválido): ${skippedCount}`);
                console.log(`  💥 Errores: ${errorCount}`);
                console.log(`  📊 Total en archivo: ${importedData.songs.length}`);
                console.log(`  🎵 Total en colección actual: ${this.songs.length}`);
                
                let message = `✅ Importadas ${importedCount} canciones`;
                if (skippedCount > 0) message += `, ${skippedCount} saltadas (formato inválido)`;
                if (errorCount > 0) message += `, ${errorCount} errores (ver consola)`;
                
                const notificationType = errorCount > 0 || skippedCount > 0 ? 'warning' : 'success';
                this.showNotification(message, notificationType);
                
                // Limpiar input de archivo
                this.importFileInput.value = '';
                
            } catch (error) {
                console.error('💥 Error crítico importando canciones JSON:', error);
                console.log(`📄 Contenido del archivo (primeros 500 caracteres):`, e.target.result?.substring(0, 500));
                this.showNotification('❌ Error al importar: archivo inválido o corrupto', 'error');
                this.importFileInput.value = '';
            }
        };
        
        reader.onerror = () => {
            this.showNotification('❌ Error al leer el archivo', 'error');
            this.importFileInput.value = '';
        };
        
        reader.readAsText(file);
    }
    
    validateSong(song) {
        if (!song) {
            return 'Canción vacía o nula';
        }
        
        if (typeof song.title !== 'string' || song.title.trim() === '') {
            return 'Título inválido o vacío';
        }
        
        if (typeof song.artist !== 'string') {
            return 'Artista debe ser texto';
        }
        
        // BPM puede ser string o número, si es string debe ser convertible a número válido
        if (song.bpm !== undefined && song.bpm !== null && song.bpm !== '') {
            const bpmNum = typeof song.bpm === 'string' ? parseFloat(song.bpm) : song.bpm;
            if (isNaN(bpmNum) || bpmNum < 0 || bpmNum > 500) {
                return `BPM inválido: ${song.bpm}`;
            }
        }
        
        if (typeof song.lyrics !== 'string') {
            return 'Letras deben ser texto';
        }
        
        return true; // Canción válida
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const backgroundColor = type === 'error' ? '#ff4444' : 
                               type === 'success' ? '#44ff44' : 
                               type === 'warning' ? '#ffaa44' : '#4444ff';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: ${type === 'success' ? '#000000' : '#ffffff'};
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            max-width: 400px;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInNotification 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    importTxtSongs(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                // Mostrar confirmación
                const confirmMessage = `¿Deseas importar las canciones del archivo "${file.name}"?\n\n` +
                    `Esto se agregará a tu colección actual.`;
                
                if (!confirm(confirmMessage)) {
                    return;
                }
                
                const txtContent = e.target.result;
                const songs = this.parseTxtSongs(txtContent);
            
            let importedCount = 0;
            
            songs.forEach(song => {
                // Verificar si la canción ya existe (por título y artista)
                const existingSong = this.songs.find(s => 
                    s.title.toLowerCase() === song.title.toLowerCase() && 
                    s.artist.toLowerCase() === song.artist.toLowerCase()
                );
                
                if (!existingSong) {
                    const newSong = {
                        id: Date.now() + Math.random(),
                        title: song.title,
                        artist: song.artist,
                        bpm: song.bpm,
                        lyrics: song.lyrics,
                        notes: song.notes || '',
                        fontSize: 2.4, // Tamaño por defecto para canciones importadas
                        active: false
                    };
                    
                    this.songs.push(newSong);
                    importedCount++;
                }
            });
            
                // Guardar y actualizar interfaz
                this.saveSongs();
                this.renderSongs();
                
                // Mostrar resultado
                this.showNotification(`✅ Importadas ${importedCount} canciones del archivo TXT`, 'success');
                
            } catch (error) {
                console.error('Error importando canciones TXT:', error);
                this.showNotification('❌ Error al importar las canciones del archivo TXT', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showNotification('❌ Error al leer el archivo TXT', 'error');
        };
        
        reader.readAsText(file, 'UTF-8');
    }
    
    parseTxtSongs(txtContent) {
        const lines = txtContent.split('\n');
        const songs = [];
        let currentSong = null;
        let lyricsLines = [];
        let notesLines = [];
        let pendingTitle = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Saltar líneas vacías
            if (!line) {
                continue;
            }
            
            // Si encontramos una línea que parece ser BPM + Artista (números seguidos de letras)
            const bpmArtistMatch = line.match(/^(\d+)(.+)$/);
            
            if (bpmArtistMatch) {
                // Guardar la canción anterior si existe
                if (currentSong) {
                    currentSong.lyrics = lyricsLines.join('\n').trim();
                    currentSong.notes = notesLines.join('\n').trim();
                    if (currentSong.title && currentSong.artist && currentSong.bpm) {
                        songs.push(currentSong);
                    }
                }
                
                // Crear nueva canción usando el título pendiente
                const bpm = parseInt(bpmArtistMatch[1]);
                const artist = bpmArtistMatch[2].trim();
                
                if (pendingTitle && artist && bpm) {
                    currentSong = {
                        title: pendingTitle,
                        artist: artist,
                        bpm: bpm,
                        lyrics: '',
                        notes: ''
                    };
                    
                    lyricsLines = [];
                    notesLines = [];
                    pendingTitle = null;
                } else {
                    currentSong = null;
                }
            } else if (currentSong && line.startsWith('::')) {
                // Es una línea de notas
                notesLines.push(line.substring(2).trim());
            } else if (currentSong) {
                // Es parte de las letras
                lyricsLines.push(line);
            } else if (!currentSong && !bpmArtistMatch) {
                // Podría ser un título de canción
                // Verificar si la siguiente línea no vacía es BPM+Artista
                let nextNonEmptyIndex = i + 1;
                while (nextNonEmptyIndex < lines.length && !lines[nextNonEmptyIndex].trim()) {
                    nextNonEmptyIndex++;
                }
                
                if (nextNonEmptyIndex < lines.length) {
                    const nextLine = lines[nextNonEmptyIndex].trim();
                    if (nextLine.match(/^(\d+)(.+)$/)) {
                        pendingTitle = line;
                    }
                }
            }
        }
        
        // Agregar la última canción
        if (currentSong) {
            currentSong.lyrics = lyricsLines.join('\n').trim();
            currentSong.notes = notesLines.join('\n').trim();
            if (currentSong.title && currentSong.artist && currentSong.bpm) {
                songs.push(currentSong);
            }
        }
        
        return songs;
    }
    
    updateCurrentSongFontSize(fontSize) {
        if (this.currentSong) {
            // Actualizar el fontSize en la canción actual
            this.currentSong.fontSize = fontSize;
            
            // Encontrar la canción en el array y actualizarla
            const songIndex = this.songs.findIndex(song => song.id === this.currentSong.id);
            if (songIndex !== -1) {
                this.songs[songIndex].fontSize = fontSize;
                this.saveSongs();
            }
        }
    }
    
    addRecordingEventsToCurrentSong(events) {
        if (this.currentSong && events && events.length > 0) {
            // Inicializar el array de grabaciones si no existe
            if (!this.currentSong.recordings) {
                this.currentSong.recordings = [];
            }
            
            // Añadir nueva grabación con timestamp
            const recording = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                events: events,
                duration: events.length > 0 ? Math.max(...events.map(e => e.timestamp)) : 0
            };
            
            this.currentSong.recordings.push(recording);
            
            // Actualizar la canción en el array
            const songIndex = this.songs.findIndex(song => song.id === this.currentSong.id);
            if (songIndex !== -1) {
                this.songs[songIndex] = { ...this.currentSong };
                this.saveSongs();
            }
            
            console.log(`💾 Grabación guardada en "${this.currentSong.title}":`, recording);
            console.log(`📊 Total de grabaciones: ${this.currentSong.recordings.length}`);
        }
    }
    
    toggleOrderMode() {
        this.isOrderMode = !this.isOrderMode;
        
        if (this.isOrderMode) {
            this.orderModeBtn.classList.add('active');
            this.orderModeBtn.innerHTML = '🔢 Modo Activo';
            this.orderModeBtn.title = 'Modo ordenamiento activo - Clic para desactivar';
            this.resetOrderBtn.style.display = 'block'; // Mostrar botón de reset
            this.tempOrderCounter = 0; // Reiniciar contador temporal a 0
            console.log('📋 Modo ordenamiento ACTIVADO. Haz clic en las canciones para asignar orden automático.');
            console.log(`🔢 Contador temporal iniciado en: ${this.tempOrderCounter} (próximo valor: ${this.tempOrderCounter + 10})`);
            
            // Cerrar el modal después de activar el modo
            this.closeRepertoireOptionsModalFunc();
            this.showNotification('Modo ordenamiento activado. Haz clic en las canciones para ordenar.', 'info');
        } else {
            this.orderModeBtn.classList.remove('active');
            this.orderModeBtn.innerHTML = '📋 Modo Ordenamiento';
            this.orderModeBtn.title = 'Activar modo ordenamiento';
            this.resetOrderBtn.style.display = 'none'; // Ocultar botón de reset
            console.log('📋 Modo ordenamiento DESACTIVADO');
            
            this.showNotification('Modo ordenamiento desactivado', 'info');
        }
        
        // Re-renderizar la lista para actualizar los títulos (mostrar/ocultar valores order)
        this.renderSongs();
    }
    
    resetAllOrders() {
        const confirmation = confirm('¿Estás seguro de que quieres resetear todos los valores de orden?\n\nTodas las canciones se pondrán en 10000 y podrás reordenarlas desde 10, 20, 30...\n\nEsto no se puede deshacer.');
        
        if (confirmation) {
            // Poner todos los valores de order a 10000
            this.songs.forEach(song => {
                song.order = 10000;
            });
            
            // Reiniciar también el contador temporal
            this.tempOrderCounter = 0;
            
            // Guardar cambios y re-renderizar
            this.saveSongs();
            this.renderSongs();
            
            console.log('🗑️ Todos los valores de orden han sido reseteados a 10000');
            console.log(`🔢 Contador temporal reiniciado a: ${this.tempOrderCounter} (las canciones ordenadas aparecerán primero)`);
            
            // Cerrar el modal y mostrar notificación
            this.closeRepertoireOptionsModalFunc();
            this.showNotification('Orden de canciones reseteado. Todas las canciones están en 10000.', 'success');
        }
    }
    
    selectPreviousSong() {
        if (!this.currentSong || this.songs.length === 0) return;
        
        const currentIndex = this.songs.findIndex(song => song.id === this.currentSong.id);
        if (currentIndex === -1) return;
        
        // Ir a la canción anterior (circular)
        const prevIndex = currentIndex === 0 ? this.songs.length - 1 : currentIndex - 1;
        this.selectSong(this.songs[prevIndex].id);
    }
    
    selectNextSong() {
        if (!this.currentSong || this.songs.length === 0) return;
        
        const currentIndex = this.songs.findIndex(song => song.id === this.currentSong.id);
        if (currentIndex === -1) return;
        
        // Ir a la siguiente canción (circular)
        const nextIndex = currentIndex === this.songs.length - 1 ? 0 : currentIndex + 1;
        this.selectSong(this.songs[nextIndex]);
    }
    
    selectPreviousSong() {
        if (this.songs.length === 0) return;
        
        const currentIndex = this.songs.findIndex(song => song.id === this.currentSong?.id);
        let prevIndex;
        
        if (currentIndex === -1 || currentIndex === 0) {
            // Si no hay canción actual o es la primera, ir a la última
            prevIndex = this.songs.length - 1;
        } else {
            prevIndex = currentIndex - 1;
        }
        
        this.selectSong(this.songs[prevIndex]);
    }

    // Funciones del modal de opciones de datos
    openDataOptionsModal() {
        console.log(`🎛️  Abriendo modal de opciones de datos...`);
        this.dataOptionsModal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    closeDataOptionsModalFunc() {
        console.log(`❌ Cerrando modal de opciones de datos...`);
        this.dataOptionsModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    // Función para borrar todas las canciones con confirmación
    clearAllSongs() {
        console.log(`🗑️  Iniciando proceso de borrado de todas las canciones...`);
        console.log(`📊 Canciones actuales: ${this.songs.length}`);
        
        if (this.songs.length === 0) {
            console.log(`⚠️  No hay canciones para borrar`);
            this.showNotification('⚠️ No hay canciones para borrar', 'warning');
            return;
        }
        
        const confirmMessage = `⚠️ ATENCIÓN: Vas a borrar TODAS las canciones (${this.songs.length} canciones)\n\n` +
            `Esta acción NO se puede deshacer.\n\n` +
            `Para confirmar, escribe exactamente la palabra: BORRAR`;
        
        const userInput = prompt(confirmMessage);
        
        if (userInput === null) {
            console.log(`❌ Borrado cancelado por el usuario`);
            return;
        }
        
        console.log(`🔤 Texto ingresado por el usuario: "${userInput}"`);
        
        if (userInput.toUpperCase() === 'BORRAR') {
            console.log(`✅ Confirmación válida - Procediendo con el borrado...`);
            
            const songsCount = this.songs.length;
            const songsBackup = [...this.songs]; // Respaldo para logging
            
            // Borrar todas las canciones
            this.songs = [];
            this.currentSong = null;
            
            // Actualizar almacenamiento y UI
            this.saveSongs();
            this.renderSongs();
            
            // Limpiar el área de letras
            const lyricsContainer = document.getElementById('lyrics-container');
            if (lyricsContainer) {
                lyricsContainer.innerHTML = '<p>Selecciona una canción para ver sus letras</p>';
            }
            
            // Deshabilitar botón de edición
            if (this.editCurrentSongBtn) {
                this.editCurrentSongBtn.disabled = true;
            }
            
            console.log(`🗑️  Borrado completado exitosamente`);
            console.log(`📈 Resumen del borrado:`);
            console.log(`  🎵 Canciones eliminadas: ${songsCount}`);
            console.log(`  📋 Canciones restantes: ${this.songs.length}`);
            console.log(`  🎯 Canción activa: ${this.currentSong ? this.currentSong.title : 'Ninguna'}`);
            
            // Log de las canciones eliminadas (solo títulos)
            if (songsBackup.length > 0) {
                console.log(`📝 Canciones que fueron eliminadas:`);
                songsBackup.forEach((song, index) => {
                    console.log(`  ${index + 1}. "${song.title}" - ${song.artist || '[Sin artista]'}`);
                });
            }
            
            this.showNotification(`🗑️ Eliminadas ${songsCount} canciones exitosamente`, 'success');
            
        } else {
            console.log(`❌ Confirmación inválida: "${userInput}" (se esperaba "BORRAR")`);
            this.showNotification('❌ Confirmación incorrecta. Debes escribir exactamente "BORRAR"', 'error');
        }
    }

    // Función para importar el archivo completo con formato de columnas
    importCompleteSongsFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const confirmMessage = `¿Deseas importar las canciones del archivo "${file.name}"?\n\n` +
                    `Esto agregará las canciones con formato completo a tu colección actual.`;
                
                if (!confirm(confirmMessage)) {
                    return;
                }
                
                const text = e.target.result;
                console.log(`🚀 Iniciando importación de archivo: ${file.name}`);
                console.log(`📊 Tamaño del archivo: ${text.length} caracteres`);
                
                const songs = this.parseCompleteSongFormat(text);
                let importedCount = 0;
                let skippedCount = 0;
                let errorCount = 0;
                
                console.log(`🔄 Procesando ${songs.length} canciones para importar...`);
                
                songs.forEach((songData, index) => {
                    try {
                        console.log(`🎵 Procesando canción ${index + 1}/${songs.length}: "${songData.title}"`);
                        
                        // Verificar si la canción ya existe
                        const existingSong = this.songs.find(s => 
                            s.title.toLowerCase() === songData.title.toLowerCase() && 
                            (songData.artist ? s.artist.toLowerCase() === songData.artist.toLowerCase() : true)
                        );
                        
                        if (!existingSong) {
                            const newSong = {
                                id: Date.now() + Math.random(),
                                title: songData.title,
                                artist: songData.artist || '',
                                bpm: songData.bpm || '',
                                lyrics: songData.lyrics || '',
                                notes: songData.notes || '',
                                fontSize: 2.4,
                                active: false,
                                order: songData.order || 0
                            };
                            
                            this.songs.push(newSong);
                            importedCount++;
                            console.log(`  ✅ Importada: "${songData.title}" - ID: ${newSong.id}`);
                        } else {
                            skippedCount++;
                            console.log(`  ⏭️  Saltada (ya existe): "${songData.title}"`);
                        }
                    } catch (error) {
                        errorCount++;
                        console.error(`  💥 Error importando "${songData.title}":`, error.message);
                        console.log(`     Datos problemáticos:`, songData);
                        // Continuar con la siguiente canción
                    }
                });
                
                // Guardar y actualizar interfaz
                this.saveSongs();
                this.renderSongs();
                
                // Mostrar resultado detallado
                console.log(`📈 Resumen de importación:`);
                console.log(`  ✅ Importadas: ${importedCount}`);
                console.log(`  ⏭️  Saltadas (duplicadas): ${skippedCount}`);
                console.log(`  💥 Errores: ${errorCount}`);
                console.log(`  📊 Total procesadas: ${songs.length}`);
                
                let message = `✅ Importadas ${importedCount} canciones`;
                if (skippedCount > 0) message += `, ${skippedCount} saltadas (ya existían)`;
                if (errorCount > 0) message += `, ${errorCount} errores (ver consola)`;
                
                const notificationType = errorCount > 0 ? 'warning' : 'success';
                this.showNotification(message, notificationType);
                
            } catch (error) {
                console.error('Error importando el archivo completo:', error);
                this.showNotification('❌ Error al procesar el archivo de canciones completo', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showNotification('❌ Error al leer el archivo', 'error');
        };
        
        reader.readAsText(file, 'UTF-8');
    }

    // Función para parsear el formato completo con columnas separadas por tabulador
    parseCompleteSongFormat(content) {
        const lines = content.split('\n');
        const songs = [];
        
        console.log(`📄 Procesando archivo con ${lines.length} líneas`);
        
        // La primera línea contiene los headers, la mostramos para debug
        if (lines.length > 0) {
            const headers = lines[0].split('\t');
            console.log(`📋 Headers detectados (${headers.length} columnas):`, headers.slice(0, 10).join(' | '), '...');
        }
        
        // Procesar líneas de datos (saltando la primera que son headers)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) {
                console.log(`⏭️  Línea ${i}: vacía, saltando...`);
                continue;
            }
            
            try {
                // Dividir por tabuladores
                const columns = line.split('\t');
                console.log(`📝 Línea ${i}: ${columns.length} columnas detectadas`);
                
                if (columns.length >= 16) { // Asegurar que tenemos suficientes columnas
                    const title = columns[0] || '';
                    const artist = columns[1] || '';
                    const order = parseInt(columns[3]) || 0;
                    const bpm = columns[8] || '';
                    const lyrics = columns[15] || ''; // Columna LETRAS
                    const notes = columns[19] || ''; // Columna COMENTARIOS
                    
                    if (title) { // Solo procesar si hay título
                        const songData = {
                            title: title,
                            artist: artist,
                            order: order,
                            bpm: bpm,
                            lyrics: lyrics.replace(/\\n/g, '\n'), // Convertir \n a saltos de línea reales
                            notes: notes.replace(/\\n/g, '\n')
                        };
                        
                        songs.push(songData);
                        console.log(`✅ Línea ${i}: "${title}" por ${artist || '[Sin artista]'} - BPM: ${bpm || '[Sin BPM]'} - Orden: ${order}`);
                    } else {
                        console.log(`⚠️  Línea ${i}: Sin título, saltando...`);
                    }
                } else {
                    console.log(`❌ Línea ${i}: Insuficientes columnas (${columns.length}/16 mínimas)`);
                    console.log(`   Contenido: "${line.substring(0, 100)}${line.length > 100 ? '...' : ''}"`);
                }
            } catch (error) {
                console.error(`💥 Error procesando línea ${i}:`, error.message);
                console.log(`   Contenido problemático: "${line.substring(0, 100)}${line.length > 100 ? '...' : ''}"`);
                // Continuar con la siguiente línea
                continue;
            }
        }
        
        console.log(`🎵 Total de canciones procesadas exitosamente: ${songs.length}`);
        return songs;
    }

    // ===== FUNCIONES DE GESTIÓN DE REPERTORIOS =====

    loadRepertoires() {
        try {
            console.log('🏁 Cargando repertorios...');
            const stored = localStorage.getItem(this.repertoiresKey);
            
            if (stored) {
                const data = JSON.parse(stored);
                this.repertoires = new Map(Object.entries(data.repertoires || {}));
                this.currentRepertoireId = data.currentRepertoireId || 'default';
                console.log(`📚 Repertorios cargados: ${this.repertoires.size}, actual: ${this.currentRepertoireId}`);
            }

            // Asegurar que existe el repertorio por defecto
            if (!this.repertoires.has('default')) {
                console.log('🆕 Creando repertorio por defecto...');
                this.repertoires.set('default', {
                    id: 'default',
                    name: 'Repertorio Principal',
                    songs: [],
                    setlistName: 'Canciones',
                    showArtistBpm: false, // No mostrar por defecto
                    hideNotes: false, // No ocultar notas por defecto
                    createdAt: new Date().toISOString()
                });
            }
            
            // Migrar repertorios existentes para añadir propiedades si no existen
            this.repertoires.forEach((repertoire, id) => {
                if (repertoire.showArtistBpm === undefined) {
                    repertoire.showArtistBpm = false; // No mostrar por defecto
                    console.log(`🔄 Migrado repertorio ${id} con showArtistBpm`);
                }
                if (repertoire.hideNotes === undefined) {
                    repertoire.hideNotes = false; // No ocultar notas por defecto
                    console.log(`🔄 Migrado repertorio ${id} con hideNotes`);
                }
            });

            // Verificar que el repertorio actual existe
            if (!this.repertoires.has(this.currentRepertoireId)) {
                console.log(`⚠️ Repertorio actual ${this.currentRepertoireId} no existe, cambiando a default`);
                this.currentRepertoireId = 'default';
            }

            this.updateRepertoireSelect();
            this.updateCurrentRepertoireName();
            
            // Aplicar configuración de visualización del repertorio actual
            const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
            if (currentRepertoire) {
                this.applyDisplaySettings(currentRepertoire);
            }
            
            console.log('✅ Repertorios inicializados correctamente');
        } catch (error) {
            console.error('❌ Error cargando repertorios:', error);
            // Inicializar repertorio por defecto en caso de error
            this.repertoires.set('default', {
                id: 'default',
                name: 'Repertorio Principal',
                songs: [],
                setlistName: 'Canciones',
                createdAt: new Date().toISOString()
            });
            this.currentRepertoireId = 'default';
        }
    }

    async saveRepertoires() {
        try {
            // Guardar el repertorio actual
            const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
            if (currentRepertoire) {
                currentRepertoire.songs = this.songs;
                currentRepertoire.setlistName = this.setlistName;
            }

            // Guardar todos los repertorios en localStorage
            const data = {
                currentRepertoireId: this.currentRepertoireId,
                repertoires: Object.fromEntries(this.repertoires)
            };
            localStorage.setItem(this.repertoiresKey, JSON.stringify(data));
            
            // Marcar fecha de última modificación local
            if (this.firebaseManager) {
                this.firebaseManager.setLocalLastModified();
            }
            
            // Sincronizar con Firebase si está habilitado
            this.syncWithFirebase();
            
        } catch (error) {
            console.error('Error guardando repertorios:', error);
        }
    }
    
    async syncWithFirebase() {
        if (!this.firebaseManager || !this.firebaseManager.syncEnabled) {
            return;
        }
        
        try {
            const result = await this.firebaseManager.syncRepertoires(this.repertoires);
            
            if (result.success) {
                console.log('🔥 Sync resultado:', result.message);
                
                // Si necesitamos actualizar datos locales
                if (result.shouldUpdateLocal && result.data) {
                    await this.loadFromFirebaseData(result.data);
                }
            } else {
                console.warn('⚠️ Sync falló:', result.message);
            }
        } catch (error) {
            console.error('❌ Error en sync Firebase:', error);
        }
    }
    
    async loadFromFirebaseData(firebaseData) {
        try {
            console.log('⬇️ Cargando datos desde Firebase...');
            
            // Actualizar repertorios con datos de Firebase
            this.repertoires = firebaseData.repertoires;
            
            // Guardar en localStorage también
            const data = {
                currentRepertoireId: this.currentRepertoireId,
                repertoires: Object.fromEntries(this.repertoires)
            };
            localStorage.setItem(this.repertoiresKey, JSON.stringify(data));
            
            // Recargar la interfaz
            this.updateRepertoireSelect();
            this.updateRepertoireList();
            this.loadSongs();
            this.renderSongs();
            
            this.showNotification('Datos sincronizados desde la nube', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando datos de Firebase:', error);
            this.showNotification('Error sincronizando datos', 'error');
        }
    }

    switchRepertoire(repertoireId) {
        if (repertoireId === this.currentRepertoireId) return;

        console.log(`🔄 Cambiando al repertorio: ${repertoireId}`);

        // Guardar el estado actual
        this.saveCurrentRepertoire();

        // Cambiar al nuevo repertorio
        this.currentRepertoireId = repertoireId;
        const repertoire = this.repertoires.get(repertoireId);
        
        if (repertoire) {
            console.log(`📂 Cargando repertorio "${repertoire.name}" con ${(repertoire.songs || []).length} canciones`);
            
            // Limpiar canciones actuales
            this.currentSong = null;
            
            // Cargar las canciones del nuevo repertorio
            this.songs = [...(repertoire.songs || [])]; // Hacer una copia para evitar referencias
            this.setlistName = repertoire.setlistName || 'Canciones';
            
            // Aplicar configuración de visualización
            this.applyDisplaySettings(repertoire);
            
            console.log(`🎵 Canciones cargadas:`, this.songs.map(s => s.title));
            
            // Asegurar propiedades necesarias en las canciones
            let hasActiveSong = false;
            this.songs.forEach(song => {
                if (song.active === undefined) {
                    song.active = false;
                }
                if (song.notes === undefined) {
                    song.notes = '';
                }
                if (song.order === undefined) {
                    song.order = 0;
                }
                if (song.active === true) {
                    hasActiveSong = true;
                }
            });
            
            // Actualizar UI
            this.renderSongs();
            this.updateSongsTitle(this.songs.length);
            this.updateCurrentRepertoireName();
            
            // Seleccionar canción activa o la primera si existe
            if (this.songs.length > 0) {
                let songToSelect = hasActiveSong ? 
                    this.songs.find(song => song.active === true) : 
                    this.songs[0];
                
                if (songToSelect) {
                    // Limpiar estados activos previos
                    this.songs.forEach(song => song.active = false);
                    songToSelect.active = true;
                    this.selectSong(songToSelect);
                }
            } else {
                // Limpiar vista si no hay canciones
                this.currentSong = null;
                this.editCurrentSongBtn.disabled = true;
                
                // Limpiar info del header
                document.getElementById('current-song').textContent = '';
                document.getElementById('current-bpm').textContent = '';
                document.getElementById('current-notes').style.display = 'none';
                
                // Limpiar letras
                if (window.lyricsScroller) {
                    window.lyricsScroller.loadLyrics('');
                }
                
                // Mostrar mensaje de bienvenida
                const lyricsContent = document.getElementById('lyrics-content');
                if (lyricsContent) {
                    lyricsContent.innerHTML = `
                        <p class="welcome-message">
                            Repertorio "${repertoire.name}" vacío
                            <br><br>
                            Agrega canciones usando el botón "+ Agregar" en la lista.
                        </p>
                    `;
                }
            }

            // Guardar el cambio
            this.saveRepertoires();
            
            this.showNotification(`Cambiado a repertorio: ${repertoire.name}`, 'success');
            
            console.log(`✅ Cambio completado. Canciones en lista:`, this.songs.length);
        } else {
            console.error(`❌ Repertorio no encontrado: ${repertoireId}`);
            this.showNotification(`Error: Repertorio no encontrado`, 'error');
        }
    }

    saveCurrentRepertoire() {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (currentRepertoire) {
            console.log(`💾 Guardando repertorio actual "${currentRepertoire.name}" con ${this.songs.length} canciones`);
            currentRepertoire.songs = [...this.songs]; // Copia profunda
            currentRepertoire.setlistName = this.setlistName;
        }
    }

    updateRepertoireSelect() {
        this.repertoireSelect.innerHTML = '';
        
        for (const [id, repertoire] of this.repertoires) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = repertoire.name;
            option.selected = id === this.currentRepertoireId;
            this.repertoireSelect.appendChild(option);
        }
    }

    updateCurrentRepertoireName() {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (currentRepertoire && this.currentRepertoireName) {
            this.currentRepertoireName.textContent = currentRepertoire.name;
        }
    }

    openRepertoireOptionsModal() {
        this.updateRepertoireList();
        this.updateDeleteButtonVisibility();
        this.updateDisplaySettingsUI();
        this.repertoireOptionsModal.style.display = 'block';
    }

    closeRepertoireOptionsModalFunc() {
        this.repertoireOptionsModal.style.display = 'none';
    }

    updateRepertoireList() {
        this.repertoireList.innerHTML = '';
        
        for (const [id, repertoire] of this.repertoires) {
            const item = document.createElement('div');
            item.className = 'repertoire-item';
            if (id === this.currentRepertoireId) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <div class="repertoire-info">
                    <div class="repertoire-name">${repertoire.name}</div>
                    <div class="repertoire-count">${(repertoire.songs || []).length} canciones</div>
                </div>
                <div class="repertoire-item-actions">
                    <button class="repertoire-item-btn" onclick="songManager.switchRepertoire('${id}')">
                        Activar
                    </button>
                </div>
            `;
            
            this.repertoireList.appendChild(item);
        }
    }

    updateDeleteButtonVisibility() {
        // Solo mostrar botón de eliminar si hay más de un repertorio
        this.deleteRepertoireBtn.style.display = this.repertoires.size > 1 ? 'block' : 'none';
    }

    openNewRepertoireModal() {
        this.repertoireNameModalTitle.textContent = 'Nuevo Repertorio';
        this.repertoireNameInput.value = '';
        this.repertoireNameInput.placeholder = 'Nombre del nuevo repertorio';
        this.repertoireNameModal.dataset.mode = 'new';
        this.repertoireNameModal.style.display = 'block';
        this.repertoireNameInput.focus();
    }

    duplicateCurrentRepertoire() {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (!currentRepertoire) return;

        this.repertoireNameModalTitle.textContent = 'Duplicar Repertorio';
        this.repertoireNameInput.value = `${currentRepertoire.name} (Copia)`;
        this.repertoireNameInput.placeholder = 'Nombre del repertorio duplicado';
        this.repertoireNameModal.dataset.mode = 'duplicate';
        this.repertoireNameModal.style.display = 'block';
        this.repertoireNameInput.focus();
        this.repertoireNameInput.select();
    }

    openRenameRepertoireModal() {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (!currentRepertoire) return;

        this.repertoireNameModalTitle.textContent = 'Renombrar Repertorio';
        this.repertoireNameInput.value = currentRepertoire.name;
        this.repertoireNameInput.placeholder = 'Nuevo nombre del repertorio';
        this.repertoireNameModal.dataset.mode = 'rename';
        this.repertoireNameModal.style.display = 'block';
        this.repertoireNameInput.focus();
        this.repertoireNameInput.select();
    }

    deleteCurrentRepertoire() {
        if (this.repertoires.size <= 1) {
            this.showNotification('No se puede eliminar el único repertorio', 'error');
            return;
        }

        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (!currentRepertoire) return;

        const confirmation = confirm(`¿Estás seguro de que quieres eliminar el repertorio "${currentRepertoire.name}"?\n\nEsta acción no se puede deshacer y se perderán todas las canciones del repertorio.`);
        
        if (confirmation) {
            // Eliminar repertorio
            this.repertoires.delete(this.currentRepertoireId);
            
            // Cambiar al primer repertorio disponible
            const firstRepertoireId = this.repertoires.keys().next().value;
            this.currentRepertoireId = firstRepertoireId;
            
            // Cargar el nuevo repertorio
            this.switchRepertoire(firstRepertoireId);
            
            // Actualizar UI
            this.updateRepertoireSelect();
            this.updateRepertoireList();
            this.updateDeleteButtonVisibility();
            
            this.showNotification(`Repertorio "${currentRepertoire.name}" eliminado`, 'success');
        }
    }

    closeRepertoireNameModalFunc() {
        this.repertoireNameModal.style.display = 'none';
        this.repertoireNameForm.reset();
    }

    handleRepertoireNameSubmit() {
        const name = this.repertoireNameInput.value.trim();
        const mode = this.repertoireNameModal.dataset.mode;

        if (!name) {
            this.showNotification('El nombre no puede estar vacío', 'error');
            return;
        }

        // Verificar que el nombre no esté duplicado (excepto en rename del mismo repertorio)
        const nameExists = Array.from(this.repertoires.values()).some(repertoire => 
            repertoire.name.toLowerCase() === name.toLowerCase() && 
            (mode !== 'rename' || repertoire.id !== this.currentRepertoireId)
        );

        if (nameExists) {
            this.showNotification('Ya existe un repertorio con ese nombre', 'error');
            return;
        }

        switch (mode) {
            case 'new':
                this.createNewRepertoire(name);
                break;
            case 'duplicate':
                this.duplicateRepertoireWithName(name);
                break;
            case 'rename':
                this.renameCurrentRepertoire(name);
                break;
        }

        this.closeRepertoireNameModalFunc();
    }

    createNewRepertoire(name) {
        const newId = 'repertoire_' + Date.now();
        const newRepertoire = {
            id: newId,
            name: name,
            songs: [],
            setlistName: 'Canciones',
            showArtistBpm: false, // No mostrar artista y BPM por defecto
            hideNotes: false, // No ocultar notas por defecto
            createdAt: new Date().toISOString()
        };

        this.repertoires.set(newId, newRepertoire);
        this.saveRepertoires();
        this.updateRepertoireSelect();
        this.updateRepertoireList();
        
        this.showNotification(`Repertorio "${name}" creado`, 'success');
    }

    duplicateRepertoireWithName(name) {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (!currentRepertoire) return;

        const newId = 'repertoire_' + Date.now();
        const duplicatedRepertoire = {
            id: newId,
            name: name,
            songs: JSON.parse(JSON.stringify(currentRepertoire.songs || [])), // Deep copy
            setlistName: currentRepertoire.setlistName,
            showArtistBpm: currentRepertoire.showArtistBpm === true, // Heredar configuración
            hideNotes: currentRepertoire.hideNotes === true, // Heredar configuración
            createdAt: new Date().toISOString()
        };

        // Asignar nuevos IDs a las canciones duplicadas
        duplicatedRepertoire.songs.forEach(song => {
            song.id = Date.now() + Math.random();
            song.active = false; // Ninguna canción duplicada debe estar activa
        });

        this.repertoires.set(newId, duplicatedRepertoire);
        this.saveRepertoires();
        this.updateRepertoireSelect();
        this.updateRepertoireList();
        
        this.showNotification(`Repertorio "${name}" duplicado con ${duplicatedRepertoire.songs.length} canciones`, 'success');
    }

    renameCurrentRepertoire(name) {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (!currentRepertoire) return;

        currentRepertoire.name = name;
        this.saveRepertoires();
        this.updateRepertoireSelect();
        this.updateCurrentRepertoireName();
        this.updateRepertoireList();
        
        this.showNotification(`Repertorio renombrado a "${name}"`, 'success');
    }

    // Sobrescribir saveSongs para que también guarde repertorios
    saveSongs() {
        // Ordenar las canciones por el campo 'order' antes de guardar
        const sortedSongs = [...this.songs].sort((a, b) => {
            // Primero por orden (ascendente), luego por título si el orden es igual
            if (a.order !== b.order) {
                return a.order - b.order;
            }
            return a.title.localeCompare(b.title);
        });
        
        // Guardar en el formato tradicional para compatibilidad
        const data = {
            setlistName: this.setlistName,
            songs: sortedSongs
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        
        // Actualizar el array interno con el orden correcto
        this.songs = sortedSongs;

        // También guardar en el sistema de repertorios
        this.saveRepertoires();
    }

    // Aplicar configuración de visualización del repertorio
    applyDisplaySettings(repertoire) {
        const showArtistBpm = repertoire.showArtistBpm === true; // Por defecto false
        const hideNotes = repertoire.hideNotes === true; // Por defecto false
        
        // Actualizar checkboxes
        if (this.showArtistBpmCheckbox) {
            this.showArtistBpmCheckbox.checked = showArtistBpm;
        }
        
        if (this.hideNotesCheckbox) {
            this.hideNotesCheckbox.checked = hideNotes;
        }
        
        // Aplicar clases CSS al body
        if (showArtistBpm) {
            document.body.classList.remove('hide-artist-bpm');
        } else {
            document.body.classList.add('hide-artist-bpm');
        }
        
        if (hideNotes) {
            document.body.classList.add('hide-notes');
        } else {
            document.body.classList.remove('hide-notes');
        }
        
        console.log(`🎨 Configuración de visualización aplicada: mostrar artista/BPM = ${showArtistBpm}, ocultar notas = ${hideNotes}`);
    }

    // Guardar configuración de visualización
    saveDisplaySettings() {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (currentRepertoire) {
            if (this.showArtistBpmCheckbox) {
                currentRepertoire.showArtistBpm = this.showArtistBpmCheckbox.checked;
            }
            if (this.hideNotesCheckbox) {
                currentRepertoire.hideNotes = this.hideNotesCheckbox.checked;
            }
            this.saveRepertoires();
            
            // Aplicar inmediatamente
            this.applyDisplaySettings(currentRepertoire);
            
            console.log(`💾 Configuración guardada: mostrar artista/BPM = ${currentRepertoire.showArtistBpm}`);
        }
    }

    // Actualizar UI de configuración de visualización
    updateDisplaySettingsUI() {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (currentRepertoire) {
            if (this.showArtistBpmCheckbox) {
                this.showArtistBpmCheckbox.checked = currentRepertoire.showArtistBpm === true;
            }
            if (this.hideNotesCheckbox) {
                this.hideNotesCheckbox.checked = currentRepertoire.hideNotes === true;
            }
        }
    }

    // Formatear fecha para mostrar
    formatDate(dateString) {
        if (!dateString) return '-';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            // Si es hoy
            if (diffDays === 0) {
                return `Hoy ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
            }
            // Si es ayer
            else if (diffDays === 1) {
                return `Ayer ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
            }
            // Si es esta semana (últimos 7 días)
            else if (diffDays < 7) {
                return `Hace ${diffDays} días`;
            }
            // Si es más antiguo
            else {
                return date.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (error) {
            console.warn('Error formateando fecha:', error);
            return '-';
        }
    }

    // Actualizar información de la canción en el modal de edición
    updateSongInfoDisplay(song) {
        const lastModifiedElement = document.getElementById('edit-song-last-modified');
        
        if (lastModifiedElement) {
            // Si la canción tiene lastModified, usarla; si no, usar createdAt; si no, mostrar que es nueva
            const dateToShow = song.lastModified || song.createdAt;
            lastModifiedElement.textContent = dateToShow ? this.formatDate(dateToShow) : 'Canción nueva';
        }
    }

    // Cargar opciones de repertorios para la función de copia
    loadCopyRepertoireOptions() {
        const select = this.copyTargetRepertoireSelect;
        select.innerHTML = '<option value="">Seleccionar repertorio...</option>';
        
        // Agregar todos los repertorios excepto el actual
        this.repertoires.forEach((repertoire, id) => {
            if (id !== this.currentRepertoireId) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = repertoire.name;
                select.appendChild(option);
            }
        });
        
        // Actualizar estado del botón
        this.updateCopyButtonState();
    }

    // Actualizar estado del botón de copia
    updateCopyButtonState() {
        const hasSelection = this.copyTargetRepertoireSelect.value !== '';
        this.copySongBtn.disabled = !hasSelection;
    }

    // Copiar canción actual a otro repertorio
    copySongToRepertoire() {
        const targetRepertoireId = this.copyTargetRepertoireSelect.value;
        
        if (!targetRepertoireId || !this.editingSong) {
            alert('Por favor selecciona un repertorio de destino.');
            return;
        }
        
        const targetRepertoire = this.repertoires.get(targetRepertoireId);
        if (!targetRepertoire) {
            alert('El repertorio seleccionado no existe.');
            return;
        }
        
        // Crear una copia de la canción con nuevo ID
        const now = new Date().toISOString();
        const songCopy = {
            ...this.editingSong,
            id: this.generateId(),
            order: 0, // Resetear el orden en el nuevo repertorio
            createdAt: now, // Nueva fecha de creación para la copia
            lastModified: now
        };
        
        // Verificar si ya existe una canción con el mismo título y artista
        const existingSong = targetRepertoire.songs.find(s => 
            s.title.toLowerCase() === songCopy.title.toLowerCase() && 
            s.artist.toLowerCase() === songCopy.artist.toLowerCase()
        );
        
        if (existingSong) {
            const confirmOverwrite = confirm(
                `Ya existe una canción "${songCopy.title}" de "${songCopy.artist}" en el repertorio "${targetRepertoire.name}".\n\n¿Deseas reemplazarla?`
            );
            
            if (confirmOverwrite) {
                // Reemplazar la canción existente manteniendo ID y fechas originales
                const originalId = existingSong.id;
                const originalCreatedAt = existingSong.createdAt;
                Object.assign(existingSong, songCopy);
                existingSong.id = originalId; // Mantener el ID original
                existingSong.createdAt = originalCreatedAt; // Mantener fecha de creación original
                existingSong.lastModified = new Date().toISOString(); // Actualizar solo fecha de modificación
            } else {
                return; // Cancelar la operación
            }
        } else {
            // Agregar la nueva canción
            targetRepertoire.songs.push(songCopy);
        }
        
        // Guardar cambios
        this.saveRepertoires();
        
        // Mostrar confirmación
        alert(`Canción "${songCopy.title}" copiada exitosamente al repertorio "${targetRepertoire.name}".`);
        
        // Limpiar selección
        this.copyTargetRepertoireSelect.value = '';
        this.updateCopyButtonState();
        
        console.log(`📄 Canción copiada: "${songCopy.title}" → ${targetRepertoire.name}`);
    }

    // Métodos de autenticación Firebase
    onAuthStateChanged(user) {
        this.updateAuthUI(user);
        
        if (user) {
            // Usuario autenticado - intentar sincronizar
            this.performManualSync();
        }
    }

    updateAuthUI(user) {
        if (user) {
            // Usuario autenticado
            this.authStatusText.textContent = `Conectado: ${user.email}`;
            this.authStatusDisplay.classList.add('authenticated');
            this.authLoginBtn.style.display = 'none';
            this.authLogoutBtn.style.display = 'block';
            this.enableSyncCheckbox.disabled = false;
            this.manualSyncBtn.disabled = false;
        } else {
            // Usuario no autenticado
            this.authStatusText.textContent = 'No autenticado';
            this.authStatusDisplay.classList.remove('authenticated');
            this.authLoginBtn.style.display = 'block';
            this.authLogoutBtn.style.display = 'none';
            this.enableSyncCheckbox.disabled = true;
            this.enableSyncCheckbox.checked = false;
            this.manualSyncBtn.disabled = true;
        }
    }

    openAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'block';
            this.authEmail.focus();
        }
    }

    closeAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'none';
            this.clearAuthForm();
        }
    }

    clearAuthForm() {
        if (this.authEmail) this.authEmail.value = '';
        if (this.authPassword) this.authPassword.value = '';
        this.hideAuthStatus();
    }

    toggleAuthMode() {
        this.isSignUpMode = !this.isSignUpMode;
        
        const title = document.getElementById('auth-modal-title');
        if (this.isSignUpMode) {
            title.textContent = 'Crear Cuenta';
            this.authSubmitBtn.textContent = 'Registrarse';
            this.authToggleBtn.textContent = '¿Ya tienes cuenta? Inicia sesión';
        } else {
            title.textContent = 'Iniciar Sesión';
            this.authSubmitBtn.textContent = 'Iniciar Sesión';
            this.authToggleBtn.textContent = '¿No tienes cuenta? Regístrate';
        }
        
        this.hideAuthStatus();
    }

    async handleAuthSubmit() {
        const email = this.authEmail.value.trim();
        const password = this.authPassword.value;

        if (!email || !password) {
            this.showAuthStatus('Por favor completa todos los campos', 'error');
            return;
        }

        if (password.length < 6) {
            this.showAuthStatus('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        this.authSubmitBtn.disabled = true;
        this.authSubmitBtn.textContent = 'Procesando...';

        try {
            let result;
            if (this.isSignUpMode) {
                result = await this.firebaseManager.signUpWithEmail(email, password);
            } else {
                result = await this.firebaseManager.signInWithEmail(email, password);
            }

            if (result.success) {
                this.showAuthStatus(
                    this.isSignUpMode ? 'Cuenta creada exitosamente' : 'Inicio de sesión exitoso',
                    'success'
                );
                
                setTimeout(() => {
                    this.closeAuthModal();
                }, 1500);
            } else {
                this.showAuthStatus(this.getAuthErrorMessage(result.error), 'error');
            }
        } catch (error) {
            console.error('Error en autenticación:', error);
            this.showAuthStatus('Error de conexión. Inténtalo de nuevo.', 'error');
        }

        this.authSubmitBtn.disabled = false;
        this.authSubmitBtn.textContent = this.isSignUpMode ? 'Registrarse' : 'Iniciar Sesión';
    }

    async performLogout() {
        try {
            const result = await this.firebaseManager.signOut();
            if (result.success) {
                this.showNotification('Sesión cerrada correctamente', 'success');
            } else {
                this.showNotification('Error cerrando sesión', 'error');
            }
        } catch (error) {
            console.error('Error cerrando sesión:', error);
            this.showNotification('Error cerrando sesión', 'error');
        }
    }

    showAuthStatus(message, type) {
        this.authStatus.textContent = message;
        this.authStatus.className = `auth-status ${type}`;
        this.authStatus.style.display = 'block';
    }

    hideAuthStatus() {
        this.authStatus.style.display = 'none';
    }

    getAuthErrorMessage(error) {
        switch (error) {
            case 'auth/user-not-found':
                return 'No existe una cuenta con este email';
            case 'auth/wrong-password':
                return 'Contraseña incorrecta';
            case 'auth/email-already-in-use':
                return 'Ya existe una cuenta con este email';
            case 'auth/weak-password':
                return 'La contraseña es muy débil';
            case 'auth/invalid-email':
                return 'Email inválido';
            case 'auth/user-disabled':
                return 'Esta cuenta ha sido deshabilitada';
            case 'auth/too-many-requests':
                return 'Demasiados intentos. Inténtalo más tarde';
            default:
                return error || 'Error desconocido';
        }
    }

    // Métodos de sincronización actualizados
    toggleSync() {
        if (!this.firebaseManager || !this.firebaseManager.isAuthenticated()) {
            this.showNotification('Debes iniciar sesión para habilitar la sincronización', 'warning');
            this.enableSyncCheckbox.checked = false;
            return;
        }

        if (this.enableSyncCheckbox.checked) {
            this.firebaseManager.enableSync();
            this.showNotification('Sincronización habilitada', 'success');
        } else {
            this.firebaseManager.disableSync();
            this.showNotification('Sincronización deshabilitada', 'info');
        }
    }

    async performManualSync() {
        if (!this.firebaseManager || !this.firebaseManager.isAuthenticated()) {
            this.showNotification('Debes iniciar sesión para sincronizar', 'warning');
            return;
        }

        this.manualSyncBtn.disabled = true;
        this.manualSyncBtn.textContent = '🔄 Sincronizando...';

        try {
            const result = await this.firebaseManager.syncRepertoires(this.repertoires);
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                
                // Si necesitamos actualizar datos locales
                if (result.shouldUpdateLocal && result.data) {
                    await this.loadFromFirebaseData(result.data);
                }
            } else {
                this.showNotification(`Error: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error en sincronización manual:', error);
            this.showNotification('Error de conexión durante la sincronización', 'error');
        }

        this.manualSyncBtn.disabled = false;
        this.manualSyncBtn.textContent = '🔄 Sincronizar Ahora';
    }

    toggleSyncStatus() {
        if (!this.firebaseManager) {
            this.showSyncStatus('Firebase no disponible', 'error');
            return;
        }

        const status = this.firebaseManager.getConnectionStatus();
        const isVisible = this.syncStatusText.style.display !== 'none';

        if (isVisible) {
            this.syncStatusText.style.display = 'none';
        } else {
            let statusText = `Estado de Firebase:\n`;
            statusText += `• Inicializado: ${status.initialized ? 'Sí' : 'No'}\n`;
            statusText += `• Autenticado: ${status.authenticated ? 'Sí' : 'No'}\n`;
            
            if (status.user) {
                statusText += `• Usuario: ${status.user.email}\n`;
                statusText += `• ID: ${status.user.uid}\n`;
            }
            
            statusText += `• Sincronización: ${status.syncEnabled ? 'Habilitada' : 'Deshabilitada'}\n`;
            
            if (status.lastSync) {
                statusText += `• Último sync: ${status.lastSync.toLocaleString()}`;
            } else {
                statusText += `• Último sync: Nunca`;
            }

            this.showSyncStatus(statusText, status.authenticated ? 'success' : 'warning');
        }
    }

    showSyncStatus(message, type) {
        this.syncStatusText.textContent = message;
        this.syncStatusText.className = `sync-status-text ${type}`;
        this.syncStatusText.style.display = 'block';
    }

    initializeSyncUI() {
        // Configurar UI inicial basada en el estado de Firebase
        if (this.firebaseManager) {
            const status = this.firebaseManager.getConnectionStatus();
            this.updateAuthUI(status.user);
            
            if (this.enableSyncCheckbox) {
                this.enableSyncCheckbox.checked = status.syncEnabled;
            }
        }
    }

    // Métodos de sincronización Firebase
    toggleSync() {
        if (!this.firebaseManager) {
            this.showNotification('Firebase no está disponible', 'error');
            this.enableSyncCheckbox.checked = false;
            return;
        }

        if (this.enableSyncCheckbox.checked) {
            this.firebaseManager.enableSync();
            this.showNotification('Sincronización habilitada', 'success');
            // Realizar primera sincronización
            this.performManualSync();
        } else {
            this.firebaseManager.disableSync();
            this.showNotification('Sincronización deshabilitada', 'info');
        }
    }

    async performManualSync() {
        if (!this.firebaseManager) {
            this.showNotification('Firebase no está disponible', 'error');
            return;
        }

        try {
            this.updateSyncStatus('Sincronizando...', 'info');
            
            const result = await this.firebaseManager.syncRepertoires(this.repertoires);
            
            if (result.success) {
                this.updateSyncStatus(result.message, 'success');
                
                // Si necesitamos actualizar datos locales
                if (result.shouldUpdateLocal && result.data) {
                    await this.loadFromFirebaseData(result.data);
                }
            } else {
                this.updateSyncStatus(result.message, 'error');
            }
        } catch (error) {
            console.error('❌ Error en sincronización manual:', error);
            this.updateSyncStatus('Error de conexión', 'error');
        }
    }

    toggleSyncStatus() {
        if (this.syncStatusText.style.display === 'none') {
            this.showSyncStatus();
        } else {
            this.hideSyncStatus();
        }
    }

    showSyncStatus() {
        if (!this.firebaseManager) {
            this.updateSyncStatus('Firebase no disponible', 'error');
            return;
        }

        const status = this.firebaseManager.getConnectionStatus();
        const statusText = `
Estado: ${status.initialized ? '✅ Conectado' : '❌ Desconectado'}
Sync: ${status.syncEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}
Usuario: ${status.userId}
Último sync: ${status.lastSync ? status.lastSync.toLocaleString() : 'Nunca'}
        `;
        
        this.updateSyncStatus(statusText, status.initialized ? 'success' : 'error');
    }

    hideSyncStatus() {
        this.syncStatusText.style.display = 'none';
    }

    updateSyncStatus(message, type = 'info') {
        if (this.syncStatusText) {
            this.syncStatusText.textContent = message;
            this.syncStatusText.className = `sync-status-text ${type}`;
            this.syncStatusText.style.display = 'block';
        }
    }

    // Inicializar estado de sincronización
    initializeSyncUI() {
        if (this.firebaseManager && this.enableSyncCheckbox) {
            this.enableSyncCheckbox.checked = this.firebaseManager.syncEnabled;
        }
    }
}

// Exportar para uso global
window.SongManager = SongManager;
