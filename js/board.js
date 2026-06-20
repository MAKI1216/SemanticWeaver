/**
 * 语义缝合师 - 推演板系统模块
 * 负责卡片管理、拖拽交互、合成判定、技能卡/垃圾桶/提交区
 */
var BoardSystem = (function() {
  'use strict';

  // ==================== 卡片数据 ====================
  var cards = [];         // 当前推演板上的所有卡片
  var cardIdCounter = 0;  // 卡片 ID 计数器
  var requiredSubmit = null; // 当前阶段需要提交的金色线索名称
  var submittableCards = []; // 可提交的卡片名称数组（包含 required_submit + 结论产物）

  // ==================== 拖拽状态 ====================
  var dragState = {
    active: false,        // 是否正在拖拽
    source: null,         // 拖拽来源: 'keyword', 'card', 'skill'
    sourceData: null,     // 来源数据
    ghost: null,          // 幽灵元素
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    originalCard: null    // 原始卡片 DOM 元素（卡片拖拽时）
  };

  // ==================== 回调函数 ====================
  var onCombineCallback = null;   // 合成成功回调: function(resultText, x, y)
  var onCombineFailCallback = null; // 合成失败回调: function(x, y)
  var onSubmitCallback = null;    // 提交回调: function(cardText, isSpecialTarget)
  var onCardDeletedCallback = null; // 卡片删除回调: function(cardId)

  /**
   * 设置回调函数
   * @param {Object} callbacks
   */
  function setCallbacks(callbacks) {
    if (callbacks.onCombine) onCombineCallback = callbacks.onCombine;
    if (callbacks.onCombineFail) onCombineFailCallback = callbacks.onCombineFail;
    if (callbacks.onSubmit) onSubmitCallback = callbacks.onSubmit;
    if (callbacks.onCardDeleted) onCardDeletedCallback = callbacks.onCardDeleted;
    if (callbacks.onContradictionFlagged) onContradictionFlaggedCallback = callbacks.onContradictionFlagged;
    if (callbacks.onMetaIntrusion) onMetaIntrusionCallback = callbacks.onMetaIntrusion;
  }

  /**
   * 设置当前阶段所需的提交线索
   * @param {string} text - 金色线索名称（required_submit）
   * @param {Array} [extraSubmittable] - 额外可提交的卡片名称数组（如结论产物）
   */
  function setRequiredSubmit(text, extraSubmittable) {
    requiredSubmit = text;
    // 构建可提交列表：始终包含 required_submit + 额外的结论产物
    submittableCards = text ? [text] : [];
    if (extraSubmittable && Array.isArray(extraSubmittable)) {
      extraSubmittable.forEach(function(c) {
        if (c && submittableCards.indexOf(c) === -1) {
          submittableCards.push(c);
        }
      });
    }
  }

  // ==================== 卡片管理 ====================

  /**
   * 在推演板上创建新卡片
   * @param {string} text - 卡片文本
   * @param {number} x - X 坐标（相对于推演板）
   * @param {number} y - Y 坐标（相对于推演板）
   * @param {Object} options
   * @param {boolean} options.isGolden - 是否为金色最终线索
   * @param {boolean} options.animate - 是否显示生成动画
   * @returns {Object} 卡片数据对象
   */
  function createCard(text, x, y, options) {
    var defaults = { isGolden: false, animate: true, cardType: null };
    var opts = Object.assign({}, defaults, options);

    // 查询关键词元数据获取 card_type
    var meta = getKeywordMetadata(text);
    var cardType = opts.cardType || meta.card_type || 'normal';

    var cardData = {
      id: 'card-' + (++cardIdCounter),
      text: text,
      x: x,
      y: y,
      isGolden: opts.isGolden,
      cardType: cardType,
      attributes: meta.attributes.slice(),
      metaTargets: meta.meta_targets || null  // Phase 3: Meta 关键词的入侵目标列表
    };

    // 检查是否为金色（匹配 required_submit 或结论产物）
    if (submittableCards.indexOf(text) !== -1) {
      cardData.isGolden = true;
    }

    cards.push(cardData);

    // 创建 DOM 元素
    var el = document.createElement('div');
    el.className = 'board-card';
    // 根据 card_type 应用视觉样式
    if (cardType !== 'normal') {
      el.classList.add('card-type-' + cardType);
    }
    if (cardData.isGolden) {
      el.classList.add('golden');
    }
    if (opts.animate) el.classList.add('card-spawn');
    el.textContent = text;
    el.dataset.cardId = cardData.id;
    el.dataset.cardType = cardType;
    el.dataset.cardText = text;  // 供 HintSystem 精确匹配
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    // Phase 2.2: 卡片底部属性图标条
    if (cardData.attributes.length > 0 && cardType !== 'hidden') {
      var attrBar = document.createElement('div');
      attrBar.className = 'card-attr-bar';
      cardData.attributes.forEach(function(attr) {
        var def = GAME_DATA.attribute_defs[attr];
        if (def) {
          var icon = document.createElement('span');
          icon.className = 'card-attr-icon';
          icon.textContent = def.icon;
          icon.title = def.name;
          icon.dataset.attr = attr;
          attrBar.appendChild(icon);
        }
      });
      el.appendChild(attrBar);
    }

    // 绑定拖拽事件
    el.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (markingMode) {
        toggleCardMark(cardData, el);
      } else {
        startCardDrag(cardData, el, e);
      }
    });

    // Phase 2.2: 右键打开属性检查面板
    el.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showAttributePanel(cardData, el);
    });

    // Phase 2.2: 长按（触屏）打开属性检查面板
    var pressTimer = null;
    el.addEventListener('touchstart', function(e) {
      pressTimer = setTimeout(function() {
        e.preventDefault();
        showAttributePanel(cardData, el);
      }, 500);
    });
    el.addEventListener('touchend', function() { clearTimeout(pressTimer); });
    el.addEventListener('touchmove', function() { clearTimeout(pressTimer); });

    var boardEl = document.getElementById('board-cards');
    if (boardEl) {
      boardEl.appendChild(el);
    }

    // 移除生成动画类
    if (opts.animate) {
      setTimeout(function() {
        el.classList.remove('card-spawn');
      }, 500);
    }

    // 更新矛盾标记按钮提示
    updateMarkButtonHint();

    // 提示系统：通知卡片上板（涵盖提取关键词、合成结果上板）
    if (typeof HintSystem !== 'undefined') {
      HintSystem.onPlayerAction();
      HintSystem.reportProgress('card_on_board', text);
      // 对话中关键词被提取（来自 keyword 拖拽时调用 createCard）
      HintSystem.reportProgress('card_extracted', text);
    }

    return cardData;
  }

  /**
   * 移除卡片
   * @param {string} cardId - 卡片 ID
   * @param {boolean} animate - 是否显示销毁动画
   */
  function removeCard(cardId, animate) {
    var card = getCard(cardId);
    var cardType = card ? card.cardType : 'normal';

    // 从数据中移除
    cards = cards.filter(function(c) { return c.id !== cardId; });

    // 从 DOM 移除
    var el = document.querySelector('[data-card-id="' + cardId + '"]');
    if (el) {
      if (animate) {
        // 根据 card_type 应用不同的销毁动画
        var destroyClass = 'card-destroy';
        if (cardType === 'distorted') {
          destroyClass = 'card-destroy-glitch';
        } else if (cardType === 'hidden') {
          destroyClass = 'card-destroy-noise';
        } else if (cardType === 'meta') {
          destroyClass = 'card-destroy-meta';
        }
        el.classList.add(destroyClass);
        setTimeout(function() {
          if (el.parentNode) el.parentNode.removeChild(el);
          updateMarkButtonHint();
        }, 400);
      } else {
        if (el.parentNode) el.parentNode.removeChild(el);
        updateMarkButtonHint();
      }
    }
  }

  /**
   * 切换卡片类型（更新视觉样式 + 数据）
   * @param {Object|string} cardOrId - 卡片数据对象或卡片 ID
   * @param {string} newType - 新的 card_type ('normal'|'hidden'|'half_finished'|'distorted'|'meta')
   */
  function setCardType(cardOrId, newType) {
    var card = (typeof cardOrId === 'string') ? getCard(cardOrId) : cardOrId;
    if (!card) return;

    var oldType = card.cardType;
    card.cardType = newType;

    var el = document.querySelector('[data-card-id="' + card.id + '"]');
    if (el) {
      // 移除旧类型类
      if (oldType !== 'normal') {
        el.classList.remove('card-type-' + oldType);
      }
      // 添加新类型类
      if (newType !== 'normal') {
        el.classList.add('card-type-' + newType);
      }
      el.dataset.cardType = newType;
    }
  }

  /**
   * 获取卡片数据
   * @param {string} cardId
   * @returns {Object|null}
   */
  function getCard(cardId) {
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].id === cardId) return cards[i];
    }
    return null;
  }

  /**
   * 更新卡片位置
   * @param {string} cardId
   * @param {number} x
   * @param {number} y
   */
  function updateCardPosition(cardId, x, y) {
    var card = getCard(cardId);
    if (card) {
      card.x = x;
      card.y = y;
    }
    var el = document.querySelector('[data-card-id="' + cardId + '"]');
    if (el) {
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    }
  }

  /**
   * 清空推演板上所有卡片（保留技能卡）
   */
  function clearBoard() {
    cards = [];
    var boardEl = document.getElementById('board-cards');
    if (boardEl) {
      boardEl.innerHTML = '';
    }
    updateMarkButtonHint();
  }

  /**
   * 获取所有卡片
   * @returns {Array}
   */
  function getAllCards() {
    return cards.slice();
  }

  // ==================== 属性检查面板（Phase 2.2）====================

  /**
   * 显示属性检查面板
   * @param {Object} cardData - 卡片数据
   * @param {HTMLElement} cardEl - 卡片 DOM 元素
   */
  function showAttributePanel(cardData, cardEl) {
    hideAttributePanel();

    var panel = document.createElement('div');
    panel.className = 'attr-panel';
    panel.id = 'attr-panel';

    // 卡片名称
    var header = document.createElement('div');
    header.className = 'attr-panel-header';
    header.textContent = cardData.text;
    panel.appendChild(header);

    // 属性列表
    if (cardData.attributes.length > 0) {
      var list = document.createElement('div');
      list.className = 'attr-panel-list';
      cardData.attributes.forEach(function(attr) {
        var def = GAME_DATA.attribute_defs[attr];
        if (def) {
          var item = document.createElement('div');
          item.className = 'attr-panel-item';
          item.innerHTML =
            '<span class="attr-panel-icon">' + def.icon + '</span>' +
            '<span class="attr-panel-name">' + def.name + '</span>';
          list.appendChild(item);
        }
      });
      panel.appendChild(list);
    } else {
      var empty = document.createElement('div');
      empty.className = 'attr-panel-empty';
      empty.textContent = '无属性标记';
      panel.appendChild(empty);
    }

    // 检查与板上其他卡片的属性矛盾
    var contradictions = [];
    var allCards = getAllCards();
    allCards.forEach(function(other) {
      if (other.id === cardData.id) return;
      var c = checkAttributeContradiction(cardData.attributes, other.attributes);
      if (c) {
        contradictions.push({ card: other.text, attrA: c.attrA, attrB: c.attrB });
      }
    });

    if (contradictions.length > 0) {
      var warning = document.createElement('div');
      warning.className = 'attr-panel-warning';
      contradictions.forEach(function(con) {
        var line = document.createElement('div');
        line.className = 'attr-panel-warning-line';
        line.textContent = '\u26A0 \u4E0E\u300C' + con.card + '\u300D\u5C5E\u6027\u51B2\u7A81';
        warning.appendChild(line);
      });
      panel.appendChild(warning);
    }

    // 定位面板
    var rect = cardEl.getBoundingClientRect();
    var panelLeft = rect.right + 10;
    // 如果右侧空间不够，放左侧
    if (panelLeft + 220 > window.innerWidth) {
      panelLeft = rect.left - 230;
    }
    panel.style.left = Math.max(10, panelLeft) + 'px';
    panel.style.top = Math.max(10, rect.top) + 'px';

    document.body.appendChild(panel);

    // 点击面板外关闭
    setTimeout(function() {
      document.addEventListener('click', hideAttributePanel, { once: true });
      document.addEventListener('contextmenu', hideAttributePanel, { once: true });
    }, 10);
  }

  /**
   * 隐藏属性检查面板
   */
  function hideAttributePanel() {
    var panel = document.getElementById('attr-panel');
    if (panel && panel.parentNode) {
      panel.parentNode.removeChild(panel);
    }
  }

  // ==================== 推演板重置 ====================

  // 重置台词池
  var resetFlavorTexts = [
    '你深吸一口气，把推演板上的线索重新理了一遍。',
    '你揉了揉太阳穴，决定从头梳理。',
    '你把散落的卡片收回手中。'
  ];

  /**
   * 初始化推演板重置按钮事件
   */
  function initResetButton() {
    var btn = document.getElementById('board-reset-btn');
    if (!btn) return;
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showResetConfirm();
    });
  }

  /**
   * 显示重置确认弹窗（非阻断式）
   */
  function showResetConfirm() {
    // 如果板上没有卡片，无需重置
    if (cards.length === 0) {
      Renderer.showMessage('推演板已经是空的', 'game-message');
      return;
    }

    // 创建确认弹窗
    var overlay = document.createElement('div');
    overlay.className = 'reset-confirm-overlay';
    overlay.innerHTML =
      '<div class="reset-confirm-dialog">' +
        '<p class="reset-confirm-text">重新梳理推演板？已提取的关键词会保留。</p>' +
        '<div class="reset-confirm-buttons">' +
          '<button class="reset-btn-confirm">确认重置</button>' +
          '<button class="reset-btn-cancel">再想想</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    // 确认按钮
    overlay.querySelector('.reset-btn-confirm').addEventListener('click', function() {
      document.body.removeChild(overlay);
      performReset();
    });

    // 取消按钮
    overlay.querySelector('.reset-btn-cancel').addEventListener('click', function() {
      document.body.removeChild(overlay);
    });
  }

  /**
   * 执行推演板重置：清空卡片，保留叙事进度
   */
  function performReset() {
    // 所有卡片溶解动画
    var allCards = cards.slice();
    allCards.forEach(function(card) {
      var el = document.querySelector('[data-card-id="' + card.id + '"]');
      if (el) {
        el.classList.add('card-destroy');
      }
    });

    // 延迟清空数据
    setTimeout(function() {
      cards = [];
      var boardEl = document.getElementById('board-cards');
      if (boardEl) {
        boardEl.innerHTML = '';
      }
      updateMarkButtonHint();

      // ███ 修复Meta卡卡关：重置推演板时同步重置消耗标记 ███
      // 1. 重置所有 meta 类型关键词的 consumed 状态，允许重置后重新提取
      if (GAME_DATA && GAME_DATA.keyword_metadata) {
        for (var kw in GAME_DATA.keyword_metadata) {
          var m = GAME_DATA.keyword_metadata[kw];
          if (m && m.card_type === 'meta') {
            if (m.meta_consumed || m.is_extractable === false) {
              m.meta_consumed = false;
              m.is_extractable = true;
            }
          }
        }
      }
      // 2. 重置当前 Trial 的 Meta 入侵执行记录，允许重置后重新入侵
      if (state.currentTrial && state.trials_state[state.currentTrial]) {
        state.trials_state[state.currentTrial].performed_meta_intrusions = {};
      }

      // 3. ███ 清理对话区域 Meta 关键词的消耗样式 ███
      // 移除 meta-consumed 样式类和 data-bound 标记，使关键词恢复正常外观和可拖拽状态
      var allKeywords = document.querySelectorAll('#dialogue-area .keyword');
      allKeywords.forEach(function(kw) {
        if (kw.classList.contains('meta-consumed')) {
          kw.classList.remove('meta-consumed');
          delete kw.dataset.bound;
        }
      });
    }, 400);

    // 显示 NPC 台词包装
    var flavorText = resetFlavorTexts[Math.floor(Math.random() * resetFlavorTexts.length)];
    Renderer.showMessage(flavorText, 'game-message');

    // 播放音效
    AudioManager.playBoardReset();
  }

  // ==================== 拖拽系统 ====================

  /**
   * 从关键词开始拖拽
   * @param {string} keywordText - 关键词文本
   * @param {MouseEvent} e - 鼠标事件
   * @param {HTMLElement} sourceEl - 来源 DOM 元素
   */
  function startKeywordDrag(keywordText, e, sourceEl) {
    // Phase 3: 已消耗的 Meta 关键词不可再提取
    var meta = getKeywordMetadata(keywordText);
    if (meta.meta_consumed || !meta.is_extractable) {
      Renderer.showMessage('这个关键词已消耗', 'game-message');
      return;
    }

    dragState.active = true;
    dragState.source = 'keyword';
    dragState.sourceData = { text: keywordText, element: sourceEl };
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;

    // 创建幽灵元素
    createGhost(keywordText, false, e.clientX, e.clientY);

    // 标记来源元素
    if (sourceEl) sourceEl.classList.add('dragging');
  }

  /**
   * 从推演板卡片开始拖拽
   * @param {Object} cardData - 卡片数据
   * @param {HTMLElement} el - 卡片 DOM 元素
   * @param {MouseEvent} e - 鼠标事件
   */
  function startCardDrag(cardData, el, e) {
    dragState.active = true;
    dragState.source = 'card';
    dragState.sourceData = cardData;
    dragState.originalCard = el;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;

    // 计算偏移量
    var rect = el.getBoundingClientRect();
    dragState.offsetX = e.clientX - rect.left;
    dragState.offsetY = e.clientY - rect.top;

    // 标记卡片为拖拽中
    el.classList.add('dragging');

    // 创建幽灵元素（Phase 3: Meta 卡片使用金色幽灵）
    createGhost(cardData.text, cardData.isGolden || cardData.cardType === 'meta', e.clientX, e.clientY);

    // 隐藏原始卡片（半透明）
    el.style.opacity = '0.3';
  }

  /**
   * 从技能卡开始拖拽
   * @param {string} skillName - 技能名称
   * @param {MouseEvent} e - 鼠标事件
   * @param {HTMLElement} sourceEl - 技能卡 DOM 元素
   */
  function startSkillDrag(skillName, e, sourceEl) {
    dragState.active = true;
    dragState.source = 'skill';
    dragState.sourceData = { text: skillName, element: sourceEl };
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;

    // 创建幽灵元素
    createGhost(skillName, false, e.clientX, e.clientY, true);

    // 标记来源元素
    if (sourceEl) sourceEl.classList.add('dragging');
  }

  /**
   * 创建拖拽幽灵元素
   * @param {string} text - 文本
   * @param {boolean} isGolden - 是否金色
   * @param {number} x - 起始 X 坐标
   * @param {number} y - 起始 Y 坐标
   * @param {boolean} isSkill - 是否技能卡
   */
  function createGhost(text, isGolden, x, y, isSkill) {
    removeGhost();

    var ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    if (isGolden) ghost.classList.add('ghost-golden');
    if (isSkill) ghost.classList.add('ghost-skill');
    ghost.textContent = text;
    ghost.style.left = (x - 40) + 'px';
    ghost.style.top = (y - 15) + 'px';
    document.body.appendChild(ghost);

    dragState.ghost = ghost;
  }

  /**
   * 移除幽灵元素
   */
  function removeGhost() {
    if (dragState.ghost && dragState.ghost.parentNode) {
      dragState.ghost.parentNode.removeChild(dragState.ghost);
    }
    dragState.ghost = null;
  }

  /**
   * 鼠标移动处理
   * @param {MouseEvent} e
   */
  function onMouseMove(e) {
    if (!dragState.active) return;

    // 更新幽灵位置
    if (dragState.ghost) {
      dragState.ghost.style.left = (e.clientX - 40) + 'px';
      dragState.ghost.style.top = (e.clientY - 15) + 'px';
    }

    // 检测悬停目标，高亮
    highlightDropTargets(e.clientX, e.clientY);
  }

  /**
   * 鼠标释放处理
   * @param {MouseEvent} e
   */
  function onMouseUp(e) {
    if (!dragState.active) return;

    var dropResult = detectDropTarget(e.clientX, e.clientY);

    // 先处理放置结果（需要 dragState 数据），再清理拖拽状态
    handleDrop(dropResult, e);

    // 清理拖拽状态（在 handleDrop 之后，因为 handleDrop 依赖 dragState）
    cleanupDrag();
  }

  /**
   * 高亮可放置目标
   * @param {number} x - 鼠标 X
   * @param {number} y - 鼠标 Y
   */
  function highlightDropTargets(x, y) {
    // 清除所有高亮
    document.querySelectorAll('.board-card.combine-target').forEach(function(el) {
      el.classList.remove('combine-target');
    });
    Renderer.activateSubmitZone(false);
    Renderer.activateSpecialTarget(false);

    // 检查是否悬停在推演板上的其他卡片上
    if (dragState.source === 'card' || dragState.source === 'skill') {
      var boardRect = document.getElementById('board-cards').getBoundingClientRect();
      if (x >= boardRect.left && x <= boardRect.right &&
          y >= boardRect.top && y <= boardRect.bottom) {
        // 检查是否悬停在某个卡片上
        var targetCard = findCardAtPosition(x, y);
        if (targetCard && targetCard.id !== (dragState.sourceData ? dragState.sourceData.id : null)) {
          var targetEl = document.querySelector('[data-card-id="' + targetCard.id + '"]');
          if (targetEl) targetEl.classList.add('combine-target');
        }
      }
    }

    // 检查是否悬停在提交区域
    if (dragState.source === 'card' && dragState.sourceData && dragState.sourceData.isGolden) {
      var submitZone = document.getElementById('submit-zone');
      var specialTarget = document.getElementById('special-target-zone');

      if (submitZone && submitZone.style.display !== 'none') {
        var submitRect = submitZone.getBoundingClientRect();
        if (x >= submitRect.left && x <= submitRect.right &&
            y >= submitRect.top && y <= submitRect.bottom) {
          Renderer.activateSubmitZone(true);
        }
      }

      if (specialTarget && specialTarget.style.display !== 'none') {
        var targetRect = specialTarget.getBoundingClientRect();
        if (x >= targetRect.left && x <= targetRect.right &&
            y >= targetRect.top && y <= targetRect.bottom) {
          Renderer.activateSpecialTarget(true);
        }
      }
    }

    // 检查垃圾桶
    var trashZone = document.getElementById('trash-zone');
    if (trashZone && dragState.source === 'card') {
      var trashRect = trashZone.getBoundingClientRect();
      if (x >= trashRect.left && x <= trashRect.right &&
          y >= trashRect.top && y <= trashRect.bottom) {
        trashZone.classList.add('active');
      } else {
        trashZone.classList.remove('active');
      }
    }

    // Phase 3: Meta 卡片拖放高亮入侵目标
    clearMetaDropHighlights();
    if (dragState.source === 'card' && dragState.sourceData &&
        dragState.sourceData.cardType === 'meta' && dragState.sourceData.metaTargets) {
      dragState.sourceData.metaTargets.forEach(function(target) {
        if (target === 'dialogue') {
          var dialogueArea = document.getElementById('dialogue-area');
          if (dialogueArea) {
            var dRect = dialogueArea.getBoundingClientRect();
            if (x >= dRect.left && x <= dRect.right &&
                y >= dRect.top && y <= dRect.bottom) {
              dialogueArea.classList.add('meta-drop-target');
            }
          }
        }
        if (target === 'crt') {
          var crtOverlay = document.getElementById('crt-overlay');
          if (crtOverlay) {
            var cRect = crtOverlay.getBoundingClientRect();
            if (x >= cRect.left && x <= cRect.right &&
                y >= cRect.top && y <= cRect.bottom) {
              crtOverlay.classList.add('meta-drop-target');
            }
          }
        }
      });
    }
  }

  /**
   * 清除 Meta 拖放高亮
   */
  function clearMetaDropHighlights() {
    document.querySelectorAll('.meta-drop-target').forEach(function(el) {
      el.classList.remove('meta-drop-target');
    });
  }

  /**
   * 检测放置目标
   * @param {number} x
   * @param {number} y
   * @returns {Object} 放置结果 {type: 'board'|'card'|'submit'|'special-target'|'trash'|'none', data: ...}
   */
  function detectDropTarget(x, y) {
    // Phase 3: Meta 卡片入侵目标检测（优先级最高）
    if (dragState.source === 'card' && dragState.sourceData &&
        dragState.sourceData.cardType === 'meta' && dragState.sourceData.metaTargets) {
      for (var i = 0; i < dragState.sourceData.metaTargets.length; i++) {
        var target = dragState.sourceData.metaTargets[i];
        if (target === 'dialogue') {
          var dialogueArea = document.getElementById('dialogue-area');
          if (dialogueArea) {
            var dRect = dialogueArea.getBoundingClientRect();
            if (x >= dRect.left && x <= dRect.right &&
                y >= dRect.top && y <= dRect.bottom) {
              return { type: 'meta-dialogue', data: null };
            }
          }
        }
        if (target === 'crt') {
          var crtOverlay = document.getElementById('crt-overlay');
          if (crtOverlay) {
            var cRect = crtOverlay.getBoundingClientRect();
            if (x >= cRect.left && x <= cRect.right &&
                y >= cRect.top && y <= cRect.bottom) {
              return { type: 'meta-crt', data: null };
            }
          }
        }
      }
    }

    // 检查提交区域（金色卡或结论产物卡均可提交）
    if (dragState.source === 'card' && dragState.sourceData &&
        (dragState.sourceData.isGolden || submittableCards.indexOf(dragState.sourceData.text) !== -1)) {
      var submitZone = document.getElementById('submit-zone');
      if (submitZone && submitZone.style.display !== 'none') {
        var submitRect = submitZone.getBoundingClientRect();
        if (x >= submitRect.left && x <= submitRect.right &&
            y >= submitRect.top && y <= submitRect.bottom) {
          return { type: 'submit', data: null };
        }
      }

      var specialTarget = document.getElementById('special-target-zone');
      if (specialTarget && specialTarget.style.display !== 'none') {
        var targetRect = specialTarget.getBoundingClientRect();
        if (x >= targetRect.left && x <= targetRect.right &&
            y >= targetRect.top && y <= targetRect.bottom) {
          return { type: 'special-target', data: null };
        }
      }
    }

    // 检查垃圾桶
    if (dragState.source === 'card') {
      var trashZone = document.getElementById('trash-zone');
      if (trashZone) {
        var trashRect = trashZone.getBoundingClientRect();
        if (x >= trashRect.left && x <= trashRect.right &&
            y >= trashRect.top && y <= trashRect.bottom) {
          return { type: 'trash', data: dragState.sourceData };
        }
      }
    }

    // 检查推演板上的卡片（合成）
    if (dragState.source === 'card' || dragState.source === 'skill') {
      var boardRect = document.getElementById('board-cards').getBoundingClientRect();
      if (x >= boardRect.left && x <= boardRect.right &&
          y >= boardRect.top && y <= boardRect.bottom) {
        var targetCard = findCardAtPosition(x, y);
        if (targetCard) {
          // 确保不是同一个卡片
          if (dragState.source === 'card' && targetCard.id === dragState.sourceData.id) {
            return { type: 'board', data: null };
          }
          return { type: 'card', data: targetCard };
        }
      }
    }

    // 检查推演板区域（放置新卡片）
    if (dragState.source === 'keyword' || dragState.source === 'skill') {
      var boardRect2 = document.getElementById('board-cards').getBoundingClientRect();
      if (x >= boardRect2.left && x <= boardRect2.right &&
          y >= boardRect2.top && y <= boardRect2.bottom) {
        return { type: 'board', data: null };
      }
    }

    // 检查卡片移动到推演板上的空白区域
    if (dragState.source === 'card') {
      var boardRect3 = document.getElementById('board-cards').getBoundingClientRect();
      if (x >= boardRect3.left && x <= boardRect3.right &&
          y >= boardRect3.top && y <= boardRect3.bottom) {
        return { type: 'board-move', data: null };
      }
    }

    return { type: 'none', data: null };
  }

  /**
   * 在指定坐标找到卡片
   * @param {number} x - 屏幕 X
   * @param {number} y - 屏幕 Y
   * @returns {Object|null} 卡片数据
   */
  function findCardAtPosition(x, y) {
    // 隐藏幽灵，用 elementFromPoint 检测
    if (dragState.ghost) dragState.ghost.style.display = 'none';
    var el = document.elementFromPoint(x, y);
    if (dragState.ghost) dragState.ghost.style.display = '';

    if (!el) return null;

    // 查找最近的 board-card 父元素
    var cardEl = el.closest('.board-card');
    if (!cardEl) return null;

    var cardId = cardEl.dataset.cardId;
    return getCard(cardId);
  }

  /**
   * 处理放置结果
   * @param {Object} dropResult - detectDropTarget 的返回值
   * @param {MouseEvent} e - 原始鼠标事件
   */
  function handleDrop(dropResult, e) {
    var boardEl = document.getElementById('board-cards');
    var boardRect = boardEl ? boardEl.getBoundingClientRect() : null;

    switch (dropResult.type) {
      case 'meta-dialogue':
        // Phase 3: Meta 关键词入侵对话框
        handleMetaIntrusion('dialogue', e);
        break;

      case 'meta-crt':
        // Phase 3: Meta 关键词入侵 CRT 区域
        handleMetaIntrusion('crt', e);
        break;

      case 'board':
        // 从关键词拖放到板上：创建新卡片
        if (dragState.source === 'keyword') {
          var relX = e.clientX - boardRect.left - 40;
          var relY = e.clientY - boardRect.top - 15;
          // 确保在范围内
          relX = Math.max(10, Math.min(relX, boardRect.width - 120));
          relY = Math.max(10, Math.min(relY, boardRect.height - 50));
          createCard(dragState.sourceData.text, relX, relY);
          // Phase 1.3: 检查提取次数，重复提取时音效更轻
          var extractCount = DialogueSystem.getExtractCount(dragState.sourceData.text);
          DialogueSystem.markKeywordExtracted(dragState.sourceData.text);
          if (extractCount > 0) {
            AudioManager.playKeywordPickup('repeat');
          } else {
            AudioManager.playKeywordPickup('fresh');
          }
        }
        // 从技能卡拖放到板空白区域：不创建卡片（技能卡不消耗）
        if (dragState.source === 'skill') {
          // 技能卡拖到空白区域不做事
        }
        break;

      case 'board-move':
        // 卡片在板上移动
        if (dragState.source === 'card' && boardRect) {
          var newX = e.clientX - boardRect.left - dragState.offsetX;
          var newY = e.clientY - boardRect.top - dragState.offsetY;
          newX = Math.max(0, Math.min(newX, boardRect.width - 120));
          newY = Math.max(0, Math.min(newY, boardRect.height - 50));
          updateCardPosition(dragState.sourceData.id, newX, newY);
        }
        break;

      case 'card':
        // 卡片合成判定
        handleCombine(dropResult.data, e);
        break;

      case 'submit':
        // 提交金色卡片 — 失真卡未净化不可提交
        if (dragState.sourceData.cardType === 'distorted') {
          Renderer.showMessage('这张卡片已经失真，必须先使用技能卡净化后再提交', 'combine-error');
          // 卡片返回原位
          if (dragState.originalCard) {
            dragState.originalCard.style.opacity = '1';
            dragState.originalCard.classList.remove('dragging');
          }
          return;
        }
        if (onSubmitCallback) {
          onSubmitCallback(dragState.sourceData.text, false);
        }
        removeCard(dragState.sourceData.id, true);
        break;

      case 'special-target':
        // 提交到特殊目标（Trial 4）— 失真卡未净化不可提交
        if (dragState.sourceData.cardType === 'distorted') {
          Renderer.showMessage('这张卡片已经失真，必须先使用技能卡净化后再提交', 'combine-error');
          if (dragState.originalCard) {
            dragState.originalCard.style.opacity = '1';
            dragState.originalCard.classList.remove('dragging');
          }
          return;
        }
        if (onSubmitCallback) {
          onSubmitCallback(dragState.sourceData.text, true);
        }
        removeCard(dragState.sourceData.id, true);
        break;

      case 'trash':
        // 删除卡片（Trial 4 中金色卡片进垃圾桶触发结局B）
        if (dragState.source === 'card') {
          var wasGolden = dragState.sourceData.isGolden;
          removeCard(dragState.sourceData.id, true);
          AudioManager.playTrash(wasGolden);
          if (onCardDeletedCallback) {
            onCardDeletedCallback(dragState.sourceData.id, wasGolden);
          }
        }
        break;

      default:
        // 取消拖拽，卡片回到原位
        break;
    }
  }

  // ==================== Phase 3: Meta 入侵 ====================

  var onMetaIntrusionCallback = null; // Meta 入侵回调

  /**
   * 处理 Meta 入侵
   * @param {string} targetType - 'dialogue' | 'crt'
   * @param {MouseEvent} e - 鼠标事件
   */
  function handleMetaIntrusion(targetType, e) {
    var cardData = dragState.sourceData;
    if (!cardData || cardData.cardType !== 'meta') return;

    if (targetType === 'dialogue') {
      // === Stage 检查：Meta 卡只能在对应的 Stage 使用 ===
      var currentTrial = Game.state ? Game.state.currentTrial : null;
      var currentStage = Game.state ? Game.state.currentStage : null;
      if (currentTrial && currentStage && GAME_DATA.trials) {
        var trialData = GAME_DATA.trials[currentTrial];
        if (trialData && trialData.stages && trialData.stages[currentStage]) {
          var expectedMetaCard = trialData.stages[currentStage].hidden_layer_meta_card;
          if (!expectedMetaCard || expectedMetaCard !== cardData.text) {
            Renderer.showMessage('现在好像不是使用它的时候……', 'combine-error');
            return;
          }
        }
      }

      // 对话框入侵：检查是否有隐藏台词层
      if (!DialogueSystem.hasHiddenLayer()) {
        // 无隐藏台词层，入侵失败，卡片不消耗
        Renderer.showMessage('这段对话下面什么也没有……', 'game-message');
        return;
      }

      // 检查门控条件
      var gate = DialogueSystem.getCurrentHiddenLayerGate();
      if (gate) {
        // 需要检查矛盾标记是否已完成
        var save = Game.loadGame ? null : null; // 通过回调检查
        if (onMetaIntrusionCallback) {
          var allowed = onMetaIntrusionCallback('check_gate', gate);
          if (!allowed) {
            Renderer.showMessage('底层记录被加密了……需要先找到矛盾线索。', 'combine-error');
            return;
          }
        }
      }

      // 入侵成功！消耗 Meta 卡片
      consumeMetaCard(cardData);

      // 触发对话框 glitch 效果
      var dialogueArea = document.getElementById('dialogue-area');
      if (dialogueArea) {
        dialogueArea.classList.add('glitch-burst');
        setTimeout(function() {
          dialogueArea.classList.remove('glitch-burst');
        }, 500);
      }

      // 揭示隐藏台词层
      setTimeout(function() {
        DialogueSystem.revealHiddenLayer();
        Renderer.showFlash('green', 400);
        AudioManager.playMetaIntrusion('dialogue');
        Renderer.showMessage('Meta 入侵成功！底层记录已浮现', 'game-message');

        // 记录 Meta 入侵到存档
        if (onMetaIntrusionCallback) {
          onMetaIntrusionCallback('performed', {
            trial: Game.state ? Game.state.currentTrial : null,
            keyword: cardData.text,
            target: 'dialogue'
          });
        }
      }, 300);

    } else if (targetType === 'crt') {
      // CRT 入侵：强化故障效果
      consumeMetaCard(cardData);

      document.body.classList.add('glitch-burst');
      Renderer.showFlash('green', 500);
      AudioManager.playMetaIntrusion('crt');

      setTimeout(function() {
        document.body.classList.remove('glitch-burst');
        Renderer.showMessage('CRT 扫描线背后似乎有什么……', 'game-message');
      }, 1000);

      if (onMetaIntrusionCallback) {
        onMetaIntrusionCallback('performed', {
          trial: Game.state ? Game.state.currentTrial : null,
          keyword: cardData.text,
          target: 'crt'
        });
      }
    }
  }

  /**
   * 消耗 Meta 卡片（从板上移除 + 标记关键词不可再提取）
   * @param {Object} cardData - 被消耗的卡片数据
   */
  function consumeMetaCard(cardData) {
    // 从板上移除卡片
    removeCard(cardData.id, true);

    // 标记关键词为已消耗（不可再提取）
    if (GAME_DATA.keyword_metadata[cardData.text]) {
      GAME_DATA.keyword_metadata[cardData.text].is_extractable = false;
      GAME_DATA.keyword_metadata[cardData.text].meta_consumed = true;
    }

    // 在对话中标记该关键词为已消耗
    var keywords = document.querySelectorAll('#dialogue-area .keyword');
    keywords.forEach(function(kw) {
      if (kw.dataset.keyword === cardData.text) {
        kw.classList.add('meta-consumed');
        kw.dataset.bound = 'true'; // 防止再次绑定
      }
    });
  }

  /**
   * 处理卡片合成
   * @param {Object} targetCard - 目标卡片数据
   * @param {MouseEvent} e - 鼠标事件
   */
  function handleCombine(targetCard, e) {
    var textA, textB;
    var isSkillCombine = false;

    if (dragState.source === 'card') {
      textA = dragState.sourceData.text;
      textB = targetCard.text;
      // Phase 3: Meta 卡片不参与合成
      if (dragState.sourceData.cardType === 'meta' || targetCard.cardType === 'meta') {
        Renderer.showMessage('Meta 关键词只能用于入侵 UI', 'game-message');
        return;
      }
    } else if (dragState.source === 'skill') {
      textA = dragState.sourceData.text;
      textB = targetCard.text;
      isSkillCombine = true;
    } else {
      return;
    }

    var boardEl = document.getElementById('board-cards');
    var boardRect = boardEl.getBoundingClientRect();
    var resultX = e.clientX - boardRect.left - 40;
    var resultY = e.clientY - boardRect.top - 15;

    // Phase 2.5: 技能卡 + 失真卡 → 净化
    if (isSkillCombine && targetCard.cardType === 'distorted') {
      var isSkillSensory = (textA === '视觉重构' || textA === '听觉重构' || textA === '嗅觉重构');
      if (isSkillSensory) {
        removeCard(targetCard.id, true);
        setTimeout(function() {
          var purifiedCard = createCard(textB, resultX, resultY, { animate: true, cardType: 'normal' });
          Renderer.showCombineSuccess(e.clientX, e.clientY);
          Renderer.showMessage('\u5931\u771F\u5F97\u5230\u51C0\u5316\uFF01', 'game-message');
          AudioManager.playPurifySuccess();
        }, 300);
        return;
      }
    }

    // Phase 2.5: 两张失真卡 → 概率校准（50%成功净化为 normal，50%双倍失真）
    if (dragState.source === 'card' &&
        dragState.sourceData.cardType === 'distorted' &&
        targetCard.cardType === 'distorted') {
      removeCard(dragState.sourceData.id, true);
      removeCard(targetCard.id, true);

      var success = (Math.random() < 0.5);
      setTimeout(function() {
        if (success) {
          // 50%: 净化，产出 normal 卡
          var result50 = Game.findRecipe(textA, textB) || textA;
          createCard(result50, resultX, resultY, { animate: true, cardType: 'normal' });
          Renderer.showCombineSuccess(e.clientX, e.clientY);
          Renderer.showMessage('\u6982\u7387\u6821\u51C6\u6210\u529F\uFF01\u5931\u771F\u88AB\u4FEE\u6B63', 'game-message');
        } else {
          // 50%: 失败，产出一张更强失真卡（保留文本）
          createCard(textA, resultX, resultY, { animate: true, cardType: 'distorted' });
          Renderer.showFlash('red', 300);
          AudioManager.playFail();
          Renderer.showMessage('\u6982\u7387\u6821\u51C6\u5931\u8D25\uFF01\u5931\u771F\u52A0\u5267', 'combine-error');
        }
        checkDistortedOverload();
      }, 300);
      return;
    }

    // 查找配方
    var result = Game.findRecipe(textA, textB);

    if (result) {
      // Phase 2.3: 属性兼容性检查（仅对卡片+卡片合成，技能卡不检查）
      var isDistorted = false;
      if (dragState.source === 'card') {
        var metaA = getKeywordMetadata(textA);
        var metaB = getKeywordMetadata(textB);
        var contradiction = checkAttributeContradiction(metaA.attributes, metaB.attributes);
        isDistorted = !!contradiction;
      }

      // 移除被消耗的卡片（技能卡不消耗）
      if (dragState.source === 'card') {
        removeCard(dragState.sourceData.id, true);
      }
      removeCard(targetCard.id, true);

      // 创建结果卡片
      setTimeout(function() {
        if (isDistorted) {
          // 属性矛盾：产出失真卡
          createCard(result, resultX, resultY, { animate: true, cardType: 'distorted' });
          Renderer.showMessage('\u5C5E\u6027\u51B2\u7A81\uFF01\u5408\u6210\u7ED3\u679C\u53D1\u751F\u5931\u771F', 'combine-error');
          checkDistortedOverload();
        } else {
          createCard(result, resultX, resultY, { animate: true });
        }
      }, 300);

      // 特效
      if (isDistorted) {
        Renderer.showFlash('red', 300);
        AudioManager.playFail();
      } else {
        Renderer.showCombineSuccess(e.clientX, e.clientY);
      }

      // 回调
      if (onCombineCallback) {
        onCombineCallback(result, e.clientX, e.clientY);
      }
    } else {
      // 合成失败
      // 弹开动画
      if (dragState.source === 'card' && dragState.originalCard) {
        dragState.originalCard.classList.add('card-bounce');
        var origCard = dragState.originalCard;
        setTimeout(function() {
          origCard.classList.remove('card-bounce');
        }, 400);
      }
      var targetEl = document.querySelector('[data-card-id="' + targetCard.id + '"]');
      if (targetEl) {
        targetEl.classList.add('card-bounce');
        setTimeout(function() {
          targetEl.classList.remove('card-bounce');
        }, 400);
      }

      // 特效
      Renderer.showCombineFail(e.clientX, e.clientY);

      // 提示
      Renderer.showMessage('\u7F3A\u4E4F\u903B\u8F91\u5173\u8054', 'combine-error');

      // 回调
      if (onCombineFailCallback) {
        onCombineFailCallback(e.clientX, e.clientY);
      }
    }
  }

  /**
   * 清理拖拽状态
   */
  function cleanupDrag() {
    // 恢复原始卡片样式
    if (dragState.originalCard) {
      dragState.originalCard.classList.remove('dragging');
      dragState.originalCard.style.opacity = '';
    }

    // 恢复关键词样式
    if (dragState.source === 'keyword' && dragState.sourceData && dragState.sourceData.element) {
      dragState.sourceData.element.classList.remove('dragging');
    }

    // 恢复技能卡样式
    if (dragState.source === 'skill' && dragState.sourceData && dragState.sourceData.element) {
      dragState.sourceData.element.classList.remove('dragging');
    }

    // 移除幽灵
    removeGhost();

    // 清除高亮
    document.querySelectorAll('.board-card.combine-target').forEach(function(el) {
      el.classList.remove('combine-target');
    });
    Renderer.activateSubmitZone(false);
    Renderer.activateSpecialTarget(false);
    var trashZone = document.getElementById('trash-zone');
    if (trashZone) trashZone.classList.remove('active');

    // Phase 3: 清除 Meta 拖放高亮
    clearMetaDropHighlights();

    // 重置状态
    dragState.active = false;
    dragState.source = null;
    dragState.sourceData = null;
    dragState.ghost = null;
    dragState.originalCard = null;
  }

  // ==================== 技能卡事件绑定 ====================

  /**
   * 初始化技能卡的拖拽事件
   */
  function initSkillCards() {
    var skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(function(card) {
      card.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var skillName = card.dataset.skill;
        startSkillDrag(skillName, e, card);
      });
    });
  }

  // ==================== 矛盾标记系统（Phase 2.4）====================

  var markingMode = false;         // 是否处于标记模式
  var markedCards = [];            // 当前选中的卡片 [{data, el}]
  var flaggedContradictions = [];  // 已标记的矛盾 ID 列表
  var onContradictionFlaggedCallback = null; // 矛盾标记成功回调

  /**
   * 更新矛盾标记按钮的提示状态
   * 板上有 2+ 张卡片时，按钮微微发光提示玩家可以使用
   */
  function updateMarkButtonHint() {
    var btn = document.getElementById('mark-contradiction-btn');
    if (!btn) return;
    if (markingMode) return; // 标记模式下不更新
    if (cards.length >= 2) {
      btn.classList.add('hint-available');
    } else {
      btn.classList.remove('hint-available');
    }
  }

  /**
   * 初始化矛盾标记按钮
   */
  function initMarkContradictionButton() {
    var btn = document.getElementById('mark-contradiction-btn');
    if (!btn) return;
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (markingMode) {
        exitMarkingMode();
      } else {
        enterMarkingMode();
      }
    });
  }

  /**
   * 进入标记模式
   */
  function enterMarkingMode() {
    markingMode = true;
    markedCards = [];

    var btn = document.getElementById('mark-contradiction-btn');
    if (btn) {
      btn.classList.add('active');
      btn.classList.remove('hint-available');
    }

    // 推演板添加标记模式样式
    var boardEl = document.getElementById('board-cards');
    if (boardEl) boardEl.classList.add('marking-mode');

    Renderer.showMessage('\u26A1 \u6807\u8BB0\u6A21\u5F0F\u5DF2\u5F00\u542F\uFF1A\u70B9\u51FB\u4E24\u5F20\u5361\u7247\u6765\u6807\u8BB0\u5B83\u4EEC\u4E4B\u95F4\u7684\u77DB\u76FE\uFF08\u518D\u70B9\u4E00\u6B21\u53D6\u6D88\u9009\u4E2D\uFF09', 'game-message');
  }

  /**
   * 退出标记模式
   */
  function exitMarkingMode() {
    markingMode = false;

    // 取消所有选中
    markedCards.forEach(function(item) {
      item.el.classList.remove('mark-selected');
    });
    markedCards = [];

    var btn = document.getElementById('mark-contradiction-btn');
    if (btn) btn.classList.remove('active');

    var boardEl = document.getElementById('board-cards');
    if (boardEl) boardEl.classList.remove('marking-mode');

    // 恢复按钮提示状态
    updateMarkButtonHint();
  }

  /**
   * 切换卡片选中状态（标记模式下）
   * @param {Object} cardData - 卡片数据
   * @param {HTMLElement} el - 卡片 DOM 元素
   */
  function toggleCardMark(cardData, el) {
    // 检查是否已选中
    var existingIdx = -1;
    for (var i = 0; i < markedCards.length; i++) {
      if (markedCards[i].data.id === cardData.id) {
        existingIdx = i;
        break;
      }
    }

    if (existingIdx >= 0) {
      // 取消选中
      el.classList.remove('mark-selected');
      markedCards.splice(existingIdx, 1);
    } else {
      // 选中（最多2张）
      if (markedCards.length >= 2) {
        // 移除最早选中的
        markedCards[0].el.classList.remove('mark-selected');
        markedCards.shift();
      }
      el.classList.add('mark-selected');
      markedCards.push({ data: cardData, el: el });

      // 选中2张时自动检查矛盾
      if (markedCards.length === 2) {
        setTimeout(executeMarkContradiction, 200);
      }
    }
  }

  /**
   * 执行矛盾标记检查
   */
  function executeMarkContradiction() {
    if (markedCards.length !== 2) return;

    var cardA = markedCards[0].data;
    var cardB = markedCards[1].data;
    var elA = markedCards[0].el;
    var elB = markedCards[1].el;

    // 查找语义矛盾
    var contradiction = findSemanticContradiction(cardA.text, cardB.text);

    // 同时也检查属性矛盾
    var attrConflict = checkAttributeContradiction(cardA.attributes, cardB.attributes);

    if (contradiction) {
      // 检查是否已标记过
      if (flaggedContradictions.indexOf(contradiction.id) >= 0) {
        Renderer.showMessage('\u8FD9\u4E2A\u77DB\u76FE\u5DF2\u7ECF\u88AB\u6807\u8BB0\u8FC7\u4E86', 'game-message');
        exitMarkingMode();
        return;
      }

      // 标记成功！
      flaggedContradictions.push(contradiction.id);

      // 解锁隐藏关键词
      if (contradiction.unlocks && contradiction.unlocks.length > 0) {
        unlockContradictionKeywords(contradiction.unlocks);
      }

      // 特效
      Renderer.showFlash('red', 400);
      AudioManager.playContradictionMark();
      Renderer.showMessage('\u77DB\u76FE\u6807\u8BB0\u6210\u529F\uFF01\u65B0\u7684\u7EBF\u7D22\u88AB\u89E3\u9501', 'game-message');

      // 回调通知 game.js 记录
      if (onContradictionFlaggedCallback) {
        onContradictionFlaggedCallback(contradiction.id, contradiction.trial);
      }

      exitMarkingMode();
    } else if (attrConflict) {
      // 属性矛盾（但非语义矛盾标记点）
      Renderer.showMessage('\u8FD9\u4E24\u5F20\u5361\u7247\u5C5E\u6027\u51B2\u7A81\uFF0C\u4F46\u672A\u53D1\u73B0\u8BB0\u5FC6\u77DB\u76FE', 'game-message');
      exitMarkingMode();
    } else {
      // 无矛盾
      Renderer.showMessage('\u8FD9\u4E24\u5F20\u5361\u7247\u4E4B\u95F4\u672A\u53D1\u73B0\u77DB\u76FE', 'game-message');
      exitMarkingMode();
    }
  }

  /**
   * 解锁矛盾对应的隐藏关键词
   * @param {Array} unlocks - 解锁列表 [{stage, word, was_noise}]
   */
  function unlockContradictionKeywords(unlocks) {
    unlocks.forEach(function(item) {
      var word = item.word;
      // 将关键词的 is_extractable 设为 true（运行时修改 metadata）
      if (GAME_DATA.keyword_metadata[word]) {
        GAME_DATA.keyword_metadata[word].is_extractable = true;
        GAME_DATA.keyword_metadata[word].card_type = 'normal';
      }
      // 在对话中追加解锁的关键词
      DialogueSystem.appendUnlockedKeyword(word);
    });
  }

  /**
   * 获取推演板上失真卡数量（Phase 2.5 使用）
   * @returns {number}
   */
  function getDistortedCount() {
    var count = 0;
    cards.forEach(function(card) {
      if (card.cardType === 'distorted') count++;
    });
    return count;
  }

  /**
   * Phase 2.5: 检查失真卡过载状态（超3张时发出警告）
   */
  function checkDistortedOverload() {
    var count = getDistortedCount();
    var boardEl = document.getElementById('board-cards');
    if (!boardEl) return;

    if (count >= 3) {
      boardEl.classList.add('distorted-overload');
      Renderer.showMessage(
        '\u8B66\u544A\uFF1A\u63A8\u6F14\u677F\u5931\u771F\u8FC7\u8F7D\uFF01\uFF08' + count + '/3\uFF09\u8BF7\u4F7F\u7528\u611F\u5B98\u6280\u80FD\u5236\u5361\u6216\u91CD\u7F6E\u63A8\u6F14\u677F',
        'combine-error'
      );
      Renderer.showFlash('red', 500);
    } else {
      boardEl.classList.remove('distorted-overload');
    }
  }

  // ==================== 全局鼠标事件 ====================

  var globalListenersInitialized = false; // 防止重复绑定

  /**
   * 初始化全局鼠标事件监听
   */
  function initGlobalListeners() {
    if (globalListenersInitialized) return;
    globalListenersInitialized = true;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // 点击对话区域时跳过打字动画
    var dialogueScroll = document.getElementById('dialogue-scroll');
    if (dialogueScroll) {
      dialogueScroll.addEventListener('click', function() {
        if (DialogueSystem.getIsTyping()) {
          DialogueSystem.skipCurrentTyping();
        }
      });
    }
  }

  // ==================== 自动布局 ====================

  /**
   * 自动排列推演板上的卡片（网格布局）
   */
  function autoLayout() {
    var boardEl = document.getElementById('board-cards');
    if (!boardEl) return;
    var boardRect = boardEl.getBoundingClientRect();
    var cols = Math.floor(boardRect.width / 180);
    if (cols < 1) cols = 1;
    var colWidth = boardRect.width / cols;

    cards.forEach(function(card, index) {
      var col = index % cols;
      var row = Math.floor(index / cols);
      var x = col * colWidth + 20;
      var y = row * 70 + 20;
      updateCardPosition(card.id, x, y);
    });
  }

  // 公开接口
  return {
    setCallbacks: setCallbacks,
    setRequiredSubmit: setRequiredSubmit,
    createCard: createCard,
    removeCard: removeCard,
    setCardType: setCardType,
    getCard: getCard,
    updateCardPosition: updateCardPosition,
    clearBoard: clearBoard,
    getAllCards: getAllCards,
    startKeywordDrag: startKeywordDrag,
    autoLayout: autoLayout,
    initSkillCards: initSkillCards,
    initGlobalListeners: initGlobalListeners,
    initResetButton: initResetButton,
    showAttributePanel: showAttributePanel,
    hideAttributePanel: hideAttributePanel,
    initMarkContradictionButton: initMarkContradictionButton,
    getDistortedCount: getDistortedCount,
    enterMarkingMode: enterMarkingMode,
    exitMarkingMode: exitMarkingMode,
    resetContradictions: function() {
      flaggedContradictions = [];
      markingMode = false;
      markedCards = [];
    },
    returnCardToBoard: function(text) {
      // 退回卡片到推演板（结论取消时使用）
      var boardEl = document.getElementById('board-cards');
      var x = 40, y = 40;
      if (boardEl) {
        var existing = getAllCards();
        if (existing.length > 0) {
          x = 40 + (existing.length % 4) * 180;
          y = 40 + Math.floor(existing.length / 4) * 70;
        }
      }
      return createCard(text, x, y, { isGolden: true, animate: true });
    }
  };
})();
