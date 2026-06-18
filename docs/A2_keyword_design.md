# 《语义缝合师》Phase A.2 关键词编排设计文档

> 策划：季元策 | 日期：2026-06-18
> 输入：trials-rewrite-draft.js（温思语重写稿）、game-data.js（现有游戏数据）
> 依赖：Task A.1（剧情对话重写）已完成

---

## 一、属性系统深度分析与修正

### 1.1 双矛盾检测系统架构说明

经过对 game-data.js 代码的分析，当前游戏存在**两套独立的矛盾检测系统**：

| 系统 | 数据结构 | 检测函数 | 匹配方式 | 用途 |
|------|----------|----------|----------|------|
| **属性矛盾系统** | `contradiction_pairs` | `checkAttributeContradiction(attrsA, attrsB)` | 属性对匹配 | 合成时检测，产出失真卡 |
| **语义矛盾系统** | `semantic_contradictions` | `findSemanticContradiction(keywordA, keywordB)` | **关键词文本精确匹配** | ⚡矛盾标记，解锁隐藏关键词 |

**关键发现**：`findSemanticContradiction()` 函数通过**关键词文本**（keyword_a / keyword_b）进行精确匹配，**不检查属性**。因此即使两个关键词属性相同（如都是 `["fact"]`），只要它们被定义在 `semantic_contradictions` 数组中，⚡矛盾标记就能正常触发。

### 1.2 Trial 1 矛盾标记点分析

**现状**：
- "很重"：`{ "attributes": ["fact"] }` — Stage 2 提取词
- "小小的"：`{ "attributes": ["fact"] }` — Stage 3 提取词
- 两者属性相同，均为 `["fact"]`

**结论**：
1. **语义矛盾系统正常工作**：`findSemanticContradiction("很重", "小小的")` 会匹配到 `trial1_weight` 条目，⚡按钮可正常触发，解锁"死信箱"和"交接点"。
2. **属性矛盾系统无法辅助检测**：`checkAttributeContradiction(["fact"], ["fact"])` 返回 null，因为 `["fact", "fact"]` 不在 contradiction_pairs 中。这意味着玩家通过右键查看属性时，两个关键词显示相同属性，缺乏视觉提示差异。

### 1.3 Trial 3 矛盾标记点分析

**现状**：
- "手术台"：`{ "attributes": ["medical"] }` — Stage 3 提取词
- "武器序列号的片段"：`{ "attributes": ["fact", "conflict"] }` — Stage 3 合成产物（"一串编号"+"听觉重构"）

**结论**：
1. **语义矛盾系统正常工作**：`findSemanticContradiction("手术台", "武器序列号的片段")` 会匹配到 `trial3_semantic` 条目，⚡按钮可正常触发，解锁 Stage 4 隐藏台词层。
2. **属性矛盾系统无法辅助检测**：`checkAttributeContradiction(["medical"], ["fact", "conflict"])` 返回 null。现有矛盾对中没有 `medical vs fact` 或 `medical vs conflict`。

### 1.4 属性修正方案

**设计目标**：让属性系统与语义矛盾系统形成双重确认——玩家通过右键查看属性时能发现差异，同时属性矛盾也能在合成时提供失真卡反馈。

#### Trial 1 修正：

```javascript
// 修正前
"很重": { "attributes": ["fact"], ... },
"小小的": { "attributes": ["fact"], ... },

// 修正后
"很重": { "attributes": ["fact", "sensory"], ... },   // 重量既是客观事实，又是触觉感受
"小小的": { "attributes": ["sensory"], ... },          // 尺寸是视觉观察
```

**设计理由**：
- "很重"描述搬运时的触觉感受（"冰冷冰冷的""手都被冻麻了""手在抖"），加入 `sensory` 合理
- "小小的"描述视觉观察（"就巴掌那么大""粉色的"），改为纯 `sensory` 合理
- 两者属性档案产生差异（`["fact", "sensory"]` vs `["sensory"]`），玩家右键检查时能发现不同
- **注意**：`fact vs sensory` 不是现有矛盾对，不会在合成时产出失真卡。这是有意为之——这两个关键词的矛盾是叙事层面的（重量与内容物不符），不应在合成时产生失真干扰。⚡语义矛盾系统负责检测。

#### Trial 3 修正：

```javascript
// 修正前
"武器序列号的片段": { "attributes": ["fact", "conflict"], ... },

// 修正后
"武器序列号的片段": { "attributes": ["fact", "conflict", "sensory"], ... },  // 加入sensory
```

**设计理由**：
- "武器序列号的片段"由"一串编号"+"听觉重构"合成而来，"听觉重构"是感官技能卡，产物继承 `sensory` 属性合理
- 修正后，`checkAttributeContradiction(["medical"], ["fact", "conflict", "sensory"])` 将检测到 `medical vs sensory` 矛盾对！
- 这意味着：当玩家尝试将"手术台"与"武器序列号的片段"合成时，会产出失真卡——这是对玩家的一种**暗示**："这两个东西不该放在一起"，引导玩家使用⚡矛盾标记
- **双重确认**：属性矛盾（合成失真）+ 语义矛盾（⚡标记解锁）形成完整的矛盾发现体验

