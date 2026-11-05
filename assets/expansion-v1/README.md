# 山海百物素材與整合

六區各 12 種道具，共 72 張生成圖示。由內建 image generation 產生六幅 4×3 圖集，再以規則格線切分、縮為 256×256 WebP；全部圖示約 0.7 MB。圖示採深色背景，不需要人物素材的去背處理。

檔名 `items/sh-地區序號-道具序號.webp`，地區 0–5 為青州、雲夢、東海、崑崙、幽冥、九天；道具 0–11 為靈植、獸材、珍材、靈砂、藏寶圖、丹藥、護符、攻伐銘紋、守禦銘紋、靈糧、陣石、故人箋。名稱、來源、用途及配方以 `Xianxia.html` 的 `SH_ITEMS` 與 `SH_RECIPES` 為準。

生成提示採同一構圖：production RPG inventory icon atlas, exactly 4 columns × 3 rows, evenly sized cells, no labels or borders, centered complete objects, generous margins, painterly polished miniature Chinese xianxia item art, sharp details at 64px, solid dark navy background. 六區分別使用碧竹、青蓮水澤、藍色珊瑚海、冰藍銀雪、幽紫魂火、象牙金天界材質；物件依上述道具次序指定，禁止角色與浮水印。

## 接入內容

- 選單與背包均可進入山海百物、洞府倉庫。
- 六區獨立掉落、42 組製作配方、每日尋訪、藏寶圖選擇、宗門懸賞。
- 十二位道友各三段故事；銘紋攻守各一格；坐騎採集培養與資源地大陣道具。
- 倉庫數量、分類、裝備淬鍊保留。保留唯一裝備的所有權以防重複掉落；存放物不顯示在背包且不能直接穿戴。
- 新進度放於存檔 `shanhai`，舊檔補預設值；雲端驗證橋接同步更新。

## 驗證

```bash
node tests/shanhai.test.cjs
node tests/main-story.test.cjs
node tests/inventory-art.test.cjs
node tests/engine-regression.cjs tests/regions.test.cjs
node tests/engine-regression.cjs tests/all-combat.test.cjs
node tests/engine-regression.cjs tests/progression-balance.test.cjs
node --check assets/engine/client.js
```

`engine-regression.cjs` 為早期測試補載目前必需的引擎核心，避免測試在未載入戰鬥規則時中止。原測試的斷言保持不變。
