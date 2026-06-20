/**
 * 语义缝合师 — 智能提示系统 (HintSystem)
 *
 * 触发条件：
 *   1. 玩家 15 秒无操作（未提取/合成/感官重构/矛盾标记/Meta入侵）
 *   2. 连续 4 次操作失败（合成失败 或 感官重构失败）
 *
 * 提示内容：
 *   - 根据攻略路径（HINT_DATA）中玩家已完成步骤，确定下一步应做什么
 *   - 对话中待提取的词：高亮闪烁边缘（蓝紫色）
 *   - 推演板上应操作的卡片：高亮闪烁边缘（金色）
 *   - 技能卡栏需要的技能：高亮脉冲
 *   - NPC 气泡提示台词（10 秒后自动消失）
 *   - 高亮持续 10 秒，一旦玩家任意操作立即停止
 *
 * 每次进入新章节（trial）时，进度记录自动清空。
 */
var HintSystem = (function() {
  'use strict';

  // ==================== 状态 ====================
  var _currentTrial = null;
  var _currentStage = null;

  // 玩家在当前Stage完成的步骤ID集合
  var _completedSteps = {};   // key: stageKey, value: Set of step ids (array polyfill)

  // 计时器
  var _idleTimer = null;
  var _IDLE_TIMEOUT = 15000; // 15秒

  // 失败计数（每次进入新Stage重置）
  var _failCount = 0;
  var _FAIL_THRESHOLD = 4;

  // 提示是否正在显示
  var _hintActive = false;
  // 高亮清理函数列表
  var _highlightCleanups = [];
  // 高亮自动消失定时器
  var _hintAutoHideTimer = null;
  var _HINT_DURATION = 10000; // 10秒

  // 是否在 Trial 1-3（只对这三关生效）
  function _isValidTrial(trialId) {
    return trialId === 'trial_1' || trialId === 'trial_2' || trialId === 'trial_3';
  }

  // ==================== 进度追踪 ====================

  function _stageKey(trialId, stageId) {
    return trialId + '::' + stageId;
  }

  function _getCompletedSteps(trialId, stageId) {
    var k = _stageKey(trialId, stageId);
    if (!_completedSteps[k]) _completedSteps[k] = [];
    return _completedSteps[k];
  }

  function _markStepDone(trialId, stageId, stepId) {
    var steps = _getCompletedSteps(trialId, stageId);
    if (steps.indexOf(stepId) < 0) {
      steps.push(stepId);
    }
  }

  function _isStepDone(trialId, stageId, stepId) {
    var steps = _getCompletedSteps(trialId, stageId);
    return steps.indexOf(stepId) >= 0;
  }

  // ==================== 下一步计算 ====================

  /**
   * 检查指定文本的卡片是否在推演板上
   * @param {string} cardText
   * @returns {boolean}
   */
  function _isCardOnBoard(cardText) {
    var els = document.querySelectorAll('#board-cards .board-card');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var text = el.dataset.cardText ||
                 (el.querySelector('.card-text') && el.querySelector('.card-text').textContent.trim());
      if (text === cardText) return true;
    }
    return false;
  }

  /**
   * 判断某个步骤当前是否"可执行"（即前置条件已满足，操作对象存在）
   * 用于跳过那些所需卡片已被消耗、无法再完成的步骤
   * @param {Object} step
   * @returns {boolean} true = 可执行（应该提示），false = 跳过
   */
  function _isStepExecutable(step) {
    // 对于矛盾标记步骤：要求 target_cards 中所有卡都必须在板上
    // 若有卡被合成消耗了，该步骤已无法完成，跳过
    if (step.type === 'contradiction') {
      if (!step.target_cards || step.target_cards.length === 0) return true;
      for (var i = 0; i < step.target_cards.length; i++) {
        if (!_isCardOnBoard(step.target_cards[i])) return false;
      }
      return true;
    }
    // 其他类型的步骤都视为可执行（extract/sensory/combine/submit/meta）
    return true;
  }

  /**
   * 计算当前 Stage 中玩家下一步应该做什么
   * @returns {Object|null} 下一个 hint_step，或 null（全完成 / 无数据）
   */
  function _getNextStep() {
    if (!_currentTrial || !_currentStage) return null;
    var trialData = (typeof HINT_DATA !== 'undefined') ? HINT_DATA[_currentTrial] : null;
    if (!trialData) return null;
    var stageData = trialData[_currentStage];
    if (!stageData || !stageData.hint_steps) return null;

    var steps = stageData.hint_steps;
    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      if (_isStepDone(_currentTrial, _currentStage, step.id)) continue;
      // 如果步骤已不可执行（所需卡片被消耗），跳过该步不提示
      if (!_isStepExecutable(step)) continue;
      return step;
    }
    return null; // 所有步骤已完成或均不可执行
  }

  // ==================== 高亮逻辑 ====================

  /**
   * 对话中关键词高亮（蓝紫色边缘闪烁）
   * @param {Array<string>} words
   */
  function _highlightDialogueWords(words) {
    if (!words || words.length === 0) return;
    words.forEach(function(word) {
      var els = document.querySelectorAll('#dialogue-area .keyword[data-keyword="' + word + '"]');
      els.forEach(function(el) {
        el.classList.add('hint-blink-dialogue');
        _highlightCleanups.push(function() {
          el.classList.remove('hint-blink-dialogue');
        });
      });
    });
  }

  /**
   * 推演板卡片高亮（金色边缘闪烁）
   * @param {Array<string>} cardTexts
   */
  function _highlightBoardCards(cardTexts) {
    if (!cardTexts || cardTexts.length === 0) return;
    cardTexts.forEach(function(text) {
      var els = document.querySelectorAll('#board-cards .board-card');
      els.forEach(function(el) {
        if (el.dataset.cardText === text || el.querySelector('.card-text') && el.querySelector('.card-text').textContent.trim() === text) {
          el.classList.add('hint-blink-board');
          _highlightCleanups.push(function() {
            el.classList.remove('hint-blink-board');
          });
        }
      });
    });
  }

  /**
   * 技能卡高亮（橙色脉冲）
   * @param {Array<string>} skillNames
   */
  function _highlightSkillCards(skillNames) {
    if (!skillNames || skillNames.length === 0) return;
    skillNames.forEach(function(name) {
      var els = document.querySelectorAll('.skill-card[data-skill="' + name + '"]');
      els.forEach(function(el) {
        el.classList.add('hint-blink-skill');
        _highlightCleanups.push(function() {
          el.classList.remove('hint-blink-skill');
        });
      });
    });
  }

  /**
   * 矛盾标记按钮高亮
   */
  function _highlightContradictionBtn() {
    var btn = document.getElementById('mark-contradiction-btn');
    if (!btn) return;
    btn.classList.add('hint-blink-board');
    _highlightCleanups.push(function() {
      btn.classList.remove('hint-blink-board');
    });
  }

  /**
   * 停止所有高亮
   */
  function _clearAllHighlights() {
    _highlightCleanups.forEach(function(fn) { try { fn(); } catch(e) {} });
    _highlightCleanups = [];
    if (_hintAutoHideTimer) {
      clearTimeout(_hintAutoHideTimer);
      _hintAutoHideTimer = null;
    }
    _hintActive = false;
  }

  // ==================== NPC 提示台词 ====================

  /**
   * 在对话区域追加一条 NPC 气泡提示（10s后自动消失）
   * @param {string} text
   */
  function _showNpcHint(text) {
    if (!text) return;

    // 直接往对话区追加一条轻量提示气泡，不打断主对话
    var bubble = document.createElement('div');
    bubble.className = 'hint-npc-bubble';
    bubble.textContent = text;

    var dialogueArea = document.getElementById('dialogue-current');
    if (!dialogueArea) {
      dialogueArea = document.getElementById('dialogue-area');
    }
    if (!dialogueArea) return;

    dialogueArea.appendChild(bubble);

    // 10秒后自动移除
    var timer = setTimeout(function() {
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    }, _HINT_DURATION);

    // 记录cleanup
    _highlightCleanups.push(function() {
      clearTimeout(timer);
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    });
  }

  // ==================== 主提示触发 ====================

  /**
   * 触发提示前，将推演板上现有的卡片批量回溯同步到进度记录
   * 解决：玩家乱序操作后，已在板上的卡片对应的 extract/sensory/combine 步骤未被标记完成的问题
   */
  function _syncBoardStateToProgress() {
    if (!_currentTrial || !_currentStage) return;
    var trialData = (typeof HINT_DATA !== 'undefined') ? HINT_DATA[_currentTrial] : null;
    if (!trialData) return;
    var stageData = trialData[_currentStage];
    if (!stageData || !stageData.hint_steps) return;

    var steps = stageData.hint_steps;
    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      if (_isStepDone(_currentTrial, _currentStage, step.id)) continue;
      var dw = step.done_when;
      if (!dw) continue;
      // 对于"卡片在板上"类型的完成条件，检查卡片是否已经在板上
      if (dw.type === 'card_on_board' && _isCardOnBoard(dw.value)) {
        _markStepDone(_currentTrial, _currentStage, step.id);
      }
    }
  }

  /**
   * 触发提示（计算下一步并展示）
   */
  function _triggerHint() {
    if (_hintActive) return; // 已在展示中不重复
    if (!_isValidTrial(_currentTrial)) return;

    // 触发前先同步板上现有卡片状态，避免提示"需要提取/合成"已存在的卡片
    _syncBoardStateToProgress();

    var step = _getNextStep();
    if (!step) return; // 没有待完成步骤

    _hintActive = true;
    _highlightCleanups = [];

    // 根据步骤类型决定高亮哪些元素
    switch (step.type) {
      case 'extract':
        _highlightDialogueWords(step.target_words);
        break;

      case 'sensory':
        _highlightBoardCards(step.target_cards);
        _highlightSkillCards(step.target_skills);
        break;

      case 'combine':
        _highlightBoardCards(step.target_cards);
        break;

      case 'submit':
        _highlightBoardCards(step.target_cards);
        // 同时高亮提交区
        var submitZone = document.getElementById('submit-zone');
        if (submitZone) {
          submitZone.classList.add('hint-blink-submit');
          _highlightCleanups.push(function() {
            submitZone.classList.remove('hint-blink-submit');
          });
        }
        break;

      case 'contradiction':
        _highlightBoardCards(step.target_cards);
        _highlightContradictionBtn();
        break;

      case 'meta':
        // 高亮推演板上的 Meta 卡
        _highlightBoardCards(step.target_cards);
        // 同时高亮对话框（提示将Meta卡拖过去）
        var dialogueScroll = document.getElementById('dialogue-scroll');
        if (dialogueScroll) {
          dialogueScroll.classList.add('hint-blink-target');
          _highlightCleanups.push(function() {
            dialogueScroll.classList.remove('hint-blink-target');
          });
        }
        break;
    }

    // NPC 台词提示
    _showNpcHint(step.npc_hint);

    // 10秒后自动熄灭高亮
    _hintAutoHideTimer = setTimeout(function() {
      _clearAllHighlights();
    }, _HINT_DURATION);
  }

  // ==================== 计时器管理 ====================

  function _resetIdleTimer() {
    if (_idleTimer) {
      clearTimeout(_idleTimer);
      _idleTimer = null;
    }
    if (!_isValidTrial(_currentTrial)) return;

    _idleTimer = setTimeout(function() {
      _triggerHint();
    }, _IDLE_TIMEOUT);
  }

  // ==================== 公开 API ====================

  /**
   * 进入新章节（Trial）：清空所有进度记录、重置计数
   * @param {string} trialId
   * @param {string} stageId
   */
  function enterTrial(trialId, stageId) {
    _clearAllHighlights();
    if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }

    _currentTrial = trialId;
    _currentStage = stageId || null;
    // 清空当前Trial所有stage的进度
    _completedSteps = {};
    _failCount = 0;

    _resetIdleTimer();
  }

  /**
   * 进入新阶段（Stage）：保留当前Trial的进度，只重置失败计数和计时器
   * @param {string} stageId
   */
  function enterStage(stageId) {
    _clearAllHighlights();
    if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }

    _currentStage = stageId;
    _failCount = 0;

    _resetIdleTimer();
  }

  /**
   * 玩家进行了有效操作（任意：提取/合成/感官重构/矛盾标记/Meta入侵）
   * 停止高亮、重置计时器
   */
  function onPlayerAction() {
    // 停止当前高亮
    _clearAllHighlights();
    // 重置闲置计时器
    _resetIdleTimer();
    // 重置失败计数
    _failCount = 0;
  }

  /**
   * 玩家操作失败（合成失败 / 感官重构失败）
   * 累计4次触发提示
   */
  function onPlayerFail() {
    if (!_isValidTrial(_currentTrial)) return;
    _failCount++;
    // 重置闲置计时器（玩家有在操作，延迟提示）
    _clearAllHighlights();
    _resetIdleTimer();

    if (_failCount >= _FAIL_THRESHOLD) {
      _failCount = 0; // 重置，避免连续重复触发
      // 立即提示（不等待闲置计时器）
      if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }
      _triggerHint();
    }
  }

  /**
   * 报告某个步骤已完成（由 game.js / board.js 调用）
   * @param {string} doneType  - 'card_extracted'|'card_on_board'|'card_submitted'|'contradiction_flagged'|'meta_used'
   * @param {string} doneValue - 关键词/卡片文本
   */
  function reportProgress(doneType, doneValue) {
    if (!_currentTrial || !_currentStage) return;
    var trialData = (typeof HINT_DATA !== 'undefined') ? HINT_DATA[_currentTrial] : null;
    if (!trialData) return;
    var stageData = trialData[_currentStage];
    if (!stageData || !stageData.hint_steps) return;

    var steps = stageData.hint_steps;
    var anyCompleted = false;

    // 扫描所有未完成步骤（而非只匹配第一个），允许玩家以任意顺序完成可完成的步骤
    // 例如：玩家先提取"手术台"（第3步的 done_when），即使第1步还未完成也应标记第3步
    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      if (_isStepDone(_currentTrial, _currentStage, step.id)) continue;
      if (step.done_when &&
          step.done_when.type === doneType &&
          step.done_when.value === doneValue) {
        _markStepDone(_currentTrial, _currentStage, step.id);
        anyCompleted = true;
        // 继续扫描剩余步骤（同一次操作可能同时完成多步）
      }
    }

    if (anyCompleted) {
      // 完成至少一步：重置闲置计时器、清除高亮、重置失败计数
      _clearAllHighlights();
      _resetIdleTimer();
      _failCount = 0;
    }
  }

  /**
   * 停止整个提示系统（进入Trial4或游戏结束时调用）
   */
  function stop() {
    _clearAllHighlights();
    if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }
    _currentTrial = null;
    _currentStage = null;
  }

  // 暴露公开接口
  return {
    enterTrial: enterTrial,
    enterStage: enterStage,
    onPlayerAction: onPlayerAction,
    onPlayerFail: onPlayerFail,
    reportProgress: reportProgress,
    stop: stop
  };

})();
