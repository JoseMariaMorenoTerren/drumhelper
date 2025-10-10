# Drum Helper

Una Progressive Web App (PWA) para músicos y bateristas que combina un metrónomo interactivo con un visor de letras con desplazamiento automático. Optimizada para pantalla completa en iPad y otros dispositivos táctiles.

## Características

### 🥁 Metrónomo Integrado
- **Control de tempo**: 40-300 BPM
- **Botones de ajuste fino**: +1/-1 BPM y +10/-10 BPM
- **Indicador visual prominente**: Círculo amarillo grande que pulsa con cada beat
- **Control principal**: Clic para reproducir/pausar, doble clic para parar
- **Sonido de click**: Audio sincronizado con Web Audio API
- **Tap tempo**: Calcula el BPM tocando el botón TAP
- **Interfaz minimalista**: Solo el círculo y controles esenciales
- **Sonido uniforme**: Todos los beats suenan igual

### 🎵 Gestor de Canciones
- **Lista organizada**: Panel lateral con todas las canciones
- **Búsqueda**: Filtro en tiempo real por título o artista
- **Información completa**: Título, artista y BPM de cada canción
- **Agregar canciones**: Modal para crear nuevas entradas
- **Editar canciones**: Botón ✏️ o Ctrl+E para modificar cualquier canción
- **Eliminar canciones**: Clic derecho o botón en el modal de edición
- **Almacenamiento local**: Las canciones se guardan en el navegador
- **Exportar/Importar**: Guarda y recupera tu colección desde archivos JSON
- **Respaldo automático**: Exporta con fecha para crear copias de seguridad

### 📜 Visor de Letras con Auto-Scroll
- **Desplazamiento automático**: Sincronizado con el tempo del metrónomo
- **Control manual**: Botones para subir/bajar o usar la rueda del mouse
- **Velocidad ajustable**: Control deslizante de 1-10
- **Tamaño de fuente ajustable**: Botones A+/A- para ampliar/reducir texto
- **Pausa inteligente**: Se pausa automáticamente al hacer scroll manual
- **Formato mejorado**: Detección automática de coros y secciones
- **Líneas especiales**: Líneas que empiecen con `::` aparecen en naranja
- **Preferencias guardadas**: El tamaño de fuente se recuerda entre sesiones

### ⌨️ Atajos de Teclado
- **Espacio**: Alternar auto-scroll de letras
- **Ctrl/Cmd + Espacio**: Play/Pause del metrónomo
- **Ctrl/Cmd + T**: Tap tempo
- **Ctrl/Cmd + N**: Agregar nueva canción
- **Escape**: Parar metrónomo
- **Flechas ↑↓**: Desplazar letras manualmente
- **Ctrl/Cmd + ←/→**: Ajustar BPM ±1
- **Shift + ←/→**: Ajustar BPM ±10
- **Ctrl/Cmd + +/-**: Aumentar/reducir tamaño de fuente
- **Ctrl/Cmd + S**: Exportar canciones a archivo
- **Ctrl/Cmd + O**: Importar canciones desde archivo
- **Ctrl/Cmd + E**: Editar canción actual

### 🎨 Diseño
- **Tema oscuro**: Fondo negro con texto blanco para mejor legibilidad
- **Layout responsivo**: Se adapta a diferentes tamaños de pantalla
- **Interfaz intuitiva**: Controles grandes y accesibles
- **Indicadores visuales**: Estados claros para todos los controles

### 📱 Progressive Web App (PWA)
- **Instalable**: Se puede instalar en dispositivos móviles y escritorio
- **Pantalla completa en iPad**: Optimización específica para experiencia inmersiva en tablets
- **Funciona sin conexión**: Service Worker permite uso offline una vez cargada
- **Protección anti-zoom**: Previene zoom accidental en dispositivos táctiles
- **Safe area support**: Compatible con dispositivos con notch o borde redondeado
- **Orientación flexible**: Se adapta tanto a portrait como landscape en iPad

## Estructura del Proyecto

```
drumhelper/
├── index.html          # Página principal con PWA meta tags
├── styles.css          # Estilos CSS con optimizaciones para iPad
├── manifest.json       # Manifiesto PWA para instalación
├── sw.js              # Service Worker para funcionamiento offline
├── js/
│   ├── metronome.js    # Clase del metrónomo
│   ├── songManager.js  # Gestor de canciones y repertorios
│   ├── lyricsScroller.js # Control de desplazamiento de letras
│   └── app.js          # Aplicación principal y registro del SW
└── README.md           # Este archivo
```

## Uso

1. **Abrir la aplicación**: Simplemente abre `index.html` en cualquier navegador moderno
2. **Seleccionar canción**: Haz clic en cualquier canción de la lista lateral
3. **Controlar el metrónomo**: Haz clic en el círculo amarillo para reproducir/pausar, doble clic para parar, y ajusta el BPM
4. **Ver las letras**: Las letras se mostrarán en el panel central y se desplazarán automáticamente
5. **Agregar canciones**: Haz clic en "+ Agregar Canción" para crear nuevas entradas
6. **Editar canciones**: Haz clic en el botón ✏️ de cualquier canción o usa Ctrl+E
7. **Gestionar datos**: Exporta tus canciones a un archivo JSON o importa desde otro archivo

### 📱 Uso en iPad (Pantalla Completa)

Para obtener la mejor experiencia en iPad:

