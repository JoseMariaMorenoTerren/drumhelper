#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import re

# Leer datos
with open('bluemoons-80.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Función para limpiar nombre de archivo
def clean_filename(title):
    # Reemplazar caracteres especiales por su equivalente sin tilde
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ú': 'u',
        'ñ': 'n', 'Ñ': 'n', 'ü': 'u', 'Ü': 'u'
    }
    
    for old, new in replacements.items():
        title = title.replace(old, new)
    
    cleaned = re.sub(r'[^\w\s-]', '', title.lower())
    cleaned = re.sub(r'[-\s]+', '-', cleaned)
    return cleaned.strip('-')

# Función para procesar el texto y aplicar formato
def process_lyrics(text):
    lines = text.split('\n')
    html_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detectar anotaciones especiales (::)
        if line.startswith('::'):
            html_lines.append(f'<div class="anotacion-especial">{line}</div>')
        # Detectar patrones de dinámica
        elif '/0' in line:
            clean_line = line.replace('/0', '').replace('0/', '')
            html_lines.append(f'<div class="verso dinamica-0">{clean_line}</div>')
        elif '//1' in line:
            clean_line = line.replace('//1', '')
            html_lines.append(f'<div class="verso dinamica-1">{clean_line}</div>')
        elif '//2' in line:
            clean_line = line.replace('//2', '')
            html_lines.append(f'<div class="verso dinamica-2">{clean_line}</div>')
        elif '//3' in line:
            clean_line = line.replace('//3', '')
            html_lines.append(f'<div class="verso dinamica-3">{clean_line}</div>')
        else:
            html_lines.append(f'<div class="verso">{line}</div>')
    
    return html_lines

# Función para distribuir contenido en 3 columnas
def create_columns(html_lines, notes_html=''):
    total_lines = len(html_lines)
    lines_per_column = (total_lines + 2) // 3  # Redondear hacia arriba
    
    columns = []
    for i in range(3):
        start = i * lines_per_column
        end = min((i + 1) * lines_per_column, total_lines)
        column_content = html_lines[start:end]
        
        # Añadir notas en la primera columna si existen
        column_html = ''
        if i == 0 and notes_html:
            column_html = notes_html + '\n                '
        
        column_html += '\n                '.join(column_content)
        columns.append(f'<div class="column">\n                {column_html}\n            </div>')
    
    return '\n        '.join(columns)

