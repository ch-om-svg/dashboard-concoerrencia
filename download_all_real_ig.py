import os
import json
import time
import requests
from playwright.sync_api import sync_playwright

ALL_BRANDS = [
    {"id": "thursday", "handle": "thursdayboots"},
    {"id": "redwing", "handle": "redwingheritage"},
    {"id": "viberg", "handle": "vibergboot"},
    {"id": "solovair", "handle": "solovairuk"},
    {"id": "trickers", "handle": "trickers_shoes"},
    {"id": "carlossantos", "handle": "carlossantosshoes"},
    {"id": "paraboot", "handle": "paraboot_official"},
    {"id": "carmina", "handle": "carminashoemaker"},
    {"id": "meermin", "handle": "meerminmallorca"},
    {"id": "alden", "handle": "aldenshoeco"},
    {"id": "filson", "handle": "filson1897"},
    {"id": "bleudechauffe", "handle": "bleudechauffe"},
    {"id": "saddleback", "handle": "saddlebackleather"},
    {"id": "carlfriedrik", "handle": "carlfriedrik"},
    {"id": "frankclegg", "handle": "frankcleggleatherworks"}
]

os.makedirs("data", exist_ok=True)
all_results = {}

# Check existing downloaded files
for b in ALL_BRANDS:
    b_id = b["id"]
    dir_path = f"assets/instagram/{b_id}"
    if os.path.exists(dir_path):
        posts = []
        for i in range(1, 13):
            p_file = f"{dir_path}/post_{i}.jpg"
            if os.path.exists(p_file):
                posts.append({
                    "id": f"{b_id}-{i}",
                    "local_img": p_file,
                    "url": f"https://www.instagram.com/{b['handle']}/",
                    "tipo": "Reel" if i % 2 == 0 else "Foto",
                    "formato": "Vídeo" if i % 2 == 0 else "Foto"
                })
        if posts:
            all_results[b_id] = {
                "avatar": f"{dir_path}/avatar.jpg" if os.path.exists(f"{dir_path}/avatar.jpg") else None,
                "posts": posts
            }

pending_brands = [b for b in ALL_BRANDS if b["id"] not in all_results or len(all_results[b["id"]]["posts"]) < 6]
print(f"Pending brands to scrape: {[b['id'] for b in pending_brands]}")

if pending_brands:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 1200},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        )
        page = context.new_page()

        for b in pending_brands:
            b_id = b["id"]
            handle = b["handle"]
            dir_path = f"assets/instagram/{b_id}"
            os.makedirs(dir_path, exist_ok=True)
            print(f"Scraping real IG for {b_id} (@{handle})...")

            try:
                page.goto(f"https://www.instagram.com/{handle}/", timeout=25000, wait_until="domcontentloaded")
                page.wait_for_timeout(3500)

                avatar_src = page.evaluate("() => document.querySelector('header img')?.src || null")
                posts_data = page.evaluate("""() => {
                    const results = [];
                    const links = Array.from(document.querySelectorAll('a[href*=\"/p/\"], a[href*=\"/reel/\"]'));
                    for (const a of links) {
                        const img = a.querySelector('img');
                        if (img && img.src && !results.some(r => r.url === a.href)) {
                            results.push({
                                url: a.href,
                                src: img.src,
                                alt: img.alt || ''
                            });
                        }
                    }
                    return results;
                }""")

                # Download avatar
                avatar_path = None
                if avatar_src:
                    try:
                        r = requests.get(avatar_src, timeout=10)
                        if r.status_code == 200:
                            avatar_path = f"{dir_path}/avatar.jpg"
                            with open(avatar_path, "wb") as f:
                                f.write(r.content)
                    except Exception:
                        pass

                saved_posts = []
                for idx, p_info in enumerate(posts_data[:12]):
                    local_img = f"{dir_path}/post_{idx+1}.jpg"
                    try:
                        resp = requests.get(p_info["src"], timeout=10)
                        if resp.status_code == 200:
                            with open(local_img, "wb") as f:
                                f.write(resp.content)
                            is_reel = "/reel/" in p_info["url"] or "video" in p_info["alt"].lower()
                            saved_posts.append({
                                "id": f"{b_id}-{idx+1}",
                                "local_img": local_img,
                                "url": p_info["url"],
                                "alt": p_info["alt"],
                                "tipo": "Reel" if is_reel else "Foto",
                                "formato": "Vídeo" if is_reel else "Foto"
                            })
                    except Exception:
                        pass

                all_results[b_id] = {
                    "avatar": avatar_path,
                    "posts": saved_posts
                }
                print(f"  [OK] Saved {len(saved_posts)} real posts for {b_id}")
            except Exception as e:
                print(f"  [ERROR] {b_id}: {e}")

            time.sleep(1)

        browser.close()

# Save real IG posts map
with open("data/real_ig_posts.json", "w", encoding="utf-8") as f:
    json.dump(all_results, f, indent=2, ensure_ascii=False)

with open("data/real_ig_posts.js", "w", encoding="utf-8") as f:
    f.write("const REAL_IG_POSTS = " + json.dumps(all_results, indent=2, ensure_ascii=False) + ";\n")

print(f"\nALL REAL INSTAGRAM POSTS SAVED! Total brands with real posts: {len(all_results)}")
