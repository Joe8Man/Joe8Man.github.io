# 一念九州 · 山海行旅

The game now opens on an illustrated overworld rather than a cultivation dashboard. Its six gated regions each provide a town, wilderness, sect gate, and ruin. Moving spends energy and advances a separate action calendar; four actions make a day and thirty days make a month. Passive cultivation and energy recovery continue to use real elapsed time. The character's displayed age uses the world calendar and has no lifespan death penalty.

Towns connect to the existing equipment and consumable market, inn recovery, a five-kill bounty, and a daily fixed-price merchant lot. Every third day offers the region's existing rare charm. Bounties count canonical kills after acceptance, pay once, and require return to the issuing region's town. Ruins provide one daily survey per region. Twelve original NPCs have region-bound itineraries, individual names, personalities, clothing, persistent relationships, daily conversation and gifting, and familiarity-gated discussions. They are local single-player NPCs; online friends remain a separate service.

Wilderness combat is a new Phaser spatial arena, with keyboard movement and a captured-pointer virtual joystick, automatic aimed flying swords, three configured arts, dodge invulnerability, healing, mana, and cooldowns. Melee circles, charge lanes, and ranged attacks are telegraphed and can miss. Art families include piercing fans, lightning areas, frost, freeze, persistent poison, orbiting protection, summons, drain, and healing. Ordinary enemies share their established regional stats and illustrations; after ten kills a field boss appears. Field bosses grant ordinary field loot and do not replace expedition first-clear rewards. Up to four enemies may occupy an arena; each spawn consumes energy. Leaving, backgrounding, modal interruption, low health, and reload are handled without offscreen damage or duplicated rewards.

The existing sect progression, crafting, cultivation, equipment, faction arts, expedition branches, and friend replay remain available under a shared visual shell. The expedition and sect challenge presentation still uses the prior live battle adapter; it does not yet use the freely moving wilderness arena. NPC factions do not autonomously simulate wars, marriage, or offspring. Merchant lots are fixed-price purchases rather than competitive NPC bidding. This is an original web RPG adaptation of a world-centered cultivation experience, not a reproduction of another game's assets or full simulation.

## Engineering and verification

- `assets/engine/world-core.js`: world schema, calendar, NPC data and itineraries.
- `assets/engine/world.js` and `world.css`: responsive overworld, destinations, services, relationships, and shared interface treatment.
- `assets/engine/field-core.js`: DOM-free spatial simulation and collision rules.
- `assets/engine/field.js`: Phaser presentation, input capture, generated audio, pause and disposal.
- `Xianxia.html`: canonical progression, transactions, rewards and state bridges.
- New schema fields are validated before import; saves without a world field gain one. This migration is a convenience and does not constrain subsequent redesign.
- Shared Phaser hit flashes use Phaser 4 tint modes; warning-circle radii are clamped against floating-point underflow.

Automated checks cover world transactions, calendar rollover, NPC limits, locked travel, save validity, session isolation, reward idempotence, movement speed, collision misses/hits, skill cooldowns, dodge, freeze and boss spawning. Existing exploration, sect, economy, combat presentation and progression tests also run. Browser QA uses the actual game scripts in a disposable local fixture with seeded characters and the online login module omitted; no test state is deployed. Desktop and 430-pixel iframe layouts, skill casting, earned field rewards, pause, close, and NPC relationship changes were exercised.

## Original image assets

Created with the built-in image_gen tool, inspected, converted to WebP, and integrated at:

- `assets/wander-v1/world.webp`
- `assets/wander-v1/field.webp`

World prompt: "Use case: stylized-concept. Asset type: background bitmap for an original Chinese xianxia browser game's interactive overworld map. Create a richly hand-painted ink and mineral-watercolor bird's-eye regional world map, landscape 1536x1024. Warm ivory rice-paper ground, elegant desaturated jade forests, blue-green winding rivers and coast, grey-blue snow mountains northwest, misty marsh middle south, bamboo grove southwest, ocean islands east, purple ghostly mountains north west corner and floating celestial mountains northeast. Tiny exquisitely painted traditional Chinese villages and Taoist temple rooftops integrated into terrain. Huge variety of subtle brushwork, organic terrain, sophisticated restrained palette, premium Chinese fantasy RPG atmosphere. Composition includes open traversable pale ground between landscape groups for interactive location labels added separately by code. No text, no labels, no numbers, no interface, no border, no logo, no watermark. Original landscape, no copied game artwork. The image should fill the whole rectangle edge to edge, not a physical map on a table."

Field prompt: "Use case: stylized-concept. Asset type: playable top-down combat ground texture for an original Chinese xianxia action RPG. Landscape 1536x1024, directly overhead bird's-eye camera, no horizon and no sky. A broad quiet irregular clearing of warm pale jade-grey earth and moss in a Chinese bamboo forest. The middle 75 percent of the image is open flat easily traversable ground with delicate scattered tiny leaves and subtle worn footpaths, soft watercolor ground texture, restrained detail to keep combat readable. Beautiful ink-wash and mineral watercolor illustration on fine rice-paper, subtle tasteful brushwork. Dense bamboo leaves, low rocks, small ferns and delicate roots ONLY around the perimeter edges, soft dappled light, jade green palette with warm ivory soil, premium hand-painted Chinese fantasy game art. No big trees or buildings in the middle, no characters, no animals, no interface, no text, no labels, no logos, no watermark, no large objects that would falsely look like obstacles."
