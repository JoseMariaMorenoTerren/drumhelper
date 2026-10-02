// Menús de esquina (diseño «Espacial»).
// Cuatro botones circulares en las esquinas; al pulsar uno se despliegan, en arco hacia
// el centro, sus opciones. Cada opción invoca funcionalidad ya existente de la app
// (SongManager, LyricsScroller, Metronome) — este módulo solo orquesta la interfaz.
(function () {
    'use strict';

    const ICONS = {
        metro: '<path d="M9.2 3.5h5.6l3.6 16.5H5.6z"/><path d="M4.5 20h15"/><path d="M12 16.5 16.8 7"/><circle cx="15.6" cy="9.4" r="1.3" fill="currentColor"/>',
        lyricsRec: '<path d="M4 6h11M4 10h11M4 14h6"/><circle cx="17" cy="16.5" r="4"/><circle cx="17" cy="16.5" r="1.5" fill="currentColor"/>',
        plusMinus: '<path d="M4 9h6M7 6v6M14 15h6"/><path d="m16 4-8 16" opacity=".5"/>',
        typeSize: '<path d="M3.5 18 8 6l4.5 12M5.2 14h5.6"/><path d="M14.5 18l2.8-7.5 2.7 7.5M15.5 15.6h3.6"/>',
        eye: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
        sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
        gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
        list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
        edit: '<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>',
        stack: '<rect x="4" y="4" width="16" height="5" rx="1.5"/><rect x="4" y="11" width="16" height="5" rx="1.5"/><path d="M7 20h10"/>',
        sort: '<path d="M8 4v16M8 4 5 7M8 4l3 3M16 20V4M16 20l-3-3M16 20l3-3"/>',
        cols: '<rect x="3" y="5" width="7.5" height="14" rx="1.5"/><rect x="13.5" y="5" width="7.5" height="14" rx="1.5"/>',
        text: '<path d="M5 6h14M12 6v13M9 19h6"/>',
        scroll: '<path d="M12 4v16M12 4 8 8M12 4l4 4M12 20l-4-4M12 20l4-4"/>',
        timer: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M9.5 3h5"/>',
        rec: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/>',
        modes: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/>',
        bars: '<rect x="3" y="14" width="3.5" height="6" rx="1"/><rect x="8.5" y="9" width="3.5" height="11" rx="1"/><rect x="14" y="5" width="3.5" height="15" rx="1"/>',
        doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
        import: '<path d="M12 4v11M12 15l-4-4M12 15l4-4M5 20h14"/>',
        cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 10.5 3.8 3.8 0 0 1 17.5 18z"/>',
        midi: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1"/><circle cx="16" cy="10" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="12" cy="6.5" r="1"/>',
        palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-1.4-1.5-1.7-1.5-3 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.2" r="1.2" fill="currentColor"/>',
        help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>'
    };

    const svg = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
    const $ = (id) => document.getElementById(id);
    const body = document.body;

    function notify(msg, type) {
        if (window.songManager) window.songManager.showNotification(msg, type || 'info');
    }

    function toggleBody(cls, force) {
        return body.classList.toggle(cls, force);
    }

    // Abre el modal de opciones de datos y se desplaza a la sección cuyo título contiene `text`
    function openDataOptions(text) {
        const sm = window.songManager;
        if (!sm) return;
        sm.openDataOptionsModal();
        setTimeout(() => {
            const heads = document.querySelectorAll('#data-options-modal .data-options-section h3');
            for (const h of heads) {
                if (h.textContent.indexOf(text) !== -1) { h.scrollIntoView({ block: 'start', behavior: 'smooth' }); break; }
            }
        }, 30);
    }

    function listIsConcert() { return body.classList.contains('concert-mode'); }

    // ---------------------------------------------------------------- acciones
    const actions = {
        // Metrónomo
        metroShow() {
            const open = body.classList.contains('metro-open') && !body.classList.contains('metro-adjust');
            body.classList.remove('metro-adjust');
            toggleBody('metro-open', !open);
        },
        metroAdjust() {
            const open = body.classList.contains('metro-open') && body.classList.contains('metro-adjust');
            toggleBody('metro-open', !open);
            toggleBody('metro-adjust', !open);
        },
        metroConfig() { openMetronomeSettings(); },

        // SetList
        listToggle() {
            if (listIsConcert()) toggleBody('list-open');
            else toggleBody('list-collapsed');
        },
        songManage() {
            const sm = window.songManager;
            if (!sm) return;
            if (sm.currentSong) sm.openEditSongModal(sm.currentSong); else sm.openAddSongModal();
        },
        repertoires() { window.songManager && window.songManager.openRepertoireOptionsModal(); },
        order() {
            const sm = window.songManager;
            if (!sm) return;
            if (listIsConcert()) body.classList.add('list-open'); else body.classList.remove('list-collapsed');
            sm.toggleOrderMode();
        },
        manager() { window.songManager && window.songManager.openRepertoireManager(); },

        // Notas y grabación
        notes() {
            const btn = $('notes-toggle-btn');
            if (btn && btn.style.display !== 'none') btn.click();
            else notify('Esta canción no tiene notas', 'info');
        },
        scrollPanel() { toggleBody('scroll-panel'); },
        timer() { window.lyricsScroller && window.lyricsScroller.toggleTimer(); },
        record() {
            const ls = window.lyricsScroller;
            if (!ls) return;
            ls.toggleRecording();
            toggleBody('rec-visible', ls.isRecording);
        },
        modes() { window.lyricsScroller && window.lyricsScroller.toggleMode(); },
        structure() {
            const hidden = toggleBody('hide-structure');
            try { localStorage.setItem('drumhelper-hide-structure', hidden ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
        },
        htmlSheet() {
            const sm = window.songManager;
            if (sm && sm.currentSong && sm.currentSong.htmlFile) sm.openSongHtmlFile();
            else notify('Esta canción no tiene ficha HTML', 'info');
        },

        // Configuración
        display() {
            const sm = window.songManager;
            if (!sm) return;
            sm.openRepertoireOptionsModal();
            setTimeout(() => {
                const el = document.querySelector('#repertoire-options-modal .repertoire-display-section');
                if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }, 30);
        },
        io() { openDataOptions('Importar'); },
        sync() { openDataOptions('GitHub'); },
        midi() { const b = $('midi-toggle-btn'); if (b) b.click(); },
        maintenance() { openDataOptions('Gestión'); },
        theme() { openThemePicker(); }
    };

    const MENUS = [
        { key: 'M', corner: 'tr', icon: 'metro', label: 'Metrónomo', items: [
            ['eye', 'Mostrar metrónomo', 'metroShow'], ['plusMinus', 'Ajustar metrónomo', 'metroAdjust'],
            ['gear', 'Configuración metrónomo', 'metroConfig']] },
        { key: 'S', corner: 'tl', icon: 'list', label: 'SetList', items: [
            ['list', 'Lista de canciones', 'listToggle'], ['edit', 'Gestión de canciones', 'songManage'],
            ['stack', 'Repertorios', 'repertoires'], ['sort', 'Orden del setlist', 'order'],
            ['cols', 'Gestor de repertorios', 'manager']] },
        { key: 'N', corner: 'bl', icon: 'lyricsRec', label: 'Notas y grabación', items: [
            ['text', 'Letra y notas', 'notes'], ['scroll', 'Desplazamiento', 'scrollPanel'],
            ['timer', 'Temporizador', 'timer'], ['rec', 'Grabación', 'record'],
            ['modes', 'Modos de vista', 'modes'], ['bars', 'Estructura', 'structure'],
            ['doc', 'Ficha HTML', 'htmlSheet']] },
        { key: 'C', corner: 'br', icon: 'sliders', label: 'Configuración', items: [
            ['typeSize', 'Visualización', 'display'], ['palette', 'Color del tema', 'theme'],
            ['import', 'Importar y exportar', 'io'],
            ['cloud', 'Sincronización', 'sync'], ['midi', 'Control MIDI', 'midi'],
            ['help', 'Mantenimiento y ayuda', 'maintenance']] }
    ];

    // ---------------------------------------------------------------- geometría
    let safe = { t: 0, b: 0, l: 0, r: 0 };
    function readSafeAreas() {
        const probe = document.createElement('div');
        probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;' +
            'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
        body.appendChild(probe);
        const cs = getComputedStyle(probe);
        safe = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0,
                 b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
        body.removeChild(probe);
    }

    function metrics() {
        const cs = getComputedStyle(document.documentElement);
        const size = parseFloat(cs.getPropertyValue('--corner')) || 56;
        const gap = parseFloat(cs.getPropertyValue('--corner-gap')) || 16;
        return { size, gap, W: window.innerWidth, H: window.innerHeight };
    }

    function cornerCenter(corner, m) {
        const half = m.size / 2;
        const cx = corner[1] === 'l' ? safe.l + m.gap + half : m.W - safe.r - m.gap - half;
        const cy = corner[0] === 't' ? safe.t + 18 + half : m.H - safe.b - 20 - half;
        return { cx, cy };
    }

    // Posición de las opciones. Ancho/iPad: sobre un arco con separación VERTICAL fija (las
    // etiquetas son horizontales, así no se solapan). Pantalla estrecha: columna junto a la esquina.
    function childPositions(menu, m) {
        const { cx, cy } = cornerCenter(menu.corner, m);
        const sx = menu.corner[1] === 'l' ? 1 : -1;
        const sy = menu.corner[0] === 't' ? 1 : -1;
        const n = menu.items.length;
        const narrow = m.W < 700;
        const out = [];
        if (narrow) {
            const step = 52, first = m.size / 2 + 40;
            menu.items.forEach((item, k) => out.push({ x: cx, y: cy + sy * (first + k * step), sx, item }));
            return out;
        }
        const room = sy > 0 ? m.H - cy - 24 : cy - 24;
        const dy = Math.min(50, room / Math.max(1, n - 1));
        const ymax = (n - 1) * dy;
        const R = Math.max(130, ymax / 0.94);
        menu.items.forEach((item, k) => {
            const y = k * dy;
            out.push({ x: cx + sx * Math.sqrt(Math.max(0, R * R - y * y)), y: cy + sy * y, sx, item });
        });
        return out;
    }

    // ---------------------------------------------------------------- construcción
    let layer, openKey = null;
    const corners = {};
    const childEls = {};   // key -> [{btn,label}]

    function build() {
        layer = document.createElement('div');
        layer.className = 'cm-layer';
        const scrim = document.createElement('div');
        scrim.className = 'cm-scrim';
        scrim.addEventListener('click', closeMenu);
        layer.appendChild(scrim);
        body.appendChild(layer);

        MENUS.forEach((menu) => {
            const b = document.createElement('button');
            b.className = 'cm-corner';
            b.type = 'button';
            b.setAttribute('aria-label', menu.label);
            b.setAttribute('aria-expanded', 'false');
            b.innerHTML = svg(menu.icon);
            b.addEventListener('click', () => toggleMenu(menu.key));
            body.appendChild(b);
            corners[menu.key] = b;

            childEls[menu.key] = menu.items.map(([icon, label, act]) => {
                const c = document.createElement('button');
                c.className = 'cm-child';
                c.type = 'button';
                c.setAttribute('aria-label', label);
                c.innerHTML = svg(icon);
                c.dataset.menu = menu.key;
                c.style.display = 'none';
                c.addEventListener('click', () => {
                    closeMenu();
                    try { actions[act](); } catch (e) { console.error('Acción de menú falló:', act, e); }
                });
                const l = document.createElement('span');
                l.className = 'cm-label';
                l.textContent = label;
                l.style.display = 'none';
                layer.appendChild(c);
                layer.appendChild(l);
                return { btn: c, label: l };
            });
        });
        place();
    }

    function place() {
        const m = metrics();
        MENUS.forEach((menu) => {
            const { cx, cy } = cornerCenter(menu.corner, m);
            const b = corners[menu.key];
            b.style.left = (cx - m.size / 2) + 'px';
            b.style.top = (cy - m.size / 2) + 'px';
            const pos = childPositions(menu, m);
            pos.forEach((p, i) => {
                const { btn, label } = childEls[menu.key][i];
                btn.style.left = (p.x - 23) + 'px';
                btn.style.top = (p.y - 23) + 'px';
                label.style.top = (p.y - 16) + 'px';
                if (p.sx > 0) { label.style.left = (p.x + 30) + 'px'; label.style.right = 'auto'; }
                else { label.style.right = (m.W - p.x + 30) + 'px'; label.style.left = 'auto'; }
            });
        });
    }

    function toggleMenu(key) {
        if (openKey === key) { closeMenu(); return; }
        closeMenu();
        openKey = key;
        childEls[key].forEach(({ btn, label }) => { btn.style.display = ''; label.style.display = ''; });
        corners[key].classList.add('on');
        corners[key].setAttribute('aria-expanded', 'true');
        body.classList.add('cm-open');
        // un fotograma después para que la transición se vea
        requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('open')));
    }

    function closeMenu() {
        if (!openKey) return;
        const key = openKey;
        openKey = null;
        layer.classList.remove('open');
        corners[key].classList.remove('on');
        corners[key].setAttribute('aria-expanded', 'false');
        body.classList.remove('cm-open');
        setTimeout(() => {
            if (openKey === key) return;
            childEls[key].forEach(({ btn, label }) => { btn.style.display = 'none'; label.style.display = 'none'; });
        }, 200);
    }

    // ---------------------------------------------------------------- selector de modo + chip BPM
    function buildModeSeg() {
        const seg = document.createElement('div');
        seg.className = 'cm-seg';
        seg.setAttribute('role', 'group');
        seg.setAttribute('aria-label', 'Modo de vista');
        [['concert', 'CONCIERTO'], ['edition', 'EDICIÓN']].forEach(([mode, text]) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.dataset.mode = mode;
            b.textContent = text;
            b.addEventListener('click', () => window.lyricsScroller && window.lyricsScroller.setMode(mode));
            seg.appendChild(b);
        });
        body.appendChild(seg);
        const sync = () => {
            const cur = window.lyricsScroller ? window.lyricsScroller.currentMode : 'edition';
            seg.querySelectorAll('button').forEach((b) => b.classList.toggle('a', b.dataset.mode === cur));
            if (cur !== 'concert') body.classList.remove('list-open');
        };
        window.addEventListener('mode-change', sync);
        sync();
    }

    function buildBpmChip() {
        const chip = document.createElement('div');
        chip.className = 'cm-bpm';
        chip.innerHTML = '<i></i><b>120</b><span>BPM</span>';
        body.appendChild(chip);
        const dot = chip.querySelector('i');
        const num = chip.querySelector('b');
        const set = (bpm) => { if (bpm) num.textContent = bpm; };
        set(window.metronome && window.metronome.bpm);
        window.addEventListener('bpm-change', (e) => set(e.detail.bpm));
        window.addEventListener('metronome-beat', () => {
            dot.classList.add('on');
            setTimeout(() => dot.classList.remove('on'), 110);
        });
    }

    // ---------------------------------------------------------------- panel de metrónomo: cierre
    function buildMetronomePanelClose() {
        const panel = document.querySelector('.metronome-container');
        if (!panel) return;
        const x = document.createElement('button');
        x.type = 'button';
        x.className = 'cm-panel-close';
        x.setAttribute('aria-label', 'Cerrar metrónomo');
        x.textContent = '×';
        x.addEventListener('click', () => body.classList.remove('metro-open', 'metro-adjust'));
        panel.appendChild(x);
    }

    // ---------------------------------------------------------------- configuración del metrónomo
    let settingsModal;
    function openMetronomeSettings() {
        const mt = window.metronome;
        if (!mt) return;
        if (!settingsModal) {
            settingsModal = document.createElement('div');
            settingsModal.className = 'modal';
            settingsModal.id = 'metro-settings-modal';
            settingsModal.innerHTML =
                '<div class="modal-content" style="max-width:520px">' +
                '<span class="close" id="ms-close">&times;</span>' +
                '<h2>Configuración del metrónomo</h2>' +
                '<div class="ms-row"><label for="ms-sound">Sonido</label><select id="ms-sound"></select></div>' +
                '<div class="ms-row"><label for="ms-volume">Volumen</label><input type="range" id="ms-volume" min="0" max="100" step="1"><output id="ms-volume-out"></output></div>' +
                '<div class="ms-row"><label for="ms-flash">Destello de borde de pantalla</label><input type="checkbox" id="ms-flash"></div>' +
                '<div class="ms-row"><label for="ms-test">Probar sonido</label><button type="button" class="control-btn" id="ms-test">Click</button></div>' +
                '<p class="ms-note">Los ajustes se guardan en este dispositivo.</p></div>';
            body.appendChild(settingsModal);
            const sel = settingsModal.querySelector('#ms-sound');
            mt.soundOptions.forEach((o) => {
                const opt = document.createElement('option');
                opt.value = o.id; opt.textContent = o.label; sel.appendChild(opt);
            });
            const close = () => { settingsModal.style.display = 'none'; };
            settingsModal.querySelector('#ms-close').addEventListener('click', close);
            settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) close(); });
            sel.addEventListener('change', () => mt.updateSettings({ sound: sel.value }));
            const vol = settingsModal.querySelector('#ms-volume');
            const out = settingsModal.querySelector('#ms-volume-out');
            vol.addEventListener('input', () => { out.textContent = vol.value + ' %'; mt.updateSettings({ volume: vol.value / 100 }); });
            settingsModal.querySelector('#ms-flash').addEventListener('change', (e) => mt.updateSettings({ flash: e.target.checked }));
            settingsModal.querySelector('#ms-test').addEventListener('click', () => mt.playTestClick());
        }
        const s = mt.settings;
        settingsModal.querySelector('#ms-sound').value = s.sound;
        settingsModal.querySelector('#ms-volume').value = Math.round(s.volume * 100);
        settingsModal.querySelector('#ms-volume-out').textContent = Math.round(s.volume * 100) + ' %';
        settingsModal.querySelector('#ms-flash').checked = s.flash;
        settingsModal.style.display = 'block';
    }

    // Anterior/siguiente pasan a la pastilla de transporte (visibles solo en concierto, por CSS)
    function moveSongNav() {
        const bar = document.querySelector('.scroll-controls');
        const prev = $('general-prev-btn');
        const next = $('general-next-btn');
        const pb = document.querySelector('.playback-controls');
        if (!bar || !prev || !next || !pb) return;
        bar.insertBefore(prev, pb);
        bar.appendChild(next);
        prev.setAttribute('aria-label', 'Canción anterior');
        next.setAttribute('aria-label', 'Canción siguiente');
    }

    // «Notas» y «Ficha» en una misma fila de píldoras junto al título
    function groupSongPills() {
        const row = document.querySelector('.song-header-row');
        const notes = $('notes-toggle-btn');
        const sheet = $('open-html-btn');
        if (!row || !notes || !sheet) return;
        const pills = document.createElement('div');
        pills.className = 'song-pills';
        row.appendChild(pills);
        pills.appendChild(notes);
        pills.appendChild(sheet);
    }

    // ---------------------------------------------------------------- tema de color
    const THEMES = [
        { id: 'green', label: 'Verde', desc: 'Menta sobre verde bosque' },
        { id: 'blue', label: 'Azul', desc: 'Hielo sobre azul noche' },
        { id: 'red', label: 'Rojo', desc: 'Coral sobre burdeos' }
    ];

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'green';
    }

    function applyTheme(id) {
        if (id === 'blue' || id === 'red') document.documentElement.setAttribute('data-theme', id);
        else document.documentElement.removeAttribute('data-theme');
        try { localStorage.setItem('drumhelper-theme', id); } catch (e) { /* sin almacenamiento */ }
        // Barra de estado / color del navegador acorde al fondo del tema
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            const t = getComputedStyle(document.documentElement).getPropertyValue('--tc-07120d').trim();
            if (t) meta.setAttribute('content', `rgb(${t})`);
        }
        if (themeModal) {
            themeModal.querySelectorAll('.theme-swatch').forEach((b) => {
                const on = b.dataset.theme === id;
                b.classList.toggle('is-active', on);
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
        }
    }

    let themeModal;
    function openThemePicker() {
        if (!themeModal) {
            themeModal = document.createElement('div');
            themeModal.className = 'modal';
            themeModal.id = 'theme-modal';
            themeModal.innerHTML =
                '<div class="modal-content" style="max-width:560px">' +
                '<div class="modal-header"><h2>Color del tema</h2><span class="close" id="theme-close">&times;</span></div>' +
                '<div class="theme-grid" role="group" aria-label="Color del tema"></div>' +
                '<p class="ms-note">Se guarda en este dispositivo y se aplica al instante.</p></div>';
            body.appendChild(themeModal);
            const grid = themeModal.querySelector('.theme-grid');
            THEMES.forEach((t) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'theme-swatch';
                b.dataset.theme = t.id;
                b.innerHTML = `<span class="theme-preview theme-preview-${t.id}"><i></i></span>` +
                    `<span class="theme-name">${t.label}</span><span class="theme-desc">${t.desc}</span>`;
                b.addEventListener('click', () => applyTheme(t.id));
                grid.appendChild(b);
            });
            const close = () => { themeModal.style.display = 'none'; };
            themeModal.querySelector('#theme-close').addEventListener('click', close);
            themeModal.addEventListener('click', (e) => { if (e.target === themeModal) close(); });
        }
        applyTheme(currentTheme());
        themeModal.style.display = 'block';
    }

    // Muestra la versión (tomada del rótulo #version-code) en Opciones y Ayuda
    function fillVersion() {
        const code = $('version-code');
        const v = code ? code.textContent.trim().replace(/^v/i, '') : '';
        if (!v) return;
        document.querySelectorAll('.dh-version').forEach((el) => { el.textContent = v; });
    }

    // ---------------------------------------------------------------- arranque
    function init() {
        readSafeAreas();
        applyTheme(currentTheme());
        try { if (localStorage.getItem('drumhelper-hide-structure') === '1') body.classList.add('hide-structure'); } catch (e) { /* ok */ }
        if (window.innerWidth <= 768) body.classList.add('list-collapsed');
        build();
        buildModeSeg();
        buildBpmChip();
        buildMetronomePanelClose();
        moveSongNav();
        groupSongPills();
        fillVersion();
        window.addEventListener('resize', () => { readSafeAreas(); place(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openKey) closeMenu(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
