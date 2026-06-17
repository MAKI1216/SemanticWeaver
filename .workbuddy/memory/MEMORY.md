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
- 存档：localStorage 保存 Trial/Stage 进度
- Trial 4：普通提交区隐藏，只有特殊目标区（集团云端数据库）可接收金色卡片

## 已修复的 Bug
- board.js: onMouseUp 中 cleanupDrag/handleDrop 调用顺序颠倒 → 交换顺序
- board.js: initGlobalListeners 重复绑定 → 加 globalListenersInitialized 守卫
- game.js: Trial 4 普通提交区接受金色卡片导致卡死 → 隐藏提交区+安全守卫
- game.js: completeTrial 末尾 Trial 空 outro 导致无结局 → 直接 gameOver 兜底
