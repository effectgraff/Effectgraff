from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/upload')
out = Path('/home/ubuntu/webdev-static-assets/wall-photos-webp')
out.mkdir(parents=True, exist_ok=True)
files = ['IMG_2012.JPG', 'IMG_0902.jpeg', 'IMG_0050.JPG', 'IMG_0048.JPG', 'IMG_9871.JPG', 'IMG_9870.JPG', 'IMG_9869.JPG', 'IMG_9640.JPG', 'IMG_9410.jpeg', 'IMG_8540.JPG', 'IMG_4968.jpeg', 'IMG_4349.jpeg']
for name in files:
    with Image.open(source / name) as image:
        image = image.convert('RGB')
        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        image.save(out / f'{Path(name).stem.lower()}.webp', 'WEBP', quality=82, method=6)
print(f'converted {len(files)} wall photos')
print(f'bytes {sum(p.stat().st_size for p in out.glob("*.webp"))}')
