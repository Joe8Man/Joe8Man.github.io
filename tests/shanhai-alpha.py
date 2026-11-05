"""Verify real alpha in every deployed atlas cell, without modifying the art."""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1] / 'assets/expansion-v1/transparent'
count = 0
for name in ['bamboo', 'marsh', 'sea', 'snow', 'nether', 'heaven']:
    with Image.open(root / (name + '.webp')) as image:
        assert image.mode == 'RGBA', (name, image.mode)
        assert image.size == (1448, 1086), (name, image.size)
        alpha = image.getchannel('A')
        for row in range(3):
            for col in range(4):
                cell = alpha.crop((col * 362, row * 362, (col+1) * 362, (row+1) * 362))
                histogram = cell.histogram()
                assert histogram[0] > 362 * 362 * .05, (name, row, col, 'no clear background')
                assert sum(histogram[200:]) > 362 * 362 * .03, (name, row, col, 'missing item')
                corners = [cell.getpixel(p) for p in [(0, 0), (361, 0), (0, 361), (361, 361)]]
                assert max(corners) < 24, (name, row, col, corners)
                count += 1
print(f'{count} item cells have real transparent backgrounds and visible foregrounds')
