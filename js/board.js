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
  }

  /**
   * 设置当前阶段所需的提交线索
   * @param {string} text - 金色线索名称
   */
  function setRequiredSubmit(text) {
    requiredSubmit = text;
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
    var defaults = { isGolden: false, animate: true };
    var opts = Object.assign({}, defaults, options);

    var cardData = {
      id: 'card-' + (++cardIdCounter),
      text: text,
      x: x,
      y: y,
      isGolden: opts.isGolden
    };

    // 检查是否为金色（匹配 required_submit）
    if (requiredSubmit && text === requiredSubmit) {
      cardData.isGolden = true;
    }

    cards.push(cardData);

    // 创建 DOM 元素
    var el = document.createElement('div');
    el.className = 'board-card' + (cardData.isGolden ? ' golden' : '');
    if (opts.animate) el.classList.add('card-spawn');
    el.textContent = text;
    el.dataset.cardId = cardData.id;
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    // 绑定拖拽事件
    el.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      startCardDrag(cardData, el, e);
    });

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

    return cardData;
  }

  /**
   * 移除卡片
   * @param {string} cardId - 卡片 ID
   * @param {boolean} animate - 是否显示销毁动画
   */
  function removeCard(cardId, animate) {
    // 从数据中移除
    cards = cards.filter(function(c) { return c.id !== cardId; });

    // 从 DOM 移除
    var el = document.querySelector('[data-card-id="' + cardId + '"]');
    if (el) {
      if (animate) {
        el.classList.add('card-destroy');
        setTimeout(function() {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 400);
      } else {
        if (el.parentNode) el.parentNode.removeChild(el);
      }
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
  }

  /**
   * 获取所有卡片
   * @returns {Array}
   */
  function getAllCards() {
    return cards.slice();
  }

  // ==================== 拖拽系统 ====================

  /**
   * 从关键词开始拖拽
   * @param {string} keywordText - 关键词文本
   * @param {MouseEvent} e - 鼠标事件
   * @param {HTMLElement} sourceEl - 来源 DOM 元素
   */
  function startKeywordDrag(keywordText, e, sourceEl) {
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

    // 创建幽灵元素
    createGhost(cardData.text, cardData.isGolden, e.clientX, e.clientY);

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
  }

  /**
   * 检测放置目标
   * @param {number} x
   * @param {number} y
   * @returns {Object} 放置结果 {type: 'board'|'card'|'submit'|'special-target'|'trash'|'none', data: ...}
   */
  function detectDropTarget(x, y) {
    // 检查提交区域
    if (dragState.source === 'card' && dragState.sourceData && dragState.sourceData.isGolden) {
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
      case 'board':
        // 从关键词拖放到板上：创建新卡片
        if (dragState.source === 'keyword') {
          var relX = e.clientX - boardRect.left - 40;
          var relY = e.clientY - boardRect.top - 15;
          // 确保在范围内
          relX = Math.max(10, Math.min(relX, boardRect.width - 120));
          relY = Math.max(10, Math.min(relY, boardRect.height - 50));
          createCard(dragState.sourceData.text, relX, relY);
          DialogueSystem.markKeywordExtracted(dragState.sourceData.text);
          AudioManager.playDrop();
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
        // 提交金色卡片
        if (onSubmitCallback) {
          onSubmitCallback(dragState.sourceData.text, false);
        }
        removeCard(dragState.sourceData.id, true);
        break;

      case 'special-target':
        // 提交到特殊目标（Trial 4）
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
          AudioManager.playDrop();
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
    } else if (dragState.source === 'skill') {
      textA = dragState.sourceData.text;
      textB = targetCard.text;
      isSkillCombine = true;
    } else {
      return;
    }

    // 查找配方
    var result = Game.findRecipe(textA, textB);

    if (result) {
      // 合成成功！
      var boardEl = document.getElementById('board-cards');
      var boardRect = boardEl.getBoundingClientRect();
      var resultX = e.clientX - boardRect.left - 40;
      var resultY = e.clientY - boardRect.top - 15;

      // 移除被消耗的卡片（技能卡不消耗）
      if (dragState.source === 'card') {
        removeCard(dragState.sourceData.id, true);
      }
      removeCard(targetCard.id, true);

      // 创建结果卡片
      setTimeout(function() {
        createCard(result, resultX, resultY, { animate: true });
      }, 300);

      // 特效
      Renderer.showCombineSuccess(e.clientX, e.clientY);

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
      Renderer.showMessage('缺乏逻辑关联', 'combine-error');

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
    getCard: getCard,
    updateCardPosition: updateCardPosition,
    clearBoard: clearBoard,
    getAllCards: getAllCards,
    startKeywordDrag: startKeywordDrag,
    autoLayout: autoLayout,
    initSkillCards: initSkillCards,
    initGlobalListeners: initGlobalListeners
  };
})();
