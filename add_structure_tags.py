#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
from collections import defaultdict

def analyze_song_structure(content):
    """
    Analiza el contenido de una canción y marca las secciones estructurales.
    """
    lines = content.split('\n')
    result = []
    
    # Buscar la sección de letras
    in_lyrics = False
    lyrics_start = -1
    lyrics_end = -1
    in_code_block = False
    
    for idx, line in enumerate(lines):
        if '```' in line:
            in_code_block = not in_code_block
        if ('## Letras / Transcripción' in line or '## Letras' in line) and not in_code_block:
            in_lyrics = True
            lyrics_start = idx + 1
        elif in_lyrics and line.strip() == '---' and not in_code_block:
            lyrics_end = idx
            break
    
    if lyrics_start == -1:
        return content  # No hay sección de letras
    
    # Procesar líneas antes de las letras
    for idx in range(lyrics_start):
        result.append(lines[idx])
    
    # Procesar las letras
    lyrics_lines = lines[lyrics_start:lyrics_end if lyrics_end > 0 else len(lines)]
    
    i = 0
    current_section = None
    verse_count = 0
    in_code = False
    block_lines = []
    
    while i < len(lyrics_lines):
        line = lyrics_lines[i]
        stripped = line.strip()
        
        # Manejar bloques de código
        if '```' in line:
            in_code = not in_code
            result.append(line)
            i += 1
            continue
        
        # Si estamos en un bloque de código, no procesamos
        if in_code:
            result.append(line)
            i += 1
            continue
        
        # Línea vacía - resetear sección
        if not stripped:
            if block_lines and current_section:
                # Fin de bloque
                block_lines = []
            current_section = None
            result.append(line)
            i += 1
            continue
        
        # Detectar intro
        if stripped.startswith('::') and any(word in stripped.lower() for word in ['intro', 'instrumental', 'empieza']):
            if current_section != 'intro':
                result.append('[intro]')
                current_section = 'intro'
            result.append(line)
            i += 1
            continue
        
        # Detectar outro/final
        if stripped.startswith('::') and any(word in stripped.lower() for word in ['outro', 'final', 'ojo final']):
            if current_section != 'outro':
                result.append('[outro]')
                current_section = 'outro'
            result.append(line)
            i += 1
            continue
        
        # Detectar puente
        if stripped.startswith('::') and any(word in stripped.lower() for word in ['bridge', 'puente', 'solo']):
            if current_section != 'puente':
                result.append('[puente]')
                current_section = 'puente'
            result.append(line)
            i += 1
            continue
        
        # Indicaciones especiales (no son secciones musicales)
        if stripped.startswith('::'):
            result.append(line)
            i += 1
            continue
        
        # Detectar estribillo por dinámica alta (/2, /3) o palabras repetidas
        if stripped.startswith('//2') or stripped.startswith('//3') or \
           stripped.startswith('/2') or stripped.startswith('/3'):
            if current_section != 'estribillo':
                result.append('[estribillo]')
                current_section = 'estribillo'
            result.append(line)
            i += 1
            continue
        
        # Si empieza con dinámica baja o media, probablemente es verso
        if stripped.startswith('/0') or stripped.startswith('//1') or stripped.startswith('/1'):
            if current_section != 'verso':
                result.append('[verso]')
                current_section = 'verso'
            result.append(line)
            i += 1
            continue
        
        # Por defecto, si no tiene etiqueta y sigue a una línea vacía, es verso
        if current_section is None:
            result.append('[verso]')
            current_section = 'verso'
        
        result.append(line)
        i += 1
    
    # Añadir el resto del contenido
    if lyrics_end > 0:
        for idx in range(lyrics_end, len(lines)):
            result.append(lines[idx])
    
    return '\n'.join(result)


def process_all_songs():
    """
    Procesa todos los archivos .md de canciones.
    """
    base_dir = 'canciones'
    processed = 0
    
    for root, dirs, files in os.walk(base_dir):
        for filename in files:
            if filename.endswith('.md'):
                filepath = os.path.join(root, filename)
                
                try:
                    # Leer el archivo
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Verificar si ya tiene etiquetas
                    if '[verso]' in content or '[estribillo]' in content:
                        print(f"⏭️  Omitido (ya tiene etiquetas): {filename}")
                        continue
                    
                    # Analizar y marcar estructura
                    new_content = analyze_song_structure(content)
                    
                    # Guardar el archivo modificado
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    processed += 1
                    print(f"✓ Procesado: {filename}")
                    
                except Exception as e:
                    print(f"❌ Error procesando {filename}: {e}")
    
    print(f"\n{'='*60}")
    print(f"Total de archivos procesados: {processed}")
    print(f"{'='*60}")


if __name__ == '__main__':
    process_all_songs()