---

## 二、真结论合成路径设计

### 2.1 设计原则

三个 Trial 的真结论采用**统一的多步合成模式**，形成可学习的模式：

```
隐藏关键词A + 隐藏关键词B = 中间产物（揭示真相本质）
中间产物 + 假结论 = 真结论（颠覆假叙事）
```

**设计意图**：
1. **假结论成为真结论的垫脚石**——玩家不会觉得假结论白做了，而是真结论的必经之路
2. **隐藏关键词是转折点**——没有隐藏关键词，中间产物无法合成，真结论无法到达
3. **两步合成有节奏感**——第一步"发现真相"，第二步"颠覆假象"，有叙事张力
4. **模式一致性**——Trial 1 学会的合成逻辑可以迁移到 Trial 2/3，降低学习成本

### 2.2 Trial 1 真结论路径

**真结论**：第七号死信箱的数据芯片

```
步骤1：死信箱 + 交接点 = 加密交接协议
  └─ 死信箱、交接点通过⚡矛盾标记"很重"vs"小小的"解锁
  └─ 合成含义：两个隐藏线索拼合，揭示这是一次秘密情报交接

步骤2：加密交接协议 + 地下冷冻室的铁盒 = 第七号死信箱的数据芯片
  └─ "地下冷冻室的铁盒"是假结论（Stage 3 正常合成获得）
  └─ 合成含义：将交接协议与物理藏匿点结合，揭示铁盒真实内容是数据芯片
```

### 2.3 Trial 2 真结论路径

**真结论**：清除目标的定位名单

```
步骤1：清除目标 + 定位 = 目标清除坐标
  └─ 清除目标、定位通过Meta入侵（"数据残影"→对话框）解锁
  └─ 合成含义：两个隐藏线索拼合，揭示丈夫行为的真实目的是清除目标

步骤2：目标清除坐标 + 叛军家属的联络名单 = 清除目标的定位名单
  └─ "叛军家属的联络名单"是假结论（Stage 4 正常合成获得）
  └─ 合成含义：将清除坐标与"联络名单"结合，揭示名单真实性质是猎杀名单
```

### 2.4 Trial 3 真结论路径

**真结论**：记忆剥离协议的受害者

```
步骤1：记忆剥离 + 协议 = 记忆剥离协议文档
  └─ 记忆剥离、协议通过组合解锁（⚡矛盾标记"手术台"vs"武器序列号的片段" → 解锁隐藏台词层 → Meta入侵"记忆碎片"→对话框）
  └─ 合成含义：两个隐藏线索拼合，揭示存在系统性的记忆手术协议

步骤2：记忆剥离协议文档 + 武器图纸的完整密码 = 记忆剥离协议的受害者
  └─ "武器图纸的完整密码"是假结论（Stage 5 正常合成获得）
  └─ 合成含义：将协议文档与"武器密码"结合，揭示所谓审讯实为记忆剥离手术，受害者是被窃取武器知识的受试者
```

---

## 三、新增/修改的 keyword_metadata

### 3.1 隐藏关键词（含解锁前后状态）

**重要机制说明**：隐藏关键词在解锁前 `card_type: "hidden"`、`is_extractable: false`、属性含 `locked`。解锁后 `card_type` 变为 `"normal"`、`is_extractable` 变为 `true`、**移除 `locked` 属性**（否则 locked 与所有属性矛盾，无法参与合成）。

```javascript
// ===== Trial 1 隐藏关键词 =====
// 解锁前（当前状态，保持不变）
"死信箱": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },
"交接点": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },

// 解锁后（程序在解锁时切换为此状态）
"死信箱": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
"交接点": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },

// ===== Trial 2 隐藏关键词 =====
// 解锁前
"清除目标": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },
"定位": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },

// 解锁后
"清除目标": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
"定位": { "attributes": ["fact", "sensory"], "card_type": "normal", "is_extractable": true },

// ===== Trial 3 隐藏关键词 =====
// 解锁前
"记忆剥离": { "attributes": ["medical", "locked"], "card_type": "hidden", "is_extractable": false },
"协议": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },

// 解锁后
"记忆剥离": { "attributes": ["medical", "memory"], "card_type": "normal", "is_extractable": true },
"协议": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
```

**属性设计理由**：
- **死信箱/交接点**（解锁后 `["fact"]`）：均为客观事实性情报，属性简洁，不与其他关键词产生属性矛盾，确保合成链顺畅
- **清除目标**（解锁后 `["fact", "conflict"]`）：事实+冲突，"清除"带有暴力含义
- **定位**（解锁后 `["fact", "sensory"]`）：事实+感官，定位涉及坐标感知
- **记忆剥离**（解锁后 `["medical", "memory"]`）：医疗+记忆，精准描述其本质
- **协议**（解锁后 `["fact"]`）：客观存在的文件/程序

