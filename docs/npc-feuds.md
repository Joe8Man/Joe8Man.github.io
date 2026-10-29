# 道友生死與仇怨

地圖人物改用原創手繪男女四格行走圖，配合腳圈、名牌及色調區分主角和道友。點地圖空地可行走到任意可達區域的位置。地點卡使用非模態的小型側窗，不阻擋地圖；抵達後才結算精力與行程日期。遠處道友可由名帖前往所在地，接近後才可互動。

惡言相向每次增加 25 仇怨並降低 15 交情；60 仇怨以上視為仇敵並觸發非致命交鋒。襲殺有獨立的遊戲內確認，勝利才記錄死亡，退出或敗退不會殺死對方。死亡者不再出現在地圖，也不能繼續對話或領取重複戰果。

殺人後記錄兩次追討：同門（兩日後）與親友（四日後）。遊歷推進日期時檢查到期事件，進入有真實人形對手、走位、命中與氣血判定的戰場。擊退尋仇者會結束該次追討；逃離或低血撤回則延後兩日。若名義上的追討者也已死，由該宗門執法弟子代為出面，不復活死者。重整後未完成追討重新排入日程，不在背景補算交鋒。追討狀態、死亡和仇怨均存入世界存檔。

這是單人虛構世界的 NPC 系統。一般交鋒、襲殺與尋仇不給刷怪收益，避免用對話反覆刷修為或靈石。

## 原創美術

Built-in image_gen 生成透明圖集，裁切為 `assets/map-v3/male-walk.webp`、`assets/map-v3/female-walk.webp`，各含四格，採 WebP alpha。舊簡單 SVG 人物已移除。

Prompt: Original premium Chinese xianxia RPG walking sprite sheet on truly transparent background. EXACT 4 columns and 2 rows, each equal cell. Entire image 1536x1024. Top row: SAME handsome adult male sword cultivator in flowing ivory and desaturated blue robes, long black hair with topknot, sword on back. Four successive readable walking poses, standing, left foot forward, passing, right foot forward. Bottom row: SAME elegant adult female sword cultivator in flowing ivory and pale jade robes, long black hair, four corresponding walking poses. Whole bodies including feet, each isolated and centered within its cell with generous empty padding, consistent scale/baseline and character identity across columns. Three-quarter front side view facing right. Refined hand-painted Chinese fantasy game art, ink wash edges with delicate mineral watercolor modeling and attractive faces, detailed layered flowing cloth and hair, graceful adult natural proportions, not childish chibi, not stick figures, not vector icons. Crisp clean silhouettes readable on an overworld map. No scenery, no ground except faint small contact shadows, no text, no cell borders, no labels, no watermark. Actual transparent alpha.
