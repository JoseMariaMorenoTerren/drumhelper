# Contexto de la aplicación Drumhelper

## Descripción
Drumhelper es una aplicación JavaScript para ayudar a un batería durante conciertos.
Permite gestionar repertorios y canciones, con orden del setlist, letras, notas y metrónomo.

## Instrucciones persistentes
1. Siempre que se toque la aplicación con cambios de código, incrementar la versión solo en el tercer dígito (patch).
2. Mantener la versión sincronizada al menos en:
   - `manifest.json` (`version`)
   - `index.html` (etiqueta visual `#version-code`)
   - `sw.js` (`CACHE_NAME`, para invalidación de caché del service worker)

## Historial de instrucciones
- 2026-04-02: Se solicita incrementar siempre el tercer dígito de versión en cada corrección menor y documentarlo en este archivo.
- 2026-10-02: A petición del propietario se pasa a la versión 2.0.0 (rediseño «Espacial»). La regla del tercer dígito sigue vigente a partir de aquí (2.0.1, 2.0.2…). La versión se muestra en Configuración → Mantenimiento y ayuda, en la Ayuda y en el rótulo inferior.
