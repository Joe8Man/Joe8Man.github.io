# 六大世界妖王

## 角色與專屬珍寶

| 地區 | 妖王 | 禁地 | 必得傳世珍寶 | 參考戰力 |
| --- | --- | --- | --- | ---: |
| 青州竹林 | 萬古青麟 | 斷天古竹 | 青麟鎮岳印 | 13,000 |
| 雲夢大澤 | 九首噬澤 | 九曲毒淵 | 九淵避劫珠 | 26,000 |
| 東海歸墟 | 歸墟龍皇 | 無日海眼 | 滄溟斷界劍 | 80,000 |
| 崑崙雪境 | 寂天冰凰 | 絕音冰頂 | 太素凰羽衣 | 250,000 |
| 幽冥古域 | 無赦冥君 | 萬魂戰塚 | 無赦鎮魂璽 | 650,000 |
| 九天仙闕 | 星穹玄武 | 碎星天垣 | 補天星核戒 | 1,800,000 |

地圖點擊先顯示來歷。介紹頁分「來歷／攻勢／珍寶」，危險警告與確認按鈕固定顯示。確認入場才扣 3 精力；地區門檻、本命法寶、活動鎖定與氣血條件會再次檢查。

單隻首領、固定強度，氣血 60%／25% 進入強化階段。攻擊順序各自定義，包含落地預警、衝鋒與扇形彈幕。戰鬥沿用原有技能、移動、閃避、服丹與低血撤退。

勝利必得專屬裝備及靈晶、殘片、感悟與靈石。已收藏同件裝備時轉為額外靈晶 20／殘片 12。獎勵在擊殺時結算一次；撤退、載入失敗與未完成戰鬥不給獎勵、不觸發重生。

每隻從擊殺當下起保存 `readyAt = Date.now() + 3600000`。獨立倒數，現實一小時後重生；切換遊戲日、重開頁面與離線不重置。進度隨目前角色存檔保存，沿用既有手動雲端同步。這是目前單人角色的討伐進度，沒有新增所有玩家共用的伺服器首領狀態。用戶端時間與匯入舊備份不是伺服器防作弊邊界。

## 美術檔案

使用內建 image_gen 工具，六次獨立生成；保存透明 alpha，轉為 WebP 供遊戲載入。每張 1536 × 1024，六張總計約 3.5 MiB。地圖另用 512 像素縮圖，避免一次把六張完整大圖上傳到 GPU；介紹頁才按需載入原圖。角色圖用於地圖、介紹與戰鬥，並配合專屬光環、體型與階段演出。

- [verdant.webp](../assets/bosses-v1/verdant.webp)
- [marsh.webp](../assets/bosses-v1/marsh.webp)
- [abyss.webp](../assets/bosses-v1/abyss.webp)
- [frost.webp](../assets/bosses-v1/frost.webp)
- [nether.webp](../assets/bosses-v1/nether.webp)
- [heaven.webp](../assets/bosses-v1/heaven.webp)

## 生成提示詞

共同規格：

Use case: stylized-concept. Asset type: final transparent full-body 2D game boss sprite and bestiary illustration for a premium Chinese xianxia RPG. Style: exquisite hand-painted fantasy game concept art, richly textured painterly brushwork, refined ink-and-mineral pigment aesthetic, realistic anatomy, precise ornate detailing, luminous restrained magical effects. Full creature visible, 3/4 front view facing slightly left, centered, large clean readable silhouette, landscape 3:2 composition, generous transparent margin around entire creature, feet consistently near 85% height. Dramatic rim lighting with deep dimensional shadows, collectible-quality polished production art. Transparent background with genuine alpha, no scenery, no text, no lettering, no labels, no frame, no watermark, no humanoid rider, no cropped limbs.

### verdant

Subject: A colossal ancient emerald QILIN with branching bamboo antlers, jade stone armor grown into bark, a flowing pale mane, four powerful hooved legs, viridian flame and moss. Majestic terrifying guardian of an ancient bamboo forest. Broad quadruped silhouette.

### marsh

Subject: A monstrous nine-headed hydra serpent of a Chinese mythic marsh, a main crowned dragon head and eight distinct smaller serpent heads on curling necks, coiled armored obsidian and teal body, poisonous turquoise vapor, lotus-like crimson eyes. Broad serpentine silhouette.

### abyss

Subject: An ancient eastern SEA DRAGON sovereign, deep sapphire scales, coral antlers, golden whiskers, massive muscular serpentine body coiling horizontally, four clawed legs, glowing pearls along its spine, sea foam around feet. Elegant but terrifying silhouette.

### frost

Subject: A gigantic ICE PHOENIX, wings spread in a broad downward V, silver and pale blue crystal feathers, long flowing icicle tail, delicate crowned head, frost trails, glowing cyan eyes. Regal dangerous bird silhouette.

### nether

Subject: A colossal underworld demon GENERAL in black iron samurai-like ancient Chinese armor with violet soul fire, skull face hidden behind a ceremonial mask, two long curved horns, floating torn cape, massive double bladed halberd, clear two legs and two arms. Imposing broad upright silhouette.

### heaven

Subject: An ancient celestial DRAGON TURTLE, massive four-legged golden tortoise body, dragon head, antlers and white beard, a black and gold shell engraved with star constellations, floating golden stone fragments above shell, radiant amber eyes. Heavy domed quadruped silhouette.

## 驗證

- `node tests/world-boss.test.cjs`：131 項入場、六地區、固定強度、階段、重複獎勵、存檔相容、現實時間重生與撤退檢查。
- `node tests/phaser-client.test.cjs`：Phaser 呈現、行動分頁、搖桿與控制回歸檢查。
- `node tests/inventory-art.test.cjs`：物品圖像對應與內嵌 JavaScript 語法。
- 既有 world 測試透過臨時補載其缺少的 field-core 依賴執行，94 項通過；原測試檔未修改。
- 1363 × 936 桌面與 390 × 844 手機預覽；檢查地圖、美術、來歷、危險警告與討伐入場，實際確認首領生成、傷害與低血撤退。

