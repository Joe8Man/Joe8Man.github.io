# Rank wardrobe artwork

Project assets generated with built-in imagegen, then encoded as WebP for the game:

- `assets/wardrobe-v2/male.webp`: male cultivator, 5 rank rows × 5 pose columns.
- `assets/wardrobe-v2/female.webp`: female cultivator, the same layout.

Rows: outer disciple (plain short narrow-sleeve tunic and trousers), inner disciple (crossed-collar ankle-length robe), core disciple (armored shoulders, split battle skirt and short cape), elder (voluminous broad sleeves and embroidered stole), sect master (gold crown and sweeping full-length cape).

Columns: standing ready, overhead wind-up, lunging thrust, slash follow-through, seated lotus meditation.

Generation prompt set: use the existing male/female painted hero sheets as separate identity and style references; create a true-transparent square sheet of exactly 5 equal rows and 5 equal columns, no labels, grids or background; keep the same adult face, long dark hair, silver jian and natural skin throughout each gender's sheet. Use jade fabric, offwhite lining, gold embroidery. Make every rank visibly different in garment cut, sleeves, shoulder shape, hem length, armor, cape and headwear, rather than changing colors. Keep each row's outfit consistent across its five poses; face right in three-quarter view, with the meditation column seated and without a sword. Male reference: `assets/qingzhou-v1/hero.webp`; female reference: `assets/characters-v1/female-hero-v2.webp`.

`RANK_ATLAS_META` in `Xianxia.html` stores per-figure bounds and SVG silhouette clips. Clips isolate neighboring poses where generated sheet edges touch. A fabric chroma mask recolors jade fabric for the six sects while preserving skin, hair, steel, and gold. Sanctuary meditation, profile portrait, equipment figure and four combat poses all resolve the same equipped wardrobe ID. An absent or ineligible equipped outfit retains the original pre-wardrobe artwork.

Validation: `node tests/wardrobe.test.cjs`, plus browser checks of rank previews, equipped sanctuary meditation, removal restoring the original appearance and sword-practice animation.
