/**
 * 语义缝合师 - 教程/引导弹窗系统模块
 * 负责首次功能引导弹窗的展示、记录与管理
 * 基于 localStorage 记录已展示的教程，NPC 口吻文案，CRT 终端美学
 */
var TutorialSystem = (function() {
  'use strict';

  // ==================== 常量 ====================

  var STORAGE_KEY = 'semantic_weaver_tutorials';

  // ==================== 教程数据定义 ====================

  /**
   * 9 个教程弹窗定义
   * 每个教程包含：NPC 口吻的引导文案 + 触发场景描述
   */
  var TUTORIALS = {
    'T1': {
      title: '提取关键词',
      npc: '直觉',
      text: '那些发光的词……是你病人话语中的碎片。试着把它拖到右边的推演板上。'
    },
    'T2': {
      title: '合成卡片',
      npc: '直觉',
      text: '把两张相关的碎片叠在一起……有时候它们会自动合成成新的线索。'
    },
    'T3': {
      title: '使用技能卡',
      npc: '直觉',
      text: '感官重构……它能帮你从碎片中看到更多的东西。试试把技能卡拖到碎片上。'
    },
    'T4': {
      title: '提交线索',
      npc: '直觉',
      text: '金色的线索已经足够完整了……把它拖到左边提交吧。'
    },
    'T5': {
      title: '属性检查',
      npc: '直觉',
      text: '每张碎片都有自己的属性……如果你不确定，可以右键看看它的本质。'
    },
    'T6': {
      title: '矛盾标记',
      npc: '直觉',
      text: '有些碎片之间……似乎存在矛盾。⚡ 按钮可以帮你标记它们。'
    },
    'T7': {
      title: 'Meta 入侵',
      npc: '直觉',
      text: '这张卡片不一样……它不属于推演板。试试把它拖到其他地方。'
    },
    'T8': {
      title: '失真卡处理',
      npc: '直觉',
      text: '合成出了错误的产物……失真的碎片。用技能卡或许能修复它。'
    },
    'T9': {
      title: '真假结论选择',
      npc: '直觉',
      text: '现在你有两个方向可以选择……仔细考虑，医生。'
    }
  };

  // ==================== 内部状态 ====================

  var shownList = [];          // 已展示的教程 ID 列表
  var overlayEl = null;        // 遮罩层 DOM
  var dialogEl = null;         // 弹窗卡片 DOM
  var avatarEl = null;         // NPC 头像区域 DOM
  var npcNameEl = null;        // NPC 名称 DOM
  var titleEl = null;          // 教程标题 DOM
  var textEl = null;           // 教程文案 DOM
  var btnEl = null;            // "知道了" 按钮 DOM
  var initialized = false;     // 是否已初始化
  var isShowing = false;       // 当前是否正在显示弹窗
  var pendingQueue = [];       // 等待显示的教程队列（避免同时弹出多个）

  // ==================== localStorage 读写 ====================

  /**
   * 从 localStorage 加载已展示教程列表
   */
  function loadShown() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        var parsed = JSON.parse(data);
        shownList = (parsed && parsed.shown) ? parsed.shown : [];
      } else {
        shownList = [];
      }
    } catch (e) {
      console.warn('教程系统: 加载已展示记录失败', e);
      shownList = [];
    }
  }

  /**
   * 保存已展示教程列表到 localStorage
   */
  function saveShown() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ shown: shownList }));
    } catch (e) {
      console.warn('教程系统: 保存展示记录失败', e);
    }
  }

  // ==================== 核心 API ====================

  /**
   * 查询某个教程是否已展示过
   * @param {string} tutorialId - 教程 ID ('T1' ~ 'T9')
   * @returns {boolean}
   */
  function hasShown(tutorialId) {
    return shownList.indexOf(tutorialId) >= 0;
  }

  /**
   * 展示指定教程弹窗（如已展示过则跳过）
   * 如果当前正在显示其他教程，则加入队列等待
   * @param {string} tutorialId - 教程 ID ('T1' ~ 'T9')
   */
  function show(tutorialId) {
    // 未定义的教程 ID 直接忽略
    if (!TUTORIALS[tutorialId]) {
      console.warn('教程系统: 未知教程 ID', tutorialId);
      return;
    }

    // 已展示过，跳过
    if (hasShown(tutorialId)) return;

    // 当前正在显示其他教程，加入队列
    if (isShowing) {
      // 避免重复入队
      if (pendingQueue.indexOf(tutorialId) < 0) {
        pendingQueue.push(tutorialId);
      }
      return;
    }

    _showNow(tutorialId);
  }

  /**
   * 立即显示指定教程弹窗（内部函数，不检查队列）
   * @param {string} tutorialId - 教程 ID
   */
  function _showNow(tutorialId) {
    var tutorial = TUTORIALS[tutorialId];
    if (!tutorial) return;

    isShowing = true;

    // 填充弹窗内容
    avatarEl.className = 'tutorial-avatar tutorial-avatar-guide';
    avatarEl.innerHTML = '<div class="tutorial-avatar-inner">◈</div>';
    npcNameEl.textContent = tutorial.npc || '直觉';
    titleEl.textContent = tutorial.title || '';
    textEl.textContent = tutorial.text || '';

    // 显示遮罩和弹窗
    overlayEl.style.display = 'flex';
    // 强制重排以重置动画
    void overlayEl.offsetHeight;
    overlayEl.classList.add('tutorial-visible');

    // 播放提示音（柔和的"叮"声，复用 playDrop）
    if (typeof AudioManager !== 'undefined' && AudioManager.playDrop) {
      AudioManager.playDrop();
    }

    // 记录已展示
    if (shownList.indexOf(tutorialId) < 0) {
      shownList.push(tutorialId);
      saveShown();
    }
  }

  /**
   * 关闭当前教程弹窗
   * 如果队列中还有待展示的教程，继续展示下一个
   */
  function dismiss() {
    if (!isShowing) return;

    // 淡出动画
    overlayEl.classList.remove('tutorial-visible');
    overlayEl.classList.add('tutorial-hiding');

    setTimeout(function() {
      overlayEl.style.display = 'none';
      overlayEl.classList.remove('tutorial-hiding');
      isShowing = false;

      // 处理队列中的下一个教程
      if (pendingQueue.length > 0) {
        var nextId = pendingQueue.shift();
        // 跳过已展示的
        while (nextId && hasShown(nextId) && pendingQueue.length > 0) {
          nextId = pendingQueue.shift();
        }
        if (nextId && !hasShown(nextId)) {
          _showNow(nextId);
        }
      }
    }, 250);
  }

  /**
   * 重置所有教程记录（调试用，重新展示所有教程）
   */
  function reset() {
    shownList = [];
    pendingQueue = [];
    saveShown();
    console.log('教程系统: 已重置所有教程记录');
  }

  // ==================== DOM 初始化 ====================

  /**
   * 初始化教程系统，创建 DOM 元素
   * 在页面加载后调用一次即可
   */
  function init() {
    if (initialized) return;
    initialized = true;

    // 加载已展示记录
    loadShown();

    // 创建弹窗 DOM 结构
    overlayEl = document.createElement('div');
    overlayEl.className = 'tutorial-overlay';
    overlayEl.style.display = 'none';

    dialogEl = document.createElement('div');
    dialogEl.className = 'tutorial-dialog';

    // NPC 头像区域
    avatarEl = document.createElement('div');
    avatarEl.className = 'tutorial-avatar tutorial-avatar-guide';
    avatarEl.innerHTML = '<div class="tutorial-avatar-inner">◈</div>';

    // NPC 名称
    npcNameEl = document.createElement('div');
    npcNameEl.className = 'tutorial-npc-name';

    // 教程标题
    titleEl = document.createElement('div');
    titleEl.className = 'tutorial-title';

    // 教程文案
    textEl = document.createElement('div');
    textEl.className = 'tutorial-text';

    // "知道了" 按钮
    btnEl = document.createElement('button');
    btnEl.className = 'tutorial-btn';
    btnEl.textContent = '知道了';

    // 组装 DOM
    var headerWrap = document.createElement('div');
    headerWrap.className = 'tutorial-header';
    headerWrap.appendChild(avatarEl);
    var nameWrap = document.createElement('div');
    nameWrap.className = 'tutorial-name-wrap';
    nameWrap.appendChild(npcNameEl);
    nameWrap.appendChild(titleEl);
    headerWrap.appendChild(nameWrap);

    dialogEl.appendChild(headerWrap);
    dialogEl.appendChild(textEl);
    dialogEl.appendChild(btnEl);

    overlayEl.appendChild(dialogEl);
    document.body.appendChild(overlayEl);

    // 绑定事件
    btnEl.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dismiss();
    });

    // 点击遮罩区域不关闭（必须点按钮），避免误操作跳过教程
    overlayEl.addEventListener('click', function(e) {
      // 阻止穿透
      e.stopPropagation();
    });

    // 支持键盘 Enter/Esc 关闭
    document.addEventListener('keydown', function(e) {
      if (!isShowing) return;
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        dismiss();
      }
    });

    // 触屏支持：点击弹窗区域不关闭，只有按钮关闭
    // （已在 click 事件中处理）
  }

  // ==================== 调试接口 ====================

  /**
   * 获取所有教程定义（调试/查看用）
   * @returns {Object}
   */
  function getAllTutorials() {
    var result = {};
    var keys = Object.keys(TUTORIALS);
    keys.forEach(function(key) {
      result[key] = {
        title: TUTORIALS[key].title,
        npc: TUTORIALS[key].npc,
        text: TUTORIALS[key].text,
        shown: hasShown(key)
      };
    });
    return result;
  }

  // ==================== 公开接口 ====================

  return {
    init: init,
    show: show,
    hasShown: hasShown,
    reset: reset,
    dismiss: dismiss,
    getAllTutorials: getAllTutorials
  };
})();
