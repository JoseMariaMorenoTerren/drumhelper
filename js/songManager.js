class SongManager {
    constructor() {
        // --- Modelo v2 (catálogo global + setlists por referencia) ---
        // Catálogo de canciones único: songId -> objeto canción.
        this.catalog = new Map();
        // Repertorios: repertoireId -> { id, name, ..., entries: [{songId, order}], activeSongId }
        this.repertoires = new Map();
        this.currentRepertoireId = 'default';

        // Estado derivado (no se persiste): canciones del repertorio actual resueltas desde el catálogo,
        // con `order` inyectado para preservar compatibilidad con el resto de la UI.
        this.songs = [];
        this.currentSong = null;
        this.setlistName = 'Canciones';

        // Claves de almacenamiento
        this.catalogKey = 'drumhelper-catalog-v2';
        this.repertoiresKeyV2 = 'drumhelper-repertoires-v2';
        // Claves del formato antiguo (para migración)
        this.legacySongsKey = 'drumhelper-songs';
        this.legacyRepertoiresKey = 'drumhelper-repertoires';
        // Compatibilidad: algunas funciones leen estos nombres
        this.storageKey = this.legacySongsKey;
        this.repertoiresKey = this.legacyRepertoiresKey;
        
        this.songList = document.getElementById('song-list');
        this.orderModeBtn = document.getElementById('order-mode-btn');
        this.resetOrderBtn = document.getElementById('reset-order-btn');
        this.alphabeticalSortBtn = document.getElementById('alphabetical-sort-btn');
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
        
        // Elementos de copia de canciones
        this.copyTargetRepertoireSelect = document.getElementById('copy-target-repertoire-select');
        this.copySongBtn = document.getElementById('copy-song-btn');
        
        // Botón para abrir archivo HTML
        this.openHtmlBtn = document.getElementById('open-html-btn');
        
        // Elementos del visor de HTML
        this.htmlViewerModal = document.getElementById('html-viewer-modal');
        this.htmlViewerIframe = document.getElementById('html-viewer-iframe');
        this.closeHtmlViewer = document.getElementById('close-html-viewer');
        this.prevSongHtmlBtn = document.getElementById('prev-song-html');
        this.nextSongHtmlBtn = document.getElementById('next-song-html');
        
        console.log('HTML Viewer elements:', {
            modal: this.htmlViewerModal,
            iframe: this.htmlViewerIframe,
            closeBtn: this.closeHtmlViewer,
            prevBtn: this.prevSongHtmlBtn,
            nextBtn: this.nextSongHtmlBtn
        });
        
        // Elementos del gestor de repertorios
        this.repertoireManagerBtn = document.getElementById('repertoire-manager-btn');
        this.repertoireManagerModal = document.getElementById('repertoire-manager-modal');
        this.closeRepertoireManager = document.getElementById('close-repertoire-manager');
        this.closeManagerBtn = document.getElementById('close-manager-btn');
        this.leftRepertoireSelect = document.getElementById('left-repertoire-select');
        this.rightRepertoireSelect = document.getElementById('right-repertoire-select');
        this.leftManagerSearchInput = document.getElementById('left-manager-search');
        this.leftSongsList = document.getElementById('left-songs-list');
        this.rightSongsList = document.getElementById('right-songs-list');
        this.moveRightBtn = document.getElementById('move-right-btn');
        this.moveLeftBtn = document.getElementById('move-left-btn');
        this.copyRightBtn = document.getElementById('copy-right-btn');
        this.copyLeftBtn = document.getElementById('copy-left-btn');
        this.leftSelectionCount = document.getElementById('left-selection-count');
        this.rightSelectionCount = document.getElementById('right-selection-count');
        
        // Elemento de estructura gráfica
        this.songStructureContainer = document.getElementById('song-structure-container');
        this.songStructure = document.getElementById('song-structure');
        
        this.editingSong = null;
        this.isOrderMode = false;
        this.tempOrderCounter = 0; // Variable temporal que empieza en 0
        
        this.initializeEventListeners();
        this._loadFromStorage();      // Carga v2 o migra desde v1
        this.loadDefaultSongs();      // Inicializa canciones por defecto si está vacío
        this._rebuildSongs();         // Materializa this.songs desde el repertorio actual
        this.renderSongs();
        
        // Seleccionar canción activa después de un breve delay para asegurar que todos los componentes estén listos
        setTimeout(() => {
            this.selectActiveSong();
        }, 100);
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
        
        this.alphabeticalSortBtn.addEventListener('click', () => {
            this.sortSongsAlphabetically();
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
        
        // Evento para abrir archivo HTML
        this.openHtmlBtn.addEventListener('click', () => {
            this.openSongHtmlFile();
        });
        
        // Evento para cerrar el visor de HTML (solo si existe)
        if (this.closeHtmlViewer) {
            this.closeHtmlViewer.addEventListener('click', () => {
                this.closeHtmlViewerModal();
            });
        }
        
        // Eventos para navegar entre canciones en el modal
        if (this.prevSongHtmlBtn) {
            this.prevSongHtmlBtn.addEventListener('click', () => {
                this.navigateToSong(-1);
            });
        }
        
        if (this.nextSongHtmlBtn) {
            this.nextSongHtmlBtn.addEventListener('click', () => {
                this.navigateToSong(1);
            });
        }
        
        // Cerrar modal al hacer clic fuera del iframe (solo si existe)
        if (this.htmlViewerModal) {
            this.htmlViewerModal.addEventListener('click', (e) => {
                if (e.target === this.htmlViewerModal) {
                    this.closeHtmlViewerModal();
                }
            });
        }
        
        // Cerrar con tecla ESC y navegar con flechas
        document.addEventListener('keydown', (e) => {
            if (this.htmlViewerModal && this.htmlViewerModal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closeHtmlViewerModal();
                } else if (e.key === 'ArrowLeft') {
                    this.navigateToSong(-1);
                } else if (e.key === 'ArrowRight') {
                    this.navigateToSong(1);
                }
            }
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

        // Event listeners para el gestor de repertorios
        this.repertoireManagerBtn.addEventListener('click', () => {
            this.openRepertoireManager();
        });

        this.closeRepertoireManager.addEventListener('click', () => {
            this.closeRepertoireManagerModal();
        });

        this.closeManagerBtn.addEventListener('click', () => {
            this.closeRepertoireManagerModal();
        });

        this.repertoireManagerModal.addEventListener('click', (e) => {
            if (e.target === this.repertoireManagerModal) {
                this.closeRepertoireManagerModal();
            }
        });

        this.leftRepertoireSelect.addEventListener('change', () => {
            this.loadManagerSongs('left');
        });

        this.rightRepertoireSelect.addEventListener('change', () => {
            this.loadManagerSongs('right');
        });

        if (this.leftManagerSearchInput) {
            this.leftManagerSearchInput.addEventListener('input', () => {
                this.loadManagerSongs('left');
            });
        }

        this.moveRightBtn.addEventListener('click', () => {
            this.transferSongs('left', 'right', false);
        });

        this.moveLeftBtn.addEventListener('click', () => {
            this.transferSongs('right', 'left', false);
        });

        this.copyRightBtn.addEventListener('click', () => {
            this.transferSongs('left', 'right', true);
        });

        this.copyLeftBtn.addEventListener('click', () => {
            this.transferSongs('right', 'left', true);
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
    }
    
    loadDefaultSongs() {
        // Solo añadir defaults si catálogo Y repertorio actual están vacíos.
        const rep = this.repertoires.get(this.currentRepertoireId);
        if (this.catalog.size > 0 || (rep && rep.entries.length > 0)) {
            return;
        }

        // Bootstrap: intentar cargar setlists/songs.json + setlists/setlists.json del servidor.
        // Si tiene éxito, sustituye a las canciones de muestra hardcoded.
        this._bootstrapFromServer().then(loaded => {
            if (loaded) {
                this._rebuildSongs();
                this.renderSongs();
                this.updateRepertoireSelect();
                this.updateCurrentRepertoireName();
                // Activar la primera canción del repertorio cargado
                setTimeout(() => this.selectActiveSong(), 50);
                this.showNotification(`✅ Cargado catálogo inicial: ${this.catalog.size} canciones, ${this.repertoires.size} repertorios`, 'success');
            }
        }).catch(err => console.warn('Bootstrap desde servidor falló:', err));

        if (true) {
            const defaultSongs = [
                {
                    id: 1,
                    title: "We Will Rock You",
                    artist: "Queen",
                    bpm: 114,
                    order: 0,
                    active: true,
                    fontSize: this.getDefaultFontSize(),
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
            
            // Insertar en el catálogo y como entries del repertorio actual
            const currentRep = this.repertoires.get(this.currentRepertoireId);
            defaultSongs.forEach((song, idx) => {
                const newId = this._newSongId();
                const now = new Date().toISOString();
                const canonical = {
                    id: newId,
                    title: song.title,
                    artist: song.artist,
                    bpm: song.bpm,
                    lyrics: song.lyrics,
                    notes: song.notes || '',
                    structure: '',
                    duration: '',
                    htmlFile: '',
                    fontSize: song.fontSize || 2.4,
                    recordings: [],
                    createdAt: now,
                    lastModified: now
                };
                this.catalog.set(newId, canonical);
                if (currentRep) {
                    currentRep.entries.push({ songId: newId, order: (idx + 1) * 10 });
                    if (song.active) currentRep.activeSongId = newId;
                }
            });
            this._saveCatalog();
            this._saveRepertoiresV2();
        }
    }

    // ===== CAPA DE DATOS v2 (catálogo + setlists por referencia) =====

    // Clave de deduplicación: title + artist normalizados
    _canonicalKey(title, artist) {
        const norm = (s) => (s || '')
            .toString()
            .normalize('NFKD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
        return `${norm(title)}|${norm(artist)}`;
    }

    _findInCatalog(title, artist) {
        const key = this._canonicalKey(title, artist);
        for (const song of this.catalog.values()) {
            if (this._canonicalKey(song.title, song.artist) === key) {
                return song;
            }
        }
        return null;
    }

    _newSongId() {
        return `song_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
    }

    _newRepertoireId(name) {
        const slug = (name || 'repertoire')
            .normalize('NFKD').replace(/[̀-ͯ]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
            .substring(0, 30);
        return `repertoire_${slug}_${Date.now().toString(36)}`;
    }

    // Carga desde localStorage v2; si no existe, migra desde v1 con backup.
    _loadFromStorage() {
        try {
            const v2Catalog = localStorage.getItem(this.catalogKey);
            const v2Reps = localStorage.getItem(this.repertoiresKeyV2);

            if (v2Catalog && v2Reps) {
                console.log('📚 Cargando datos v2 desde localStorage');
                const catalogData = JSON.parse(v2Catalog);
                const repsData = JSON.parse(v2Reps);
                this.catalog = new Map(Object.entries(catalogData.songs || {}));
                this.repertoires = new Map(Object.entries(repsData.repertoires || {}));
                this.currentRepertoireId = repsData.currentRepertoireId || 'default';
            } else {
                // Sin datos v2 — intentar migrar desde v1
                const hasV1 = localStorage.getItem(this.legacyRepertoiresKey) || localStorage.getItem(this.legacySongsKey);
                if (hasV1) {
                    console.log('🔄 Migrando datos v1 → v2…');
                    this._migrateFromV1();
                } else {
                    console.log('🆕 Sin datos previos — inicializando vacío');
                    this.catalog = new Map();
                    this.repertoires = new Map();
                    this.currentRepertoireId = 'default';
                }
            }

            // Garantizar repertorio por defecto
            if (!this.repertoires.has('default') && this.repertoires.size === 0) {
                this.repertoires.set('default', {
                    id: 'default',
                    name: 'Repertorio Principal',
                    setlistName: 'Canciones',
                    showArtistBpm: false,
                    hideNotes: false,
                    activeSongId: null,
                    entries: [],
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                });
            }

            // Si el currentRepertoireId no existe, caer al primero disponible
            if (!this.repertoires.has(this.currentRepertoireId)) {
                this.currentRepertoireId = this.repertoires.keys().next().value || 'default';
            }

            // Migrar repertorios v2 existentes con campos faltantes
            this.repertoires.forEach((rep) => {
                if (!Array.isArray(rep.entries)) rep.entries = [];
                if (rep.showArtistBpm === undefined) rep.showArtistBpm = false;
                if (rep.hideNotes === undefined) rep.hideNotes = false;
                if (rep.activeSongId === undefined) rep.activeSongId = null;
                if (!rep.lastModified) rep.lastModified = rep.createdAt || new Date().toISOString();
            });

            const current = this.repertoires.get(this.currentRepertoireId);
            this.setlistName = (current && current.setlistName) || 'Canciones';

            this.updateRepertoireSelect && this.updateRepertoireSelect();
            this.updateCurrentRepertoireName && this.updateCurrentRepertoireName();
            if (current) {
                this.applyDisplaySettings && this.applyDisplaySettings(current);
            }
            console.log(`✅ Estado cargado: ${this.catalog.size} canciones, ${this.repertoires.size} repertorios`);
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            this.catalog = new Map();
            this.repertoires = new Map();
            this.currentRepertoireId = 'default';
        }
    }

    // Migra del modelo v1 (canciones incrustadas) al v2 (catálogo + entries)
    _migrateFromV1() {
        // Backup en localStorage por si algo va mal
        const backupKey = `drumhelper-backup-v1-${Date.now()}`;
        const backup = {
            songs: localStorage.getItem(this.legacySongsKey),
            repertoires: localStorage.getItem(this.legacyRepertoiresKey)
        };
        try {
            localStorage.setItem(backupKey, JSON.stringify(backup));
            console.log(`💾 Backup v1 guardado en localStorage: ${backupKey}`);
        } catch (e) {
            console.warn('No se pudo guardar backup v1:', e);
        }

        // Leer repertorios v1
        const legacyReps = localStorage.getItem(this.legacyRepertoiresKey);
        let repsV1 = {};
        let currentId = 'default';
        if (legacyReps) {
            try {
                const data = JSON.parse(legacyReps);
                repsV1 = data.repertoires || {};
                currentId = data.currentRepertoireId || 'default';
            } catch {}
        }
        // Si no hay repertorios v1 pero sí lista plana de canciones, crear repertorio por defecto
        if (Object.keys(repsV1).length === 0) {
            const legacySongs = localStorage.getItem(this.legacySongsKey);
            if (legacySongs) {
                try {
                    const data = JSON.parse(legacySongs);
                    const songs = Array.isArray(data) ? data : (data.songs || []);
                    repsV1.default = {
                        id: 'default',
                        name: 'Repertorio Principal',
                        setlistName: Array.isArray(data) ? 'Canciones' : (data.setlistName || 'Canciones'),
                        songs: songs
                    };
                } catch {}
            }
        }

        // Construir catálogo y entries
        this.catalog = new Map();
        this.repertoires = new Map();
        this.currentRepertoireId = currentId;

        for (const [repId, rep] of Object.entries(repsV1)) {
            const entries = [];
            let activeSongId = null;
            const seen = new Set();
            const v1Songs = Array.isArray(rep.songs) ? rep.songs : [];

            v1Songs.forEach((s, idx) => {
                if (!s || !s.title) return;
                let canonical = this._findInCatalog(s.title, s.artist);
                if (!canonical) {
                    // Añadir al catálogo
                    const newId = this._newSongId();
                    const bpmNum = (typeof s.bpm === 'string') ? parseInt(s.bpm, 10) : s.bpm;
                    canonical = {
                        id: newId,
                        title: (s.title || '').trim(),
                        artist: (s.artist || '').trim(),
                        bpm: isNaN(bpmNum) ? 0 : bpmNum,
                        lyrics: s.lyrics || '',
                        notes: s.notes || '',
                        structure: s.structure || '',
                        duration: s.duration || '',
                        htmlFile: s.htmlFile || '',
                        fontSize: s.fontSize || 2.4,
                        recordings: s.recordings || [],
                        createdAt: s.createdAt || new Date().toISOString(),
                        lastModified: s.lastModified || s.createdAt || new Date().toISOString()
                    };
                    this.catalog.set(newId, canonical);
                } else {
                    // Conflicto: si v1 es más reciente, actualizamos
                    const v1Time = s.lastModified || s.createdAt || '';
                    if (v1Time && v1Time > (canonical.lastModified || '')) {
                        canonical.lyrics = s.lyrics || canonical.lyrics;
                        canonical.notes = s.notes || canonical.notes;
                        canonical.bpm = (typeof s.bpm === 'string') ? parseInt(s.bpm, 10) : (s.bpm || canonical.bpm);
                        canonical.lastModified = v1Time;
                    }
                }
                if (seen.has(canonical.id)) return; // misma canción 2 veces en el setlist
                seen.add(canonical.id);
                const order = s.order || ((idx + 1) * 10);
                entries.push({ songId: canonical.id, order });
                if (s.active === true) activeSongId = canonical.id;
            });

            this.repertoires.set(repId, {
                id: repId,
                name: rep.name || repId,
                setlistName: rep.setlistName || 'Canciones',
                showArtistBpm: rep.showArtistBpm === true,
                hideNotes: rep.hideNotes === true,
                activeSongId,
                entries,
                createdAt: rep.createdAt || new Date().toISOString(),
                lastModified: rep.lastModified || new Date().toISOString()
            });
        }

        // Persistir v2 inmediatamente
        this._saveCatalog();
        this._saveRepertoiresV2();
        console.log(`✅ Migración completa: ${this.catalog.size} canciones únicas, ${this.repertoires.size} repertorios`);
    }

    // Carga inicial desde setlists/songs.json + setlists/setlists.json (solo si localStorage está vacío)
    async _bootstrapFromServer() {
        try {
            const [songsRes, setlistsRes] = await Promise.all([
                fetch('setlists/songs.json', { cache: 'no-cache' }),
                fetch('setlists/setlists.json', { cache: 'no-cache' })
            ]);

            if (!songsRes.ok || !setlistsRes.ok) {
                console.log('Bootstrap: ficheros JSON no disponibles, usando defaults hardcoded');
                return false;
            }

            const songsData = await songsRes.json();
            const setlistsData = await setlistsRes.json();

            if (!songsData.songs || !setlistsData.repertoires) {
                console.log('Bootstrap: formato JSON inválido');
                return false;
            }

            console.log(`🌱 Bootstrap: cargando ${Object.keys(songsData.songs).length} canciones y ${Object.keys(setlistsData.repertoires).length} setlists`);

            this.catalog = new Map(Object.entries(songsData.songs));
            this.repertoires = new Map(Object.entries(setlistsData.repertoires));
            this.currentRepertoireId = setlistsData.currentRepertoireId || 'default';

            if (!this.repertoires.has(this.currentRepertoireId)) {
                this.currentRepertoireId = this.repertoires.keys().next().value || 'default';
            }

            this._saveCatalog();
            this._saveRepertoiresV2();
            return true;
        } catch (e) {
            console.warn('Bootstrap falló:', e);
            return false;
        }
    }

    _saveCatalog() {
        try {
            // Limpiar campos transitorios (`order`, `active`) que viven en this.songs
            const clean = {};
            for (const [id, song] of this.catalog) {
                const { order, active, ...rest } = song;
                clean[id] = rest;
            }
            localStorage.setItem(this.catalogKey, JSON.stringify({
                version: 2,
                songs: clean
            }));
        } catch (e) {
            console.error('Error guardando catálogo:', e);
        }
    }

    _saveRepertoiresV2() {
        try {
            const payload = {
                version: 2,
                currentRepertoireId: this.currentRepertoireId,
                repertoires: Object.fromEntries(this.repertoires)
            };
            localStorage.setItem(this.repertoiresKeyV2, JSON.stringify(payload));
        } catch (e) {
            console.error('Error guardando repertorios v2:', e);
        }
    }

    // Resuelve entries del repertorio actual a objetos canción del catálogo,
    // inyectando `order` para mantener compatibilidad con UI existente.
    _rebuildSongs() {
        const rep = this.repertoires.get(this.currentRepertoireId);
        if (!rep) { this.songs = []; this.setlistName = 'Canciones'; return; }

        this.setlistName = rep.setlistName || 'Canciones';

        const result = [];
        // Mantengo el orden de entries; aplico sort por order
        const entriesSorted = [...rep.entries].sort((a, b) => (a.order || 0) - (b.order || 0));
        for (const entry of entriesSorted) {
            const song = this.catalog.get(entry.songId);
            if (!song) continue; // entry huérfana — la limpiamos al guardar
            song.order = entry.order || 0; // inyección temporal (limpia en _saveCatalog)
            result.push(song);
        }
        this.songs = result;
    }

    // Sincroniza order desde this.songs (modificados por UI) a entries del repertorio actual
    _syncOrdersToEntries() {
        const rep = this.repertoires.get(this.currentRepertoireId);
        if (!rep) return;
        const byId = new Map(rep.entries.map(e => [e.songId, e]));
        for (const s of this.songs) {
            const entry = byId.get(s.id);
            if (entry) entry.order = s.order || 0;
        }
    }

    // Compat: la API antigua de la app llamaba a loadSongs/saveSongs/loadRepertoires/saveRepertoires
    loadSongs() { /* no-op: v2 carga todo en _loadFromStorage */ this._rebuildSongs(); }

    saveSongs() {
        // Las "canciones" de this.songs apuntan al catálogo (orden inyectado). Persistimos:
        this._syncOrdersToEntries();
        this._saveCatalog();
        this.updateCurrentRepertoireModified();
        this._saveRepertoiresV2();
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

        const titleSpan = document.createElement('span');
        titleSpan.className = 'song-title';
        titleSpan.textContent = titleText;

        const artistSpan = document.createElement('span');
        artistSpan.className = 'song-artist';
        artistSpan.textContent = song.artist || '';

        const bpmSpan = document.createElement('span');
        bpmSpan.className = 'song-bpm';
        bpmSpan.textContent = `${song.bpm} BPM`;

        li.appendChild(titleSpan);
        li.appendChild(artistSpan);
        li.appendChild(bpmSpan);
        
        // Event listener para seleccionar canción
        li.addEventListener('click', (e) => {
            this.selectSong(song);
        });
        
        // Agregar menú contextual para opciones adicionales
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const action = confirm(`Opciones para "${song.title}":\n\nOK = Editar\nCancelar = Quitar del setlist`);
            if (action === true) {
                this.openEditSongModal(song);
            } else if (action === false) {
                if (confirm(`¿Quitar "${song.title}" de este setlist?\n\nLa canción seguirá en el catálogo global y otros setlists.`)) {
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

        // Marcar la canción activa en el repertorio (no en la canción)
        const rep = this.repertoires.get(this.currentRepertoireId);
        if (rep) rep.activeSongId = song.id;
        this._saveRepertoiresV2();
        
        // Actualizar información en el header
        const songElement = document.getElementById('current-song');
        const bpmElement = document.getElementById('current-bpm');
        const notesElement = document.getElementById('current-notes');
        
        // El título de la canción siempre debe estar visible
        songElement.textContent = `${song.title} - ${song.artist}`;
        songElement.style.display = 'block';
        
        if (song.notes && song.notes.trim()) {
            // Si hay notas, mostrar notas también pero mantener título visible
            bpmElement.style.display = 'block';
            notesElement.innerHTML = this.processTextHighlights(song.notes);
            notesElement.style.display = 'block';
        } else {
            // Si no hay notas, mostrar título y BPM
            bpmElement.style.display = 'block';
            notesElement.textContent = '';
            notesElement.style.display = 'none';
        }
        
        // Actualizar BPM del metrónomo
        window.metronome.setBPM(song.bpm);
        
        // Renderizar estructura gráfica
        this.renderSongStructure(song);
        
        // Cargar letras
        window.lyricsScroller.loadLyrics(song.lyrics);
        
        // Cargar el tamaño de fuente específico de la canción
        window.lyricsScroller.loadSongFontSize(song);
        
        // Activar el botón de editar
        this.editCurrentSongBtn.disabled = false;
        
        // Mostrar u ocultar botón de abrir HTML según si la canción tiene archivo HTML
        if (song.htmlFile && song.htmlFile.trim()) {
            this.openHtmlBtn.style.display = 'block';
        } else {
            this.openHtmlBtn.style.display = 'none';
        }
        
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
        // En v2 la canción activa se identifica por activeSongId del repertorio
        const rep = this.repertoires.get(this.currentRepertoireId);
        let activeSong = null;
        if (rep && rep.activeSongId) {
            activeSong = this.songs.find(s => s.id === rep.activeSongId);
        }
        if (!activeSong && this.songs.length > 0) {
            activeSong = this.songs[0];
            if (rep) rep.activeSongId = activeSong.id;
        }

        if (activeSong) {
            // Seleccionar la canción activa sin guardar de nuevo (para evitar loop)
            this.currentSong = activeSong;
            
            // Actualizar información en el header
            const songElement = document.getElementById('current-song');
            const bpmElement = document.getElementById('current-bpm');
            const notesElement = document.getElementById('current-notes');
            
            // El título de la canción siempre debe estar visible
            songElement.textContent = `${activeSong.title} - ${activeSong.artist}`;
            songElement.style.display = 'block';
            
            if (activeSong.notes && activeSong.notes.trim()) {
                // Si hay notas, mostrar notas también pero mantener título visible
                bpmElement.style.display = 'block';
                notesElement.innerHTML = this.processTextHighlights(activeSong.notes);
                notesElement.style.display = 'block';
            } else {
                // Si no hay notas, mostrar título y BPM
                bpmElement.style.display = 'block';
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
            
            // Renderizar estructura gráfica
            this.renderSongStructure(activeSong);
            
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
    
    escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    processTextHighlights(text) {
        // 1) Escapar todo el texto antes de cualquier inyección de markup propio
        let processedText = this.escapeHtml(text);

        // 2) Procesar imágenes (patrón //img=archivo.jpg) - solo nombres seguros sin '/'
        processedText = processedText.replace(/\/\/img=([A-Za-z0-9._-]+\.(jpg|jpeg|png|gif|webp))/gi, (match, filename) => {
            return `<img src="imagenes/${filename}" alt="${filename}" onerror="this.style.display='none'" loading="lazy">`;
        });

        // 3) Procesar instrucciones de espera (patrón //espera=XXX) - solo mostrar texto, sin funcionalidad
        processedText = processedText.replace(/\/\/espera=(\d+)/gi, (match, seconds) => {
            return `<span class="wait-instruction-display">espera ${seconds}s</span>`;
        });

        // 4) Resaltados (sobre texto ya escapado)
        processedText = processedText.replace(/\/0(.*?)0\//g, '<span class="highlight-yellow">$1</span>');
        processedText = processedText.replace(/\/1(.*?)1\//g, '<span class="highlight-blue">$1</span>');
        processedText = processedText.replace(/\/3(.*?)3\//g, '<span class="highlight-green">$1</span>');
        return processedText;
    }
    
    renderSongStructure(song) {
        if (!this.songStructure) return;
        
        // Limpiar estructura anterior
        this.songStructure.innerHTML = '';
        
        // Si no hay estructura definida, ocultar el contenedor
        if (!song.structure || song.structure.trim() === '') {
            this.songStructureContainer.style.display = 'none';
            return;
        }
        
        // Mostrar el contenedor
        this.songStructureContainer.style.display = 'block';
        
        // Mapeo de letras a clases CSS
        const structureMap = {
            '_': 'silence',      // Silencio - Amarillo
            'E': 'chorus',       // Estribillo - Verde
            'V': 'verse',        // Estrofa - Blanco
            'B': 'bridge',       // Puente - Rojo
            'I': 'intro',        // Intro - Cian
            'O': 'outro',        // Outro - Morado
            'S': 'solo',         // Solo - Naranja
            'P': 'pre-chorus'    // Pre-estribillo - Azul claro
        };
        
        // Crear un cuadrado por cada letra
        const structure = song.structure.toUpperCase();
        for (let i = 0; i < structure.length; i++) {
            const char = structure[i];
            const bar = document.createElement('div');
            bar.className = 'structure-bar';
            
            // Añadir la clase correspondiente según el tipo
            const structureClass = structureMap[char] || 'unknown';
            bar.classList.add(structureClass);
            
            // Añadir tooltip
            const tooltipText = this.getStructureLabel(char);
            bar.title = `${tooltipText} (compás ${i + 1})`;
            
            this.songStructure.appendChild(bar);
        }
    }
    
    getStructureLabel(char) {
        const labels = {
            '_': 'Silencio',
            'E': 'Estribillo',
            'V': 'Estrofa',
            'B': 'Puente',
            'I': 'Intro',
            'O': 'Outro',
            'S': 'Solo',
            'P': 'Pre-estribillo'
        };
        return labels[char] || 'Desconocido';
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
        document.getElementById('edit-song-html-file').value = song.htmlFile || '';
        document.getElementById('edit-song-structure').value = song.structure || '';
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
        const structure = document.getElementById('song-structure-input').value.trim();
        const htmlFile = document.getElementById('song-html-file').value.trim();

        if (!title) {
            alert('El título es obligatorio');
            return;
        }

        const finalArtist = artist || 'Artista desconocido';

        // Si la canción ya existe en el catálogo, añadimos solo la entry al setlist actual.
        let canonical = this._findInCatalog(title, finalArtist);
        const now = new Date().toISOString();
        if (!canonical) {
            const newId = this._newSongId();
            canonical = {
                id: newId,
                title,
                artist: finalArtist,
                bpm: bpm || 120,
                duration: duration || '',
                lyrics: lyrics || '',
                notes: document.getElementById('song-notes').value.trim() || '',
                structure: structure || '',
                htmlFile: htmlFile || '',
                fontSize: this.getDefaultFontSize(),
                recordings: [],
                createdAt: now,
                lastModified: now
            };
            this.catalog.set(newId, canonical);
            this._saveCatalog();
        }

        // Añadir entry al repertorio actual (evitar duplicar)
        const rep = this.repertoires.get(this.currentRepertoireId);
        if (rep) {
            if (!rep.entries.some(e => e.songId === canonical.id)) {
                rep.entries.push({ songId: canonical.id, order });
            }
            rep.lastModified = now;
            this._saveRepertoiresV2();
        }

        this._rebuildSongs();
        this.renderSongs();
        this.closeAddSongModal();

        // Seleccionar la nueva canción automáticamente
        const songWithOrder = this.songs.find(s => s.id === canonical.id);
        if (songWithOrder) this.selectSong(songWithOrder);

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
        const structure = document.getElementById('edit-song-structure').value.trim();
        const htmlFile = document.getElementById('edit-song-html-file').value.trim();

        if (!title) {
            alert('El título es obligatorio');
            return;
        }

        const canonical = this.catalog.get(this.editingSong.id);
        if (!canonical) {
            this.showNotification('❌ Canción no encontrada en el catálogo', 'error');
            return;
        }

        // Actualizar campos en el catálogo (afecta a TODOS los setlists donde aparezca)
        canonical.title = title;
        canonical.artist = artist || 'Artista desconocido';
        canonical.bpm = bpm || 120;
        canonical.duration = duration || '';
        canonical.notes = notes || '';
        canonical.lyrics = lyrics || '';
        canonical.structure = structure || '';
        canonical.htmlFile = htmlFile || '';
        canonical.lastModified = new Date().toISOString();

        // El `order` es por setlist, no por canción global
        const rep = this.repertoires.get(this.currentRepertoireId);
        if (rep) {
            const entry = rep.entries.find(e => e.songId === canonical.id);
            if (entry) entry.order = order;
        }

        this._saveCatalog();
        this._saveRepertoiresV2();
        this._rebuildSongs();
        this.renderSongs();

        // Si era la canción actual, refrescar la interfaz
        if (this.currentSong && this.currentSong.id === canonical.id) {
            const refreshed = this.songs.find(s => s.id === canonical.id);
            if (refreshed) this.selectSong(refreshed);
        }

        this.closeEditSongModal();
        this.showNotification(`✅ Canción "${title}" actualizada correctamente`, 'success');
    }

    deleteCurrentEditingSong() {
        if (!this.editingSong) return;

        const confirmMessage = `¿Quitar "${this.editingSong.title}" de este setlist?\n\n` +
            `La canción seguirá en el catálogo global y en otros setlists donde aparezca.`;

        if (confirm(confirmMessage)) {
            this.deleteSong(this.editingSong.id);
            this.closeEditSongModal();
            this.showNotification(`✅ "${this.editingSong.title}" quitada del setlist`, 'success');
        }
    }
    
    // Quita la entry del repertorio actual. NO borra la canción del catálogo global.
    deleteSong(songId) {
        const rep = this.repertoires.get(this.currentRepertoireId);
        if (rep) {
            rep.entries = rep.entries.filter(e => e.songId !== songId);
            if (rep.activeSongId === songId) rep.activeSongId = null;
            rep.lastModified = new Date().toISOString();
            this._saveRepertoiresV2();
        }
        this._rebuildSongs();
        this.renderSongs();

        if (this.currentSong && this.currentSong.id === songId) {
            this.currentSong = null;
            document.getElementById('current-song').textContent = 'Selecciona una canción';
            if (window.lyricsScroller) window.lyricsScroller.clearLyrics();
        }
    }

    // Borra la canción del catálogo global y de TODOS los setlists. Operación destructiva.
    deleteSongFromCatalog(songId) {
        if (!this.catalog.has(songId)) return;
        this.catalog.delete(songId);
        // Quitar entries en todos los repertorios
        this.repertoires.forEach(rep => {
            rep.entries = rep.entries.filter(e => e.songId !== songId);
            if (rep.activeSongId === songId) rep.activeSongId = null;
        });
        this._saveCatalog();
        this._saveRepertoiresV2();
        this._rebuildSongs();
        this.renderSongs();
        if (this.currentSong && this.currentSong.id === songId) {
            this.currentSong = null;
            document.getElementById('current-song').textContent = 'Selecciona una canción';
            if (window.lyricsScroller) window.lyricsScroller.clearLyrics();
        }
    }
    
    isSafeHtmlPath(path) {
        if (typeof path !== 'string' || !path.trim()) return false;
        const trimmed = path.trim();
        // Rechazar protocolos peligrosos
        const lower = trimmed.toLowerCase();
        if (lower.startsWith('javascript:') ||
            lower.startsWith('data:') ||
            lower.startsWith('vbscript:') ||
            lower.startsWith('file:')) {
            return false;
        }
        // Permitir solo rutas relativas o http(s) del mismo origen
        if (lower.startsWith('http://') || lower.startsWith('https://')) {
            try {
                const url = new URL(trimmed, window.location.href);
                return url.origin === window.location.origin;
            } catch {
                return false;
            }
        }
        // Rutas relativas: solo letras, dígitos, ., /, -, _ y %
        return /^[A-Za-z0-9._\-\/%]+$/.test(trimmed);
    }

    openSongHtmlFile() {
        if (!this.currentSong || !this.currentSong.htmlFile) {
            console.warn('No hay archivo HTML configurado para esta canción');
            return;
        }

        const htmlFile = this.currentSong.htmlFile;
        if (!this.isSafeHtmlPath(htmlFile)) {
            console.warn('Ruta HTML rechazada por seguridad:', htmlFile);
            this.showNotification('❌ Ruta de archivo HTML no permitida', 'error');
            return;
        }

        console.log('Opening HTML file:', htmlFile);

        // Verificar que los elementos del modal existan
        if (!this.htmlViewerModal || !this.htmlViewerIframe) {
            console.error('Elementos del modal no encontrados, abriendo en nueva ventana');
            window.open(htmlFile, '_blank', 'noopener,noreferrer');
            return;
        }

        // Cargar el archivo HTML en el iframe y mostrar el modal
        this.htmlViewerIframe.src = htmlFile;
        this.htmlViewerModal.classList.add('active');
        
        // Actualizar estado de botones de navegación
        this.updateNavigationButtons();
        
        console.log('Modal abierto con src:', this.htmlViewerIframe.src);
        
        // Pausar el metrónomo si está sonando
        if (window.metronome && window.metronome.isPlaying) {
            window.metronome.stop();
        }
    }
    
    updateNavigationButtons() {
        // Obtener la lista de canciones con htmlFile en el orden actual
        const songsWithHtml = this.songs.filter(song => song.htmlFile && song.htmlFile.trim() !== '');
        
        // Ordenar igual que en renderSongs
        songsWithHtml.sort((a, b) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return a.title.localeCompare(b.title);
        });
        
        const currentIndex = songsWithHtml.findIndex(song => song.id === this.currentSong.id);
        
        // Actualizar estado de botones
        if (this.prevSongHtmlBtn) {
            this.prevSongHtmlBtn.disabled = currentIndex <= 0;
        }
        
        if (this.nextSongHtmlBtn) {
            this.nextSongHtmlBtn.disabled = currentIndex >= songsWithHtml.length - 1;
        }
    }
    
    navigateToSong(direction) {
        // direction: -1 para anterior, 1 para siguiente
        const songsWithHtml = this.songs.filter(song => song.htmlFile && song.htmlFile.trim() !== '');
        
        // Ordenar igual que en renderSongs
        songsWithHtml.sort((a, b) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return a.title.localeCompare(b.title);
        });
        
        const currentIndex = songsWithHtml.findIndex(song => song.id === this.currentSong.id);
        const newIndex = currentIndex + direction;
        
        // Verificar límites
        if (newIndex < 0 || newIndex >= songsWithHtml.length) {
            return;
        }
        
        // Cambiar a la nueva canción
        const newSong = songsWithHtml[newIndex];
        this.selectSong(newSong);
        
        // Reabrir el HTML con la nueva canción
        this.openSongHtmlFile();
    }
    
    closeHtmlViewerModal() {
        if (!this.htmlViewerModal) {
            console.error('Modal no encontrado');
            return;
        }
        this.htmlViewerModal.classList.remove('active');
        this.htmlViewerIframe.src = '';
    }
    
    getCurrentSong() {
        return this.currentSong;
    }
    
    // Exporta dos ficheros: songs.json (catálogo global) + setlists.json (repertorios con entries).
    exportSongs() {
        try {
            console.log(`🚀 Exportación v2: catálogo + setlists`);
            const now = new Date();
            const ts = now.toISOString().replace(/[:T]/g, '-').replace(/\..+/, '');

            // 1) songs.json — catálogo entero
            const catalogObj = {};
            for (const [id, song] of this.catalog) {
                const { order, active, ...rest } = song;
                catalogObj[id] = rest;
            }
            const songsBlob = new Blob([JSON.stringify({
                version: 2,
                exportDate: now.toISOString(),
                songs: catalogObj
            }, null, 2)], { type: 'application/json' });

            const songsLink = document.createElement('a');
            songsLink.href = URL.createObjectURL(songsBlob);
            songsLink.download = `songs-${ts}.json`;
            document.body.appendChild(songsLink);
            songsLink.click();
            document.body.removeChild(songsLink);
            URL.revokeObjectURL(songsLink.href);

            // 2) setlists.json — todos los setlists con entries (referencias)
            const setlistsBlob = new Blob([JSON.stringify({
                version: 2,
                exportDate: now.toISOString(),
                currentRepertoireId: this.currentRepertoireId,
                repertoires: Object.fromEntries(this.repertoires)
            }, null, 2)], { type: 'application/json' });

            const setlistsLink = document.createElement('a');
            setlistsLink.href = URL.createObjectURL(setlistsBlob);
            setlistsLink.download = `setlists-${ts}.json`;
            document.body.appendChild(setlistsLink);
            setlistsLink.click();
            document.body.removeChild(setlistsLink);
            URL.revokeObjectURL(setlistsLink.href);

            console.log(`✅ Exportados: ${this.catalog.size} canciones, ${this.repertoires.size} setlists`);
            this.showNotification(
                `✅ Exportados songs-${ts}.json (${this.catalog.size} canciones) y setlists-${ts}.json (${this.repertoires.size} setlists)`,
                'success'
            );
        } catch (error) {
            console.error('💥 Error exportando:', error);
            this.showNotification('❌ Error al exportar', 'error');
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
                
                const isV2Catalog = importedData.version === 2 && importedData.songs && !Array.isArray(importedData.songs);
                const isV2Setlists = importedData.version === 2 && importedData.repertoires;
                const isV1 = Array.isArray(importedData.songs);

                let importedCount = 0, skippedCount = 0, errorCount = 0;

                if (isV2Catalog) {
                    // Importar catálogo v2 — fusionar canciones (dedup por título+artista)
                    const songsObj = importedData.songs;
                    const songList = Object.values(songsObj);
                    if (!confirm(`¿Importar catálogo de ${songList.length} canciones?\n\nSe fusionarán por título+artista (las existentes pueden actualizarse si la importada es más reciente).`)) {
                        return;
                    }
                    songList.forEach((song) => {
                        try {
                            const existing = this._findInCatalog(song.title, song.artist);
                            if (existing) {
                                const incoming = song.lastModified || '';
                                if (incoming > (existing.lastModified || '')) {
                                    Object.assign(existing, song, { id: existing.id });
                                    importedCount++;
                                } else {
                                    skippedCount++;
                                }
                            } else {
                                const newId = song.id && !this.catalog.has(song.id) ? song.id : this._newSongId();
                                this.catalog.set(newId, { ...song, id: newId });
                                importedCount++;
                            }
                        } catch (e) {
                            errorCount++;
                            console.error('Error importando canción:', e);
                        }
                    });
                    this._saveCatalog();

                } else if (isV2Setlists) {
                    // Importar setlists v2 — fusionar repertorios
                    const repsObj = importedData.repertoires;
                    const repCount = Object.keys(repsObj).length;
                    if (!confirm(`¿Importar ${repCount} setlist(s)?\n\nLas entries que apunten a canciones desconocidas se ignorarán. Importa primero el catálogo si no lo has hecho.`)) {
                        return;
                    }
                    Object.entries(repsObj).forEach(([repId, rep]) => {
                        try {
                            // Si el id colisiona, generar uno nuevo
                            let finalId = repId;
                            if (this.repertoires.has(repId)) finalId = this._newRepertoireId(rep.name || repId);

                            const cleanEntries = (rep.entries || []).filter(e => this.catalog.has(e.songId));
                            const droppedEntries = (rep.entries || []).length - cleanEntries.length;

                            this.repertoires.set(finalId, {
                                id: finalId,
                                name: rep.name || finalId,
                                setlistName: rep.setlistName || rep.name || 'Canciones',
                                showArtistBpm: rep.showArtistBpm === true,
                                hideNotes: rep.hideNotes === true,
                                activeSongId: rep.activeSongId && this.catalog.has(rep.activeSongId) ? rep.activeSongId : null,
                                entries: cleanEntries,
                                createdAt: rep.createdAt || new Date().toISOString(),
                                lastModified: rep.lastModified || new Date().toISOString()
                            });
                            importedCount++;
                            if (droppedEntries > 0) console.warn(`  ⚠️ "${rep.name}": ${droppedEntries} entries descartadas (canciones no en catálogo)`);
                        } catch (e) {
                            errorCount++;
                            console.error('Error importando setlist:', e);
                        }
                    });
                    this._saveRepertoiresV2();
                    this.updateRepertoireSelect();

                } else if (isV1) {
                    // Formato antiguo — canciones embebidas en un setlist
                    if (!confirm(`¿Importar ${importedData.songs.length} canciones al repertorio actual?\n\nSe deduplicarán por título+artista contra el catálogo global.`)) {
                        return;
                    }
                    const rep = this.repertoires.get(this.currentRepertoireId);
                    const maxOrder = rep ? rep.entries.reduce((m, e) => Math.max(m, e.order || 0), 0) : 0;
                    let nextOrder = maxOrder + 10;
                    importedData.songs.forEach((song) => {
                        try {
                            const v = this.validateSong(song);
                            if (v !== true) { skippedCount++; return; }
                            let canonical = this._findInCatalog(song.title, song.artist);
                            if (!canonical) {
                                const newId = this._newSongId();
                                const bpmNum = typeof song.bpm === 'string' ? parseInt(song.bpm, 10) : song.bpm;
                                canonical = {
                                    id: newId,
                                    title: song.title,
                                    artist: song.artist || '',
                                    bpm: isNaN(bpmNum) ? 0 : bpmNum,
                                    lyrics: song.lyrics || '',
                                    notes: song.notes || '',
                                    structure: song.structure || '',
                                    duration: song.duration || '',
                                    htmlFile: song.htmlFile || '',
                                    fontSize: song.fontSize || 2.4,
                                    recordings: song.recordings || [],
                                    createdAt: song.createdAt || new Date().toISOString(),
                                    lastModified: song.lastModified || new Date().toISOString()
                                };
                                this.catalog.set(newId, canonical);
                            }
                            if (rep && !rep.entries.some(e => e.songId === canonical.id)) {
                                rep.entries.push({ songId: canonical.id, order: nextOrder });
                                nextOrder += 10;
                            }
                            importedCount++;
                        } catch (e) {
                            errorCount++;
                        }
                    });
                    this._saveCatalog();
                    this._saveRepertoiresV2();

                } else {
                    throw new Error('Formato de archivo no reconocido');
                }

                this._rebuildSongs();
                this.renderSongs();

                let message = `✅ Importadas ${importedCount} entradas`;
                if (skippedCount > 0) message += `, ${skippedCount} saltadas`;
                if (errorCount > 0) message += `, ${errorCount} errores`;
                this.showNotification(message, errorCount ? 'warning' : 'success');
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
                const rep = this.repertoires.get(this.currentRepertoireId);
                const maxOrder = rep ? rep.entries.reduce((m, e) => Math.max(m, e.order || 0), 0) : 0;
                let nextOrder = maxOrder + 10;

                songs.forEach(song => {
                    let canonical = this._findInCatalog(song.title, song.artist);
                    if (!canonical) {
                        const newId = this._newSongId();
                        canonical = {
                            id: newId,
                            title: song.title,
                            artist: song.artist || '',
                            bpm: song.bpm || 0,
                            lyrics: song.lyrics || '',
                            notes: song.notes || '',
                            structure: '',
                            duration: '',
                            htmlFile: '',
                            fontSize: this.getDefaultFontSize(),
                            recordings: [],
                            createdAt: new Date().toISOString(),
                            lastModified: new Date().toISOString()
                        };
                        this.catalog.set(newId, canonical);
                    }
                    if (rep && !rep.entries.some(e => e.songId === canonical.id)) {
                        rep.entries.push({ songId: canonical.id, order: nextOrder });
                        nextOrder += 10;
                        importedCount++;
                    }
                });

                this._saveCatalog();
                this._saveRepertoiresV2();
                this._rebuildSongs();
                this.renderSongs();
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
        if (!this.currentSong) return;
        const canonical = this.catalog.get(this.currentSong.id);
        if (canonical) {
            canonical.fontSize = fontSize;
            this._saveCatalog();
        }
    }

    addRecordingEventsToCurrentSong(events) {
        if (!this.currentSong || !events || events.length === 0) return;
        const canonical = this.catalog.get(this.currentSong.id);
        if (!canonical) return;

        if (!canonical.recordings) canonical.recordings = [];
        const recording = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            events: events,
            duration: events.length > 0 ? Math.max(...events.map(e => e.timestamp)) : 0
        };
        canonical.recordings.push(recording);
        canonical.lastModified = new Date().toISOString();
        this._saveCatalog();

        console.log(`💾 Grabación guardada en "${canonical.title}":`, recording);
        console.log(`📊 Total de grabaciones: ${canonical.recordings.length}`);
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
    
    sortSongsAlphabetically() {
        if (this.songs.length === 0) {
            this.showNotification('No hay canciones para ordenar', 'warning');
            return;
        }
        
        const confirmation = confirm(`¿Ordenar todas las canciones alfabéticamente?\n\n` +
            `• Se ordenarán por título (A-Z)\n` +
            `• Los valores de orden serán: 10, 20, 30, 40...\n` +
            `• Total de canciones: ${this.songs.length}\n\n` +
            `Esta acción no se puede deshacer.`);
        
        if (confirmation) {
            console.log(`🔤 Iniciando ordenamiento alfabético de ${this.songs.length} canciones...`);
            
            // Crear copia de las canciones y ordenar alfabéticamente por título
            const sortedSongs = [...this.songs].sort((a, b) => {
                return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
            });
            
            // Asignar valores de orden incrementales de 10 en 10
            sortedSongs.forEach((song, index) => {
                song.order = ((index + 1) * 10)+10000;
                console.log(`  ${index + 1}. "${song.title}" → orden: ${song.order}`);
            });
            
            // Actualizar el array principal con el orden correcto
            this.songs = sortedSongs;
            
            // Reiniciar contador temporal para futuras ordenaciones manuales
            this.tempOrderCounter = 0;
            
            // Guardar cambios y re-renderizar
            this.saveSongs();
            this.renderSongs();
            
            console.log(`✅ Ordenamiento alfabético completado. Valores de orden: 10 a ${this.songs.length * 10}`);
            
            // Cerrar modal y mostrar notificación
            this.closeRepertoireOptionsModalFunc();
            this.showNotification(`${this.songs.length} canciones ordenadas alfabéticamente (10, 20, 30...)`, 'success');
        }
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

    selectNextSong() {
        if (this.songs.length === 0) return;

        const currentIndex = this.songs.findIndex(song => song.id === this.currentSong?.id);
        let nextIndex;

        if (currentIndex === -1 || currentIndex === this.songs.length - 1) {
            // Si no hay canción actual o es la última, ir a la primera
            nextIndex = 0;
        } else {
            nextIndex = currentIndex + 1;
        }

        this.selectSong(this.songs[nextIndex]);
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
            console.log(`✅ Confirmación válida — vaciando setlist actual (catálogo intacto)`);

            const songsCount = this.songs.length;
            const rep = this.repertoires.get(this.currentRepertoireId);
            if (rep) {
                rep.entries = [];
                rep.activeSongId = null;
                rep.lastModified = new Date().toISOString();
                this._saveRepertoiresV2();
            }
            this.currentSong = null;
            this._rebuildSongs();
            this.renderSongs();

            const lyricsContainer = document.getElementById('lyrics-container');
            if (lyricsContainer) {
                lyricsContainer.innerHTML = '<p>Selecciona una canción para ver sus letras</p>';
            }
            if (this.editCurrentSongBtn) this.editCurrentSongBtn.disabled = true;

            this.showNotification(`🗑️ Vaciadas ${songsCount} entradas del setlist (catálogo global intacto)`, 'success');

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
                
                const rep = this.repertoires.get(this.currentRepertoireId);
                const maxOrder = rep ? rep.entries.reduce((m, e) => Math.max(m, e.order || 0), 0) : 0;
                let nextOrder = maxOrder + 10;

                songs.forEach((songData, index) => {
                    try {
                        console.log(`🎵 Procesando canción ${index + 1}/${songs.length}: "${songData.title}"`);

                        let canonical = this._findInCatalog(songData.title, songData.artist);
                        if (!canonical) {
                            const newId = this._newSongId();
                            const bpmNum = typeof songData.bpm === 'string' ? parseInt(songData.bpm, 10) : songData.bpm;
                            canonical = {
                                id: newId,
                                title: songData.title,
                                artist: songData.artist || '',
                                bpm: isNaN(bpmNum) ? 0 : (bpmNum || 0),
                                lyrics: songData.lyrics || '',
                                notes: songData.notes || '',
                                structure: '',
                                duration: '',
                                htmlFile: '',
                                fontSize: this.getDefaultFontSize(),
                                recordings: [],
                                createdAt: new Date().toISOString(),
                                lastModified: new Date().toISOString()
                            };
                            this.catalog.set(newId, canonical);
                        }
                        if (rep && !rep.entries.some(e => e.songId === canonical.id)) {
                            rep.entries.push({ songId: canonical.id, order: songData.order || nextOrder });
                            nextOrder += 10;
                            importedCount++;
                        } else {
                            skippedCount++;
                        }
                    } catch (error) {
                        errorCount++;
                        console.error(`  💥 Error importando "${songData.title}":`, error.message);
                    }
                });

                this._saveCatalog();
                this._saveRepertoiresV2();
                this._rebuildSongs();
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

    // Compat: en v2 la carga la hace _loadFromStorage (constructor). Aquí no-op.
    loadRepertoires() { /* no-op en v2 */ }

    saveRepertoires() {
        this.updateCurrentRepertoireModified();
        this._saveRepertoiresV2();
    }

    switchRepertoire(repertoireId) {
        if (repertoireId === this.currentRepertoireId) return;

        console.log(`🔄 Cambiando al repertorio: ${repertoireId}`);

        // Sincronizar orders del actual antes de salir
        this._syncOrdersToEntries();
        this._saveRepertoiresV2();

        this.currentRepertoireId = repertoireId;
        const repertoire = this.repertoires.get(repertoireId);

        if (!repertoire) {
            console.error(`❌ Repertorio no encontrado: ${repertoireId}`);
            this.showNotification(`Error: Repertorio no encontrado`, 'error');
            return;
        }

        console.log(`📂 Cargando repertorio "${repertoire.name}" con ${repertoire.entries.length} canciones`);
        this.currentSong = null;
        this._rebuildSongs();
        this.applyDisplaySettings(repertoire);

        this.renderSongs();
        this.updateSongsTitle(this.songs.length);
        this.updateCurrentRepertoireName();

        if (this.songs.length > 0) {
            let songToSelect = null;
            if (repertoire.activeSongId) {
                songToSelect = this.songs.find(s => s.id === repertoire.activeSongId);
            }
            if (!songToSelect) songToSelect = this.songs[0];
            this.selectSong(songToSelect);
        } else {
            this.editCurrentSongBtn.disabled = true;
            document.getElementById('current-song').textContent = '';
            document.getElementById('current-bpm').textContent = '';
            document.getElementById('current-notes').style.display = 'none';

            if (window.lyricsScroller) {
                window.lyricsScroller.loadLyrics('');
            }

            const lyricsContent = document.getElementById('lyrics-content');
            if (lyricsContent) {
                lyricsContent.innerHTML = '';
                const msg = document.createElement('p');
                msg.className = 'welcome-message';
                msg.appendChild(document.createTextNode(`Repertorio "${repertoire.name}" vacío`));
                msg.appendChild(document.createElement('br'));
                msg.appendChild(document.createElement('br'));
                msg.appendChild(document.createTextNode('Agrega canciones usando el botón "+ Agregar" en la lista.'));
                lyricsContent.appendChild(msg);
            }
        }

        this._saveRepertoiresV2();
        this.showNotification(`Cambiado a repertorio: ${repertoire.name}`, 'success');
    }

    saveCurrentRepertoire() {
        // En v2 esto solo sincroniza orders + persiste
        this._syncOrdersToEntries();
        this._saveRepertoiresV2();
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

            const info = document.createElement('div');
            info.className = 'repertoire-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'repertoire-name';
            nameDiv.textContent = repertoire.name;

            const countDiv = document.createElement('div');
            countDiv.className = 'repertoire-count';
            countDiv.textContent = `${(repertoire.entries || []).length} canciones`;

            info.appendChild(nameDiv);
            info.appendChild(countDiv);

            const actions = document.createElement('div');
            actions.className = 'repertoire-item-actions';

            const button = document.createElement('button');
            button.className = 'repertoire-item-btn';
            button.textContent = 'Activar';
            button.addEventListener('click', () => this.switchRepertoire(id));

            actions.appendChild(button);

            item.appendChild(info);
            item.appendChild(actions);

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
        const newId = this._newRepertoireId(name);
        const now = new Date().toISOString();
        this.repertoires.set(newId, {
            id: newId,
            name: name,
            setlistName: 'Canciones',
            showArtistBpm: false,
            hideNotes: false,
            activeSongId: null,
            entries: [],
            createdAt: now,
            lastModified: now
        });
        this._saveRepertoiresV2();
        this.updateRepertoireSelect();
        this.updateRepertoireList();

        this.showNotification(`Repertorio "${name}" creado`, 'success');
    }

    duplicateRepertoireWithName(name) {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (!currentRepertoire) return;

        const newId = this._newRepertoireId(name);
        const now = new Date().toISOString();
        // Duplicar entries (referencias a canciones), NO clonar canciones
        const dupEntries = currentRepertoire.entries.map(e => ({ songId: e.songId, order: e.order }));

        this.repertoires.set(newId, {
            id: newId,
            name: name,
            setlistName: currentRepertoire.setlistName,
            showArtistBpm: currentRepertoire.showArtistBpm === true,
            hideNotes: currentRepertoire.hideNotes === true,
            activeSongId: null,
            entries: dupEntries,
            createdAt: now,
            lastModified: now
        });

        this._saveRepertoiresV2();
        this.updateRepertoireSelect();
        this.updateRepertoireList();

        this.showNotification(`Repertorio "${name}" duplicado con ${dupEntries.length} canciones`, 'success');
    }

    renameCurrentRepertoire(name) {
        const currentRepertoire = this.repertoires.get(this.currentRepertoireId);
        if (!currentRepertoire) return;

        currentRepertoire.name = name;
        this.updateCurrentRepertoireModified();
        this.saveRepertoires();
        this.updateRepertoireSelect();
        this.updateCurrentRepertoireName();
        this.updateRepertoireList();
        
        this.showNotification(`Repertorio renombrado a "${name}"`, 'success');
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

    // Añadir referencia a la canción actual en otro repertorio.
    // En v2 esto es solo una nueva entry — no se duplica la canción.
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

        const songId = this.editingSong.id;
        const songTitle = this.editingSong.title;

        // ¿Ya está la canción en el destino?
        if (targetRepertoire.entries.some(e => e.songId === songId)) {
            alert(`La canción "${songTitle}" ya está en el repertorio "${targetRepertoire.name}".`);
            return;
        }

        // Calcular siguiente order
        const maxOrder = targetRepertoire.entries.reduce((m, e) => Math.max(m, e.order || 0), 0);
        targetRepertoire.entries.push({ songId, order: maxOrder + 10 });
        targetRepertoire.lastModified = new Date().toISOString();

        this._saveRepertoiresV2();

        alert(`Canción "${songTitle}" añadida al repertorio "${targetRepertoire.name}".`);

        // Limpiar selección
        this.copyTargetRepertoireSelect.value = '';
        this.updateCopyButtonState();
        
        console.log(`📄 Canción copiada: "${songCopy.title}" → ${targetRepertoire.name}`);
    }

    // Función helper para obtener el fontSize por defecto desde localStorage
    getDefaultFontSize() {
        const savedSize = localStorage.getItem('globalFontSize');
        const defaultSize = savedSize ? parseFloat(savedSize) : 2.4;
        console.log(`📏 getDefaultFontSize: ${defaultSize} (desde localStorage: ${savedSize || 'null'})`);
        return defaultSize;
    }

    // Función para actualizar la fecha de última modificación del repertorio actual
    updateCurrentRepertoireModified() {
        if (this.repertoires.has(this.currentRepertoireId)) {
            const repertoire = this.repertoires.get(this.currentRepertoireId);
            const now = new Date().toISOString();
            repertoire.lastModified = now;
            console.log(`📅 Repertorio "${repertoire.name}" actualizado - última modificación: ${now}`);
            this.saveRepertoires();
        }
    }

    // ========== FUNCIONES DEL GESTOR DE REPERTORIOS ==========

    openRepertoireManager() {
        console.log('📋 Abriendo gestor de repertorios...');
        
        // Inicializar selecciones
        this.selectedLeftSongs = new Set();
        this.selectedRightSongs = new Set();

        if (this.leftManagerSearchInput) {
            this.leftManagerSearchInput.value = '';
        }
        
        // Poblar los selectores de repertorios
        this.populateManagerRepertoireSelects();
        
        // Cargar canciones de los repertorios por defecto
        this.loadManagerSongs('left');
        this.loadManagerSongs('right');
        
        // Mostrar modal
        this.repertoireManagerModal.style.display = 'flex';
        
        // Actualizar contadores
        this.updateSelectionCounts();
    }

    closeRepertoireManagerModal() {
        console.log('📋 Cerrando gestor de repertorios...');
        this.repertoireManagerModal.style.display = 'none';
        
        // Limpiar selecciones
        this.selectedLeftSongs = new Set();
        this.selectedRightSongs = new Set();
        
        // Recargar la lista de canciones actual por si hubo cambios
        this.renderSongs();
    }

    populateManagerRepertoireSelects() {
        // Limpiar opciones actuales
        this.leftRepertoireSelect.innerHTML = '';
        this.rightRepertoireSelect.innerHTML = '';
        
        // Agregar opciones para cada repertorio
        this.repertoires.forEach((repertoire, id) => {
            const leftOption = document.createElement('option');
            leftOption.value = id;
            leftOption.textContent = repertoire.name;
            this.leftRepertoireSelect.appendChild(leftOption);
            
            const rightOption = document.createElement('option');
            rightOption.value = id;
            rightOption.textContent = repertoire.name;
            this.rightRepertoireSelect.appendChild(rightOption);
        });
        
        // Seleccionar el repertorio actual en el panel izquierdo
        this.leftRepertoireSelect.value = this.currentRepertoireId;
        
        // Seleccionar otro repertorio en el derecho si hay más de uno
        if (this.repertoires.size > 1) {
            const otherRepertoire = Array.from(this.repertoires.keys()).find(id => id !== this.currentRepertoireId);
            if (otherRepertoire) {
                this.rightRepertoireSelect.value = otherRepertoire;
            }
        }
        
        console.log(`📋 Repertorios cargados en selectores: ${this.repertoires.size}`);
    }

    loadManagerSongs(side) {
        const select = side === 'left' ? this.leftRepertoireSelect : this.rightRepertoireSelect;
        const list = side === 'left' ? this.leftSongsList : this.rightSongsList;
        const selectedSongs = side === 'left' ? this.selectedLeftSongs : this.selectedRightSongs;
        const searchTerm = side === 'left' && this.leftManagerSearchInput
            ? this.leftManagerSearchInput.value.trim().toLowerCase()
            : '';
        
        const repertoireId = select.value;
        const repertoire = this.repertoires.get(repertoireId);
        
        if (!repertoire) {
            list.innerHTML = '<li style="color: #888; padding: 20px; text-align: center;">No hay repertorio seleccionado</li>';
            return;
        }
        
        // Limpiar la lista
        list.innerHTML = '';
        
        if (!repertoire.entries || repertoire.entries.length === 0) {
            list.innerHTML = '<li style="color: #888; padding: 20px; text-align: center;">No hay canciones en este repertorio</li>';
            return;
        }

        // Resolver entries → canciones del catálogo, con order inyectado
        const repSongs = repertoire.entries
            .map(e => {
                const song = this.catalog.get(e.songId);
                return song ? { ...song, order: e.order || 0 } : null;
            })
            .filter(Boolean);

        const sortedSongs = repSongs.sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return a.title.localeCompare(b.title);
        });
        const filteredSongs = searchTerm
            ? sortedSongs.filter(song => {
                const title = (song.title || '').toLowerCase();
                const artist = (song.artist || '').toLowerCase();
                return title.includes(searchTerm) || artist.includes(searchTerm);
            })
            : sortedSongs;

        if (filteredSongs.length === 0) {
            list.innerHTML = `<li style="color: #888; padding: 20px; text-align: center;">${
                searchTerm ? 'No hay coincidencias para la búsqueda' : 'No hay canciones en este repertorio'
            }</li>`;
            return;
        }
        
        // Crear items de canciones
        filteredSongs.forEach(song => {
            const li = document.createElement('li');
            li.className = 'manager-song-item';
            li.dataset.songId = song.id;
            
            if (selectedSongs.has(song.id)) {
                li.classList.add('selected');
            }
            
            const info = document.createElement('div');
            info.className = 'manager-song-info';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'manager-song-title';
            titleDiv.textContent = song.title;

            const artistDiv = document.createElement('div');
            artistDiv.className = 'manager-song-artist';
            artistDiv.textContent = song.artist || 'Sin artista';

            info.appendChild(titleDiv);
            info.appendChild(artistDiv);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'manager-song-checkbox';
            checkbox.checked = selectedSongs.has(song.id);

            li.appendChild(info);
            li.appendChild(checkbox);
            
            // Event listener para seleccionar/deseleccionar
            li.addEventListener('click', (e) => {
                const checkbox = li.querySelector('.manager-song-checkbox');
                const songId = song.id;
                
                if (selectedSongs.has(songId)) {
                    selectedSongs.delete(songId);
                    li.classList.remove('selected');
                    checkbox.checked = false;
                } else {
                    selectedSongs.add(songId);
                    li.classList.add('selected');
                    checkbox.checked = true;
                }
                
                this.updateSelectionCounts();
            });
            
            list.appendChild(li);
        });
        
        console.log(`📋 Cargadas ${filteredSongs.length} canciones en panel ${side}`);
    }

    updateSelectionCounts() {
        this.leftSelectionCount.textContent = `${this.selectedLeftSongs.size} seleccionada${this.selectedLeftSongs.size !== 1 ? 's' : ''}`;
        this.rightSelectionCount.textContent = `${this.selectedRightSongs.size} seleccionada${this.selectedRightSongs.size !== 1 ? 's' : ''}`;
    }

    transferSongs(fromSide, toSide, isCopy) {
        const fromRepertoireId = fromSide === 'left' ? this.leftRepertoireSelect.value : this.rightRepertoireSelect.value;
        const toRepertoireId = toSide === 'left' ? this.leftRepertoireSelect.value : this.rightRepertoireSelect.value;
        const selectedSongs = fromSide === 'left' ? this.selectedLeftSongs : this.selectedRightSongs;

        if (selectedSongs.size === 0) {
            this.showNotification('❌ No hay canciones seleccionadas', 'error');
            return;
        }

        if (fromRepertoireId === toRepertoireId) {
            this.showNotification('❌ No puedes transferir canciones al mismo repertorio', 'error');
            return;
        }

        const fromRepertoire = this.repertoires.get(fromRepertoireId);
        const toRepertoire = this.repertoires.get(toRepertoireId);

        if (!fromRepertoire || !toRepertoire) {
            this.showNotification('❌ Error: Repertorio no encontrado', 'error');
            return;
        }

        if (!Array.isArray(fromRepertoire.entries)) fromRepertoire.entries = [];
        if (!Array.isArray(toRepertoire.entries)) toRepertoire.entries = [];

        let transferred = 0;
        const maxOrderTo = toRepertoire.entries.reduce((m, e) => Math.max(m, e.order || 0), 0);
        let nextOrder = maxOrderTo + 10;

        selectedSongs.forEach(songId => {
            const fromEntry = fromRepertoire.entries.find(e => e.songId === songId);
            if (!fromEntry) return;

            const alreadyInTarget = toRepertoire.entries.some(e => e.songId === songId);

            if (isCopy) {
                if (alreadyInTarget) return; // no duplicar referencias
                toRepertoire.entries.push({ songId, order: nextOrder });
                nextOrder += 10;
            } else {
                // Mover = quitar del origen y, si no existía, añadir al destino
                fromRepertoire.entries = fromRepertoire.entries.filter(e => e.songId !== songId);
                if (fromRepertoire.activeSongId === songId) fromRepertoire.activeSongId = null;
                if (!alreadyInTarget) {
                    toRepertoire.entries.push({ songId, order: nextOrder });
                    nextOrder += 10;
                }
            }
            transferred++;
        });

        const now = new Date().toISOString();
        fromRepertoire.lastModified = now;
        toRepertoire.lastModified = now;

        this._saveRepertoiresV2();

        // Si el repertorio actual es uno de los afectados, refrescar la vista
        if (fromRepertoireId === this.currentRepertoireId || toRepertoireId === this.currentRepertoireId) {
            this._rebuildSongs();
            this.renderSongs();
            this.updateSongsTitle(this.songs.length);
        }

        selectedSongs.clear();
        this.loadManagerSongs('left');
        this.loadManagerSongs('right');
        this.updateSelectionCounts();

        const verb = isCopy ? 'copiadas' : 'movidas';
        this.showNotification(`✅ ${transferred} canción${transferred !== 1 ? 'es' : ''} ${verb} correctamente`, 'success');
        console.log(`📋 ${transferred} canciones ${verb} de "${fromRepertoire.name}" a "${toRepertoire.name}"`);
    }
}

// Exportar para uso global
window.SongManager = SongManager;