### 3.2 中间合成关键词（新增）

```javascript
// ===== 真结论合成链中间产物 =====
"加密交接协议": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
"目标清除坐标": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
"记忆剥离协议文档": { "attributes": ["medical", "memory"], "card_type": "normal", "is_extractable": true },
```

**属性设计理由**：
- 三个中间产物的属性都与后续合成的假结论属性兼容，不会产出失真卡
- "加密交接协议"和"目标清除坐标"带 `conflict`，暗示其背后隐藏的对抗性真相
- "记忆剥离协议文档"带 `medical` 和 `memory`，直接点明其医疗-记忆本质

### 3.3 真结论关键词（新增）

```javascript
// ===== 真结论结果 =====
"第七号死信箱的数据芯片": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
"清除目标的定位名单": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
"记忆剥离协议的受害者": { "attributes": ["medical", "memory", "conflict"], "card_type": "normal", "is_extractable": true },
```

### 3.4 替代合成路径中间关键词（新增）

```javascript
// ===== 替代路径中间产物 =====
"震动源定位": { "attributes": ["fact", "sensory"], "card_type": "normal", "is_extractable": true },
"项链中的加密数据": { "attributes": ["fact", "sensory"], "card_type": "normal", "is_extractable": true },
```

### 3.5 干扰性关键词（新增）

```javascript
// ===== 干扰性关键词 =====
"女儿": { "attributes": ["emotion"], "card_type": "normal", "is_extractable": true },
"姐夫": { "attributes": ["emotion", "conflict"], "card_type": "normal", "is_extractable": true },
"伤疤": { "attributes": ["medical", "sensory"], "card_type": "normal", "is_extractable": true },
```

### 3.6 新增 Meta 关键词（已采纳实现）

```javascript
// ===== 新增 Meta 关键词 =====
"信号溢出": { "attributes": ["locked"], "card_type": "meta", "is_extractable": true, "meta_targets": ["dialogue"] },
"脑波异常": { "attributes": ["locked"], "card_type": "meta", "is_extractable": true, "meta_targets": ["dialogue"] },
```

**属性设计理由**：与现有 Meta 卡（数据残影、记忆碎片）保持一致，使用 `["locked"]` 属性和 `card_type: "meta"`。`meta_targets: ["dialogue"]` 表示可拖入对话框触发入侵。

### 3.6 现有属性修正

```javascript
// ===== Trial 1 属性修正 =====
"很重": { "attributes": ["fact", "sensory"], "card_type": "normal", "is_extractable": true },  // 原 ["fact"]
"小小的": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },         // 原 ["fact"]

// ===== Trial 3 属性修正 =====
"武器序列号的片段": { "attributes": ["fact", "conflict", "sensory"], "card_type": "normal", "is_extractable": true },  // 原 ["fact", "conflict"]
```

---

## 四、新增/修改的 recipes

### 4.1 真结论合成配方

```javascript
// ===== Trial 1 真结论合成链 =====
"死信箱+交接点": "加密交接协议",
"加密交接协议+地下冷冻室的铁盒": "第七号死信箱的数据芯片",

// ===== Trial 2 真结论合成链 =====
"清除目标+定位": "目标清除坐标",
"目标清除坐标+叛军家属的联络名单": "清除目标的定位名单",

// ===== Trial 3 真结论合成链 =====
"记忆剥离+协议": "记忆剥离协议文档",
"记忆剥离协议文档+武器图纸的完整密码": "记忆剥离协议的受害者",
```

### 4.2 替代合成路径配方

```javascript
// ===== Trial 1 替代路径（到达假结论"地下冷冻室的铁盒"） =====
// 主路径：嗡嗡的震动声+听觉重构=冷冻库的压缩机 → 生锈的铁门+嗅觉重构=消毒水与铁锈的混合气味 → 两者合成=地下冷冻室的铁盒
// 替代路径：利用Stage 2结论"铁盒的线索"跨阶段合成
"铁盒的线索+嗡嗡的震动声": "震动源定位",
"震动源定位+生锈的铁门": "地下冷冻室的铁盒",

// ===== Trial 2 替代路径（到达假结论"叛军家属的联络名单"） =====
// 主路径：要保护什么东西+嗅觉重构=藏在项链里的微缩胶卷 → 一条项链+视觉重构=项链吊坠的暗层 → 两者合成=叛军家属的联络名单
// 替代路径：利用Stage 3结论"加密名单的解密钥匙"跨阶段合成
"加密名单的解密钥匙+一条项链": "项链中的加密数据",
"项链中的加密数据+要保护什么东西": "叛军家属的联络名单",
```

**替代路径设计理由**：
- 利用前一阶段的结论作为后一阶段的合成材料，鼓励玩家保留和复用已合成的卡片
- 为错过特定技能卡组合的玩家提供备用路径，降低卡关风险
- 替代路径步骤更短（2步 vs 3步），但需要跨阶段思维，给探索型玩家以奖励

