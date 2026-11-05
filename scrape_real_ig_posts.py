import os
import requests
from playwright.sync_api import sync_playwright

def get_real_ig_posts(handle, brand_id, max_posts=12):
    dir_path = f"assets/instagram/{brand_id}"
    os.makedirs(dir_path, exist_ok=True)
    
    print(f"Fetching real Instagram for @{handle}...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 1200},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        )
        page = context.new_page()
        page.goto(f'https://www.instagram.com/{handle}/', wait_until='domcontentloaded')
        page.wait_for_timeout(4000)

        # Extract avatar
        avatar_src = page.evaluate("""() => {
            const img = document.querySelector('header img');
            return img ? img.src : null;
        }""")

        # Extract post links & images
        posts_data = page.evaluate("""() => {
            const results = [];
            // Select all post links (href includes /p/ or /reel/)
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

        browser.close()

    print(f"Extracted {len(posts_data)} real post entries from @{handle}")

    # Download images locally
    saved_posts = []
    
    # Download avatar if available
    avatar_path = None
    if avatar_src:
        try:
            r = requests.get(avatar_src, timeout=10)
            if r.status_code == 200:
                avatar_path = f"{dir_path}/avatar.jpg"
                with open(avatar_path, "wb") as f:
                    f.write(r.content)
                print(f"  Saved avatar -> {avatar_path}")
        except Exception as e:
            print("Avatar error:", e)

    for i, p in enumerate(posts_data[:max_posts]):
        img_url = p["src"]
        post_url = p["url"]
        alt_text = p["alt"]
        local_img = f"{dir_path}/post_{i+1}.jpg"

        try:
            resp = requests.get(img_url, timeout=10)
            if resp.status_code == 200:
                with open(local_img, "wb") as f:
                    f.write(resp.content)
                
                is_reel = "/reel/" in post_url or "video" in alt_text.lower()
                saved_posts.append({
                    "id": f"{brand_id}-{i+1}",
                    "local_img": local_img,
                    "url": post_url,
                    "alt": alt_text,
                    "tipo": "Reel" if is_reel else "Foto",
                    "formato": "Vídeo" if is_reel else "Foto"
                })
                print(f"  Saved post #{i+1} -> {local_img}")
        except Exception as e:
            print(f"  Error downloading post #{i+1}:", e)

    return {
        "avatar": avatar_path,
        "posts": saved_posts
    }

if __name__ == "__main__":
    res = get_real_ig_posts("thursdayboots", "thursday", 12)
    print("FINISHED:", len(res["posts"]), "posts downloaded")
