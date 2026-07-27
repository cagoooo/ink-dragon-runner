import os
from PIL import Image, ImageDraw, ImageFont

public_dir = r'h:\Dragon\artifacts\ink-dragon-runner\public'
dist_public_dir = r'h:\Dragon\artifacts\ink-dragon-runner\dist\public'
os.makedirs(public_dir, exist_ok=True)
os.makedirs(dist_public_dir, exist_ok=True)

# 1. 產生 favicon.svg
svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="46" fill="#F5F0E8" stroke="#3D2B1F" stroke-width="4"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#E34234" stroke-width="2" stroke-dasharray="6 4"/>
  <path d="M25,60 C 35,30 65,30 75,60 C 65,52 50,58 35,55 C 30,68 25,65 25,60 Z" fill="#2C1810" />
  <circle cx="62" cy="42" r="4" fill="#E34234" />
  <path d="M 65 35 Q 75 25 80 30 Q 75 35 70 38" fill="#2C1810" />
  <circle cx="30" cy="40" r="2.5" fill="#2C1810" />
  <circle cx="22" cy="48" r="1.8" fill="#2C1810" />
  <circle cx="78" cy="65" r="2" fill="#E34234" />
</svg>"""

for d in [public_dir, dist_public_dir]:
    with open(os.path.join(d, 'favicon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_content)

# 2. 產生 1200x630 og-image.png
width, height = 1200, 630
img = Image.new('RGB', (width, height), color='#F5F0E8')
draw = ImageDraw.Draw(img)

# 繪製裝飾水墨邊框
draw.rectangle([20, 20, width-20, height-20], outline='#3D2B1F', width=6)
draw.rectangle([32, 32, width-32, height-32], outline='#E34234', width=2)

# 繪製背景裝飾墨滴與圓形印章背景
draw.ellipse([800, 100, 1100, 400], fill='#EAE2D5', outline='#D8C8B0', width=2)

# 朱紅印章
draw.rectangle([90, 80, 210, 200], fill='#E34234')

# 繪製文字 (粗體通用文字)
try:
    font_title = ImageFont.truetype('msjh.ttc', 68)
    font_sub = ImageFont.truetype('msjh.ttc', 36)
    font_badge = ImageFont.truetype('msjh.ttc', 26)
    font_seal = ImageFont.truetype('msjh.ttc', 36)
except Exception:
    font_title = font_sub = font_badge = font_seal = ImageFont.load_default()

draw.text((115, 95), '墨龍\n奔跑', fill='#FFFFFF', font=font_seal)
draw.text((240, 85), '仙人掌大逃亡', fill='#8B4513', font=font_title)
draw.text((240, 175), '奔跑吧小墨龍', fill='#2C1810', font=font_title)

draw.text((90, 300), '🐉 全新東方水墨風網頁無盡跑酷遊戲', fill='#3D2B1F', font=font_sub)
draw.text((90, 365), '🌵 靈敏操控小墨龍跳躍與俯衝，穿越重重仙人掌！', fill='#5A3E30', font=font_sub)
draw.text((90, 430), '📱 電腦鍵盤 / 手機觸控全支援 ‧ 即刻免費挑戰最高分', fill='#5A3E30', font=font_sub)

# 底部標籤
draw.rectangle([90, 510, 520, 570], fill='#3D2B1F')
draw.text((110, 525), '✨ 阿凱老師作品 | cagoooo', fill='#F5F0E8', font=font_badge)

# 畫水墨小龍意象圖解
draw.pieslice([850, 180, 1050, 380], start=180, end=360, fill='#2C1810')
draw.ellipse([980, 210, 1010, 240], fill='#E34234')

for d in [public_dir, dist_public_dir]:
    img.save(os.path.join(d, 'og-image.png'), 'PNG')
    # 產生 192x192 favicon.png
    favicon_png = img.crop((80, 70, 580, 570)).resize((192, 192))
    favicon_png.save(os.path.join(d, 'favicon.png'), 'PNG')
    favicon_png.save(os.path.join(d, 'apple-touch-icon.png'), 'PNG')

print('Successfully generated og-image.png, favicon.svg, favicon.png, and apple-touch-icon.png!')
