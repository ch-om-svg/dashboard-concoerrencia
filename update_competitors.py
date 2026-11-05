import os
import re
import json
import time
import datetime
from playwright.sync_api import sync_playwright

BRANDS = [
    {
        "id": "thursday",
        "name": "Thursday Boot Company",
        "category": "botas",
        "site_url": "https://thursdayboots.com/",
        "catalog_url": "https://thursdayboots.com/collections/boots",
        "ig_handle": "thursdayboots"
    },
    {
        "id": "redwing",
        "name": "Red Wing Heritage",
        "category": "botas",
        "site_url": "https://eu.redwingshoes.com/",
        "catalog_url": "https://eu.redwingshoes.com/collections/heritage",
        "ig_handle": "redwingheritage"
    },
    {
        "id": "viberg",
        "name": "Viberg Boot",
        "category": "botas",
        "site_url": "https://viberg.com/",
        "catalog_url": "https://viberg.com/collections/footwear",
        "ig_handle": "vibergboot"
    },
    {
        "id": "solovair",
        "name": "Solovair",
        "category": "botas",
        "site_url": "https://uk.nps-solovair.com/",
        "catalog_url": "https://uk.nps-solovair.com/collections/mens",
        "ig_handle": "solovairuk"
    },
    {
        "id": "trickers",
        "name": "Tricker's",
        "category": "botas",
        "site_url": "https://trickers.com/",
        "catalog_url": "https://trickers.com/collections/mens-boots",
        "ig_handle": "trickers_shoes"
    },
    {
        "id": "carlossantos",
        "name": "Carlos Santos Shoes",
        "category": "sapatos",
        "site_url": "https://www.santosshoes.com/",
        "catalog_url": "https://www.santosshoes.com/en/shop/",
        "ig_handle": "carlossantosshoes"
    },
    {
        "id": "paraboot",
        "name": "Paraboot",
        "category": "sapatos",
        "site_url": "https://www.paraboot.com/",
        "catalog_url": "https://www.paraboot.com/homme",
        "ig_handle": "paraboot_official"
    },
    {
        "id": "carmina",
        "name": "Carmina Shoemaker",
        "category": "sapatos",
        "site_url": "https://www.carminashoemaker.com/",
        "catalog_url": "https://www.carminashoemaker.com/shoes",
        "ig_handle": "carminashoemaker"
    },
    {
        "id": "meermin",
        "name": "Meermin Mallorca",
        "category": "sapatos",
        "site_url": "https://meermin.com/",
        "catalog_url": "https://meermin.com/collections/mens-shoes",
        "ig_handle": "meerminmallorca"
    },
    {
        "id": "alden",
        "name": "Alden Shoe Company",
        "category": "sapatos",
        "site_url": "https://www.aldenshoe.com/",
        "catalog_url": "https://www.aldenshoe.com/",
        "ig_handle": "aldenshoeco"
    },
    {
        "id": "filson",
        "name": "Filson",
        "category": "malas",
        "site_url": "https://www.filson.com/",
        "catalog_url": "https://www.filson.com/bags-luggage.html",
        "ig_handle": "filson1897"
    },
    {
        "id": "bleudechauffe",
        "name": "Bleu de Chauffe",
        "category": "malas",
        "site_url": "https://www.bleu-de-chauffe.com/",
        "catalog_url": "https://www.bleu-de-chauffe.com/fr/11-sacs-en-cuir-homme",
        "ig_handle": "bleudechauffe"
    },
    {
        "id": "saddleback",
        "name": "Saddleback Leather",
        "category": "malas",
        "site_url": "https://saddlebackleather.com/",
        "catalog_url": "https://saddlebackleather.com/leather-briefcases",
        "ig_handle": "saddlebackleather"
    },
    {
        "id": "carlfriedrik",
        "name": "Carl Friedrik",
        "category": "malas",
        "site_url": "https://carlfriedrik.com/",
        "catalog_url": "https://carlfriedrik.com/collections/briefcases",
        "ig_handle": "carlfriedrik"
    },
    {
        "id": "frankclegg",
        "name": "Frank Clegg Leatherworks",
        "category": "malas",
        "site_url": "https://frankcleggleatherworks.com/",
        "catalog_url": "https://frankcleggleatherworks.com/leather-bags.html",
        "ig_handle": "frankcleggleatherworks"
    }
]

# Tentar carregar marcas dinamicamente a partir dos dados consolidados (90 marcas)
try:
    if os.path.exists("verified_brands_info.json"):
        with open("verified_brands_info.json", "r", encoding="utf-8") as f:
            v_data = json.load(f)
            dynamic_brands = []
            for name, info in v_data.items():
                cat = info.get("categories", ["botas"])[0]
                slug = re.sub(r'[^a-z0-9]', '', name.lower())[:15]
                dynamic_brands.append({
                    "id": slug,
                    "name": name,
                    "category": cat,
                    "site_url": info.get("site", ""),
                    "catalog_url": info.get("site", ""),
                    "ig_handle": info.get("ig_handle", "")
                })
            if len(dynamic_brands) > 15:
                BRANDS = dynamic_brands
except Exception as e:
    pass
os.makedirs("data", exist_ok=True)

