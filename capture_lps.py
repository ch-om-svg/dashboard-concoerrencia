import os
import json
import time
from playwright.sync_api import sync_playwright

brands = [
    # BOTAS
    {"id": "redwing", "name": "Red Wing Heritage", "category": "botas", "url": "https://eu.redwingshoes.com/"},
    {"id": "thursday", "name": "Thursday Boot Company", "category": "botas", "url": "https://thursdayboots.com/"},
    {"id": "viberg", "name": "Viberg", "category": "botas", "url": "https://viberg.com/"},
    {"id": "solovair", "name": "Solovair", "category": "botas", "url": "https://uk.nps-solovair.com/"},
    {"id": "trickers", "name": "Tricker's", "category": "botas", "url": "https://trickers.com/"},
    
    # SAPATOS
    {"id": "carlossantos", "name": "Carlos Santos Shoes", "category": "sapatos", "url": "https://carlossantosshoes.com/"},
    {"id": "paraboot", "name": "Paraboot", "category": "sapatos", "url": "https://www.paraboot.com/"},
    {"id": "carmina", "name": "Carmina Shoemaker", "category": "sapatos", "url": "https://www.carminashoemaker.com/"},
    {"id": "meermin", "name": "Meermin Mallorca", "category": "sapatos", "url": "https://meermin.com/"},
    {"id": "alden", "name": "Alden Shoe Company", "category": "sapatos", "url": "https://www.aldenshoe.com/"},
    
    # MALAS
    {"id": "filson", "name": "Filson", "category": "malas", "url": "https://www.filson.com/"},
    {"id": "bleudechauffe", "name": "Bleu de Chauffe", "category": "malas", "url": "https://www.bleu-de-chauffe.com/"},
    {"id": "saddleback", "name": "Saddleback Leather", "category": "malas", "url": "https://saddlebackleather.com/"},
    {"id": "carlfriedrik", "name": "Carl Friedrik", "category": "malas", "url": "https://carlfriedrik.com/"},
    {"id": "frankclegg", "name": "Frank Clegg Leatherworks", "category": "malas", "url": "https://frankcleggleatherworks.com/"}
]

os.makedirs("assets/screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(
        viewport={"width": 1280, "height": 800},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
    
    for b in brands:
        out_path = f"assets/screenshots/{b['id']}.jpg"
        print(f"Capturing {b['name']} -> {out_path}...")
        try:
            page = context.new_page()
            page.goto(b["url"], timeout=25000, wait_until="domcontentloaded")
            page.wait_for_timeout(2500)
            
            # Dismiss typical cookie banners if visible
            try:
                page.evaluate("""() => {
                    const selectors = ['#onetrust-accept-btn-handler', '.cookie-accept', '#cookie-banner', '.cc-accept', 'button[id*="cookie"]', 'button[class*="cookie"]'];
                    for (const s of selectors) {
                        const el = document.querySelector(s);
                        if (el) el.click();
                    }
                }""")
                page.wait_for_timeout(500)
            except Exception:
                pass
                
            page.screenshot(path=out_path, type="jpeg", quality=82)
            print(f"[OK] Saved {b['id']}.jpg")
            page.close()
        except Exception as e:
            print(f"[ERROR] Error capturing {b['name']}: {e}")
            try:
                page.close()
            except Exception:
                pass

    browser.close()
    print("ALL DONE")
