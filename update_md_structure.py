#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

def add_structure_and_dynamics(md_file):
    """
    Añade etiquetas de estructura y marcadores de dinámica a un archivo .md
    """
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verificar si ya tiene etiquetas
    if '[verso]' in content or '[estribillo]' in content:
        return False, "Ya tiene etiquetas"
    
    # Buscar la sección de letras
    lyrics_start = content.find('## Letras / Transcripción')
    if lyrics_start == -1:
        return False, "Sin sección de letras"
    
    lyrics_end = content.find('---', lyrics_start)
    if lyrics_end == -1:
        lyrics_end = len(content)
    
    # Extraer las líneas de letras
    before = content[:lyrics_start + len('## Letras / Transcripción')]
    after = content[lyrics_end:]
    lyrics_text = content[lyrics_start + len('## Letras / Transcripción'):lyrics_end].strip()
    
    lines = lyrics_text.split('\n')
    new_lines = []
    current_section = None
    empty_line_count = 0
    
    for line in lines:
        stripped = line.strip()
        
        # Línea vacía
        if not stripped:
            new_lines.append(line)
            empty_line_count += 1
            current_section = None
            continue
        
        # Indicaciones especiales (::)
        if stripped.startswith('::'):
            new_lines.append(line)
            continue
        
        # Ya tiene marcador de dinámica
        if any(stripped.startswith(m) for m in ['/0', '//1', '//2', '//3']):
            # Determinar si es estribillo o verso por la dinámica
            if stripped.startswith('//2') or stripped.startswith('/2'):
                if current_section != 'verso':
                    new_lines.append('[verso]')
                    current_section = 'verso'
            elif stripped.startswith('//3') or stripped.startswith('/3'):
                if current_section != 'estribillo':
                    new_lines.append('[estribillo]')
                    current_section = 'estribillo'
            new_lines.append(line)
            continue
        
        # Detectar estribillos por repetición o palabras clave
        lower = stripped.lower()
        is_chorus = any(word in lower for word in [
            'chorus', 'estribillo', 'baby', 'tonight', 'watching you',
            'break free', 'without you', 'together', 'love', 'numb',
            'dame una', 'mediterráneo', 'santa lucia'
        ])
        
        # Si parece estribillo
        if is_chorus:
            if current_section != 'estribillo':
                new_lines.append('[estribillo]')
                current_section = 'estribillo'
            # Añadir marcador verde /3
            new_lines.append('//3')
            new_lines.append(line)
        else:
            # Es un verso
            if current_section != 'verso':
                new_lines.append('[verso]')
                current_section = 'verso'
            # Añadir marcador blanco /2
            new_lines.append('//2')
            new_lines.append(line)
    
    # Reconstruir el archivo
    new_content = before + '\n\n' + '\n'.join(new_lines) + '\n\n' + after
    
    # Guardar
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True, "Actualizado"


# Procesar archivos
base_dir = 'canciones'
archivos_sin_tildes = [
    'escuela-de-calor/escuela-de-calor.md',
    'eye-in-the-skys/eye-in-the-skys.md',
    'i-still-havent-found-what/i-still-havent-found-what.md',
    'insurreccion/insurreccion.md',
    'la-del-pirata-cojo/la-del-pirata-cojo.md',
    'lobo-hombre-en-paris/lobo-hombre-en-paris.md',
    'maldito-duende/maldito-duende.md',
    'mediterraneo/mediterraneo.md',
    'ni-tu-ni-nadie/ni-tu-ni-nadie.md',
    'no-dudaria/no-dudaria.md',
    'santa-lucia/santa-lucia.md',
    'the-power-of-love/the-power-of-love.md',
    'walk-of-live/walk-of-live.md',
    'with-or-without-you/with-or-without-you.md'
]

procesados = 0
for rel_path in archivos_sin_tildes:
    md_file = os.path.join(base_dir, rel_path)
    if os.path.exists(md_file):
        success, msg = add_structure_and_dynamics(md_file)
        if success:
            procesados += 1
            print(f"✓ {rel_path.split('/')[0]}")
        else:
            print(f"⏭️  {rel_path.split('/')[0]}: {msg}")

print(f"\n{'='*60}")
print(f"Archivos procesados: {procesados}")
print(f"{'='*60}")
