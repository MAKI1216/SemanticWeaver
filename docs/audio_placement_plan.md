# 《语义缝合师》(Semantic Weaver) — 音乐音效放置方案

> 策划：季元策 | 日期：2026-06-19 | 版本：v1.0

---

## 一、现有音效复核与补漏

### 1.1 现有音效触发位置清单

| 音效函数 | 当前触发位置 | 触发时机 | 状态 |
|---------|------------|---------|------|
| `playSuccess()` | `renderer.js:165` showCombineSuccess | 卡片合成成功 + 特效 | ✅ 正确 |
| `playSuccess()` | `board.js:1030` handleMetaIntrusion→dialogue | Meta入侵对话框成功 | ✅ 正确 |
| `playSuccess()` | `board.js:1451` executeMarkContradiction | ⚡矛盾标记成功 | ⚠️ 应替换为专用音效 |
| `playFail()` | `renderer.js:187` showCombineFail | 卡片合成失败 + 特效 | ✅ 正确 |
| `playFail()` | `board.js:1154` handleCombine→distorted fail | 失真卡校准失败 | ✅ 正确 |
| `playFail()` | `game.js:425,443,455` onSubmitCard | 提交失败/拒收 | ✅ 正确 |
| `playType()` | `dialogue.js:144` showDialogue→showNextUnit | 打字机每3字触发 | ✅ 正确 |
| `playType()` | `game.js:1392` typewriteText | 假结局打字机 | ✅ 正确 |
| `playWarning()` | `game.js:938` _startTrialInner | Trial 4 入口 | ✅ 正确 |
| `playWarning()` | `game.js:640` triggerCRTEffect | CRT异常效果（moderate/intense） | ✅ 正确 |
| `playWarning()` | `game.js:1321` triggerFalseEnding | 假结局CRT关闭 | ✅ 正确 |
| `playWarning()` | `game.js:1489` triggerEndingB | 结局B触发 | ✅ 正确 |
| `playGlitch()` | `renderer.js:255` startGlitch→间歇 | Trial 4 故障效果 | ✅ 正确 |
| `playGlitch()` | `board.js:1049` handleMetaIntrusion→crt | Meta入侵CRT | ✅ 正确 |
| `playDrop()` | `board.js:509` performReset | 推演板重置 | ⚠️ 语义不匹配 |
| `playDrop()` | `board.js:920` handleDrop→board | 首次提取关键词→放置卡片 | ✅ 正确 |
| `playDrop()` | `board.js:966` handleDrop→trash | 卡片拖入垃圾桶 | ⚠️ 应替换为删除音 |
| `playDropLight()` | `board.js:917` handleDrop→board | 重复提取关键词 | ✅ 正确 |
| `playSubmit()` | `game.js:438` onSubmitCard→Trial4 final | 最终Stage提交成功→EndingA | ✅ 正确 |
| `playSubmit()` | `game.js:449` onSubmitCard→普通 | 普通Stage提交成功 | ✅ 正确 |
| `playSubmit()` | `game.js:483` handleConclusionSubmit | 结论确认提交 | ✅ 正确 |
| `playCountdownTick()` | `game.js:1430` startCountdown interval | 倒计时≤30秒每秒 | ⚠️ 需增强 |
| `playEnding('A')` | `renderer.js:332` showEnding | 结局A画面 | ✅ 正确 |
| `playEnding('B')` | `renderer.js:332` showEnding | 结局B画面 | ✅ 正确 |

### 1.2 现有音效问题清单

| # | 问题 | 当前行为 | 建议 |
|---|------|---------|------|
| 1 | ⚡矛盾标记成功用 `playSuccess` | 与卡片合成成功混用同一音效 | 新增 `playContradictionMark` |
| 2 | 推演板重置用 `playDrop` | 卡片溶解却播放放置音 | 新增 `playBoardReset` |
| 3 | 卡片入垃圾桶用 `playDrop` | 删除操作却播放放置音 | 新增 `playTrash` |
| 4 | 倒计时仅最后30秒有滴答 | 前30秒完全静默 | 新增分层倒计时音效系统 |
| 5 | Trial 4 无背景氛围 | 完全依赖间歇glitch | 新增工业氛围 loop |
| 6 | 无 Stage 推进过渡音 | Stage 切换完全静默 | 新增 `playStageTransition` |

