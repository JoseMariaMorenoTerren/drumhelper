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
