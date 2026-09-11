from PIL import Image, ImageDraw, ImageFilter

image = Image.open("assets/images/geography-russia-west-imagegen.png").convert("RGBA")
pixels = image.load()
barrier = Image.new("L", image.size, 0)
barrier_pixels = barrier.load()
for y in range(image.height):
    for x in range(image.width):
        r, g, b, _ = pixels[x, y]
        if r > 220 and 70 < g < 180 and b < 60:
            barrier_pixels[x, y] = 255

seen = {}
for seed in [(360, 580), (390, 580), (420, 580), (360, 610), (390, 610), (420, 610), (360, 640), (390, 640), (420, 640), (450, 620), (470, 620)]:
    component = barrier.copy()
    ImageDraw.floodfill(component, seed, 128, thresh=0)
    component = component.point(lambda value: 255 if value == 128 else 0)
    depth = 0
    last = component
    while component.getbbox():
        last = component
        component = component.filter(ImageFilter.MinFilter(3))
        depth += 1
    bbox = last.getbbox()
    center = ((bbox[0] + bbox[2] - 1) // 2, (bbox[1] + bbox[3] - 1) // 2)
    seen.setdefault(center, (seed, depth))

for center, (seed, depth) in sorted(seen.items(), key=lambda item: item[0][1]):
    print(seed, "->", center, "depth", depth)
