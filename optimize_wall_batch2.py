from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/upload')
out = Path('/home/ubuntu/webdev-static-assets/wall-photos-batch2-webp')
out.mkdir(parents=True, exist_ok=True)
files = [
    'IMG_3190.jpeg', 'IMG_2798.jpeg', 'IMG_1383.jpeg', 'IMG_3030.jpeg',
    'IMG_9893.jpeg', 'IMG_9892.jpeg', 'IMG_9891.jpeg', 'IMG_9890.jpeg',
    'IMG_5428.jpeg', 'IMG_5397.jpeg', 'IMG_2888.jpeg', 'IMG_2315.JPG',
    'IMG_1765.jpeg', 'IMG_1732.jpeg', 'IMG_1269.PNG', 'IMG_2065.jpeg',
    'IMG_6164.jpeg', '8504F9D6-69E1-4E1B-9E6C-6519A0297A05.jpg',
    'IMG_9889.jpeg', 'IMG_6178.jpeg', 'IMG_6181.jpeg', 'IMG_6179.jpeg',
]
for index, name in enumerate(files, start=13):
    with Image.open(source / name) as image:
        image = image.convert('RGB')
        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        image.save(out / f'wall-{index:02d}.webp', 'WEBP', quality=82, method=6)
print(f'converted {len(files)} unique wall photos')
print(f'bytes {sum(p.stat().st_size for p in out.glob("*.webp"))}')
