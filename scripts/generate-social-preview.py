"""Generate the branded Open Graph graphic. Optional tooling: Python + Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets'
WIDTH, HEIGHT = 1200, 630
image = Image.new('RGB', (WIDTH, HEIGHT), '#05070d')
pixels = image.load()
for y in range(HEIGHT):
    for x in range(WIDTH):
        light = math.exp(-(((x - 900) / 340) ** 2 + ((y - 270) / 330) ** 2))
        pixels[x, y] = (int(5 + 7 * light), int(7 + 26 * light), int(13 + 43 * light))
image = image.convert('RGBA')
draw = ImageDraw.Draw(image)
draw.ellipse((700, 85, 1320, 545), outline=(87, 141, 158, 36), width=1)
draw.arc((645, 160, 1260, 520), 185, 345, fill=(125, 226, 209, 70), width=2)

def font(size, display=False):
    result = ImageFont.truetype(str(ASSETS / ('BricolageGrotesque.ttf' if display else 'DMSans.ttf')), size)
    if display:
        result.set_variation_by_axes([min(size, 96), 650, 100])
    return result

for position, text, size, color, display in [
    ((65, 48), 'ginhawa.', 45, '#b3e4bd', True),
    ((65, 182), 'Find your calm,', 65, '#f0f4ff', True),
    ((65, 258), 'one moment', 65, '#b3e4bd', True),
    ((65, 334), 'at a time.', 65, '#b3e4bd', True),
    ((68, 454), 'Understand your stress.', 23, '#c1ccdf', False),
    ((68, 489), 'Find small steps toward a calmer day.', 23, '#c1ccdf', False),
    ((68, 567), 'ginhawa-ph.vercel.app', 18, '#8fa8bb', False),
]:
    draw.text(position, text, font=font(size, display), fill=color)

phone = Image.open(ROOT / 'public/screens/darkmode/1.webp').convert('RGBA').resize((206, 458), Image.Resampling.LANCZOS)
mask = Image.new('L', phone.size, 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, 205, 457), radius=23, fill=255)
phone.putalpha(mask)
shadow = Image.new('RGBA', (WIDTH, HEIGHT))
ImageDraw.Draw(shadow).rounded_rectangle((838, 73, 1069, 563), radius=31, fill=(0, 0, 0, 170))
image.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(19)))
frame = Image.new('RGBA', (220, 472))
ImageDraw.Draw(frame).rounded_rectangle((0, 0, 219, 471), radius=29, fill='#111b2e', outline='#6f859f', width=2)
frame.alpha_composite(phone, (7, 7))
image.alpha_composite(frame, (846, 62))
chika = Image.open(ASSETS / 'chika-front-bow-still.webp').convert('RGBA')
chika.thumbnail((233, 254), Image.Resampling.LANCZOS)
image.alpha_composite(chika, (700, 337))
image.convert('RGB').save(ASSETS / 'social-preview-v2.png', optimize=True)
