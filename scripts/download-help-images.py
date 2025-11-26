#!/usr/bin/env python3
"""
Script para descargar las imágenes de los artículos de ayuda desde los JSONs
"""
import json
import os
import requests
from pathlib import Path
from urllib.parse import urljoin

BASE_URL = "https://formacion-inversion.bancosantander.es/eci/"
HELP_JSONS_DIR = Path(__file__).parent.parent / "public" / "help-jsons"
HELP_IMAGES_DIR = Path(__file__).parent.parent / "public" / "help-images"
HELP_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

def download_image(url, output_path):
    """Descarga una imagen desde una URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"Error descargando {url}: {e}")
        return False

def main():
    """Función principal"""
    image_urls = set()
    
    # Leer todos los JSONs y extraer URLs de imágenes
    print("Leyendo JSONs...")
    for json_file in HELP_JSONS_DIR.glob("*.json"):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Extraer UrlImage del artículo principal
            if data.get('UrlImage'):
                url = data['UrlImage']
                if not url.startswith('http'):
                    url = urljoin(BASE_URL, url)
                image_urls.add(url)
            
            # Extraer UrlImage de RelatedContents
            for related in data.get('RelatedContents', []):
                if related.get('UrlImage'):
                    url = related['UrlImage']
                    if not url.startswith('http'):
                        url = urljoin(BASE_URL, url)
                    image_urls.add(url)
                    
        except Exception as e:
            print(f"Error leyendo {json_file}: {e}")
    
    print(f"Encontradas {len(image_urls)} URLs de imágenes únicas")
    
    # Descargar imágenes
    downloaded = 0
    failed = 0
    
    for url in image_urls:
        # Extraer nombre del archivo de la URL
        filename = url.split('/')[-1]
        if not filename:
            filename = f"image_{downloaded + failed}.jpg"
        
        output_path = HELP_IMAGES_DIR / filename
        
        # Si ya existe, saltar
        if output_path.exists():
            print(f"Ya existe: {filename}")
            continue
        
        print(f"Descargando: {filename}...")
        if download_image(url, output_path):
            downloaded += 1
            print(f"✓ Descargado: {filename}")
        else:
            failed += 1
    
    print(f"\nResumen:")
    print(f"  Descargadas: {downloaded}")
    print(f"  Fallidas: {failed}")
    print(f"  Total: {len(image_urls)}")

if __name__ == "__main__":
    main()

