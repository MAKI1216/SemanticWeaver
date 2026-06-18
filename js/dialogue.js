/**
 * 语义缝合师 - 对话系统模块
 * 负责打字机效果、关键词渲染与提取、对话历史管理
 */
var DialogueSystem = (function() {
  'use strict';

  var typeTimer = null;        // 打字机定时器
  var isTyping = false;        // 是否正在打字中
  var currentCallback = null;  // 打字完成回调
  var skipRequested = false;   // 是否请求跳过
  var onKeywordDragStart = null; // 关键词拖拽开始回调

  // Phase 3: 当前 Stage 的隐藏台词层数据
  var currentHiddenLayer = null;       // 底层台词文本（含 {} 关键词标记）
  var currentHiddenLayerKeywords = [];  // 底层台词中的可提取关键词
  var currentHiddenLayerGate = null;    // 底层台词的解锁条件（contradiction ID）
  var hiddenLayerRevealed = false;      // 底层台词是否已被入侵揭示

  /**
   * 设置关键词拖拽回调
   * @param {Function} callback - 当关键词开始拖拽时调用 callback(keywordText, event, sourceEl)
   */
  function setKeywordDragCallback(callback) {
    onKeywordDragStart = callback;
  }

  /**
   * 解析对话文本，将 {关键词} 替换为可拖拽的高亮 span 元素
   * @param {string} text - 原始对话文本，如 "下着{大雨}，躲进{没有灯的巷子}"
   * @returns {string} HTML 字符串
   */
  function parseDialogueText(text) {
    if (!text) return '';

    // Phase A.1: 处理（）全角括号旁白文字，包裹在特殊样式 span 中
    // 旁白文字（如"他盯着桌面看了很久"）与 NPC 台词（「...」）视觉区分
    var html = text.replace(/（([^）]*)）/g, function(match, content) {
      return '<span class="dialogue-paren">（' + escapeHtml(content) + '）</span>';
    });

    // 处理 {关键词} → 可拖拽高亮 span
    html = html.replace(/\{([^}]+)\}/g, function(match, keyword) {
      // Phase 3: 为 Meta 关键词添加特殊类
      var meta = getKeywordMetadata(keyword);
      var extraClass = '';
      if (meta.card_type === 'meta') {
        extraClass = ' keyword-meta';
      }
      return '<span class="keyword' + extraClass + '" data-keyword="' + escapeHtml(keyword) + '">' +
             escapeHtml(keyword) + '</span>';
    });

    // 换行符 → <br>
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  /**
   * HTML 转义
   */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 显示对话文本（带打字机效果）
   * 使用纯文本逐字 + HTML 标签即时插入的方式
   * @param {string} text - 原始对话文本
   * @param {Object} options
   */
  function showDialogue(text, options) {
    var defaults = {
      isNarration: false,
      isSystemLog: false,
      speed: 40,
      append: false,
      onComplete: null
    };
    var opts = Object.assign({}, defaults, options);

    // 停止之前的打字动画
    stopTypewriter();

    var historyEl = document.getElementById('dialogue-history');
    var currentEl = document.getElementById('dialogue-current');
    if (!currentEl) return;

    // 将当前内容归档
    archiveCurrentDialogue();

    // 创建新的对话行
    var lineEl = document.createElement('div');
    lineEl.className = 'dialogue-line current';
    if (opts.isNarration) {
      lineEl.classList.add('dialogue-narration');
    }
    if (opts.isSystemLog) {
      lineEl.classList.add('dialogue-system-log');
    }
    currentEl.innerHTML = '';
    currentEl.appendChild(lineEl);

    // 解析文本为 HTML
    var fullHtml = parseDialogueText(text);

    // 打字机效果状态
    isTyping = true;
    skipRequested = false;
    currentCallback = opts.onComplete;

    // 将 HTML 拆分为 "显示单元"：每个字符或 HTML 标签作为一个单元
    var units = splitHtmlToUnits(fullHtml);
    var unitIndex = 0;
    var displayBuffer = '';

    /**
     * 递归式逐单元显示，避免嵌套 interval 的问题
     */
    function showNextUnit() {
      if (skipRequested || unitIndex >= units.length) {
        // 完成：显示全部内容
        lineEl.innerHTML = fullHtml;
        finishTyping();
        return;
      }

      var unit = units[unitIndex];
      displayBuffer += unit;
      unitIndex++;

      // 更新显示
      lineEl.innerHTML = displayBuffer + '<span class="typewriter-cursor"></span>';
      Renderer.scrollDialogueToBottom();

      if (unit.charAt(0) === '<') {
        // HTML 标签：无延迟，立即显示下一个
        showNextUnit();
      } else {
        // 文字：延迟显示下一个
        if (unitIndex % 3 === 0) {
          AudioManager.playType();
        }
        typeTimer = setTimeout(showNextUnit, opts.speed);
      }
    }

    // 启动显示
    showNextUnit();
  }

  /**
   * 将 HTML 字符串拆分为显示单元
   * HTML 标签作为一个完整单元，文字逐字拆分
   * @param {string} html
   * @returns {Array<string>} 单元数组
   */
  function splitHtmlToUnits(html) {
    var units = [];
    var i = 0;
    while (i < html.length) {
      if (html.charAt(i) === '<') {
        // HTML 标签：找到闭合 >
        var end = html.indexOf('>', i);
        if (end !== -1) {
          units.push(html.substring(i, end + 1));
          i = end + 1;
        } else {
          // 异常：未闭合标签，当作文字
          units.push(html.charAt(i));
          i++;
        }
      } else if (html.charAt(i) === '&') {
        // HTML 实体：如 &amp; &lt; 等，作为一个单元
        var semiEnd = html.indexOf(';', i);
        if (semiEnd !== -1 && semiEnd - i < 10) {
          units.push(html.substring(i, semiEnd + 1));
          i = semiEnd + 1;
        } else {
          units.push(html.charAt(i));
          i++;
        }
      } else {
        // 普通文字，逐字
        units.push(html.charAt(i));
        i++;
      }
    }
    return units;
  }

  /**
   * 完成打字动画
   */
  function finishTyping() {
    if (typeTimer) {
      clearTimeout(typeTimer);
      typeTimer = null;
    }
    isTyping = false;
    skipRequested = false;

    // 移除光标
    var cursors = document.querySelectorAll('.typewriter-cursor');
    cursors.forEach(function(c) { c.remove(); });

    // 绑定关键词事件
    bindKeywordEvents();

    // 回调
    if (currentCallback) {
      var cb = currentCallback;
      currentCallback = null;
      setTimeout(cb, 100);
    }
  }

  /**
   * 停止打字动画（立即）
   */
  function stopTypewriter() {
    if (typeTimer) {
      clearTimeout(typeTimer);
      typeTimer = null;
    }
    isTyping = false;
    skipRequested = false;
  }

  /**
   * 跳过当前打字动画
   */
  function skipCurrentTyping() {
    if (isTyping) {
      skipRequested = true;
    }
  }

  /**
   * 绑定关键词的鼠标事件（拖拽交互）
   * Phase 1.3: 所有关键词均可重复拖拽提取，不再标记为不可交互
   */
  function bindKeywordEvents() {
    var keywords = document.querySelectorAll('#dialogue-area .keyword');
    keywords.forEach(function(kw) {
      if (kw.dataset.bound) return;
      kw.dataset.bound = 'true';

      kw.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (onKeywordDragStart) {
          onKeywordDragStart(kw.dataset.keyword, e, kw);
        }
      });
    });
  }

  /**
   * 记录关键词提取次数（不禁止重复提取）
   * Phase 1.3: 关键词提取后仍保持可交互，仅记录提取次数用于音效区分
   * @param {string} keywordText - 关键词文本
   */
  function markKeywordExtracted(keywordText) {
    var keywords = document.querySelectorAll('#dialogue-area .keyword');
    keywords.forEach(function(kw) {
      if (kw.dataset.keyword === keywordText) {
        var count = parseInt(kw.dataset.extractCount || '0', 10);
        count++;
        kw.dataset.extractCount = count;
        // 首次提取后添加轻微视觉标记（仍可交互）
        if (count === 1) {
          kw.classList.add('extracted-once');
        }
      }
    });
  }

  /**
   * 获取关键词的提取次数
   * @param {string} keywordText - 关键词文本
   * @returns {number} 提取次数（0 表示未提取过）
   */
  function getExtractCount(keywordText) {
    var keywords = document.querySelectorAll('#dialogue-area .keyword');
    for (var i = 0; i < keywords.length; i++) {
      if (keywords[i].dataset.keyword === keywordText) {
        return parseInt(keywords[i].dataset.extractCount || '0', 10);
      }
    }
    return 0;
  }

  /**
   * 添加旁白文本到对话历史
   * @param {string} text - 旁白文本
   * @param {Function} onComplete - 完成回调
   */
  function showNarration(text, onComplete) {
    showDialogue(text, {
      isNarration: true,
      speed: 30,
      onComplete: onComplete
    });
  }

  /**
   * 清空对话区域
   */
  function clearDialogue() {
    var historyEl = document.getElementById('dialogue-history');
    var currentEl = document.getElementById('dialogue-current');
    if (historyEl) historyEl.innerHTML = '';
    if (currentEl) currentEl.innerHTML = '';
  }

  /**
   * 将当前对话移入历史记录
   * Phase 2 Fix: 使用真实 DOM 节点移动而非 innerHTML 克隆，
   * 以保留关键词 span 上的事件监听器，支持跨对话提取关键词。
   */
  function archiveCurrentDialogue() {
    var historyEl = document.getElementById('dialogue-history');
    var currentEl = document.getElementById('dialogue-current');
    if (!historyEl || !currentEl) return;

    // 移除光标（如果有）
    var cursors = currentEl.querySelectorAll('.typewriter-cursor');
    cursors.forEach(function(c) { c.remove(); });

    // 将 currentEl 的所有子节点直接移动到 historyEl（保留事件监听器）
    var children = Array.prototype.slice.call(currentEl.childNodes);
    children.forEach(function(child) {
      // 给移入历史的节点补充 dialogue-line 包装
      if (child.nodeType === 1 && child.classList.contains('dialogue-line')) {
        // 已经是 dialogue-line，直接移动
        historyEl.appendChild(child);
      } else if (child.nodeType === 1 || (child.nodeType === 3 && child.textContent.trim())) {
        // 其他元素或非空文本节点，包一层 dialogue-line
        var wrapper = document.createElement('div');
        wrapper.className = 'dialogue-line';
        wrapper.appendChild(child);
        historyEl.appendChild(wrapper);
      }
    });

    currentEl.innerHTML = '';
  }

  /**
   * 是否正在打字
   * @returns {boolean}
   */
  function getIsTyping() {
    return isTyping;
  }

  /**
   * Phase 2.4: 追加解锁的隐藏关键词到对话区域
   * 在当前对话下方添加一行特殊提示，包含可提取的关键词
   * @param {string} keyword - 被解锁的关键词文本
   */
  function appendUnlockedKeyword(keyword) {
    var currentEl = document.getElementById('dialogue-current');
    if (!currentEl) return;

    var line = document.createElement('div');
    line.className = 'dialogue-line dialogue-unlocked';

    var prefix = document.createElement('span');
    prefix.className = 'unlocked-prefix';
    prefix.textContent = '\u2727 \u8BB0\u5FC6\u88C2\u7F1D\u540E\u6D6E\u73B0\uFF1A';
    line.appendChild(prefix);

    var kwSpan = document.createElement('span');
    kwSpan.className = 'keyword keyword-unlocked';
    kwSpan.dataset.keyword = keyword;
    kwSpan.textContent = keyword;
    line.appendChild(kwSpan);

    currentEl.appendChild(line);
    Renderer.scrollDialogueToBottom();

    // 绑定关键词拖拽事件
    if (!kwSpan.dataset.bound) {
      kwSpan.dataset.bound = 'true';
      kwSpan.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (onKeywordDragStart) {
          onKeywordDragStart(keyword, e, kwSpan);
        }
      });
    }
  }

  // ==================== Phase 3: 隐藏台词层 ====================

  /**
   * 设置当前 Stage 的隐藏台词层
   * @param {string} hiddenText - 底层台词文本（含 {} 关键词）
   * @param {Array} keywords - 底层台词中的可提取关键词列表
   * @param {string|null} gate - 解锁条件（contradiction ID），null 表示无门控
   */
  function setHiddenLayer(hiddenText, keywords, gate) {
    currentHiddenLayer = hiddenText || null;
    currentHiddenLayerKeywords = keywords || [];
    currentHiddenLayerGate = gate || null;
    hiddenLayerRevealed = false;
  }

  /**
   * 检查当前对话是否有隐藏台词层
   * @returns {boolean}
   */
  function hasHiddenLayer() {
    return !!currentHiddenLayer;
  }

  /**
   * 清除隐藏台词层状态
   */
  function clearHiddenLayer() {
    currentHiddenLayer = null;
    currentHiddenLayerKeywords = [];
    currentHiddenLayerGate = null;
    hiddenLayerRevealed = false;
  }

  /**
   * 获取当前隐藏台词层的门控条件
   * @returns {string|null} contradiction ID，或 null 表示无门控
   */
  function getCurrentHiddenLayerGate() {
    return currentHiddenLayerGate;
  }

  /**
   * 揭示隐藏台词层（Meta 入侵成功后调用）
   * 在当前对话下方渲染底层台词，并绑定关键词提取事件
   * @param {Function} onReveal - 揭示完成后的回调
   */
  function revealHiddenLayer(onReveal) {
    if (!currentHiddenLayer || hiddenLayerRevealed) return false;

    var currentEl = document.getElementById('dialogue-current');
    if (!currentEl) return false;

    // 创建底层台词 DOM
    var hiddenLine = document.createElement('div');
    hiddenLine.className = 'dialogue-line dialogue-hidden-layer';

    // glitch 入场动画
    hiddenLine.classList.add('hidden-layer-glitch-in');

    // 解析底层台词（复用 parseDialogueText 处理 {} 关键词）
    var html = parseDialogueText(currentHiddenLayer);
    hiddenLine.innerHTML = html;

    currentEl.appendChild(hiddenLine);
    Renderer.scrollDialogueToBottom();

    hiddenLayerRevealed = true;

    // 绑定底层台词中的关键词事件
    var hiddenKeywords = hiddenLine.querySelectorAll('.keyword');
    hiddenKeywords.forEach(function(kw) {
      if (kw.dataset.bound) return;
      kw.dataset.bound = 'true';
      kw.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (onKeywordDragStart) {
          onKeywordDragStart(kw.dataset.keyword, e, kw);
        }
      });
    });

    // 解锁隐藏关键词的 metadata（从 hidden → normal）
    currentHiddenLayerKeywords.forEach(function(word) {
      if (GAME_DATA.keyword_metadata[word]) {
        GAME_DATA.keyword_metadata[word].is_extractable = true;
        GAME_DATA.keyword_metadata[word].card_type = 'normal';
      }
    });

    // 移除入场动画类
    setTimeout(function() {
      hiddenLine.classList.remove('hidden-layer-glitch-in');
    }, 800);

    if (onReveal) onReveal();
    return true;
  }

  // 公开接口
  return {
    setKeywordDragCallback: setKeywordDragCallback,
    parseDialogueText: parseDialogueText,
    showDialogue: showDialogue,
    showNarration: showNarration,
    skipCurrentTyping: skipCurrentTyping,
    markKeywordExtracted: markKeywordExtracted,
    getExtractCount: getExtractCount,
    clearDialogue: clearDialogue,
    archiveCurrentDialogue: archiveCurrentDialogue,
    getIsTyping: getIsTyping,
    stopTypewriter: stopTypewriter,
    appendUnlockedKeyword: appendUnlockedKeyword,
    setHiddenLayer: setHiddenLayer,
    revealHiddenLayer: revealHiddenLayer,
    hasHiddenLayer: hasHiddenLayer,
    clearHiddenLayer: clearHiddenLayer,
    getCurrentHiddenLayerGate: getCurrentHiddenLayerGate
  };
})();
