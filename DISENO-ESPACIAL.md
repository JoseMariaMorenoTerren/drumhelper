# Drum Helper v1.4.19 — tema «Espacial» (verde)

Copia de `~/Proyectos/drumhelper` (v1.4.13) adaptada al diseño aprobado. La app original no se ha tocado.

## Qué cambia
- **Estilo:** `css/space.css` (se carga tras `styles.css`): fondo espacial verde con estrellas, texto claro, cristal esmerilado, Manrope + Sora. Colores semánticos de la letra: `::` ámbar, secciones lila, resaltados `/0 /1 /3`.
- **Menús de esquina:** `js/cornerMenu.js`. Cuatro botones circulares (↖ SetList, ↗ Metrónomo, ↙ Notas y grabación, ↘ Configuración); al pulsarlos salen las opciones en arco (iPad/ancho) o en columna (<700 px). Cada opción llama a funcionalidad ya existente.
- **Dos modos:** Concierto y Edición (selector arriba al centro). El modo *prompter* se ha retirado (`lyricsScroller.modes`).
- **Metrónomo:** panel flotante (Mostrar / Ajustar) y chip de BPM con pulso. Nuevo modal «Configuración del metrónomo» (sonido, volumen, destello), guardado en `localStorage` (`drumhelper-metronome-settings`).
- **Ayuda:** ahora es accesible (Configuración → Mantenimiento y ayuda → «Ayuda y atajos», o clic en el rótulo de versión) y lista solo atajos realmente implementados.
- Versión 1.4.19 sincronizada en `index.html`, `sw.js` y `manifest.json`.

## Mapa de opciones de los menús
| Menú | Opción | Acción |
|---|---|---|
| Metrónomo | Mostrar / Ajustar | panel flotante (solo círculo / con ±, TAP) |
| | Configuración | modal de sonido, volumen, destello |
| SetList | Lista de canciones | acoplada (edición) o cajón (concierto) |
| | Gestión de canciones | editar la actual (o añadir si no hay) |
| | Repertorios · Orden · Gestor | modales existentes |
| Notas y grabación | Letra y notas | plegar/desplegar notas |
| | Desplazamiento | controles de scroll y tamaño de letra |
| | Temporizador · Grabación · Modos | `toggleTimer`, `toggleRecording`, `toggleMode` |
| | Estructura | mostrar/ocultar barra de compases |
| | Ficha HTML | visor de la ficha (si la canción la tiene) |
| Configuración | Visualización | opciones de repertorio |
| | Importar/exportar · Sincronización · Mantenimiento | secciones del modal de opciones |
| | Control MIDI | activar/desactivar |

## Sin cambiar (heredado de la v1.4.13)
Los defectos del Anexo A del análisis funcional que no afectan al diseño siguen presentes (auto-scroll por tempo inactivo, `Ctrl+S/O`, MIDI 65/67, eliminar repertorio…).

## Pulido estético (v1.4.19)
- **Iconos unificados** (`js/icons.js`): todos los controles usan el mismo trazo SVG; se eliminan emojis y glifos (▶️ ⏸️ 🔴 ⏹️ « ⇑ ✎ 📁 📋…), también los que la app reinsertaba al cambiar de estado. Tamaño de letra con «A» pequeña/grande.
- **Iconos de esquina** rediseñados: metrónomo más reconocible; «Notas y grabación» = líneas de letra + punto de grabación; «Ajustar metrónomo» = ±; «Visualización» = tamaño de texto (ya no repiten el ojo/deslizadores de otras opciones).
- **Cabecera**: título y artista en dos niveles (artista en versalitas); «Notas» y «Ficha» como píldoras en la misma fila.
- **Lista**: nombre del repertorio y «N canciones · duración» en dos líneas (antes se truncaba); botones «Añadir» / «Editar» con icono.
- **Notificaciones** en cristal del tema, con punto de color por tipo, centradas sobre la barra de reproducción (antes verde lima con texto negro, tapando el título).
- **Modales**: sin emojis, cabeceras alineadas, interruptores en lugar de casillas nativas, repertorio activo marcado «Activo», formulario de canción más ancho con BPM · Orden · Duración en una fila y etiquetas sin dos puntos.
- **Concierto**: la letra se desvanece antes de la pastilla de transporte; barras de scroll discretas.
- **Corrección**: al arrancar, el botón «Ficha» no aparecía hasta cambiar de canción (`selectActiveSong`).