---

## 五、hidden_keyword_sources 更新

### 5.1 Trial 2（原为空数组，需填充）

```javascript
"hidden_keyword_sources": [
  {
    "keyword": "清除目标",
    "method": "meta",
    "trigger": {
      "type": "meta_intrusion",
      "meta_card": "数据残影",
      "target_stage": "stage_03",
      "description": "将Stage 1提取的'数据残影'拖入Stage 3对话框，触发Meta入侵揭示隐藏台词层",
      "unlocks": [
        { "stage": "stage_03", "word": "清除目标", "was_noise": true },
        { "stage": "stage_03", "word": "定位", "was_noise": true }
      ]
    }
  },
  {
    "keyword": null,
    "method": "meta",
    "trigger": {
      "type": "meta_intrusion",
      "meta_card": "信号溢出",
      "target_stage": "stage_04",
      "description": "将Stage 2提取的'信号溢出'拖入Stage 4对话框，触发Meta入侵揭示世界观补充信息（不解锁关键词）",
      "unlocks": []
    }
  }
]
```

### 5.2 Trial 3（原为空数组，需填充）

```javascript
"hidden_keyword_sources": [
  {
    "keyword": "记忆剥离",
    "method": "combo",
    "trigger": {
      "type": "contradiction_then_meta",
      "contradiction_id": "trial3_semantic",
      "meta_card": "记忆碎片",
      "target_stage": "stage_03",
      "description": "步骤1：用⚡标记'手术台'与'武器序列号的片段'的语义矛盾，解锁隐藏台词层门控；步骤2：将Stage 2提取的'记忆碎片'拖入Stage 3或Stage 4对话框，触发Meta入侵揭示隐藏关键词",
      "unlocks": [
        { "stage": "stage_03", "word": "记忆剥离", "was_noise": true },
        { "stage": "stage_03", "word": "协议", "was_noise": true }
      ]
    }
  },
  {
    "keyword": null,
    "method": "meta",
    "trigger": {
      "type": "meta_intrusion",
      "meta_card": "脑波异常",
      "target_stage": "stage_02",
      "description": "将Stage 1提取的'脑波异常'拖入Stage 2对话框，触发Meta入侵揭示世界观补充信息（不解锁关键词）",
      "unlocks": []
    }
  }
]
```

**注意**：Trial 3 的隐藏台词层同时出现在 stage_03 和 stage_04 中（温思语已实现），两处均设 `hidden_layer_gated_by: "trial3_semantic"`。玩家在标记矛盾后，可在 Stage 3 或 Stage 4 使用"记忆碎片"触发入侵。原 `semantic_contradictions` 中 `unlocks_hidden_layer: "stage_04"` 应更新为 `"stage_03"` 或同时包含两个 Stage。

---

## 六、semantic_contradictions 确认

### 6.1 Trial 1 — `trial1_weight`（确认有效，无需修改）

```javascript
{
  "id": "trial1_weight",
  "trial": "trial_1",
  "keyword_a": "很重",
  "keyword_b": "小小的",
  "description": "重量矛盾：同一物品既'很重'又'小小的'",
  "unlocks": [
    { "stage": "stage_03", "word": "死信箱", "was_noise": true },
    { "stage": "stage_03", "word": "交接点", "was_noise": true }
  ]
}
```

**状态**：✅ 有效。`findSemanticContradiction("很重", "小小的")` 可正常匹配。属性修正后（"很重"→`["fact","sensory"]`，"小小的"→`["sensory"]`），两者属性档案产生差异，辅助玩家发现矛盾。

### 6.2 Trial 3 — `trial3_semantic`（确认有效，需配合属性修正）

```javascript
{
  "id": "trial3_semantic",
  "trial": "trial_3",
  "keyword_a": "手术台",
  "keyword_b": "武器序列号的片段",
  "description": "语义矛盾：医疗设施不应出现在武器数据上下文中",
  "unlocks": [],
  "unlocks_hidden_layer": "stage_04"
}
```

**状态**：✅ 有效。`findSemanticContradiction("手术台", "武器序列号的片段")` 可正常匹配。属性修正后（"武器序列号的片段"加入 `sensory`），`checkAttributeContradiction(["medical"], ["fact","conflict","sensory"])` 将检测到 `medical vs sensory` 矛盾——**双重确认机制**：
1. 玩家若尝试合成"手术台"+"武器序列号的片段"→ 产出失真卡（属性矛盾提示）
2. 玩家用⚡标记两者 → 语义矛盾匹配成功 → 解锁 Stage 4 隐藏台词层

---

## 七、干扰性关键词设计

### 7.1 设计思路

干扰性关键词是**可提取但无法参与任何有效配方**的关键词。玩家提取后尝试合成，会因属性矛盾产出失真卡，制造"走弯路"体验。这些关键词的名字看起来像有用线索，诱使玩家尝试合成。

### 7.2 干扰词详细设计

#### Trial 1 — "女儿"

