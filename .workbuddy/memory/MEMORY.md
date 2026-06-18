# Semantic Weaver - 项目记忆

## 项目概述
- 网页端叙事解谜游戏《语义缝合师》(Semantic Weaver)
- 纯前端 H5 游戏，无后端依赖
- 技术栈：HTML5 + CSS3 + 原生 JavaScript

## 文件结构
- `index.html` - 主页面
- `css/styles.css` - 全部样式（双态主题、CRT效果、动画）
- `js/game.js` - 游戏主控/状态管理/合成引擎
- `js/dialogue.js` - 对话系统（打字机效果、关键词渲染）
- `js/board.js` - 推演板系统（卡片管理、拖放、合成判定）
- `js/renderer.js` - 渲染引擎（DOM操作、主题切换、特效）
- `js/audio.js` - 音效管理（Web Audio API）
- `data/game-data.js` - 全部剧情数据、配方、关卡配置

## 核心设计
- 合成系统：JSON 配方驱动的多对一状态机，支持 A+B/B+A 无序匹配
- 双态主题：.theme-clinic（暖黄）↔ .theme-interrogation（冰冷血红）
- 4 个 Trial 章节完整流程，Trial 4 含倒计时和双结局
- 存档：localStorage 保存 Trial/Stage 进度，SAVE_VERSION='1.1'，支持旧存档自动迁移
- Trial 4：普通提交区隐藏，只有特殊目标区（集团云端数据库）可接收金色卡片

## 增强玩法开发进度
- 9 阶段开发计划（Phase 1–9），分阶段验收
- **Phase 1 基础设施重构** ✅ 已完成（2026-06-18）
  - keyword_metadata + getKeywordMetadata() 数据层
  - 卡片类型系统（normal/hidden/half_finished/distorted/meta）+ setCardType()
  - 关键词可重复提取（extractCount 计数，不再 disable）
  - 推演板重置功能（#board-reset-btn + 非阻塞确认）
  - 存档系统升级（trials_state/memory_echo/playthrough_history/endings_seen）
- **Phase 2 关键词属性系统** ✅ 已完成（2026-06-18）
  - attribute_defs（7种属性）+ contradiction_pairs（8对）+ semantic_contradictions（2个标记点）
  - 83 个关键词填充属性元数据
  - 属性矛盾→失真卡：配方匹配但属性矛盾时产出 distorted 卡
  - 矛盾标记系统：⚡按钮→选2张→检测→解锁隐藏关键词（红色连线 SVG 已移除，仅保留特效提示）
  - 失真卡净化：技能卡+失真卡/双失真卡概率校准/≥3张过载警告
  - 属性检查面板：右键卡片弹出（属性列表+矛盾提示）
- **Phase 3 Meta 语义入侵** ✅ 已完成（2026-06-18）
  - 隐藏台词层系统：dialogue.js 新增 setHiddenLayer/revealHiddenLayer/hasHiddenLayer/clearHiddenLayer/getCurrentHiddenLayerGate
  - Trial 2 Stage 3 hidden_layer（"目标#037已清除"），无门控
  - Trial 3 Stage 4 hidden_layer（"受试者#019"），gated_by trial3_semantic 矛盾标记
  - Meta 关键词：数据残影（Trial 2 Stage 1）、记忆碎片（Trial 3 Stage 2），card_type="meta"
  - Meta 卡片可拖出推演板→拖到对话框触发入侵→揭示底层台词→提取隐藏关键词
  - Meta 卡片使用后消耗（meta_consumed 标记），不可重新提取
  - consumeMetaCard()：移除卡片+标记 metadata+对话关键词加 meta-consumed 类
  - onMetaIntrusion 回调：check_gate 检查矛盾标记存档，performed 记录到存档
  - CSS：底层台词等宽字体+绿色辉光+glitch入场、Meta 关键词金色高亮、拖放目标高亮
  - Phase 3.4/3.5（Trial 3 伏笔/Trial 4 应用）依赖 Phase 4，暂缓
- **成品化路线图 v2.0** — 3必做+3选做（详见 `成品化开发路线图_v2.md`）
  - **Phase A** 内容+美术深化 ✅ 已完成（2026-06-18，团队协作）
    - A.1 剧情对话重写 ✅ → `data/trials-rewrite-draft.js`（13488字）
    - A.2 关键词编排重构 ✅ → `docs/A2_keyword_design.md`（真结论合成路径+属性修正+干扰词）
    - A.3 美术素材生成 ✅ → `data/art-assets-design-v2.md` + 13张AI图片（`assets/img/`）
    - A.4 开场动画 ✅ → `js/intro.js`（502行，CSS场景+雨声合成+标题glitch）
    - A.5 教程弹窗系统 ✅ → `js/tutorial.js`（341行，9弹窗）
    - A.6 过场动画框架 ✅ → `js/cutscene.js`（838行，6过场）
    - 集成待办：文案/关键词/美术需集成到game-data.js和CSS
    - Phase B 预备已完成（温思语在A.1期间提前处理）：3个干扰词{}标记+extractable_words、Trial 2隐藏台词层修正、2个新Meta关键词（信号溢出/脑波异常）、全部兼容性确认
  - **Phase A 美术集成** ✅ 已完成（2026-06-18）
    - NPC 立绘：renderer.js 从 CSS 几何图形 → AI 图片 `<img>`，4个NPC全部替换
    - 背景图：CSS `#game-screen::before` 加载 bg_clinic/bg_interrogation.png
    - 开场漫画：intro.js createStreetScene/createClinicScene 加载 frame_1/frame_3.png
  - **Phase B** 核心玩法闭环 ✅ 已完成（2026-06-18）
    - B.1 真假结论系统：onSubmitCard 重写，conclusions[] 匹配→NPC两步反应→确认框→CRT异常→存档记录
    - B.2 假结局：triggerFalseEnding()，CRT关闭→黑屏→打字机反问句→重来提示
    - B.3 Trial 4 入口：completeTrial 检查三关全真→CutsceneSystem.play('trial4_entrance')
    - B.4 防卡关：3次失败NPC暗示+6次/2分钟卡片脉动
    - B.5 配方验证：9条新配方+6条conclusions+102个metadata全部通过
    - 数据层已在 game-data.js 中完整集成（A.1文案+A.2配方/属性+conclusions+hidden_layer_meta_card）
  - **Phase C** 打磨上线 → 音效+QA+存档+上线
    - 音效系统 v3 ✅ 已完成（2026-06-19）：卷积混响+和弦进行+电影级弦乐，全面柔化（详见 2026-06-19 日志）
  - Phase D/E/F 选做（二周目/多步推理/P2机制）
- 相关文档：`成品化开发路线图_v2.md`、`增强玩法开发任务清单.md`、`真假结论系统_游戏设计文档.md`、`工作日志.md`

## 已修复的 Bug
- board.js: onMouseUp 中 cleanupDrag/handleDrop 调用顺序颠倒 → 交换顺序
- board.js: initGlobalListeners 重复绑定 → 加 globalListenersInitialized 守卫
- game.js: Trial 4 普通提交区接受金色卡片导致卡死 → 隐藏提交区+安全守卫
- game.js: completeTrial 末尾 Trial 空 outro 导致无结局 → 直接 gameOver 兜底