# Template HTML
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - {artist}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body, html {{
            height: 100vh;
            width: 100%;
            font-family: 'Courier New', monospace;
            background-color: black;
            color: white;
            overflow: hidden;
        }}

        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 8px 15px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
        }}

        h1 {{
            font-size: 1.3em;
            margin: 0;
            display: inline;
        }}

        .info {{
            font-size: 0.9em;
            color: #ddd;
            display: inline;
            margin-left: 15px;
        }}

        .container {{
            height: calc(100vh - 50px);
            display: flex;
            padding: 15px;
            gap: 15px;
            overflow: hidden;
        }}

        .column {{
            flex: 1;
            background-color: #111;
            padding: 20px;
            border-radius: 8px;
            overflow-y: auto;
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.05);
        }}

        .column::-webkit-scrollbar {{
            width: 8px;
        }}

        .column::-webkit-scrollbar-track {{
            background: #222;
            border-radius: 4px;
        }}

        .column::-webkit-scrollbar-thumb {{
            background: #667eea;
            border-radius: 4px;
        }}

        .column::-webkit-scrollbar-thumb:hover {{
            background: #764ba2;
        }}

        .verso {{
            line-height: 1.6;
            margin: 6px 0;
            font-size: 1em;
            padding-left: 10px;
        }}

        .dinamica-0 {{
            color: #FFD700;
            font-weight: bold;
        }}

        .dinamica-1 {{
            color: #66CCFF;
        }}

        .dinamica-2 {{
            color: #FFFFFF;
        }}

        .dinamica-3 {{
            color: #66FF66;
            font-weight: bold;
        }}

        .anotacion-especial {{
            color: #FF8C00;
            font-style: italic;
            font-weight: bold;
            margin: 12px 0;
            font-size: 1.1em;
            padding: 8px;
            background-color: rgba(255, 140, 0, 0.1);
            border-left: 3px solid #FF8C00;
        }}

        .notes-section {{
        .notes-section {{
            background-color: rgba(76, 175, 80, 0.15);
            padding: 15px;
            margin-bottom: 15px;
            border-left: 3px solid #4CAF50;
            border-radius: 5px;
        }}

        .notes-section h2 {{
            color: #4CAF50;
            margin-bottom: 10px;
            font-size: 1.1em;
        }}

        .notes-section div {{
            font-size: 0.95em;
            line-height: 1.5;
        }}

        .legend {{
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: rgba(34, 34, 34, 0.95);
            padding: 12px;
            border-radius: 6px;
            font-size: 0.85em;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            max-width: 250px;
        }}

        .legend h3 {{
            color: #4CAF50;
            margin-bottom: 8px;
            font-size: 1em;
        }}

        .legend-item {{
            margin: 5px 0;
            padding: 3px;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{title}</h1>
        <span class="info">{artist} | BPM: {bpm}</span>
    </div>

    <div class="container">
        {columns_html}
    </div>

    <div class="legend">
        <h3>Leyenda:</h3>
        <div class="legend-item dinamica-0">/0...0/ - Básica</div>
        <div class="legend-item dinamica-1">//1 - Nivel 1</div>
        <div class="legend-item dinamica-2">//2 - Nivel 2</div>
        <div class="legend-item dinamica-3">//3 - Nivel 3</div>
        <div class="legend-item anotacion-especial">:: - Especial</div>
    </div>
</body>
</html>
'''

# Template Markdown
MD_TEMPLATE = '''# {title} - {artist}

**BPM:** {bpm}  
**Artista:** {artist}

## Notas

{notes}

## Letras / Transcripción

{lyrics}

---

## Leyenda de notación:
- `/0...0/` - Dinámica básica/inicial
- `//1` - Dinámica nivel 1
- `//2` - Dinámica nivel 2
- `//3` - Dinámica nivel 3 (máxima)
- `::` - Indicaciones especiales
'''

# Procesar canciones
canciones_creadas = []
base_dir = 'canciones'

for song in data['songs']:
    has_content = (song.get('lyrics', '').strip() != '' or song.get('notes', '').strip() != '')
    if not has_content:
        continue
    
    title = song['title'].strip()
    artist = song.get('artist', 'Artista Desconocido')
    bpm = song.get('bpm', 120)
    lyrics = song.get('lyrics', '')
    notes = song.get('notes', '')
    
    # Limpiar nombre de carpeta
    folder_name = clean_filename(title)
    folder_path = os.path.join(base_dir, folder_name)
    
    # Crear carpeta si no existe
    os.makedirs(folder_path, exist_ok=True)
    
    # Procesar letras para HTML
    lyrics_html_lines = process_lyrics(lyrics) if lyrics else ['<div class="verso">Sin letras/transcripción</div>']
    
    # HTML de notas si existen
    notes_html = ''
    if notes:
        notes_html = f'''<div class="notes-section">
                <h2>📝 Notas de Batería</h2>
                <div style="white-space: pre-wrap; color: #ddd;">{notes}</div>
            </div>'''
    
    # Crear columnas con el contenido
    columns_html = create_columns(lyrics_html_lines, notes_html)
    
    # Crear archivo HTML
    html_content = HTML_TEMPLATE.format(
        title=title,
        artist=artist,
        bpm=bpm,
        columns_html=columns_html
    )
    
    html_path = os.path.join(folder_path, f'{folder_name}.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    # Crear archivo Markdown
    md_content = MD_TEMPLATE.format(
        title=title,
        artist=artist,
        bpm=bpm,
        notes=notes if notes else 'Sin notas adicionales',
        lyrics=lyrics if lyrics else 'Sin letras/transcripción'
    )
    
    md_path = os.path.join(folder_path, f'{folder_name}.md')
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    canciones_creadas.append({
        'title': title,
        'folder': folder_name,
        'html_path': f'canciones/{folder_name}/{folder_name}.html'
    })
    
    print(f"✓ Creada: {title}")
    print(f"  Carpeta: {folder_path}")
    print(f"  HTML: {html_path}")
    print(f"  MD: {md_path}")
    print()

print(f"\n{'='*60}")
print(f"Total de canciones procesadas: {len(canciones_creadas)}")
print(f"{'='*60}\n")

# Guardar resumen
print("Rutas HTML para usar en la aplicación:")
for cancion in canciones_creadas:
    print(f"  {cancion['title']}: {cancion['html_path']}")