---

## 二、新增音效/音乐详细规格

### A. 背景氛围音乐

---

#### A1. 诊所氛围 (Trial 1-3)

- **音效名称**: `playClinicAmbience`
- **触发时机**: 
  - **文件**: `game.js` → `_startTrialInner()` 函数 (line 926)
  - **位置**: 在 `Renderer.showTrialTransition(...)` 回调内，`DialogueSystem.clearDialogue()` 之前
  - 仅在 `!state.isTrial4Active` 时启动
  - **停止时机**: `game.js` → `_startTrialInner()` 进入 Trial 4 分支时停止; `completeTrial()` 完成时淡出
- **建议的声音特征**: 
  - 持续的环境 drone pad，基频 80-120Hz，叠加轻柔 sine wave 和弦 (C大调，Am-F-C-G 循环)
  - 添加模拟雨声的白噪声层 (low-pass @ 800Hz, volume 0.03-0.05)
  - 层叠微弱的模拟心跳（40 BPM，仅作为 sub-bass 律动感），叠加极轻微的磁带噪声
  - **时长**: 无限循环 (loop)，每个循环周期约 32 秒平滑过渡
  - **情绪**: 温暖、静谧、略带不安的忧郁感，像雨天的诊所等候室
- **优先级**: **P0** (必须) — 奠定 Trial 1-3 整体情绪基调

---

#### A2. 审讯室氛围 (Trial 4)

- **音效名称**: `playInterrogationAmbience`
- **触发时机**:
  - **文件**: `game.js` → `_startTrialInner()` 函数 (line 926)
  - **位置**: 在 `state.isTrial4Active` 条件分支内，`Renderer.setTheme('interrogation', false)` 之后，`AudioManager.playWarning()` 之前
  - **停止时机**: `triggerEndingA()` / `triggerEndingB()` 中调用; 或倒计时归零
- **建议的声音特征**:
  - 工业低频嗡鸣 (sawtooth @ 50-60Hz, filtered, 极低音量 0.04)
  - 叠加金属回响——周期性 (每 6-8 秒) 的短促金属撞击混响 (damped sine @ 200Hz→decay 1.5s)
  - 远距离机器运转声 (低频脉冲 @ 2Hz 律动)
  - 偶尔的数据流/电流声 (8kHz 以上微弱高频，随机触发)
  - **时长**: 无限循环，每 45 秒一个周期
  - **情绪**: 冰冷、压迫、机械、非人化
- **优先级**: **P0** (必须) — Trial 4 氛围基石

---

#### A3. 倒计时音乐 (Trial 4 Stage 03)

- **音效名称**: `playCountdownMusic` / `updateCountdownMusicTier`
- **触发时机**:
  - **文件**: `game.js` → `startCountdown()` 函数 (line 1407)
  - **位置**: 紧接 `state.countdownTimer = setInterval(...)` 之前启动音乐
  - **分层更新**: 在 `setInterval` 回调内（line 1416-1438），根据 `state.countdownRemaining` 调用 `updateCountdownMusicTier(remaining)`
  - **停止时机**: `stopCountdown()` 中停止; `triggerEndingA()` / `triggerEndingB()` 中停止
- **建议的声音特征**:
  
  | 时间段 | 音乐层次 | 特征 |
  |--------|---------|------|
  | 60→30s | Tier 1: 工业脉动 | 低沉的工业嗡鸣 + 缓慢心跳律动 (45 BPM)，类似潜艇声呐 ping |
  | 30→15s | Tier 2: 加速紧张 | 心跳加速至 75 BPM，加入间歇警报泛音 (1kHz 正弦短脉冲，每 3 秒)，工业嗡鸣升高半个音阶 |
  | 15→0s | Tier 3: 狂乱高潮 | 心跳 120 BPM，警报长鸣 (880Hz+1760Hz 双频)，加入数据损坏杂音 burst，所有层次音量渐进提升至 1.5x |
  
  - **技术实现**: 使用 3 个独立的 gain node 做 crossfade，避免突兀切换
  - **情绪**: 从压抑的紧张 → 焦虑的恐惧 → 崩溃的绝望
