# 戰鬥素材整合 · 2026-11-03

本批使用圖像生成製作，共 13 張透明圖集、208 個素材格。發布時連同程式一次提交，避免玩家遇到程式先更新、圖片尚未上傳的情況。

| 圖集 | 內容 |
| --- | --- |
| hero-male / hero-female | 每位角色 16 格：跑動 4、揮劍 4、施法 4、待機／護體／受擊／倒地 |
| human-enemies | 劍修、術士、重甲武修、領隊長老，各 4 個姿勢 |
| monsters-{qingzhou,marsh,sea,snow,nether,heaven} | 每區 7 種現有敵人，各待機／攻擊 2 格，另有 2 格區域特效 |
| bosses-verdant-marsh-abyss | 萬古青麟、九首噬澤、歸墟龍皇，各 4 格，另有 4 格特效 |
| bosses-frost-nether-heaven | 寂天冰凰、無赦冥君、星穹玄武，各 4 格，另有 4 格特效 |
| effects-sword-arcane-ice | 劍氣、御劍、雷法、護盾、冰霜、打擊、身法，共 16 格 |
| effects-blood-beast-pill | 燃血、御獸、毒霧、青藤、療傷、防禦陣與破陣，共 16 格 |

## 接入範圍

- 自由除妖、秘境、世界妖王、NPC 交鋒、資源戰：`field.js`。
- 自動巡行、舊歷練戰鬥、宗門試煉與問鼎宗主：`hunt.js`、`journey.js`。
- 道友切磋回放：`online/arena.js`。
- 素衣男女使用新動作；已穿上的宗門及階級服裝保留原本服飾圖與姿勢，避免失去外觀差異。
- 原有插畫仍可作為圖集載入失敗時的備援。大地圖、角色介紹、怪物圖鑑與妖王介紹圖維持各自原有用途。

## 格式與效能

每張圖集為 1024×1024 WebP，4×4 格，每格 256×256。打包時依角色或物種使用一致縮放比例，將落腳位置對齊，保留透明留白。戰鬥只載入所在區域、必要妖王與共用特效，不一次下載全部六區；裝飾特效同時最多 32 個。

目前屬關鍵姿勢動畫：玩家每個攻擊／跑動循環 4 格，普通妖獸 2 格，並非高影格骨骼動畫。姿勢、施法特效與戰鬥數值分離，本批不改存檔、獎勵、佔領時間與敵人傷害。

## 重建及驗證

`scripts/pack-combat-assets.cjs` 接收 JSON 陣列，每項提供 `name` 與原始 PNG 的本機 `path`。需 Node.js 與 `sharp`。它僅做機械切格、留白、縮放與圖集編排，不重畫素材。

```sh
node scripts/pack-combat-assets.cjs /absolute/path/source-manifest.json
node tests/combat-assets.test.cjs
```

原始生成 PNG 由對話中的素材產出保留；遊戲採用壓縮、對齊後的 WebP。`assets/combat-v1/manifest.json` 記錄正式圖集規格與大小。
