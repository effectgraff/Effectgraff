from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

source = Path('/home/ubuntu/webdev-static-assets/portfolio-pages')
files = sorted(source.glob('page-*.jpg'))
thumb_w, thumb_h = 180, 240
cols = 4
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * thumb_w, rows * (thumb_h + 28)), '#eee8e0')
for idx, path in enumerate(files):
    image = Image.open(path).convert('RGB')
    thumb = ImageOps.contain(image, (thumb_w - 14, thumb_h - 14))
    x = (idx % cols) * thumb_w
    y = (idx // cols) * (thumb_h + 28)
    sheet.paste(thumb, (x + (thumb_w - thumb.width) // 2, y + 4))
    draw = ImageDraw.Draw(sheet)
    draw.text((x + 8, y + thumb_h + 5), path.stem, fill='#171519')
sheet.save('/home/ubuntu/webdev-static-assets/effectgraff-contact-sheet.jpg', quality=88)