- **优先级**: **P0** (必须) — Trial 4 核心体验

---

### B. Trial 4 专属音效

---

#### B1. 心跳声

- **音效名称**: `playHeartbeat`
- **触发时机**:
  - **文件**: `game.js` → `startCountdown()` → setInterval 回调 (line 1416)
  - **位置**: 与倒计时 tick 并列，根据 `remaining` 控制频率：
    - 60→30s: 每 2 秒播放一次 (模拟 30 BPM 深潜心跳)
    - 30→15s: 每 1.3 秒播放一次 (模拟 45 BPM)
    - 15→5s: 每 0.8 秒播放一次 (模拟 75 BPM)
    - 5→0s: 每 0.5 秒播放一次 (模拟 120 BPM)
  - 在 `countdownRemaining` 值为 [60,58,56,...,32,30,28.7,...,15.2,14.4,...] 这样的间隔触发
  - **注意**: 不替代 `playCountdownTick`，两者并行——tick 是秒级精确滴答，heartbeat 是生理节奏
- **建议的声音特征**:
  - 低频脉冲: sine wave @ 40Hz，attack 50ms / decay 300ms
  - 叠加 sub-bass 共振 (20-30Hz)，让玩家身体感受到震动（在支持的设备上）
  - 添加轻微的胸腔共鸣模拟 (bandpass @ 100-200Hz, noise burst 50ms)
  - 后期加速时，decay 缩短，attack 更尖锐
  - **时长**: 单次约 0.4-0.6 秒
  - **情绪**: 原始恐惧、生理紧张
- **优先级**: **P0** (必须) — Trial 4 倒计时阶段的核心生理驱动

---

#### B2. 警报声

- **音效名称**: `playAlarm` / `startAlarmLoop` / `stopAlarmLoop`
- **触发时机**:
  - **文件**: `game.js` → `startCountdown()` → setInterval 回调 (line 1416)
  - **位置**: 
    - 30→15s: 间歇警报 — `playAlarm('intermittent')` 每 3 秒播放一次短警报 (0.3s)
    - 15→0s: 长鸣警报 — `startAlarmLoop()` 启动持续循环，`stopAlarmLoop()` 在 `stopCountdown()` 中停止
  - **额外触发**: `triggerEndingB()` 在金卡入垃圾桶时也可播放一次短促警报
- **建议的声音特征**:
  - 间歇警报: 880Hz + 1760Hz 双频正弦波，attack 30ms / sustain 200ms / decay 100ms，类似空袭汽笛的前奏
  - 长鸣警报: 双频正弦波持续循环，加入 slow LFO (0.5Hz) 做音量/频率微调制，模拟老式空袭警报的起伏感
  - 叠加远距离反射的回声 (delay 200ms, feedback 0.3)
  - **情绪**: 紧急、危殆、不可逆的倒计时
- **优先级**: **P0** (必须) — 15 秒临界点的标志性音效

---

#### B3. 工业杂音

- **音效名称**: `playIndustrialNoise`
- **触发时机**:
  - **文件**: `renderer.js` → `startGlitch()` 函数 (line 238)
  - **位置**: 与现有 glitch burst 并列，在 `glitchInterval` 的 setInterval 回调中 (line 245)，与 `playGlitch()` 交替或叠加
  - 触发概率: 30% 每 2 秒周期（与现有 glitch burst 共享随机判定，但独立播放）
  - **额外触发**: Trial 4 Stage 03 倒计时 30→0s 期间，触发概率提升至 60%
- **建议的声音特征**:
  - 金属回响: damped sine @ 300Hz→decay 2s，模拟大空间金属撞击
  - 机器嗡鸣: 低频方波 @ 60Hz + 120Hz 谐波，持续 0.5-1.5s
  - 管道蒸汽/气压释放: 白噪声 burst (bandpass @ 500-2000Hz, 0.3s)
  - 每次触发随机选择其中一种，避免重复感
  - **情绪**: 工业化、冷酷、非人化空间的压迫
