// Sincronización de datos con GitHub (sin backend propio).
// Publica/recibe setlists/songs.json y setlists/setlists.json usando la
// API de contenidos de GitHub directamente desde el navegador.
class GitHubSync {
    constructor() {
        // Configuración del repositorio destino
        this.owner = 'JoseMariaMorenoTerren';
        this.repo = 'drumhelper';
        this.branch = 'main';
        this.songsPath = 'setlists/songs.json';
        this.setlistsPath = 'setlists/setlists.json';

        this.tokenKey = 'drumhelper-github-token';

        this.publishBtn = document.getElementById('github-publish-btn');
        this.pullBtn = document.getElementById('github-pull-btn');
        this.tokenBtn = document.getElementById('github-token-btn');

        this.initializeEventListeners();
        this.updateTokenButtonLabel();
    }

    initializeEventListeners() {
        if (this.publishBtn) {
            this.publishBtn.addEventListener('click', () => this.publish());
        }
        if (this.pullBtn) {
            this.pullBtn.addEventListener('click', () => this.pull());
        }
        if (this.tokenBtn) {
            this.tokenBtn.addEventListener('click', () => this.configureToken());
        }
    }

    // ---------- Token ----------

    getToken() {
        return localStorage.getItem(this.tokenKey) || '';
    }

    configureToken() {
        const current = this.getToken();
        const input = prompt(
            'Token de acceso personal de GitHub (fine-grained) con permiso de ' +
            `contenidos sobre ${this.owner}/${this.repo}.\n\n` +
            'Se guarda solo en este dispositivo.\n' +
            'Deja el campo vacío y acepta para borrarlo.',
            current
        );

        if (input === null) return; // cancelado

        const token = input.trim();
        if (token) {
            localStorage.setItem(this.tokenKey, token);
            this.notify('🔑 Token guardado en este dispositivo', 'success');
        } else {
            localStorage.removeItem(this.tokenKey);
            this.notify('Token eliminado', 'info');
        }
        this.updateTokenButtonLabel();
    }

    updateTokenButtonLabel() {
        if (!this.tokenBtn) return;
        const small = this.tokenBtn.querySelector('small');
        if (small) {
            small.textContent = this.getToken()
                ? 'Token configurado en este dispositivo'
                : 'Necesario para publicar (no para recibir)';
        }
    }

    // Pide el token si no existe todavía (necesario solo para publicar)
    ensureToken() {
        if (this.getToken()) return true;
        this.configureToken();
        return !!this.getToken();
    }

    // ---------- API de GitHub ----------