```javascript
"女儿": { "attributes": ["emotion"], "card_type": "normal", "is_extractable": true }
```

- **来源**：NPC 在 Stage 2/3 对话中提到"我女儿""她怕弄丢""我女儿还在等我"
- **迷惑性**：玩家会自然认为女儿是铁盒故事的核心——"铁盒里是女儿的音乐盒"
- **干扰机制**：`["emotion"]` 与 Trial 1 大量 `["fact"]` 线索形成 `fact vs emotion` 矛盾。玩家将"女儿"与"很重""地下冷冻室的铁盒"等事实卡合成时，产出失真卡
- **叙事含义**："女儿"是假记忆的情感锚点——NPC 对女儿的情感是被植入的，用情感属性标记，暗示其不可靠性

#### Trial 2 — "姐夫"

```javascript
"姐夫": { "attributes": ["emotion", "conflict"], "card_type": "normal", "is_extractable": true }
```

- **来源**：NPC 在 Stage 3 提到"我姐夫去年就消失了，他们说他是被叛军带走的"
- **迷惑性**：玩家可能认为姐夫的消失与丈夫的行为有关联，是破案线索
- **干扰机制**：`["emotion", "conflict"]` 中的 `emotion` 与 Trial 2 大量 `["fact"]` 线索形成矛盾。与事实卡合成产出失真卡
- **叙事含义**：姐夫的消失是真相的一部分（真结论揭示丈夫出卖了姐夫），但"姐夫"这个关键词本身不参与合成——真相需要通过隐藏关键词"清除目标"+"定位"来揭示，而非直接用"姐夫"合成

#### Trial 3 — "伤疤"

```javascript
"伤疤": { "attributes": ["medical", "sensory"], "card_type": "normal", "is_extractable": true }
```

- **来源**：NPC Stage 5 对话"一滴眼泪从眼角滑下来，沿着伤疤的纹路走了一段"
- **迷惑性**：伤疤看起来是审讯/酷刑的证据，玩家会想用它合成"刑讯逼供"相关结论
- **干扰机制**：`["medical", "sensory"]` 在同一张卡上同时拥有两个互相矛盾的属性对成员。当与其他含 `sensory` 的卡合成时，`medical vs sensory` 触发失真；当与其他含 `medical` 的卡合成时，同样触发失真。几乎与所有 Trial 3 线索卡合成都会产出失真卡
- **叙事含义**：伤疤是真实存在的物理痕迹，但它指向的是"战争创伤"的假叙事，而非"记忆剥离手术"的真相。伤疤无法帮助你找到真相——真相藏在隐藏关键词中

### 7.3 干扰词在对话中的标记要求 ✅ 已完成

温思语已完成所有干扰词的 {} 标记和 extractable_words 添加：

| Trial | 关键词 | 所在 Stage | 状态 | 备注 |
|-------|--------|-----------|------|------|
| 1 | 女儿 | stage_03 | ✅ 已完成 | "像是我{女儿}的玩具" — 植入假记忆情感锚点 |
| 2 | 姐夫 | stage_03 | ✅ 已完成 | "我{姐夫}去年就消失了" |
| 3 | 伤疤 | stage_05 | ✅ 已完成 | "沿着{伤疤}的纹路走了一段" |

---

## 八、新增 Meta 关键词 ✅ 已采纳并实现

温思语已采纳建议并在对话中实现了两个新 Meta 关键词。以下为最终确认的配置（含温思语对入侵目标 Stage 的调整）。

### 8.1 Trial 2 新增 — "信号溢出" ✅

```javascript
"信号溢出": { "attributes": ["locked"], "card_type": "meta", "is_extractable": true, "meta_targets": ["dialogue"] }
```

- **提取位置**：Stage 2 对话（已添加 `{信号溢出}` 标记）
- **对话文本**："还有——最近电视的花屏越来越严重了。有时候不只是绿色的字，整个屏幕会白一下，{信号溢出}，像有什么东西要从里面冲出来。"
- **Meta 入侵目标**：**Stage 4**（温思语从原设计的 Stage 2 调整为 Stage 4，因 Stage 2 是提取该卡的 Stage，玩家提取后已推进到 Stage 3+，无法回头）
- **隐藏台词层**（已添加到 stage_04）："频段#47.3MHz，每周二/五 22:00-23:00 活跃，关联设备：搪瓷杯底部发射器"
- **hidden_layer_keywords**: `[]`（纯世界观补充，不解锁新关键词）
- **叙事效果**：补充丈夫通讯规律信息（周二/五与 stage_03 中报纸整理频率一致），搪瓷杯与 stage_02 的"反复擦拭一个杯子"呼应

### 8.2 Trial 3 新增 — "脑波异常" ✅

```javascript
"脑波异常": { "attributes": ["locked"], "card_type": "meta", "is_extractable": true, "meta_targets": ["dialogue"] }
```

