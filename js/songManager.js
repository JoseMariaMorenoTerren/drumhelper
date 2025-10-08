class SongManager {
    constructor() {
        this.songs = [];
        this.currentSong = null;
        this.storageKey = 'drumhelper-songs';
        
        this.songList = document.getElementById('song-list');
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
        this.importFileInput = document.getElementById('import-file-input');
        
        this.editingSong = null;
        
        this.initializeEventListeners();
        this.loadSongs();
        this.loadDefaultSongs();
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
        
        // Eventos de exportar/importar
        this.exportBtn.addEventListener('click', () => {
            this.exportSongs();
        });
        
        this.importBtn.addEventListener('click', () => {
            this.importFileInput.click();
        });
        
        this.importFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importSongs(e.target.files[0]);
            }
        });
    }
    
    loadDefaultSongs() {
        if (this.songs.length === 0) {
            const defaultSongs = [
                {
                    id: 1,
                    title: "We Will Rock You",
                    artist: "Queen",
                    bpm: 114,
                    active: true,
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
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.songs = JSON.parse(stored);
            
            // Añadir propiedades faltantes a canciones existentes
            let hasActiveSong = false;
            this.songs.forEach(song => {
                if (song.active === undefined) {
                    song.active = false;
                }
                if (song.notes === undefined) {
                    song.notes = '';
                }
                if (song.active === true) {
                    hasActiveSong = true;
                }
            });
            
            // Si no hay ninguna canción activa, marcar la primera como activa
            if (!hasActiveSong && this.songs.length > 0) {
                this.songs[0].active = true;
                this.saveSongs(); // Guardar el cambio
            }
        }
    }
    
    saveSongs() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.songs));
    }
    
    renderSongs(searchTerm = '') {
        const filteredSongs = this.songs.filter(song => 
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.songList.innerHTML = '';
        
        filteredSongs.forEach(song => {
            const songElement = this.createSongElement(song);
            this.songList.appendChild(songElement);
        });
    }
    
    createSongElement(song) {
        const li = document.createElement('li');
        li.className = 'song-item';
        li.dataset.songId = song.id;
        li.style.position = 'relative';
        
        if (this.currentSong && this.currentSong.id === song.id) {
            li.classList.add('active');
        }
        
        li.innerHTML = `
            <span class="song-title">${song.title}</span>
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
        
        // Activar el botón de editar
        this.editCurrentSongBtn.disabled = false;
        
        // Actualizar clases activas
        document.querySelectorAll('.song-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-song-id="${song.id}"]`).classList.add('active');
        
        // Notificar cambio de canción
        window.dispatchEvent(new CustomEvent('song-selected', {
            detail: { song }
        }));
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
                }
            }, 100);
            
            // Notificar cambio de canción (igual que selectSong pero sin guardar)
            window.dispatchEvent(new CustomEvent('song-selected', {
                detail: { song: activeSong }
            }));
        }
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
        document.getElementById('edit-song-notes').value = song.notes || '';
        document.getElementById('edit-song-lyrics').value = song.lyrics;
        
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
        const lyrics = document.getElementById('song-lyrics').value.trim();
        
        if (!title) {
            alert('El título es obligatorio');
            return;
        }
        
        const newSong = {
            id: Date.now(), // Simple ID basado en timestamp
            title,
            artist: artist || 'Artista desconocido',
            bpm: bpm || 120,
            lyrics: lyrics || '',
            notes: document.getElementById('song-notes').value.trim() || '',
            active: false
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
                notes: notes || '',
                lyrics: lyrics || ''
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
            const dataToExport = {
                version: "1.0",
                exportDate: new Date().toISOString(),
                songs: this.songs
            };
            
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Crear un enlace de descarga
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(dataBlob);
            
            // Generar nombre de archivo con fecha
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            downloadLink.download = `drumhelper-songs-${dateStr}.json`;
            
            // Simular clic para descargar
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Limpiar URL del blob
            URL.revokeObjectURL(downloadLink.href);
            
            this.showNotification(`✅ Exportadas ${this.songs.length} canciones a ${downloadLink.download}`, 'success');
            
        } catch (error) {
            console.error('Error exportando canciones:', error);
            this.showNotification('❌ Error al exportar las canciones', 'error');
        }
    }
    
    importSongs(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validar estructura del archivo
                if (!importedData.songs || !Array.isArray(importedData.songs)) {
                    throw new Error('Formato de archivo inválido');
                }
                
                // Mostrar confirmación
                const confirmMessage = `¿Deseas importar ${importedData.songs.length} canciones?\n\n` +
                    `Esto ${this.songs.length > 0 ? 'se agregará a' : 'reemplazará'} tu colección actual.\n` +
                    `Fecha de exportación: ${importedData.exportDate ? new Date(importedData.exportDate).toLocaleString() : 'Desconocida'}`;
                
                if (!confirm(confirmMessage)) {
                    return;
                }
                
                // Procesar canciones importadas
                let importedCount = 0;
                let skippedCount = 0;
                
                importedData.songs.forEach(song => {
                    // Validar estructura de cada canción
                    if (this.validateSong(song)) {
                        // Generar nuevo ID para evitar conflictos
                        const newSong = {
                            ...song,
                            id: Date.now() + Math.random(), // ID único
                            notes: song.notes || '', // Asegurar que tenga el campo notes
                            active: false // Las canciones importadas no están activas por defecto
                        };
                        
                        this.songs.push(newSong);
                        importedCount++;
                    } else {
                        skippedCount++;
                    }
                });
                
                // Guardar y actualizar interfaz
                this.saveSongs();
                this.renderSongs();
                
                // Si no hay canción activa después del import, activar la primera
                if (!this.songs.find(song => song.active) && this.songs.length > 0) {
                    this.selectSong(this.songs[0]);
                }
                
                // Mostrar resultado
                let message = `✅ Importadas ${importedCount} canciones`;
                if (skippedCount > 0) {
                    message += ` (${skippedCount} omitidas por formato inválido)`;
                }
                
                this.showNotification(message, 'success');
                
                // Limpiar input de archivo
                this.importFileInput.value = '';
                
            } catch (error) {
                console.error('Error importando canciones:', error);
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
        return song && 
               typeof song.title === 'string' && song.title.trim() !== '' &&
               typeof song.artist === 'string' &&
               typeof song.bpm === 'number' && song.bpm >= 40 && song.bpm <= 300 &&
               typeof song.lyrics === 'string';
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
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
}

// Exportar para uso global
window.SongManager = SongManager;
