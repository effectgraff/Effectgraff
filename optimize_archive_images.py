from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/webdev-static-assets/portfolio-pages')
out = Path('/home/ubuntu/webdev-static-assets/portfolio-pages-webp')
out.mkdir(parents=True, exist_ok=True)

for jpg in sorted(source.glob('page-*.jpg')):
    with Image.open(jpg) as image:
        image = image.convert('RGB')
        image.save(out / f'{jpg.stem}.webp', 'WEBP', quality=78, method=6)

print(f'converted {len(list(out.glob("*.webp")))} pages')
print(f'bytes {sum(p.stat().st_size for p in out.glob("*.webp"))}')