- **优先级**: **P1** (重要) — 丰富 Trial 4 声音层次

---

#### B4. 数据损坏音

- **音效名称**: `playDataCorruption`
- **触发时机**:
  - **文件**: `renderer.js` → `startGlitch()` → glitchInterval 回调 (line 245)
  - **位置**: 与 glitch burst 叠加，当随机选中对话区域触发剧烈故障时额外播放
  - **倒计时强化**: 15→0s 期间，`playDataCorruption` 作为独立层持续随机触发，频率逐渐增加
  - **额外触发**: `board.js` → `handleCombine()` 产出失真卡时 (line 1186)
  - **额外触发**: `game.js` → `triggerCRTEffect('intense')` 时 (line 615)
- **建议的声音特征**:
  - 数字故障: 短促的 bit-crushing 噪声 (采样率降低至 2kHz 的白噪声 burst, 0.1-0.3s)
  - 频率跳跃: 快速扫频 sine (1kHz→8kHz→500Hz, duration 0.15s)
  - 数据碎片: 极短的随机频率脉冲簇 (8-12 个脉冲 @ 0.01s 间隔)
  - **时长**: 0.1-0.3 秒单次
  - **情绪**: 数字世界的崩坏、系统瓦解
- **优先级**: **P0** (必须) — 倒计时最后 15 秒的关键层次

---

### C. 增强现有音效

---

#### C1. 提取关键词专用音

- **音效名称**: `playKeywordPickup`
- **触发时机**:
  - **文件**: `board.js` → `handleDrop()` → case 'board' (line 903-922)
  - **位置**: 替代当前的 `playDrop()` / `playDropLight()`，在关键词首次提取→卡片创建时播放
  - 首次提取: `playKeywordPickup('fresh')`
  - 重复提取: `playKeywordPickup('repeat')` — 音高降低、音量减半
- **建议的声音特征**:
  - 首次提取: 清脆的"叮"声 — sine wave @ 1200Hz→800Hz glide, attack 5ms / decay 150ms，叠加微弱的纸张摩擦高频 (8kHz noise 20ms)
  - 重复提取: 同一声音降低一个八度，音量 50%，decay 缩短至 80ms
  - **情绪**: 灵光一现、拾取记忆碎片
- **优先级**: **P1** (重要) — 提升核心交互反馈质感

---

#### C2. 卡片合成"解锁"质感

- **音效名称**: 增强 `playSuccess()`
- **触发时机**:
  - **文件**: `renderer.js` → `showCombineSuccess()` (line 156) 和 `board.js` → `handleCombine()` 正常合成分支 (line 1188-1190)
  - 不改动触发位置，仅增强 `playSuccess()` 函数本身
- **建议的声音特征**:
  - 在现有 C5-E5-G5 上升和弦基础上，末尾追加一个轻微的"咔嗒"解锁声（模仿锁簧弹开）
  - 解锁声: sine @ 2400Hz, attack 2ms / decay 60ms, 在第三个音符后 0.05s 播放
  - 可选: 叠加微弱的 shimmer/reverb tail (高频延音 0.5s)
  - **情绪**: 拼图碎片完美咬合
- **优先级**: **P2** (锦上添花) — 现有音效已经够用

---

#### C3. Stage 推进过渡音

- **音效名称**: `playStageTransition`
- **触发时机**:
  - **文件**: `game.js` → `advanceStage()` 函数 (line 1163)
  - **位置**: 在 `setTimeout(function() { runStage(...) }, 800)` 之前立即播放
  - 在 `Renderer.showFlash('white', 300)` 之后 (line 450, advanceStage 被 onSubmitCard 调用时)
- **建议的声音特征**:
  - 上升的 whoosh/sweep: 白噪声 bandpass 从 200Hz 扫至 4kHz, duration 0.4s
  - 叠加低沉的"咚"声作为段落标记: sine @ 80Hz, attack 5ms / decay 300ms
  - 音量控制在 0.06-0.08，不宜喧宾夺主
  - **情绪**: 翻页、进入新章节的仪式感
- **优先级**: **P1** (重要) — 改善叙事节奏感

---