def parse_ig_meta(desc_text):
    """
    Exemplo: '1M Followers, 229 Following, 2,873 Posts - Thursday Boot Company (@thursdayboots) on Instagram: ...'
    """
    followers = None
    following = None
    posts = None
    
    m_f = re.search(r'([\d\.,KMkm]+)\s+Followers', desc_text, re.IGNORECASE)
    if m_f:
        followers = m_f.group(1)
        
    m_fg = re.search(r'([\d\.,KMkm]+)\s+Following', desc_text, re.IGNORECASE)
    if m_fg:
        following = m_fg.group(1)
        
    m_p = re.search(r'([\d\.,KMkm]+)\s+Posts', desc_text, re.IGNORECASE)
    if m_p:
        posts = m_p.group(1)
        
    return followers, following, posts

def update_brand(b, page):
    print(f"\n--- ATUALIZANDO: {b['name']} ---")
    data_res = {
        "id": b["id"],
        "name": b["name"],
        "updated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # 1. CAPTURAR LOJA ONLINE (HERO)
    try:
        print(f"  [1/3] A aceder à Loja Online: {b['site_url']}...")
        page.goto(b["site_url"], timeout=22000, wait_until="domcontentloaded")
        page.wait_for_timeout(2500)
        
        # Tentar fechar cookie banners
        try:
            page.evaluate("""() => {
                const selectors = ['#onetrust-accept-btn-handler', '.cookie-accept', '#cookie-banner', '.cc-accept', 'button[id*=\"cookie\"]', 'button[class*=\"cookie\"]'];
                for (const s of selectors) {
                    const el = document.querySelector(s);
                    if (el) el.click();
                }
            }""")
            page.wait_for_timeout(500)
        except Exception:
            pass

        hero_path = f"assets/screenshots/{b['id']}_hero.jpg"
        page.screenshot(path=hero_path, type="jpeg", quality=82)
        data_res["hero_screenshot"] = hero_path
        print(f"  [OK] Hero da Loja guardado: {hero_path}")
    except Exception as e:
        print(f"  [AVISO] Erro na Loja: {e}")

    # 2. CAPTURAR CATÁLOGO / PRODUTOS
    if b.get("catalog_url") and b["catalog_url"] != b["site_url"]:
        try:
            print(f"  [2/3] A aceder ao Catálogo: {b['catalog_url']}...")
            page.goto(b["catalog_url"], timeout=22000, wait_until="domcontentloaded")
            page.wait_for_timeout(2500)
            catalog_path = f"assets/screenshots/{b['id']}_catalog.jpg"
            page.screenshot(path=catalog_path, type="jpeg", quality=82)
            data_res["catalog_screenshot"] = catalog_path
            print(f"  [OK] Catálogo guardado: {catalog_path}")
        except Exception as e:
            print(f"  [AVISO] Erro no Catálogo: {e}")

    # 3. EXTRAIR INSTAGRAM (SEGUIDORES, POSTS, BIO E SCREENSHOT)
    try:
        ig_url = f"https://www.instagram.com/{b['ig_handle']}/"
        print(f"  [3/3] A extrair dados do Instagram: @{b['ig_handle']}...")
        page.goto(ig_url, timeout=22000, wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

        meta_desc = page.evaluate("() => document.querySelector('meta[name=\"description\"]')?.content || ''")
        followers, following, posts = parse_ig_meta(meta_desc)

        if followers:
            print(f"  [OK] Instagram Atualizado: {followers} seguidores | {posts} posts | {following} a seguir")
            data_res["ig_followers"] = followers
            data_res["ig_posts"] = posts
            data_res["ig_following"] = following
        else:
            print("  [INFO] Metadados directos protegidos, a guardar captura de ecrã...")

        ig_path = f"assets/screenshots/{b['id']}_ig.jpg"
        page.screenshot(path=ig_path, type="jpeg", quality=82)
        data_res["ig_screenshot"] = ig_path
        print(f"  [OK] Screenshot do Instagram guardado: {ig_path}")
    except Exception as e:
        print(f"  [AVISO] Erro no Instagram: {e}")

    return data_res

def main(selected_brand=None):
    print("=" * 60)
    print("INICIANDO SINCRONIZAÇÃO AUTOMÁTICA DA CONCORRÊNCIA")
    print(f"Data/Hora: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 60)

    target_brands = BRANDS
    if selected_brand:
        target_brands = [b for b in BRANDS if b["id"] == selected_brand or b["ig_handle"] == selected_brand]
        if not target_brands:
            print(f"Marca '{selected_brand}' não encontrada. A executar para todas.")
            target_brands = BRANDS

    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 850},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        for b in target_brands:
            res = update_brand(b, page)
            results.append(res)
            time.sleep(1)

        browser.close()

    # Guardar estado de sincronização
    sync_report = {
        "last_sync": datetime.datetime.now().strftime("%d/%m/%Y às %H:%M:%S"),
        "total_brands_updated": len(results),
        "brands": results
    }
    with open("data/sync_status.json", "w", encoding="utf-8") as f:
        json.dump(sync_report, f, indent=2, ensure_ascii=False)

    with open("data/sync_status.js", "w", encoding="utf-8") as f:
        f.write("const SYNC_STATUS = " + json.dumps(sync_report, indent=2, ensure_ascii=False) + ";\n")

    print("\n" + "=" * 60)
    print("SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!")
    print(f"Relatório guardado em: data/sync_status.json")
    print("=" * 60)

if __name__ == "__main__":
    import sys
    brand_arg = sys.argv[1] if len(sys.argv) > 1 else None
    main(brand_arg)
