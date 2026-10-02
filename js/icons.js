// Juego de iconos único de la app (trazo 1.6, extremos redondeados, 24×24).
// Sustituye a los emojis y glifos de texto (▶️ 🔴 « ⇑ ✎ …) para que todo comparta estilo.
(function () {
    'use strict';

    const P = {
        play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
        pause: '<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="2.4"/>',
        stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/>',
        rec: '<circle cx="12" cy="12" r="5.5" fill="currentColor" stroke="none"/>',
        restart: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>',
        prev: '<path d="M6.5 6v12"/><path d="M18 6.5 9.5 12l8.5 5.5z" fill="currentColor" stroke-linejoin="round"/>',
        next: '<path d="M17.5 6v12"/><path d="M6 6.5 14.5 12 6 17.5z" fill="currentColor" stroke-linejoin="round"/>',
        up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
        down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
        top: '<path d="M5 4.5h14M12 20V9M7 14l5-5 5 5"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        edit: '<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>',
        doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
        chevron: '<path d="m9 6 6 6-6 6"/>',
        close: '<path d="m6 6 12 12M18 6 6 18"/>',
        right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
        left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
        copyRight: '<rect x="3" y="8" width="9" height="12" rx="2"/><path d="M8 4h9a2 2 0 0 1 2 2v9"/><path d="M14 12h7M18 9l3 3-3 3"/>',
        copyLeft: '<rect x="12" y="8" width="9" height="12" rx="2"/><path d="M16 4H7a2 2 0 0 0-2 2v9"/><path d="M10 12H3M6 9l-3 3 3 3"/>'
    };

    function svg(name, cls) {
        const body = P[name];
        if (!body) return '';
        return `<svg class="dh-icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
    }

    // Pone un icono (y opcionalmente un texto) en un botón, conservando un aria-label legible
    function set(el, name, label, text) {
        if (!el) return;
        el.innerHTML = svg(name) + (text ? `<span class="dh-icon-text">${text}</span>` : '');
        if (label) {
            el.setAttribute('aria-label', label);
            el.title = label;
        }
    }

    // Botones estáticos del HTML: icono + etiqueta accesible
    function applyStaticIcons() {
        const $ = (id) => document.getElementById(id);
        set($('restart-btn'), 'restart', 'Volver al inicio');
        set($('play-pause-btn'), 'play', 'Reproducir');
        set($('record-btn'), 'rec', 'Grabar desplazamiento');
        set($('scroll-up-btn'), 'up', 'Subir letra');
        set($('scroll-down-btn'), 'down', 'Bajar letra');
        set($('scroll-to-top-btn'), 'top', 'Ir al principio');
        set($('general-prev-btn'), 'prev', 'Canción anterior');
        set($('general-next-btn'), 'next', 'Canción siguiente');
        set($('add-song-btn'), 'plus', 'Añadir canción', 'Añadir');
        set($('edit-current-song-btn'), 'edit', 'Editar canción', 'Editar');
        set($('open-html-btn'), 'doc', 'Ver la ficha de la canción', 'Ficha');
        set($('move-right-btn'), 'right', 'Mover seleccionadas a la derecha');
        set($('move-left-btn'), 'left', 'Mover seleccionadas a la izquierda');
        set($('copy-right-btn'), 'copyRight', 'Copiar seleccionadas a la derecha');
        set($('copy-left-btn'), 'copyLeft', 'Copiar seleccionadas a la izquierda');
        set($('move-up-btn'), 'up', 'Subir la canción seleccionada', 'Subir');
        set($('move-down-btn'), 'down', 'Bajar la canción seleccionada', 'Bajar');
        set($('close-html-viewer'), 'close', 'Cerrar ficha');
        // Tamaño de letra: tipográfico en lugar de «A- / A+»
        const fm = $('font-size-minus'), fp = $('font-size-plus');
        if (fm) { fm.innerHTML = '<span class="aa aa-s">A</span>'; fm.setAttribute('aria-label', 'Letra más pequeña'); fm.title = 'Letra más pequeña'; }
        if (fp) { fp.innerHTML = '<span class="aa aa-l">A</span>'; fp.setAttribute('aria-label', 'Letra más grande'); fp.title = 'Letra más grande'; }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyStaticIcons);
    else applyStaticIcons();

    window.DHIcons = { svg, set };
})();
