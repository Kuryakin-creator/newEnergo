from collections import OrderedDict, deque
from pathlib import Path
import json

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
SOURCE = Path(r"C:\Users\ORLOW\AppData\Local\Temp\codex-clipboard-c603aeb6-7bd7-4048-b587-444aded4c478.png")
DATA = ROOT / "assets" / "data" / "geography-map.json"
OUTPUT = ROOT / "assets" / "images" / "geography-russia-west-imagegen-next.png"
DIAGNOSTIC = ROOT / "geography-map-diagnostic.png"
ACCENT = np.array([244, 134, 18], dtype=np.uint8)
ORDER = [
    "murmansk", "leningrad", "vologda", "smolensk", "tver", "yaroslavl",
    "moscow", "vladimir", "nizhny", "bryansk", "oryol", "tula", "ryazan",
    "lipetsk", "tambov", "voronezh", "volgograd",
]


def nearest(mask, x, y, limit=140):
    h, w = mask.shape
    x, y = int(round(x)), int(round(y))
    if 0 <= x < w and 0 <= y < h and mask[y, x]:
        return x, y
    for radius in range(1, limit + 1):
        x0, x1 = max(0, x - radius), min(w - 1, x + radius)
        y0, y1 = max(0, y - radius), min(h - 1, y + radius)
        for xx in range(x0, x1 + 1):
            if mask[y0, xx]: return xx, y0
            if mask[y1, xx]: return xx, y1
        for yy in range(y0 + 1, y1):
            if mask[yy, x0]: return x0, yy
            if mask[yy, x1]: return x1, yy
    raise RuntimeError(f"No map interior near {(x, y)}")


def component_from_seed(mask, seed):
    h, w = mask.shape
    component = np.zeros_like(mask)
    queue = deque([seed])
    component[seed[1], seed[0]] = True
    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and mask[ny, nx] and not component[ny, nx]:
                component[ny, nx] = True
                queue.append((nx, ny))
    return component


def deepest_point(component):
    current = Image.fromarray(component.astype(np.uint8) * 255, "L")
    last = component
    depth = 0
    while True:
        eroded = current.filter(ImageFilter.MinFilter(3))
        arr = np.asarray(eroded) > 0
        if not arr.any():
            ys, xs = np.nonzero(last)
            return int(round(xs.mean())), int(round(ys.mean())), depth
        current, last = eroded, arr
        depth += 1


source = Image.open(SOURCE).convert("RGBA")
rgba = np.array(source)
rgb, alpha = rgba[:, :, :3], rgba[:, :, 3]
r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]

# One exact brand color for every warm boundary pixel; alpha keeps the source antialiasing.
warm = (
    (alpha > 0) & (r > 88)
    & ((r.astype(np.int16) - b.astype(np.int16)) > 48)
    & ((g.astype(np.int16) - b.astype(np.int16)) > 10)
)
rgba[warm, :3] = ACCENT
rgba[alpha == 0, :3] = 0
Image.fromarray(rgba, "RGBA").save(OUTPUT, optimize=True, compress_level=9)

# Boundary removal partitions the raster into its administrative regions.
boundary = np.asarray(Image.fromarray(warm.astype(np.uint8) * 255, "L").filter(ImageFilter.MaxFilter(7))) > 0
interior = (alpha > 180) & ~boundary

data = json.loads(DATA.read_text(encoding="utf-8"))
regions = {region["id"]: region for region in data["regions"]}
seeds = OrderedDict([
    # Moscow is the orange inset explicitly identified by the user. The remaining
    # semantic seeds follow the factual neighboring-region topology around it.
    ("murmansk", (807, 137)), ("leningrad", (414, 284)), ("vologda", (603, 353)),
    ("smolensk", (346, 449)), ("tver", (470, 350)), ("yaroslavl", (559, 420)),
    ("moscow", (468, 454)), ("vladimir", (574, 488)), ("nizhny", (700, 470)),
    ("bryansk", (350, 590)), ("oryol", (450, 600)), ("tula", (470, 525)),
    ("ryazan", (560, 550)), ("lipetsk", (540, 620)), ("tambov", (630, 620)),
    ("voronezh", (560, 700)), ("volgograd", (760, 750)),
])

points = OrderedDict()
signatures = {}
for region_id, seed_xy in seeds.items():
    seed = nearest(interior, *seed_xy)
    component = component_from_seed(interior, seed)
    deep_x, deep_y, depth = deepest_point(component)
    points[region_id] = (deep_x, deep_y)
    signatures[region_id] = (int(component.sum()), depth)

# Preserve the Moscow start point supplied by the user; all other markers use the
# deepest interior point of their own administrative region.
points["moscow"] = (468, 454)

diagnostic = Image.fromarray(rgba, "RGBA")
draw = ImageDraw.Draw(diagnostic)
font = ImageFont.load_default(size=14)
for index, (region_id, (x, y)) in enumerate(points.items(), 1):
    draw.ellipse((x - 8, y - 8, x + 8, y + 8), fill=(255, 255, 255, 255), outline=(244, 134, 18, 255), width=3)
    draw.text((x + 11, y - 9), f"{index} {region_id}", font=font, fill=(255, 255, 255, 255), stroke_width=2, stroke_fill=(3, 25, 45, 255))
diagnostic.save(DIAGNOSTIC, optimize=True)

print("output", OUTPUT, OUTPUT.stat().st_size, source.size)
for region_id, point in points.items():
    print(f"{region_id}: {point}, signature={signatures[region_id]}")