#### C4. Meta 入侵专用音效

- **音效名称**: `playMetaIntrusion`
- **触发时机**:
  - **文件**: `board.js` → `handleMetaIntrusion()` 函数 (line 988)
  - **位置**: 在 `consumeMetaCard(cardData)` 之前（line 1015 for dialogue, line 1045 for crt），替代目前的 `playSuccess()` (dialogue) / `playGlitch()` (crt)
  - 两种目标类型使用同一音效的不同变体
- **建议的声音特征**:
  - 核心: 数字化的"撕裂"音 — 快速扫频锯齿波 (200Hz→4kHz, 0.2s) + bit-crushed 噪声 burst
  - dialogue 变体: 叠加低语回声（微弱的反向人声碎片，模拟"穿透对话表层"）
  - crt 变体: 叠加 CRT 高压放电声 (火花噪声 @ 10kHz+)
  - 末尾追加微弱的系统确认音: sine @ 1500Hz, 短促"叮" 0.05s
  - **情绪**: 入侵、穿透、打破第四面墙
- **优先级**: **P1** (重要) — Meta 是核心特色机制

---

#### C5. ⚡矛盾标记成功专用音效

- **音效名称**: `playContradictionMark`
- **触发时机**:
  - **文件**: `board.js` → `executeMarkContradiction()` 函数 (line 1419)
  - **位置**: 替代 line 1451 的 `AudioManager.playSuccess()`，在矛盾标记成功、解锁关键词之前播放