- **提取位置**：Stage 1 对话（已添加 `{脑波异常}` 标记）
- **对话文本**：在"有什么东西在里面爬的疼"后插入"{脑波异常}——"作为关键词标签
- **Meta 入侵目标**：**Stage 2**（温思语从原设计的 Stage 3 调整为 Stage 2，因 Stage 3 已有 hidden_layer 且 gated_by: trial3_semantic，避免冲突）
- **隐藏台词层**（已添加到 stage_02）："受试者#019，θ波振幅超出正常值300%，记忆皮层活跃度异常，建议进入第三轮提取"
- **hidden_layer_keywords**: `[]`（纯伏笔，不解锁新关键词）
- **叙事效果**：在 Stage 2 就能通过 Meta 入侵获得医疗实验背景信息，"第三轮提取"与 Stage 3/4 隐藏层的"第三轮{记忆剥离}术后"形成呼应

---

## 九、Meta 入侵系统特异性问题（需开发修改）

### 9.1 问题描述

经过对 `board.js` 和 `dialogue.js` 代码的分析，当前 Meta 入侵系统的实现是**卡片无关的**——任何 `card_type: "meta"` 的卡片拖入对话框，都会触发**当前 Stage** 的 `hidden_layer`，系统不检查具体是哪张 Meta 卡。

代码路径：
1. `board.js` `detectDropTarget()` — 检测到 Meta 卡拖入 dialogue 区域
2. `game.js` — 记录 `meta_intrusions_performed`，调用 `DialogueSystem.revealHiddenLayer()`
3. `dialogue.js` `revealHiddenLayer()` — 揭示当前 Stage 的 `hidden_layer`，**不检查 Meta 卡身份**

### 9.2 影响分析

在只有 2 个 Meta 卡（数据残影在 Trial 2、记忆碎片在 Trial 3）时，不存在问题——它们分属不同 Trial，不会交叉。

现在每个 Trial 有 2 个 Meta 卡后，出现**交叉触发**风险：

| 场景 | 玩家使用的卡 | 当前 Stage | 触发的 hidden_layer | 是否正确 |
|------|-------------|-----------|-------------------|---------|
| Trial 2 Stage 3 | 数据残影 ✅ | stage_03 | 清除目标/定位 | ✅ 正确 |
| Trial 2 Stage 3 | 信号溢出 ❌ | stage_03 | 清除目标/定位 | ❌ 错误卡触发正确层 |
| Trial 2 Stage 4 | 信号溢出 ✅ | stage_04 | 频段#47.3MHz... | ✅ 正确 |
| Trial 2 Stage 4 | 数据残影 ❌ | stage_04 | 频段#47.3MHz... | ❌ 错误卡触发补充层 |
| Trial 3 Stage 2 | 脑波异常 ✅ | stage_02 | θ波振幅... | ✅ 正确 |
| Trial 3 Stage 2 | 记忆碎片 ❌ | stage_02 | θ波振幅... | ❌ 错误卡触发补充层 |
| Trial 3 Stage 3/4 | 记忆碎片 ✅ | stage_03/04 | 记忆剥离/协议 | ✅ 正确 |
| Trial 3 Stage 3/4 | 脑波异常 ❌ | stage_03/04 | 记忆剥离/协议 | ❌ 错误卡触发关键层 |

**最严重的情况**：Trial 3 中玩家用"脑波异常"（错误卡）在 Stage 3/4 触发了"记忆剥离/协议"隐藏关键词——绕过了设计意图中"使用记忆碎片"的叙事逻辑，使真结论路径过于容易。

### 9.3 解决方案

在每个 Stage 的 hidden_layer 定义中新增 `hidden_layer_meta_card` 字段，指定触发该层所需的 Meta 卡。系统在 `revealHiddenLayer()` 之前检查卡匹：

**数据层修改**（trials-rewrite-draft.js）：
```javascript
// Trial 2 stage_03
"hidden_layer": "目标#037已{清除目标}，关联人{定位}已更新",
"hidden_layer_keywords": ["清除目标", "定位"],
"hidden_layer_meta_card": "数据残影",    // ← 新增

// Trial 2 stage_04
"hidden_layer": "频段#47.3MHz，每周二/五 22:00-23:00 活跃，关联设备：搪瓷杯底部发射器",
"hidden_layer_keywords": [],
"hidden_layer_meta_card": "信号溢出",    // ← 新增

// Trial 3 stage_02
"hidden_layer": "受试者#019，θ波振幅超出正常值300%，记忆皮层活跃度异常，建议进入第三轮提取",
"hidden_layer_keywords": [],
"hidden_layer_meta_card": "脑波异常",    // ← 新增

// Trial 3 stage_03 / stage_04
"hidden_layer": "受试者#019，第三轮{记忆剥离}术后，残留{协议}待提取",
"hidden_layer_keywords": ["记忆剥离", "协议"],
"hidden_layer_gated_by": "trial3_semantic",
"hidden_layer_meta_card": "记忆碎片",    // ← 新增
```

