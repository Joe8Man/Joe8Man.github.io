# Painted Jiuzhou world map

Generated with built-in imagegen for the existing six-region game map.

- Full artwork: `assets/map-v2/jiuzhou-painted.webp` (1161 × 1355).
- Smaller responsive artwork: `assets/map-v2/jiuzhou-painted-small.webp` (600 × 700).
- Interactive landmarks, labels, locks, selection, route hints, and travel logic remain HTML/SVG; no expensive image filters or animated terrain were added.
- Landmark coordinates were adjusted to the painted points of interest. The original vector map remains in `assets/map-v1/`.

## Generation prompt

Use case: stylized-concept. Asset type: premium hand-painted world map background for a Chinese xianxia cultivation RPG, vertical portrait composition in a 6:7 aspect ratio. Create an exquisite detailed top-down / gently oblique aerial fantasy atlas painted with Chinese gongbi landscape brushwork and refined realistic miniature terrain, jade-green forests, mineral blue water, muted ivory clouds, gold sunrise accents. This is an actual explorable game map, not a panoramic landscape viewed from ground level. Rich terrain relief, winding paths, tiny traditional buildings, intricate rocky ridges, ink washes, silk scroll texture, atmospheric but readable at phone size. No text, no Chinese characters, no letters, no labels, no UI, no nodes, no icons, no circular badges, no grid, no people, no dragons. Edge-to-edge geography without an ornate thick frame. 
Precise six environment centers, given as percentage (x across, y down), must be recognizable; floating interface labels will be added by code at those positions:
BOTTOM LEFT (26%,82%): verdant Qingzhou bamboo forest and mountain village, winding stone path, slender dense bamboo, warm green.
LOWER RIGHT (66%,68%): Yunmeng marshland, pale mist over branching reed lakes, winding water channels, small stone bridge, silver-jade water.
MIDDLE RIGHT (82%,43%): deep eastern sea with turquoise coast, dramatic sea cliffs, rocky islands and an ancient half-submerged dragon palace, white wave crests.
MIDDLE LEFT (28%,49%): tall jagged snowy Kunlun mountain range with a tucked-away temple, pale icy-blue peaks.
UPPER LEFT (18%,25%): mysterious dark violet nether ruins, weathered stone gate, dusky purple ravine, restrained violet energy glow; eerie rather than horror.
UPPER CENTER RIGHT (62%,17%): glorious golden-roof celestial palace on floating mountain islands amidst luminous cloud sea, tiny soaring bridges, rich ivory and gold.
Connect regions with natural valleys and trails, not diagram arrows. Main continental landmass on left and center, broad ocean on right. Each biome distinct while forming one believable continuous world. Map orientation from southern forest foreground to northern cloud palace. Leave breathing room around the six landmark centers for readable interactive labels. Light at top, deeper jade-green at bottom, cinematic high-end fantasy mobile game matte painting, not flat vector art, not neon, not cartoon. Fine decorative compass geometry may be omitted entirely.