1. **Abrir en Safari**: Visita la aplicación web en Safari
2. **Añadir a Pantalla de Inicio**: 
   - Toca el botón de compartir (cuadrado con flecha)
   - Selecciona "Añadir a pantalla de inicio"
   - Confirma el nombre de la app
3. **Abrir desde Pantalla de Inicio**: La app se abrirá en modo pantalla completa
4. **Experiencia Optimizada**: 
   - Sin barras de navegador
   - Usa toda la pantalla disponible
   - Funciona en orientación landscape y portrait
   - Protección contra zoom accidental

### ✏️ Edición de Canciones

#### **Formas de Editar**
- **Botón ✏️**: Aparece al pasar el mouse sobre cada canción
- **Atajo Ctrl+E**: Edita la canción actualmente seleccionada
- **Clic derecho**: Menu contextual con opción "Editar"

#### **Modal de Edición**
- **Todos los campos editables**: Título, artista, BPM y letras
- **Validación en tiempo real**: Verifica que los datos sean válidos
- **Botón Eliminar**: Opción para borrar la canción desde el modal
- **Actualización automática**: Los cambios se reflejan inmediatamente

#### **Características**
- **Sin pérdida de datos**: Si cancelas, no se guardan los cambios
- **Actualización en vivo**: Si editas la canción actual, se actualiza automáticamente
- **Notificaciones**: Confirmación visual de los cambios guardados

### 🎨 Formato de Letras

La aplicación reconoce automáticamente diferentes tipos de contenido en las letras:

#### **Líneas Especiales (Naranja)**
Cualquier línea que empiece con `::` se mostrará en **color naranja** y en negrita:
```
:: Intro - Guitar only
:: Chorus - Everyone sing!
:: Solo Section - 16 bars
:: Bridge - Quiet part
```

**Casos de uso:**
- Indicaciones para músicos
- Marcadores de secciones
- Notas de tempo o dinámicas
- Recordatorios de arreglos

#### **Secciones Automáticas (Rojo)**
Se detectan automáticamente y aparecen en rojo:
- `[Chorus]`, `[Verse]`, `[Bridge]`, etc.
- `(Intro)`, `(Outro)`, etc.

#### **Letras Normales (Blanco)**
Todo el resto del texto aparece en blanco con el tamaño seleccionado.

### 💾 Gestión de Archivos

#### **Exportar Canciones**
- Clic en "📤 Exportar" o usa `Ctrl+S`
- Se descarga un archivo JSON con todas tus canciones
- Formato: `drumhelper-songs-YYYY-MM-DD.json`
- Incluye metadatos como fecha de exportación

#### **Importar Canciones**
- Clic en "📥 Importar" o usa `Ctrl+O`
- Selecciona un archivo JSON exportado previamente
- Valida automáticamente el formato y contenido
- Las canciones se agregan a tu colección actual
- Notificaciones muestran el resultado de la importación

#### **Formato del Archivo JSON**
```json
{
  "version": "1.0",
  "exportDate": "2025-10-07T10:30:00.000Z",
  "songs": [
    {
      "id": 1697544123456,
      "title": "Nombre de la canción",
      "artist": "Artista",
      "bpm": 120,
      "lyrics": "Letras completas..."
    }
  ]
}
```

## Canciones Incluidas

La aplicación incluye algunas canciones de ejemplo:
- **We Will Rock You** - Queen (114 BPM)
- **Another One Bites the Dust** - Queen (110 BPM)
- **Seven Nation Army** - The White Stripes (124 BPM)

## Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones recientes)
- **Dispositivos**: Desktop, tablet, móvil
- **Requisitos**: Navegador con soporte para Web Audio API (opcional para sonido)
- **Sin servidor**: Funciona completamente del lado cliente, no requiere Node.js ni servidor

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsive design
- **JavaScript ES6+**: Programación orientada a objetos
- **Web Audio API**: Generación de sonido del metrónomo
- **LocalStorage API**: Persistencia de datos

## Personalización

### Modificar Estilos
Edita `styles.css` para cambiar colores, fuentes o layout.

### Agregar Funcionalidades
Cada componente está en su propio archivo JS para facilitar la extensión:
- `metronome.js`: Lógica del metrónomo
- `songManager.js`: Gestión de canciones
- `lyricsScroller.js`: Control de desplazamiento
- `app.js`: Coordinación y eventos globales

### Canciones por Defecto
Modifica el array `defaultSongs` en `songManager.js` para cambiar las canciones incluidas.

## Solución de Problemas

### El sonido del metrónomo no funciona
- Asegúrate de que el navegador soporte Web Audio API
- Algunos navegadores requieren interacción del usuario antes de reproducir audio
- Haz clic en cualquier botón antes de iniciar el metrónomo

### Las letras no se desplazan
- Verifica que el auto-scroll esté activado (botón "AUTO" resaltado)
- Ajusta la velocidad con el control deslizante
- El desplazamiento se sincroniza con el metrónomo

### Las canciones no se guardan
- Verifica que el navegador permita LocalStorage
- En modo incógnito, los datos se pierden al cerrar

## Desarrollo

Para contribuir o modificar el proyecto:

1. Clona o descarga el repositorio
2. Abre `index.html` en tu navegador para probar
3. Modifica los archivos según sea necesario
4. No se requiere proceso de build ni dependencias

## Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo, modificarlo y distribuirlo.