    apiUrl(path) {
        return `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    }

    apiHeaders(extra = {}) {
        const headers = {
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            ...extra
        };
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    }

    // SHA actual del fichero en el repo (null si no existe)
    async fetchSha(path) {
        const res = await fetch(`${this.apiUrl(path)}?ref=${this.branch}`, {
            headers: this.apiHeaders(),
            cache: 'no-store'
        });
        if (res.status === 404) return null;
        if (!res.ok) throw await this.apiError(res, `obteniendo ${path}`);
        const data = await res.json();
        return data.sha || null;
    }

    async putFile(path, jsonString, message) {
        const sha = await this.fetchSha(path);
        const body = {
            message,
            content: this.toBase64Utf8(jsonString),
            branch: this.branch
        };
        if (sha) body.sha = sha;

        const res = await fetch(this.apiUrl(path), {
            method: 'PUT',
            headers: this.apiHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(body)
        });
        if (!res.ok) throw await this.apiError(res, `subiendo ${path}`);
        return res.json();
    }

    // Contenido crudo y actual del fichero (sin esperar redespliegues de Pages)
    async fetchRaw(path) {
        const res = await fetch(`${this.apiUrl(path)}?ref=${this.branch}`, {
            headers: this.apiHeaders({ 'Accept': 'application/vnd.github.raw+json' }),
            cache: 'no-store'
        });
        if (!res.ok) throw await this.apiError(res, `descargando ${path}`);
        return res.json();
    }

    async apiError(res, doing) {
        let detail = '';
        try {
            const data = await res.json();
            if (data && data.message) detail = ` — ${data.message}`;
        } catch (e) { /* sin cuerpo JSON */ }

        if (res.status === 401) {
            return new Error(`Token inválido o caducado (401)${detail}. Revisa "Configurar token".`);
        }
        if (res.status === 403) {
            return new Error(`Sin permisos sobre el repositorio (403)${detail}. El token necesita acceso de contenidos a ${this.owner}/${this.repo}.`);
        }
        if (res.status === 404) {
            return new Error(`No encontrado (404) ${doing}${detail}.`);
        }
        return new Error(`Error ${res.status} ${doing}${detail}`);
    }

    toBase64Utf8(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
            bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        return btoa(bin);
    }

    // ---------- Publicar ----------

    async publish() {
        const sm = window.songManager;
        if (!sm) return;

        if (!this.ensureToken()) {
            this.notify('Publicación cancelada: falta el token', 'info');
            return;
        }

        const songCount = sm.catalog.size;
        const repCount = sm.repertoires.size;
        if (!confirm(
            `¿Publicar ${songCount} canciones y ${repCount} repertorios en GitHub?\n\n` +
            `Sobrescribirá ${this.songsPath} y ${this.setlistsPath} en ${this.owner}/${this.repo}.`
        )) {
            return;
        }

        // Cerrar el modal de opciones (igual que el resto de acciones del modal)
        if (typeof sm.closeDataOptionsModalFunc === 'function') sm.closeDataOptionsModalFunc();

        this.setBusy(this.publishBtn, true);
        this.notify('⏳ Publicando en GitHub...', 'info');

        try {
            // Asegurar que el orden actual del setlist queda reflejado antes de exportar
            if (typeof sm._syncOrdersToEntries === 'function') sm._syncOrdersToEntries();

            const stamp = new Date().toISOString();
            const message = `Sync desde DrumHelper (${stamp})`;

            // Mismo formato que exportSongs(): sin campos transitorios order/active
            const catalogObj = {};
            for (const [id, song] of sm.catalog) {
                const { order, active, ...rest } = song;
                catalogObj[id] = rest;
            }
            const songsJson = JSON.stringify({
                version: 2,
                exportDate: stamp,
                songs: catalogObj
            }, null, 2);

            // Mismo formato que exportSetlists()
            const setlistsJson = JSON.stringify({
                version: 2,
                exportDate: stamp,
                currentRepertoireId: sm.currentRepertoireId,
                repertoires: Object.fromEntries(sm.repertoires)
            }, null, 2);

            await this.putFile(this.songsPath, songsJson, message);
            await this.putFile(this.setlistsPath, setlistsJson, message);

            this.notify(`✅ Publicado en GitHub: ${songCount} canciones, ${repCount} repertorios`, 'success');
        } catch (e) {
            console.error('💥 Error publicando en GitHub:', e);
            this.notify(`❌ ${e.message}`, 'error');
        } finally {
            this.setBusy(this.publishBtn, false);
        }
    }

    // ---------- Recibir ----------

    async pull() {
        const sm = window.songManager;
        if (!sm) return;

        if (!confirm(
            'Esto REEMPLAZARÁ las canciones y repertorios de este dispositivo ' +
            `por los publicados en GitHub (${this.owner}/${this.repo}).\n\n¿Continuar?`
        )) {
            return;
        }

        // Cerrar el modal de opciones (igual que el resto de acciones del modal)
        if (typeof sm.closeDataOptionsModalFunc === 'function') sm.closeDataOptionsModalFunc();

        this.setBusy(this.pullBtn, true);
        this.notify('⏳ Descargando de GitHub...', 'info');

        try {
            const [songsData, setlistsData] = await Promise.all([
                this.fetchRaw(this.songsPath),
                this.fetchRaw(this.setlistsPath)
            ]);

            if (!songsData.songs || !setlistsData.repertoires) {
                throw new Error('Formato JSON inválido en los ficheros del repositorio');
            }

            // Misma aplicación de datos que el bootstrap desde servidor
            sm.catalog = new Map(Object.entries(songsData.songs));
            sm.repertoires = new Map(Object.entries(setlistsData.repertoires));
            sm.currentRepertoireId = setlistsData.currentRepertoireId || 'default';
            if (!sm.repertoires.has(sm.currentRepertoireId)) {
                sm.currentRepertoireId = sm.repertoires.keys().next().value || 'default';
            }

            sm._saveCatalog();
            sm._saveRepertoiresV2();

            sm._rebuildSongs();
            sm.renderSongs();
            sm.updateSongsTitle(sm.songs.length);
            sm.updateRepertoireSelect();
            sm.updateCurrentRepertoireName();
            setTimeout(() => sm.selectActiveSong(), 50);

            this.notify(`✅ Recibido de GitHub: ${sm.catalog.size} canciones, ${sm.repertoires.size} repertorios`, 'success');
        } catch (e) {
            console.error('💥 Error recibiendo de GitHub:', e);
            this.notify(`❌ ${e.message}`, 'error');
        } finally {
            this.setBusy(this.pullBtn, false);
        }
    }

    // ---------- Utilidades ----------

    setBusy(btn, busy) {
        if (!btn) return;
        btn.disabled = busy;
        btn.style.opacity = busy ? '0.5' : '';
    }

    notify(message, type) {
        if (window.songManager && window.songManager.showNotification) {
            window.songManager.showNotification(message, type);
        } else {
            console.log(`[GitHubSync] ${message}`);
        }
    }
}

// Exportar para uso global
window.GitHubSync = GitHubSync;
