from PIL import Image, ImageDraw
import math, os

S = 512
img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# rounded dark panel background
def rounded(draw, box, r, fill):
    x0, y0, x1, y1 = box
    draw.rectangle([x0+r, y0, x1-r, y1], fill=fill)
    draw.rectangle([x0, y0+r, x1, y1-r], fill=fill)
    for cx, cy in [(x0+r, y0+r), (x1-r, y0+r), (x0+r, y1-r), (x1-r, y1-r)]:
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=fill)

# vertical gradient panel
panel = Image.new("RGBA", (S, S), (0, 0, 0, 0))
pd = ImageDraw.Draw(panel)
for y in range(S):
    t = y / S
    r = int(5 + t * 8); g = int(9 + t * 20); b = int(14 + t * 34)
    pd.line([(0, y), (S, y)], fill=(r, g, b, 255))
mask = Image.new("L", (S, S), 0)
rounded(ImageDraw.Draw(mask), [24, 24, S-24, S-24], 86, 255)
img.paste(panel, (0, 0), mask)

cyan = (25, 230, 200, 255)
blue = (43, 183, 255, 255)
dim = (15, 60, 70, 255)

# outer hexagon ring (cyber sigil)
cx, cy, R = S/2, S/2, 168
def hexpts(rad, rot=math.pi/6):
    return [(cx + rad*math.cos(rot + i*math.pi/3), cy + rad*math.sin(rot + i*math.pi/3)) for i in range(6)]
d.line(hexpts(R) + [hexpts(R)[0]], fill=dim, width=10, joint="curve")
d.line(hexpts(R) + [hexpts(R)[0]], fill=blue, width=4, joint="curve")

# inner stealth "mask / visor" glyph — angular shadow operative
glyph = [
    (cx-86, cy-54), (cx+86, cy-54), (cx+70, cy-18),
    (cx+18, cy-18), (cx+10, cy+14), (cx-10, cy+14),
    (cx-18, cy-18), (cx-70, cy-18)
]
d.polygon(glyph, fill=(8, 16, 22, 255), outline=cyan)
# visor slit (neon)
d.line([(cx-64, cy-36), (cx+64, cy-36)], fill=cyan, width=8)
d.line([(cx-58, cy-36), (cx+58, cy-36)], fill=(180, 255, 245, 255), width=3)
# downward shadow fang
d.polygon([(cx-14, cy+14), (cx+14, cy+14), (cx, cy+70)], fill=cyan)

# corner ticks
for (mx, my) in [(64, 64), (S-64, 64), (64, S-64), (S-64, S-64)]:
    d.line([(mx-18, my), (mx+18, my)], fill=blue, width=4)
    d.line([(mx, my-18), (mx, my+18)], fill=blue, width=4)

out = os.path.dirname(os.path.abspath(__file__))
img.save(os.path.join(out, "icon.png"))
sizes = [(256,256),(128,128),(64,64),(48,48),(32,32),(16,16)]
img.save(os.path.join(out, "icon.ico"), sizes=sizes)
print("icon.png + icon.ico written:", out)