- **建议的声音特征**:
  - 两个冲突音符同时响起: 不协和音程 minor 2nd (如 C5 + C#5)，短促冲击 (attack 10ms / decay 300ms)
  - 随后一个解决的"叮": sine @ C6, delay 0.3s, 清脆单音
  - 叠加微弱的电流/火花声 (8kHz noise burst 0.05s)
  - **情绪**: 矛盾被发现→裂痕被揭示→真相碎片解锁
- **优先级**: **P0** (必须) — 核心机制需要专属反馈

---

#### C6. 推演板重置音效

- **音效名称**: `playBoardReset`
- **触发时机**:
  - **文件**: `board.js` → `performReset()` 函数 (line 456)
  - **位置**: 替代 line 509 的 `AudioManager.playDrop()`，在卡片溶解动画启动后立即播放
- **建议的声音特征**:
  - 多张卡片同时消散: 多层纸张翻动声叠加 (white noise bandpass @ 2-6kHz, 快速衰减 0.3s)
  - 叠加低频"呼"声: sine @ 100Hz, quick swell 0.2s / decay 0.5s
  - **情绪**: 重新整理、清空思绪
- **优先级**: **P2** (锦上添花) — 使用频率低

---

#### C7. 卡片入垃圾桶音效

- **音效名称**: `playTrash`
- **触发时机**:
  - **文件**: `board.js` → `handleDrop()` → case 'trash' (line 961-970)
  - **位置**: 替代 line 966 的 `AudioManager.playDrop()`
- **建议的声音特征**:
  - 短促的纸张撕裂/揉搓: noise burst (bandpass @ 1-4kHz, 0.15s)
  - 可选: 在 Trial 4 中，金色卡片入垃圾桶时叠加低频金属撞击 (sine @ 60Hz, 0.3s decay)，因为这会触发结局B
  - **情绪**: 丢弃、破坏
- **优先级**: **P1** (重要) — 删除与放置应有不同反馈

---

## 三、Trial 4 倒计时分层方案（核心）

> 这是整个音效方案中最重要的部分，直接决定 Trial 4 的紧张体验。

### 3.1 时间线总览

```
秒数:  60 ───────────────── 30 ─────────────── 15 ──────── 0
       │                     │                   │           │
氛围:  审讯室环境音 (持续)     │                   │           │
       │                     │                   │           │
心跳:  慢 (0.5Hz, 每2秒)    快 (0.77Hz, 每1.3秒) 狂 (2Hz, 每0.5秒)
       │                     │                   │           │
警报:  ─                     间歇(每3秒0.3s)     长鸣持续 ──→
       │                     │                   │           │
数据:  ─                     ─                   随机burst(渐密)
       │                     │                   │           │
滴答:  ─                     playCountdownTick   playCountdownTick
       │                     (220Hz, 每秒)        (220Hz, 每秒)
       │                     │                   │           │
视觉:  countdown-warning      countdown-warning   countdown-critical
       (屏幕边缘红光)          (红光加深)           (红色狂闪+脉动)
```

### 3.2 代码实现锚点

**文件**: `game.js` → `startCountdown()` 函数

**当前代码** (line 1407-1439):
```javascript
function startCountdown() {
  // ...
  state.countdownTimer = setInterval(function() {
    // ...
    state.countdownRemaining--;

    // 倒计时显示更新
    Renderer.updateCountdownDisplay(state.countdownRemaining, total);

    // === 插入点 A: 心跳声 ===
    // if (state.countdownRemaining > 30) → 每2秒
    // else if (state.countdownRemaining > 15) → 每1.3秒
    // else if (state.countdownRemaining > 0) → 每0.8秒

    // === 插入点 B: 警报 ===
    // if (state.countdownRemaining === 30) → 启动间歇警报
    // if (state.countdownRemaining === 15) → 切换为长鸣警报

    // === 插入点 C: 数据损坏音 ===
    // if (state.countdownRemaining <= 15) → 随机触发，频率随剩余时间递增

    // 现有：最后30秒倒计时滴答
    if (state.countdownRemaining <= 30 && state.countdownRemaining > 0) {
      AudioManager.playCountdownTick();
    }

    // 倒计时结束
    if (state.countdownRemaining <= 0) {
      stopCountdown();
      triggerEndingB();
    }
  }, 1000);
}
```

### 3.3 倒计时音乐分层状态机

```
┌──────────────────────────────────────────────────┐
│          Tier 1: 工业脉动 (60→30s)                │
│  • 低沉 drone pad @ 55Hz                          │
│  • 缓慢心跳每2秒 (30 BPM 等效)                     │
│  • 工业嗡鸣背景 (sawtooth filtered)                │
│  • 间歇 glitch/industrial 杂音 (30% 概率)          │
├──────────────────────────────────────────────────┤
│          Tier 2: 加速紧张 (30→15s)                 │
│  • drone pad 升半音 → @ 58Hz                      │
│  • 心跳加速每1.3秒 (46 BPM)                        │
│  • 间歇警报 880Hz 每3秒 (0.3s 短脉冲)              │
│  • 倒计时滴答 220Hz 每秒                           │
│  • glitch/industrial 概率升至 50%                  │
├──────────────────────────────────────────────────┤
│          Tier 3: 狂乱高潮 (15→0s)                  │
│  • drone pad 音量 ×1.5, 频率抖动 (LFO 2Hz)        │
│  • 心跳狂跳每0.5-0.8秒 (75→120 BPM)               │
│  • 警报长鸣 880+1760Hz 持续                         │
│  • 数据损坏音随机 burst (概率逐步升至 80%)         │
│  • 倒计时滴答 + 红色闪烁同步                        │
│  • 最后5秒: 所有音量推至峰值，加入低频轰鸣(30Hz)   │
└──────────────────────────────────────────────────┘
```

### 3.4 停止条件

所有 Trial 4 专属音效/音乐的停止时机：

| 停止条件 | 触发位置 | 说明 |
|---------|---------|------|
| 结局A触发 | `game.js:1457` triggerEndingA() | 立即停止所有倒计时音效→播放 Ending A 音效 |
| 结局B触发 | `game.js:1482` triggerEndingB() | 立即停止→播放 Warning → GlitchBurst → Ending B |
| 倒计时归零 | `game.js:1435` countdownRemaining≤0 | 已被 triggerEndingB 覆盖 |
| 重启诊断 | `game.js:1556` restartCurrentTrial() | 停止所有 Trial 4 音效 |
| 页面离开 | `window.onbeforeunload` | AudioContext.close() |

---

## 四、新增 AudioManager 函数签名

```javascript
// === 背景氛围 ===
playClinicAmbience()          // 启动诊所氛围 loop
stopClinicAmbience()           // 停止诊所氛围 (带 2s fadeout)
playInterrogationAmbience()   // 启动审讯室氛围 loop
stopInterrogationAmbience()    // 停止审讯室氛围 (带 1s fadeout)

// === 倒计时音乐 ===
startCountdownMusic()          // 启动 Tier 1
updateCountdownMusicTier(tier) // 切换层级: 1|2|3 (内部 crossfade)
stopCountdownMusic()           // 停止 (带 0.5s fadeout)

// === Trial 4 专属 ===
playHeartbeat(rate)            // rate: 心跳间隔秒数 (2.0 | 1.3 | 0.8 | 0.5)
startAlarmLoop()               // 启动持续警报循环
stopAlarmLoop()                // 停止警报
playAlarmBurst()               // 单次短警报 (0.3s)
playIndustrialNoise()          // 随机播放一种工业杂音
playDataCorruption()           // 数据损坏音 burst

// === 增强音效 ===
playKeywordPickup(variant)     // variant: 'fresh' | 'repeat'
playStageTransition()          // Stage 推进过渡
playMetaIntrusion(target)      // target: 'dialogue' | 'crt'
playContradictionMark()        // ⚡矛盾标记成功
playBoardReset()               // 推演板重置
playTrash(isGolden)            // 卡片入垃圾桶 (Trial4金卡特殊处理)
```

---

## 五、实施优先级总览

### P0 (必须实现 — 8项)

| # | 音效 | 理由 |
|---|------|------|
| 1 | `playClinicAmbience` | Trial 1-3 情绪基底 |
| 2 | `playInterrogationAmbience` | Trial 4 氛围区分 |
| 3 | `playCountdownMusic` (含3 Tier) | Trial 4 核心体验 |
| 4 | `playHeartbeat` | 生理紧张驱动 |
| 5 | `playAlarm` (间歇+长鸣) | 15秒临界标志 |
| 6 | `playDataCorruption` | 最后15秒层次 |
| 7 | `playContradictionMark` | ⚡核心机制反馈 |
| 8 | 倒计时分层状态机 | 整体编排逻辑 |

### P1 (重要 — 5项)

| # | 音效 | 理由 |
|---|------|------|
| 9 | `playIndustrialNoise` | Trial 4 声音丰富度 |
| 10 | `playKeywordPickup` | 核心交互质感提升 |
| 11 | `playStageTransition` | 叙事节奏改善 |
| 12 | `playMetaIntrusion` | Meta 机制专属反馈 |
| 13 | `playTrash` | 删除与放置区分 |

### P2 (锦上添花 — 3项)

| # | 音效 | 理由 |
|---|------|------|
| 14 | `playSuccess` 增强 (解锁质感) | 现有已够用 |
| 15 | `playBoardReset` | 使用频率低 |
| 16 | `playCountdownTick` 低频强化 | 现有已可接受 |

---

## 六、技术可行性备注

1. **Web Audio API 限制**: 所有音效均使用合成音频，无需外部文件加载。`AudioManager` 已有 `AudioContext` 初始化逻辑。
2. **循环音效**: 对于 `playClinicAmbience` 和 `playInterrogationAmbience`，使用 `setInterval` + 周期性重新调度 oscillator（Web Audio 不原生支持 loop 点），或在 oscillator `onended` 回调中重新创建。
3. **分层 Crossfade**: 倒计时音乐 3 个 Tier 之间的过渡，通过两个并行 gain node 做 crossfade（`linearRampToValueAtTime`），过渡时长 2 秒。
4. **性能**: 所有合成音频计算量极低（< 20 个并发 oscillator），不会影响游戏帧率。
5. **移动端**: 心跳 sub-bass (20-30Hz) 在移动设备扬声器上无法再现，应以 80-120Hz 的泛音作为 fallback。
6. **静音机制**: 所有新音效需遵守 `AudioManager.mute/unmute` 的 `masterGain` 控制。
7. **浏览器自动播放策略**: `AudioManager.init()` 和 `resume()` 已在用户首次点击「新游戏」时调用，背景音乐应在 `_startTrialInner` 中启动，确保已有用户手势上下文。

---

*文档完毕。如需追加文案或美术支持，请告知。*