**代码层修改**（dialogue.js 或 game.js）：
在 `revealHiddenLayer()` 被调用前，增加 Meta 卡身份检查：
1. 读取当前 Stage 的 `hidden_layer_meta_card` 字段
2. 如果该字段存在，检查被拖入的 Meta 卡 keyword 是否匹配
3. 不匹配时，显示提示："这张卡片似乎无法在这里触发什么……" 并阻止揭示
4. 匹配时（或字段不存在时，向后兼容），正常揭示

**向后兼容**：未添加 `hidden_layer_meta_card` 字段的 Stage 保持原有行为（任何 Meta 卡可触发），不影响已有功能。

### 9.4 替代方案（如不修改代码）

如果开发优先级不允许代码修改，可通过数据层设计规避：
- 将"信号溢出"和"脑波异常"的 hidden_layer 放在不会与主 Meta 卡产生交叉的 Stage 上
- 但这限制了叙事设计的灵活性，且 Trial 3 的交叉问题无法完全规避（记忆碎片和脑波异常都在 Stage 2 之后的 Stage 可用）

**推荐**：采用 9.3 的代码修改方案，这是正确的系统性修复。

---

## 十、完整配方变更汇总

### 10.1 新增配方一览

```javascript
// === Trial 1 新增配方 ===
"死信箱+交接点": "加密交接协议",
"加密交接协议+地下冷冻室的铁盒": "第七号死信箱的数据芯片",
"铁盒的线索+嗡嗡的震动声": "震动源定位",
"震动源定位+生锈的铁门": "地下冷冻室的铁盒",

// === Trial 2 新增配方 ===
"清除目标+定位": "目标清除坐标",
"目标清除坐标+叛军家属的联络名单": "清除目标的定位名单",
"加密名单的解密钥匙+一条项链": "项链中的加密数据",
"项链中的加密数据+要保护什么东西": "叛军家属的联络名单",

// === Trial 3 新增配方 ===
"记忆剥离+协议": "记忆剥离协议文档",
"记忆剥离协议文档+武器图纸的完整密码": "记忆剥离协议的受害者",
```

### 10.2 配方不变项确认

以下现有配方**保持不变**（假结论合成路径已确认有效）：
- Trial 1 全部 9 条 recipes ✅
- Trial 2 全部 12 条 recipes ✅
- Trial 3 全部 15 条 recipes ✅
- Trial 4 全部 9 条 recipes ✅

---

## 十一、隐藏关键词解锁流程汇总

### Trial 1：⚡矛盾标记 → 直接解锁

```
玩家提取"很重"(Stage 2) 和"小小的"(Stage 3)
→ 右键查看属性，发现属性档案不同（fact+sensory vs sensory）
→ 选中两张卡，点击⚡矛盾标记
→ findSemanticContradiction("很重","小小的") 匹配 trial1_weight
→ 解锁"死信箱"和"交接点"（加入Stage 3可提取词，card_type: hidden→normal，移除locked属性）
→ 死信箱+交接点=加密交接协议
→ 加密交接协议+地下冷冻室的铁盒=第七号死信箱的数据芯片（真结论）
```

### Trial 2：Meta入侵 → 直接解锁

```
玩家在Stage 1提取"数据残影"(Meta卡)
→ 保留到Stage 3
→ 将"数据残影"拖入Stage 3对话框
→ 触发Meta入侵，揭示隐藏台词层："目标#037已{清除目标}，关联人{定位}已更新"
→ 从隐藏台词层提取"清除目标"和"定位"（card_type: hidden→normal，移除locked属性）
→ 清除目标+定位=目标清除坐标
→ 目标清除坐标+叛军家属的联络名单=清除目标的定位名单（真结论）

（可选）玩家在Stage 2提取"信号溢出"(Meta卡)
→ 保留到Stage 4
→ 将"信号溢出"拖入Stage 4对话框
→ 触发Meta入侵，揭示隐藏台词层："频段#47.3MHz，每周二/五 22:00-23:00 活跃，关联设备：搪瓷杯底部发射器"
→ 纯世界观补充，不解锁新关键词
```

### Trial 3：⚡矛盾标记 + Meta入侵 → 组合解锁

```
步骤1：玩家在Stage 3提取"手术台"，合成"武器序列号的片段"
→ 尝试合成两者 → 产出失真卡（属性矛盾：medical vs sensory）→ 暗示矛盾存在
→ 选中两张卡，点击⚡矛盾标记
→ findSemanticContradiction("手术台","武器序列号的片段") 匹配 trial3_semantic
→ 解锁 Stage 3 和 Stage 4 的隐藏台词层门控（两处均设 hidden_layer_gated_by: "trial3_semantic"）

步骤2：玩家在Stage 2已提取"记忆碎片"(Meta卡)
→ 在Stage 3或Stage 4将"记忆碎片"拖入对话框
→ 触发Meta入侵，揭示隐藏台词层："受试者#019，第三轮{记忆剥离}术后，残留{协议}待提取"
→ 从隐藏台词层提取"记忆剥离"和"协议"（card_type: hidden→normal，移除locked属性）
→ 记忆剥离+协议=记忆剥离协议文档
→ 记忆剥离协议文档+武器图纸的完整密码=记忆剥离协议的受害者（真结论）
```

