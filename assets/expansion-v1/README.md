# 山海百物素材與整合

六區各 12 種道具，共 72 張生成圖示。以六幅 4×3 RGBA WebP 圖集保存，使用 SVG 視窗裁切顯示；完整保留去背工具產生的透明通道，不鋪黑底。舊 `items/` 素材網址保留，供尚未重新整理的舊頁面繼續讀取；新版全部使用 `transparent/`。

圖集位於 `transparent/{bamboo,marsh,sea,snow,nether,heaven}.webp`，對應青州、雲夢、東海、崑崙、幽冥、九天。每幅 1448×1086，每格 362×362。道具 0–11 為靈植、獸材、珍材、靈砂、藏寶圖、丹藥、護符、攻伐銘紋、守禦銘紋、靈糧、陣石、故人箋。名稱、來源、用途及配方以 `Xianxia.html` 的 `SH_ITEMS` 與 `SH_RECIPES` 為準。

生成提示採同一構圖：production RPG inventory icon atlas, exactly 4 columns × 3 rows, evenly sized cells, no labels or borders, centered complete objects, generous margins, painterly polished miniature Chinese xianxia item art, sharp details at 64px, genuine transparent alpha background. 六區分別使用碧竹、青蓮水澤、藍色珊瑚海、冰藍銀雪、幽紫魂火、象牙金天界材質；物件依上述道具次序指定，禁止角色與浮水印。去背使用內建 image generation 的 background-extraction 編輯，保留物件與位置、移除深色底；雪境另外要求收緊邊緣並移除廣域霧光。PNG 轉 WebP 只作格式封裝，保留 RGBA。

## 接入內容

- 選單與背包均可進入山海百物、洞府倉庫。
- 六區獨立掉落、42 組製作配方、每日尋訪、藏寶圖選擇、宗門懸賞。
- 十二位道友各三段故事；銘紋攻守各一格；坐騎採集培養與資源地大陣道具。
- 倉庫數量、分類、裝備淬鍊保留。保留唯一裝備的所有權以防重複掉落；存放物不顯示在背包且不能直接穿戴。
- 新進度放於存檔 `shanhai`，舊檔補預設值；雲端驗證橋接同步更新。

## 驗證

```bash
python tests/shanhai-alpha.py
node tests/shanhai.test.cjs
node tests/main-story.test.cjs
node tests/inventory-art.test.cjs
node tests/engine-regression.cjs tests/regions.test.cjs
node tests/engine-regression.cjs tests/all-combat.test.cjs
node tests/engine-regression.cjs tests/progression-balance.test.cjs
node --check assets/engine/client.js
```

`engine-regression.cjs` 為早期測試補載目前必需的引擎核心，避免測試在未載入戰鬥規則時中止。原測試的斷言保持不變。
