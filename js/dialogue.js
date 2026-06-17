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
    var html = text.replace(/\{([^}]+)\}/g, function(match, keyword) {
      return '<span class="keyword" data-keyword="' + escapeHtml(keyword) + '">' +
             escapeHtml(keyword) + '</span>';
    });
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
   */
  function bindKeywordEvents() {
    var keywords = document.querySelectorAll('#dialogue-area .keyword:not(.extracted)');
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
   * 标记关键词为已提取（变灰、不可再拖）
   * @param {string} keywordText - 关键词文本
   */
  function markKeywordExtracted(keywordText) {
    var keywords = document.querySelectorAll('#dialogue-area .keyword');
    keywords.forEach(function(kw) {
      if (kw.dataset.keyword === keywordText) {
        kw.classList.add('extracted');
      }
    });
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
   */
  function archiveCurrentDialogue() {
    var historyEl = document.getElementById('dialogue-history');
    var currentEl = document.getElementById('dialogue-current');
    if (!historyEl || !currentEl) return;

    var content = currentEl.innerHTML;
    if (content.trim()) {
      var line = document.createElement('div');
      line.className = 'dialogue-line';
      line.innerHTML = content;
      var cursors = line.querySelectorAll('.typewriter-cursor');
      cursors.forEach(function(c) { c.remove(); });
      historyEl.appendChild(line);
    }
    currentEl.innerHTML = '';
  }

  /**
   * 是否正在打字
   * @returns {boolean}
   */
  function getIsTyping() {
    return isTyping;
  }

  // 公开接口
  return {
    setKeywordDragCallback: setKeywordDragCallback,
    parseDialogueText: parseDialogueText,
    showDialogue: showDialogue,
    showNarration: showNarration,
    skipCurrentTyping: skipCurrentTyping,
    markKeywordExtracted: markKeywordExtracted,
    clearDialogue: clearDialogue,
    archiveCurrentDialogue: archiveCurrentDialogue,
    getIsTyping: getIsTyping,
    stopTypewriter: stopTypewriter
  };
})();