---

## 十二、需协调事项

### 12.1 需温思语（game-writer）配合 — ✅ 全部完成

1. ✅ **干扰词标记**：在 Trial 1/2/3 对话中为"女儿""姐夫""伤疤"添加 `{}` 标记，并加入对应 Stage 的 `extractable_words` 数组
2. ✅ **Trial 2 隐藏台词层修正**："目标#037已清除"改为"目标#037已{清除目标}"
3. ✅ **Meta关键词文本**：已采纳并实现"信号溢出"和"脑波异常"的 {} 标记文本及隐藏台词层内容，含入侵目标 Stage 调整

### 12.2 需马立航（game-developer）配合

1. **隐藏关键词解锁逻辑**：当 semantic_contradiction 触发或 Meta 入侵成功时，程序需将对应关键词的 `card_type` 从 `"hidden"` 改为 `"normal"`，`is_extractable` 改为 `true`，并从 `attributes` 数组中移除 `"locked"`
2. **was_noise 关键词注入**：`hidden_keyword_sources` 中 `was_noise: true` 的关键词（如"死信箱""交接点"）不在原始对话文本中，解锁后需程序动态注入到对应 Stage 的可提取词列表中
3. **真结论合成验证**：新增的 9 条真结论/替代路径配方需加入对应 Trial 的 recipes 对象中
4. **属性矛盾双重提示**（Trial 3）：当玩家尝试合成"手术台"+"武器序列号的片段"时，除了产出失真卡，建议额外显示提示文本如"这两样东西似乎不该放在一起……也许该换个方式看？"
5. **conclusions 判定逻辑**：真结论的 `recipe.required_keywords` 需匹配合成链最终产物（如 Trial 1 真结论需检测"第七号死信箱的数据芯片"这张卡是否被提交，而非检测"死信箱"+"交接点"两张原料卡）
6. **【重要】Meta 卡特异性检查**：新增 `hidden_layer_meta_card` 字段到 Stage 数据中，并在 `revealHiddenLayer()` 前检查 Meta 卡身份匹配（详见第九章）。不修改则会出现错误 Meta 卡触发错误隐藏层的问题
7. **hidden_layer_keywords 为空数组的处理**：新增的"信号溢出"和"脑波异常"隐藏台词层 `hidden_layer_keywords` 为 `[]`，需确认 Meta 入侵代码能正确处理此情况（只显示文本，不创建关键词卡）
8. **Meta 入侵目标 Stage 映射**：确认 Meta 入侵支持非最终 Stage 作为入侵目标（Trial 2 stage_04、Trial 3 stage_02）

### 12.3 需确认的设计决策

1. **真结论提交机制**：玩家合成出真结论卡片后，是否直接替换假结论卡片可提交？还是需要额外条件（如必须先提交假结论被NPC质疑后才能提交真结论）？建议：真结论和假结论都可以提交，但真结论提交后触发 CRT 异常效果和不同的 NPC 反应
2. **替代路径发现引导**：替代合成路径是否需要防卡关提示触发？建议：当玩家在最终 Stage 停留超过 2 分钟且未提交结论时，NPC 暗示"之前的线索……也许还能用得上？"

---

## 十三、设计思路总结

### 核心设计理念

1. **假结论不是死胡同，而是真结论的垫脚石**——每个 Trial 的真结论合成都需要假结论作为材料，让玩家的每一步探索都有价值

2. **隐藏关键词是叙事转折的钥匙**——三个 Trial 的隐藏关键词分别通过三种不同机制解锁（矛盾标记、Meta入侵、组合解锁），保持玩法新鲜感

3. **属性系统三层参与**：
   - **第一层（合成失真）**：属性矛盾在合成时产出失真卡，惩罚错误的合成尝试
   - **第二层（矛盾发现）**：不同属性档案提示玩家可能的矛盾点，引导⚡标记
   - **第三层（干扰识别）**：干扰词的属性使其与大多数线索卡合成时产出失真卡，帮助玩家识别"这条路走不通"

4. **统一模式 + 渐进复杂度**：
   - Trial 1（教学关）：⚡矛盾标记 → 2步合成 → 真结论
   - Trial 2（进阶关）：Meta入侵 → 2步合成 → 真结论
   - Trial 3（高难关）：⚡+Meta组合 → 2步合成 → 真结论
   - 模式一致（隐藏词→中间产物→假结论→真结论），但解锁机制递进复杂

5. **干扰词的叙事融合**：每个干扰词都不是随机设计，而是与假记忆叙事深度绑定——"女儿"是情感锚点、"姐夫"是误导线索、"伤疤"是物理假象。玩家通过失真卡反馈逐渐意识到这些词是"被植入的"

---

*文档结束。请 team-lead 审阅后分发至 game-writer 和 game-developer 协调执行。*
