/**
 * 语义缝合师 - 游戏主控模块
 * 负责游戏状态管理、流程控制、存档系统、合成引擎
 */
var Game = (function() {
  'use strict';

  // ==================== 游戏状态 ====================
  var state = {
    currentTrial: null,          // 当前 Trial ID ('trial_1' ~ 'trial_4')
    currentStage: null,          // 当前 Stage ID
    completedTrials: [],         // 已完成的 Trial 列表（向后兼容）
    theme: 'clinic',             // 当前主题
    isTrial4Active: false,       // Trial 4 是否激活
    countdownTimer: null,        // 倒计时定时器
    countdownRemaining: 0,       // 倒计时剩余秒数
    gameOver: false,             // 游戏是否结束
    // Phase 1.5: 新增存档字段
    currentPlaythrough: 1,       // 第几次游玩
    trial4Unlocked: false,       // Trial 4 是否解锁
    memoryEchoActive: false,     // 记忆残影是否激活
    totalPlaythroughs: 1,        // 总游玩次数
    endingsSeen: [],             // 已见结局列表
    // Phase B.4: 防卡关状态
    combineFailCount: 0,         // 当前 Stage 合成失败次数
    stageEnterTime: 0,           // 当前 Stage 进入时间戳
    stuckHintShown: { light: false, medium: false }  // 是否已显示提示
  };

  var SAVE_VERSION = '1.1';

  // ==================== 存档系统 ====================

  /**
   * 创建默认的单 Trial 状态
   * @param {string} status - 'locked' | 'in_progress' | 'completed'
   * @returns {Object}
   */
  function createDefaultTrialState(status) {
    return {
      status: status || 'locked',
      conclusion_type: null,     // 'false' | 'true' | null
      conclusion_id: null,
      stages_completed: [],
      hidden_keywords_found: [],
      contradictions_flagged: [],
      meta_intrusions_performed: []
    };
  }

  /**
   * 创建默认的完整存档数据结构
   * @returns {Object}
   */
  function createDefaultSaveData() {
    return {
      version: SAVE_VERSION,
      // 向后兼容字段
      currentTrial: null,
      currentStage: null,
      completedTrials: [],
      theme: 'clinic',
      // 新增字段
      current_playthrough: 1,
      trial4_unlocked: false,
      memory_echo_active: false,
      total_playthroughs: 1,
      endings_seen: [],
      playthrough_history: [],
      trials_state: {
        trial_1: createDefaultTrialState('locked'),
        trial_2: createDefaultTrialState('locked'),
        trial_3: createDefaultTrialState('locked'),
        trial_4: {
          status: 'locked',
          ending_reached: null    // 'true_ending' | 'false_ending' | null
        }
      },
      memory_echo: {
        enabled: false,
        echo_triggers: {
          trial_1: { missed_hidden_keywords: [], missed_contradictions: [], missed_meta_intrusions: [], false_conclusion_submitted: false },
          trial_2: { missed_hidden_keywords: [], missed_contradictions: [], missed_meta_intrusions: [], false_conclusion_submitted: false },
          trial_3: { missed_hidden_keywords: [], missed_contradictions: [], missed_meta_intrusions: [], false_conclusion_submitted: false }
        },
        echo_dialogues_shown: []
      }
    };
  }

  /**
   * 迁移旧版存档数据到新格式
   * @param {Object} oldData - 旧存档数据
   * @returns {Object} 迁移后的新格式数据
   */
  function migrateSaveData(oldData) {
    // 如果已经是新版本，直接返回
    if (oldData.version === SAVE_VERSION) {
      return oldData;
    }

    // 旧版存档（无 version 字段，视为 "1.0"）
    var newData = createDefaultSaveData();

    // 迁移向后兼容字段
    newData.currentTrial = oldData.currentTrial || null;
    newData.currentStage = oldData.currentStage || null;
    newData.completedTrials = oldData.completedTrials || [];
    newData.theme = oldData.theme || 'clinic';

    // 从旧数据推导 trials_state
    if (newData.currentTrial) {
      // 设置当前 Trial 为 in_progress
      if (newData.trials_state[newData.currentTrial]) {
        newData.trials_state[newData.currentTrial].status = 'in_progress';
      }
    }

    // 从 completedTrials 推导已完成 Trial 的状态
    newData.completedTrials.forEach(function(trialId) {
      if (newData.trials_state[trialId]) {
        newData.trials_state[trialId].status = 'completed';
        // 旧存档没有结论类型信息，默认为 null（未判定）
        // 后续 Phase 4 会处理结论类型
      }
    });

    // 如果当前是 Trial 4，标记为已解锁
    if (newData.currentTrial === 'trial_4') {
      newData.trial4_unlocked = true;
      newData.trials_state.trial_4.status = 'in_progress';
    }

    return newData;
  }

  /**
   * 保存游戏进度到 localStorage
   */
  function saveGame() {
    var saveData = {
      version: SAVE_VERSION,
      // 向后兼容字段
      currentTrial: state.currentTrial,
      currentStage: state.currentStage,
      completedTrials: state.completedTrials.slice(),
      theme: state.theme,
      // 新增字段
      current_playthrough: state.currentPlaythrough,
      trial4_unlocked: state.trial4Unlocked,
      memory_echo_active: state.memoryEchoActive,
      total_playthroughs: state.totalPlaythroughs,
      endings_seen: state.endingsSeen.slice(),
      playthrough_history: [],  // Phase 4+ 填充
      trials_state: {
        trial_1: createDefaultTrialState(state.completedTrials.indexOf('trial_1') >= 0 ? 'completed' : (state.currentTrial === 'trial_1' ? 'in_progress' : 'locked')),
        trial_2: createDefaultTrialState(state.completedTrials.indexOf('trial_2') >= 0 ? 'completed' : (state.currentTrial === 'trial_2' ? 'in_progress' : 'locked')),
        trial_3: createDefaultTrialState(state.completedTrials.indexOf('trial_3') >= 0 ? 'completed' : (state.currentTrial === 'trial_3' ? 'in_progress' : 'locked')),
        trial_4: {
          status: state.isTrial4Active ? 'in_progress' : (state.completedTrials.indexOf('trial_4') >= 0 ? 'completed' : 'locked'),
          ending_reached: null
        }
      },
      memory_echo: {
        enabled: state.memoryEchoActive,
        echo_triggers: {
          trial_1: { missed_hidden_keywords: [], missed_contradictions: [], missed_meta_intrusions: [], false_conclusion_submitted: false },
          trial_2: { missed_hidden_keywords: [], missed_contradictions: [], missed_meta_intrusions: [], false_conclusion_submitted: false },
          trial_3: { missed_hidden_keywords: [], missed_contradictions: [], missed_meta_intrusions: [], false_conclusion_submitted: false }
        },
        echo_dialogues_shown: []
      }
    };

    try {
      localStorage.setItem('semantic_weaver_save', JSON.stringify(saveData));
    } catch (e) {
      console.warn('存档失败:', e);
    }
  }

  /**
   * 读取游戏存档（含自动迁移）
   * @returns {Object|null} 存档数据
   */
  function loadGame() {
    try {
      var data = localStorage.getItem('semantic_weaver_save');
      if (data) {
        var parsed = JSON.parse(data);
        // 自动迁移旧版存档
        if (!parsed.version || parsed.version !== SAVE_VERSION) {
          parsed = migrateSaveData(parsed);
          // 保存迁移后的数据
          try {
            localStorage.setItem('semantic_weaver_save', JSON.stringify(parsed));
          } catch (e) {
            console.warn('迁移存档保存失败:', e);
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn('读档失败:', e);
    }
    return null;
  }

  /**
   * 检测是否存在存档
   */
  function hasSaveGame() {
    return localStorage.getItem('semantic_weaver_save') !== null;
  }

  /**
   * 删除存档
   */
  function deleteSaveGame() {
    localStorage.removeItem('semantic_weaver_save');
  }

  // ==================== 合成引擎 ====================

  /**
   * 查找合成配方（支持 A+B 和 B+A 无序匹配）
   * @param {string} textA - 卡片A文本
   * @param {string} textB - 卡片B文本
   * @returns {string|null} 合成结果，无配方返回 null
   */
  function findRecipe(textA, textB) {
    if (!state.currentTrial) return null;

    var trialData = GAME_DATA.trials[state.currentTrial];
    if (!trialData || !trialData.recipes) return null;

    var recipes = trialData.recipes;

    // 正序 A+B
    var key1 = textA + '+' + textB;
    if (recipes[key1]) return recipes[key1];

    // 反序 B+A
    var key2 = textB + '+' + textA;
    if (recipes[key2]) return recipes[key2];

    return null;
  }

  // ==================== 回调处理 ====================

  /**
   * Phase A.5: 推演板状态观察器
   * 监听推演板 DOM 变化，自动触发相关教程（T4金色卡片/T6双卡/T8失真卡）
   */
  var boardObserver = null;

  function initBoardObserver() {
    if (boardObserver) boardObserver.disconnect();

    var boardEl = document.getElementById('board-cards');
    if (!boardEl) return;

    boardObserver = new MutationObserver(function() {
      // T6: 首次有 2 张卡片上板时
      if (BoardSystem.getAllCards().length >= 2) {
        TutorialSystem.show('T6');
      }
      // T4: 首次获得金色卡片后
      var goldenCards = document.querySelectorAll('.board-card.golden');
      if (goldenCards.length > 0) {
        TutorialSystem.show('T4');
      }
      // T8: 首次产出失真卡时
      var distortedCards = document.querySelectorAll('.board-card.card-type-distorted');
      if (distortedCards.length > 0) {
        TutorialSystem.show('T8');
      }
    });
    boardObserver.observe(boardEl, { childList: true, subtree: true });
  }

  /**
   * Phase A.5: 关键词拖拽回调包装
   * 在原有拖拽逻辑基础上添加教程触发（T2首次拖出/T7 Meta关键词）
   */
  function createKeywordDragHandler() {
    return function(keywordText, e, sourceEl) {
      // 调用原有的拖拽启动
      BoardSystem.startKeywordDrag(keywordText, e, sourceEl);

      // T2: 首次拖出关键词后
      TutorialSystem.show('T2');

      // T7: 首次提取 Meta 关键词时
      if (GAME_DATA.keyword_metadata && GAME_DATA.keyword_metadata[keywordText]) {
        var meta = GAME_DATA.keyword_metadata[keywordText];
        if (meta.card_type === 'meta') {
          TutorialSystem.show('T7');
        }
      }
    };
  }

  /**
   * 合成成功回调
   */
  function onCombineSuccess(resultText, x, y) {
    var trialData = GAME_DATA.trials[state.currentTrial];
    if (trialData) {
      var stageData = trialData.stages[state.currentStage];
      if (stageData && resultText === stageData.required_submit) {
        Renderer.showMessage('最终线索已合成！请将其拖回左侧提交', 'game-message');
      }
    }
  }

  /**
   * 合成失败回调
   * Phase B.4: 防卡关提示 — 轻度（3次）+ 中度（6次）
   */
  function onCombineFail(x, y) {
    state.combineFailCount++;

    // 轻度提示：3 次失败 → NPC 暗示台词
    if (state.combineFailCount === 3 && !state.stuckHintShown.light) {
      state.stuckHintShown.light = true;
      showStuckHint('light');
    }

    // 中度提示：6 次失败 → 相关卡片发光脉动
    if (state.combineFailCount === 6 && !state.stuckHintShown.medium) {
      state.stuckHintShown.medium = true;
      showStuckHint('medium');
    }
  }

  /**
   * Phase B.4: 防卡关提示
   * @param {string} level - 'light' | 'medium'
   */
  function showStuckHint(level) {
    if (level === 'light') {
      // NPC 口吻的暗示台词
      var hints = [
        '「……也许该换个角度看看？」',
        '「有些碎片……放在一起才能看到全貌。」',
        '「医生……你不觉得有些东西应该先处理一下吗？」'
      ];
      var hint = hints[Math.floor(Math.random() * hints.length)];
      DialogueSystem.showDialogue(hint, {
        speed: 50,
        isNarration: false,
        onComplete: function() { /* 仅显示，不阻塞 */ }
      });
    } else if (level === 'medium') {
      // 让推演板上的卡片发光脉动
      var cards = BoardSystem.getAllCards();
      cards.forEach(function(card) {
        if (card.el) {
          card.el.classList.add('card-pulse-hint');
          setTimeout(function() {
            card.el && card.el.classList.remove('card-pulse-hint');
          }, 4500);
        }
      });
      Renderer.showMessage('似乎有些线索被忽略了……', 'game-message');
    }
  }

  /**
   * 提交卡片回调（含 Trial 4 特殊逻辑 + Phase B 真假结论系统）
   * @param {string} cardText - 提交的卡片文本
   * @param {boolean} isSpecialTarget - 是否提交到特殊目标（集团云端数据库）
   */
  function onSubmitCard(cardText, isSpecialTarget) {
    if (state.gameOver) return;

    var trialData = GAME_DATA.trials[state.currentTrial];
    if (!trialData) return;

    var stageData = trialData.stages[state.currentStage];
    if (!stageData) return;

    // Trial 4 安全守卫：普通提交区不接受金色卡片
    if (state.isTrial4Active && !isSpecialTarget) {
      Renderer.showMessage('需要更强大的目标……将线索拖向集团云端数据库！', 'combine-error');
      AudioManager.playFail();
      return;
    }

    // Trial 4 特殊目标处理
    if (state.isTrial4Active && isSpecialTarget) {
      if (cardText === stageData.required_submit) {
        AudioManager.playSubmit();
        triggerEndingA();
      } else {
        Renderer.showMessage('这不够强大……', 'combine-error');
        AudioManager.playFail();
      }
      return;
    }

    // === Phase B: 真假结论系统 ===
    // 最终 Stage 有 conclusions[] 时走结论判定流程
    if (stageData.is_final_stage && stageData.conclusions && stageData.conclusions.length > 0) {
      handleConclusionSubmit(cardText, stageData);
      return;
    }

    // 普通提交验证（非最终 Stage）
    if (cardText === stageData.required_submit) {
      AudioManager.playSubmit();
      Renderer.showFlash('white', 300);
      advanceStage(stageData.next_stage);
    } else {
      Renderer.showMessage('这不是正确的最终线索……', 'combine-error');
      AudioManager.playFail();
    }
  }

  // ==================== Phase B: 真假结论系统 ====================

  /**
   * 处理最终 Stage 的结论提交
   * @param {string} cardText - 提交的卡片文本
   * @param {Object} stageData - 当前 Stage 数据
   */
  function handleConclusionSubmit(cardText, stageData) {
    // 在 conclusions[] 中查找匹配的结论
    var matchedConclusion = null;
    for (var i = 0; i < stageData.conclusions.length; i++) {
      var conc = stageData.conclusions[i];
      if (conc.recipe && conc.recipe.result === cardText) {
        matchedConclusion = conc;
        break;
      }
    }

    if (!matchedConclusion) {
      // 不匹配任何结论 — 检查是否匹配 required_submit（旧逻辑兼容）
      if (cardText === stageData.required_submit) {
        AudioManager.playSubmit();
        advanceStage(stageData.next_stage);
      } else {
        Renderer.showMessage('这不是正确的最终线索……', 'combine-error');
        AudioManager.playFail();
      }
      return;
    }

    var conclusion = matchedConclusion;
    var reaction = conclusion.npc_reaction;

    // Phase 1: NPC 反应 + 音效
    AudioManager.playSubmit();

    // 真结论：CRT 异常效果
    if (conclusion.type === 'true' && reaction.crt_effect) {
      triggerCRTEffect(reaction.crt_effect.intensity);
    }

    // 显示 Phase 1 NPC 反应
    DialogueSystem.archiveCurrentDialogue();
    var phase1Text = reaction.phase_1.dialogue || '';
    var emotionClass = reaction.phase_1.emotion === 'relieved' ? 'npc-emotion-relieved'
                     : reaction.phase_1.emotion === 'unsettled' ? 'npc-emotion-unsettled'
                     : '';

    DialogueSystem.showDialogue(phase1Text, {
      speed: 40,
      isNarration: false,
      onComplete: function() {
        // Phase 2: 等待 1 秒后显示 Phase 2 反应
        setTimeout(function() {
          if (reaction.phase_2 && reaction.phase_2.dialogue) {
            DialogueSystem.archiveCurrentDialogue();
            DialogueSystem.showDialogue(reaction.phase_2.dialogue, {
              speed: 40,
              onComplete: function() {
                // 显示确认选择
                showConclusionConfirmation(conclusion, stageData);
              }
            });
          } else {
            showConclusionConfirmation(conclusion, stageData);
          }
        }, 1000);
      }
    });
  }

  /**
   * 显示结论确认选择框
   * @param {Object} conclusion - 匹配的结论对象
   * @param {Object} stageData - 当前 Stage 数据
   */
  function showConclusionConfirmation(conclusion, stageData) {
    var overlay = document.createElement('div');
    overlay.className = 'conclusion-confirm-overlay';
    overlay.innerHTML =
      '<div class="conclusion-confirm-box">' +
        '<div class="conclusion-confirm-label">' +
          (conclusion.type === 'true' ? '⚠ 提交这个结论？' : '提交这个结论？') +
        '</div>' +
        '<div class="conclusion-confirm-text">' + conclusion.label + '</div>' +
        '<div class="conclusion-confirm-buttons">' +
          '<button class="conclusion-btn conclusion-btn-confirm">确定提交</button>' +
          '<button class="conclusion-btn conclusion-btn-cancel">再想想</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // 确认提交
    overlay.querySelector('.conclusion-btn-confirm').addEventListener('click', function() {
      document.body.removeChild(overlay);
      confirmConclusion(conclusion, stageData);
    });

    // 取消（退回卡片）
    overlay.querySelector('.conclusion-btn-cancel').addEventListener('click', function() {
      document.body.removeChild(overlay);
      // 退回卡片到推演板
      BoardSystem.returnCardToBoard(conclusion.recipe.result);
      Renderer.showMessage('卡片已退回推演板。', 'game-message');
    });
  }

  /**
   * 确认提交结论
   * @param {Object} conclusion - 确认的结论对象
   * @param {Object} stageData - 当前 Stage 数据
   */
  function confirmConclusion(conclusion, stageData) {
    // 记录结论类型到存档
    try {
      var save = loadGame() || createDefaultSaveData();
      if (save.trials_state && save.trials_state[state.currentTrial]) {
        save.trials_state[state.currentTrial].conclusion_type = conclusion.type;
        save.trials_state[state.currentTrial].conclusion_id = conclusion.id;
        save.trials_state[state.currentTrial].status = 'completed';
      }
      localStorage.setItem('semantic_weaver_save', JSON.stringify(save));
    } catch (e) {
      console.warn('记录结论类型失败:', e);
    }

    // 记录到内存状态
    if (!state.conclusionTypes) state.conclusionTypes = {};
    state.conclusionTypes[state.currentTrial] = conclusion.type;

    // 显示 final_dialogue
    var finalText = conclusion.npc_reaction.final_dialogue || '';
    DialogueSystem.archiveCurrentDialogue();

    DialogueSystem.showDialogue(finalText, {
      speed: 40,
      onComplete: function() {
        // 假结论：标记后正常推进到下一关（completeTrial 会检查并触发假结局）
        // 真结论：正常推进
        setTimeout(function() {
          advanceStage(stageData.next_stage);
        }, 1500);
      }
    });
  }

  // ==================== Phase B: CRT 异常效果 ====================

  /**
   * 触发 CRT 异常效果
   * @param {string} intensity - 'subtle' | 'moderate' | 'intense'
   */
  function triggerCRTEffect(intensity) {
    var body = document.body;
    var crtClass = 'crt-anomaly-' + intensity;
    body.classList.add(crtClass);
    body.classList.add('crt-anomaly');

    // 根据强度配置效果
    var duration = 800;
    if (intensity === 'moderate') {
      duration = 1000;
      // 0.3s 静音
      AudioManager.mute && AudioManager.mute();
      setTimeout(function() { AudioManager.unmute && AudioManager.unmute(); }, 300);
    } else if (intensity === 'intense') {
      duration = 1200;
      AudioManager.mute && AudioManager.mute();
      setTimeout(function() { AudioManager.unmute && AudioManager.unmute(); }, 500);
    }

    // 闪屏效果
    var flashColor = intensity === 'subtle' ? 'white' : intensity === 'moderate' ? 'red' : 'white';
    Renderer.showFlash(flashColor, Math.min(duration, 400));

    // 播放电流杂音
    AudioManager.playWarning && AudioManager.playWarning();

    // 持续时间后移除效果
    setTimeout(function() {
      body.classList.remove(crtClass);
      body.classList.remove('crt-anomaly');
    }, duration);
  }

  /**
   * 卡片删除回调（含 Trial 4 金色卡片进垃圾桶 → 结局B）
   * @param {string} cardId
   * @param {boolean} wasGolden - 是否为金色卡片
   */
  function onCardDeleted(cardId, wasGolden) {
    if (state.isTrial4Active && wasGolden) {
      // 金色卡片被扔进垃圾桶 → 结局B
      triggerEndingB();
    }
  }

  /**
   * Phase 2.4: 矛盾标记成功回调
   * @param {string} contradictionId - 矛盾标记点 ID
   * @param {string} trialId - 所属 Trial ID
   */
  function onContradictionFlagged(contradictionId, trialId) {
    // 记录到存档（Phase 4 会完善 trials_state 结构）
    try {
      var save = loadGame() || createDefaultSaveData();
      if (save.trials_state && save.trials_state[trialId]) {
        if (!save.trials_state[trialId].contradictions_flagged) {
          save.trials_state[trialId].contradictions_flagged = [];
        }
        if (save.trials_state[trialId].contradictions_flagged.indexOf(contradictionId) < 0) {
          save.trials_state[trialId].contradictions_flagged.push(contradictionId);
        }
      }
      localStorage.setItem('semantic_weaver_save', JSON.stringify(save));
    } catch (e) {
      console.warn('记录矛盾标记失败:', e);
    }
  }

  /**
   * Phase 3: Meta 入侵回调
   * 处理两种操作类型：'check_gate'（检查门控条件）和 'performed'（入侵完成记录）
   * @param {string} action - 'check_gate' | 'performed'
   * @param {string|Object} data - gate ID（check_gate）或入侵记录（performed）
   * @returns {boolean} check_gate 时返回是否允许入侵
   */
  function onMetaIntrusion(action, data) {
    if (action === 'check_gate') {
      var gateId = data;
      // 检查该矛盾标记是否已完成
      try {
        var save = loadGame();
        if (!save) return false;
        if (save.trials_state && save.trials_state[state.currentTrial]) {
          var flagged = save.trials_state[state.currentTrial].contradictions_flagged || [];
          return flagged.indexOf(gateId) >= 0;
        }
      } catch (e) {
        console.warn('检查门控条件失败:', e);
      }
      return false;
    }

    if (action === 'performed') {
      // 记录 Meta 入侵到存档
      try {
        var save2 = loadGame() || createDefaultSaveData();
        if (save2.trials_state && save2.trials_state[data.trial]) {
          if (!save2.trials_state[data.trial].meta_intrusions_performed) {
            save2.trials_state[data.trial].meta_intrusions_performed = [];
          }
          save2.trials_state[data.trial].meta_intrusions_performed.push({
            keyword: data.keyword,
            target: data.target
          });
        }
        localStorage.setItem('semantic_weaver_save', JSON.stringify(save2));
      } catch (e) {
        console.warn('记录 Meta 入侵失败:', e);
      }
    }
  }

  // ==================== 游戏流程控制 ====================

  /**
   * 开始新游戏
   */
  function newGame() {
    AudioManager.init();
    AudioManager.resume();
    deleteSaveGame();
    state.currentTrial = null;
    state.currentStage = null;
    state.completedTrials = [];
    state.theme = 'clinic';
    state.isTrial4Active = false;
    state.gameOver = false;
    // Phase 1.5: 初始化新字段
    state.currentPlaythrough = 1;
    state.trial4Unlocked = false;
    state.memoryEchoActive = false;
    state.totalPlaythroughs = 1;
    state.endingsSeen = [];

    Renderer.showScreen('game-screen');
    Renderer.setTheme('clinic', true);
    Renderer.startMemFlicker();
    Renderer.updateHUD({
      sessionText: 'Session_ID: ' + GAME_DATA.hud.session_id,
      progress: 0,
      progressLabel: '解析进度',
      isWarning: false
    });

    DialogueSystem.clearDialogue();
    BoardSystem.clearBoard();
    BoardSystem.initSkillCards();
    BoardSystem.initGlobalListeners();
    BoardSystem.initResetButton();
    BoardSystem.initMarkContradictionButton();

    // 绑定回调
    BoardSystem.setCallbacks({
      onCombine: onCombineSuccess,
      onCombineFail: onCombineFail,
      onSubmit: onSubmitCard,
      onCardDeleted: onCardDeleted,
      onContradictionFlagged: onContradictionFlagged,
      onMetaIntrusion: onMetaIntrusion
    });

    // 绑定关键词拖拽回调（Phase A.5: 包装以添加教程触发）
    DialogueSystem.setKeywordDragCallback(createKeywordDragHandler());

    // Phase A.5: 初始化推演板状态观察器（触发 T4/T6/T8 教程）
    initBoardObserver();

    startTrial('trial_1');
  }

  /**
   * 继续游戏（从存档恢复）
   */
  function continueGame() {
    var saveData = loadGame();
    if (!saveData) {
      newGame();
      return;
    }

    AudioManager.init();
    AudioManager.resume();

    state.currentTrial = saveData.currentTrial || saveData.current_trial;
    state.currentStage = saveData.currentStage || saveData.current_stage;
    state.completedTrials = saveData.completedTrials || [];
    state.theme = saveData.theme || 'clinic';
    state.isTrial4Active = (state.currentTrial === 'trial_4');
    state.gameOver = false;
    // Phase 1.5: 读取新字段
    state.currentPlaythrough = saveData.current_playthrough || 1;
    state.trial4Unlocked = saveData.trial4_unlocked || false;
    state.memoryEchoActive = saveData.memory_echo_active || false;
    state.totalPlaythroughs = saveData.total_playthroughs || 1;
    state.endingsSeen = saveData.endings_seen || [];

    Renderer.showScreen('game-screen');
    Renderer.setTheme(state.theme, true);
    Renderer.startMemFlicker();

    DialogueSystem.clearDialogue();
    BoardSystem.clearBoard();
    BoardSystem.initSkillCards();
    BoardSystem.initGlobalListeners();
    BoardSystem.initResetButton();
    BoardSystem.initMarkContradictionButton();

    BoardSystem.setCallbacks({
      onCombine: onCombineSuccess,
      onCombineFail: onCombineFail,
      onSubmit: onSubmitCard,
      onCardDeleted: onCardDeleted,
      onContradictionFlagged: onContradictionFlagged,
      onMetaIntrusion: onMetaIntrusion
    });

    DialogueSystem.setKeywordDragCallback(createKeywordDragHandler());

    // Phase A.5: 初始化推演板状态观察器
    initBoardObserver();

    updateHUDForTrial(state.currentTrial);

    if (state.currentTrial && state.currentStage) {
      var trialData = GAME_DATA.trials[state.currentTrial];
      if (trialData) {
        Renderer.renderNPCPortrait(trialData.npc.portrait_class);
        Renderer.setNPCName(trialData.npc.name);

        if (state.isTrial4Active) {
          Renderer.showSubmitZone(false);
          Renderer.showSpecialTarget(true);
          Renderer.startGlitch();
          startCountdown();
        } else {
          Renderer.showSubmitZone(true);
        }
        runStage(state.currentTrial, state.currentStage);
      }
    } else {
      startTrial('trial_1');
    }
  }

  /**
   * 开始指定 Trial
   * Phase A.6: Trial 4 入口可使用 CutsceneSystem.play('trial4_entrance', ...) 播放 28 秒仪式过场
   * Phase B 将在此处集成 Trial 4 入口仪式的完整流程
   */
  function startTrial(trialId) {
    var trialData = GAME_DATA.trials[trialId];
    if (!trialData) return;

    state.currentTrial = trialId;
    state.isTrial4Active = (trialId === 'trial_4');

    updateHUDForTrial(trialId);

    // Phase A.6: Trial 4 入口仪式过场（Phase B 启用）
    // if (trialId === 'trial_4' && typeof CutsceneSystem !== 'undefined') {
    //   CutsceneSystem.play('trial4_entrance', function() {
    //     _startTrialInner(trialId, trialData);
    //   });
    //   return;
    // }

    _startTrialInner(trialId, trialData);
  }

  /**
   * Trial 内部启动逻辑（从 startTrial 抽取，供过场回调调用）
   */
  function _startTrialInner(trialId, trialData) {
    Renderer.showTrialTransition(trialData.title, trialData.subtitle, function() {
      Renderer.renderNPCPortrait(trialData.npc.portrait_class);
      Renderer.setNPCName(trialData.npc.name);

      // Trial 4 特殊处理：隐藏普通提交区，只显示特殊目标区
      if (state.isTrial4Active) {
        Renderer.showSubmitZone(false);
        Renderer.setTheme('interrogation', false);
        state.theme = 'interrogation';
        Renderer.showSpecialTarget(true);
        Renderer.startGlitch();
        AudioManager.playWarning();
      } else {
        Renderer.showSubmitZone(true);
      }

      DialogueSystem.clearDialogue();
      DialogueSystem.showNarration(trialData.intro, function() {
        var stageIds = Object.keys(trialData.stages);
        if (stageIds.length > 0) {
          state.currentStage = stageIds[0];
          saveGame();
          runStage(trialId, state.currentStage);
        }
      });

      if (state.isTrial4Active) {
        startCountdown();
      }
    });
  }

  /**
   * 更新 HUD
   */
  function updateHUDForTrial(trialId) {
    var trialIndex = 0;
    var trialKeys = Object.keys(GAME_DATA.trials);
    for (var i = 0; i < trialKeys.length; i++) {
      if (trialKeys[i] === trialId) { trialIndex = i; break; }
    }

    var progress = (trialIndex / trialKeys.length) * 100;
    var isWarning = (trialId === 'trial_4');
    var sessionText = isWarning
      ? GAME_DATA.hud.warning_text
      : 'Session_ID: ' + GAME_DATA.hud.session_id;
    var progressLabel = isWarning
      ? GAME_DATA.hud.countdown_label
      : '解析进度';

    Renderer.updateHUD({
      sessionText: sessionText,
      progress: progress,
      progressLabel: progressLabel,
      isWarning: isWarning
    });
  }

  /**
   * 运行指定 Stage
   */
  function runStage(trialId, stageId) {
    var trialData = GAME_DATA.trials[trialId];
    if (!trialData || !trialData.stages[stageId]) return;

    state.currentTrial = trialId;
    state.currentStage = stageId;
    // Phase B.4: 重置防卡关状态
    state.combineFailCount = 0;
    state.stageEnterTime = Date.now();
    state.stuckHintShown = { light: false, medium: false };
    if (state.stuckTimer) { clearTimeout(state.stuckTimer); state.stuckTimer = null; }
    saveGame();

    var stageData = trialData.stages[stageId];

    // 设置所需提交线索
    BoardSystem.setRequiredSubmit(stageData.required_submit);

    // Phase 3: 设置隐藏台词层
    if (stageData.hidden_layer) {
      DialogueSystem.setHiddenLayer(
        stageData.hidden_layer,
        stageData.hidden_layer_keywords || [],
        stageData.hidden_layer_gated_by || null
      );
    } else {
      DialogueSystem.clearHiddenLayer();
    }

    // 更新进度条
    var stageIds = Object.keys(trialData.stages);
    var stageIndex = stageIds.indexOf(stageId);
    var trialKeys = Object.keys(GAME_DATA.trials);
    var trialIndex = trialKeys.indexOf(trialId);
    var totalProgress = ((trialIndex + (stageIndex + 1) / stageIds.length) / trialKeys.length) * 100;
    Renderer.updateHUD({ progress: totalProgress });

    // 清空推演板上的旧卡片
    BoardSystem.clearBoard();

    // 将上一段对话归档
    DialogueSystem.archiveCurrentDialogue();

    // 显示对话
    var isSystemLog = (trialId === 'trial_4');
    DialogueSystem.showDialogue(stageData.dialogue, {
      isSystemLog: isSystemLog,
      speed: isSystemLog ? 20 : 35,
      onComplete: function() {
        if (stageData.hint) {
          Renderer.showHint(stageData.hint);
        }

        // Phase A.5: 教程触发（基于当前 Trial 和 Stage 位置）
        // T1: Trial1 第一个 Stage 首次高亮关键词出现时
        if (trialId === 'trial_1' && stageIndex === 0) {
          TutorialSystem.show('T1');
          // T3: 技能卡引导（延迟触发，避免与 T1 同时弹出）
          setTimeout(function() {
            TutorialSystem.show('T3');
          }, 1000);
        }

        // T5: Trial2 首次进入 Stage 后（属性检查引导）
        if (trialId === 'trial_2' && stageIndex === 0) {
          TutorialSystem.show('T5');
        }

        // T9: Trial1 最终 Stage 首次进入时（真假结论选择引导）
        if (trialId === 'trial_1' && !stageData.next_stage) {
          TutorialSystem.show('T9');
        }

        // Phase B.4: 2分钟停留防卡关定时器
        if (!state.stuckTimer) {
          state.stuckTimer = setTimeout(function() {
            if (!state.stuckHintShown.medium && state.currentStage === stageId) {
              state.stuckHintShown.medium = true;
              showStuckHint('medium');
            }
            state.stuckTimer = null;
          }, 120000); // 2 分钟
        }
      }
    });
  }

  /**
   * 推进到下一阶段
   */
  function advanceStage(nextStageId) {
    if (nextStageId) {
      setTimeout(function() {
        runStage(state.currentTrial, nextStageId);
      }, 800);
    } else {
      completeTrial(state.currentTrial);
    }
  }

  /**
   * 完成当前 Trial
   * Phase B: 检查三关结论类型，决定进入 Trial 4 或触发假结局
   * Phase A.6: Trial 间过渡可使用 CutsceneSystem 播放过场动画
   */
  function completeTrial(trialId) {
    state.completedTrials.push(trialId);

    var trialData = GAME_DATA.trials[trialId];
    if (!trialData) return;

    var trialKeys = Object.keys(GAME_DATA.trials);
    var currentIndex = trialKeys.indexOf(trialId);
    var nextTrialId = (currentIndex + 1 < trialKeys.length) ? trialKeys[currentIndex + 1] : null;

    // 最后一个 Trial（Trial 4）由 endings 系统处理，不走 outro 流程
    if (!nextTrialId) {
      state.gameOver = true;
      saveGame();
      return;
    }

    // === Phase B: 检查结论类型 ===
    // Trial 1/2/3 完成后检查是否应该进入假结局
    if (trialId === 'trial_1' || trialId === 'trial_2' || trialId === 'trial_3') {
      // 记录到 state.conclusionTypes
      if (!state.conclusionTypes) state.conclusionTypes = {};
      try {
        var save = loadGame();
        if (save && save.trials_state && save.trials_state[trialId]) {
          state.conclusionTypes[trialId] = save.trials_state[trialId].conclusion_type;
        }
      } catch (e) { /* 忽略 */ }
    }

    // Trial 3 完成后：检查三关结论
    if (trialId === 'trial_3') {
      var allTrue = checkAllTrueConclusions();
      if (!allTrue) {
        // 任意假结论 → 触发假结局
        DialogueSystem.archiveCurrentDialogue();
        DialogueSystem.showNarration(trialData.outro, function() {
          triggerFalseEnding();
        });
        saveGame();
        return;
      }
      // 三关全真 → 继续到 Trial 4 入口仪式
    }

    // 正常流程：显示 outro → 过场 → 下一关
    DialogueSystem.archiveCurrentDialogue();
    DialogueSystem.showNarration(trialData.outro, function() {
      stopCountdown();

      // === Phase B: Trial 3 → Trial 4 入口仪式 ===
      if (trialId === 'trial_3' && nextTrialId === 'trial_4') {
        if (typeof CutsceneSystem !== 'undefined') {
          CutsceneSystem.play('trial4_entrance', function() {
            startTrial(nextTrialId);
          });
        } else {
          startTrial(nextTrialId);
        }
        return;
      }

      // Phase A.6: Trial 间过渡过场（可跳过）
      var cutsceneId = null;
      if (trialId === 'trial_1') cutsceneId = 'trial1_to_2';
      else if (trialId === 'trial_2') cutsceneId = 'trial2_to_3';

      if (cutsceneId && typeof CutsceneSystem !== 'undefined') {
        CutsceneSystem.play(cutsceneId, function() {
          startTrial(nextTrialId);
        });
      } else {
        setTimeout(function() {
          startTrial(nextTrialId);
        }, 500);
      }
    });

    saveGame();
  }

  // ==================== Phase B: 结论检查与假结局 ====================

  /**
   * 检查 Trial 1/2/3 是否全部为真结论
   * @returns {boolean}
   */
  function checkAllTrueConclusions() {
    if (!state.conclusionTypes) return false;

    var trials = ['trial_1', 'trial_2', 'trial_3'];
    for (var i = 0; i < trials.length; i++) {
      if (state.conclusionTypes[trials[i]] !== 'true') {
        return false;
      }
    }
    return true;
  }

  /**
   * 触发假结局序列
   * Phase B.2: 黑屏 → 打字机反问句 → "算了" → 系统提示重来
   */
  function triggerFalseEnding() {
    if (state.gameOver) return;
    state.gameOver = true;
    stopCountdown();

    // 收集玩家提交了假结论的 Trial
    var falseTrials = [];
    var trialQuestions = {
      'trial_1': '铁盒里装的到底是什么？你确定那只是一只音乐盒吗？',
      'trial_2': '他到底在保护什么？你确定那是一份联络名单吗？',
      'trial_3': '那间房间里的手术台——你确定那是审讯室吗？'
    };

    ['trial_1', 'trial_2', 'trial_3'].forEach(function(tid) {
      if (state.conclusionTypes && state.conclusionTypes[tid] === 'false') {
        if (trialQuestions[tid]) {
          falseTrials.push(trialQuestions[tid]);
        }
      }
    });

    // 如果没有假结论记录（异常情况），使用全部问题
    if (falseTrials.length === 0) {
      falseTrials = [trialQuestions['trial_1'], trialQuestions['trial_2'], trialQuestions['trial_3']];
    }

    // 创建假结局遮罩
    var overlay = document.createElement('div');
    overlay.className = 'false-ending-overlay';

    // Step 1: 画面渐暗 + CRT 关闭效果
    document.body.classList.add('crt-shutdown');
    AudioManager.playWarning && AudioManager.playWarning();

    setTimeout(function() {
      document.body.classList.remove('crt-shutdown');

      // Step 2: 黑屏 2 秒
      overlay.style.background = '#000';
      overlay.style.opacity = '1';
      document.body.appendChild(overlay);

      setTimeout(function() {
        // Step 3: 打字机显示反问句
        var textContainer = document.createElement('div');
        textContainer.className = 'false-ending-text';
        overlay.appendChild(textContainer);

        var allQuestions = falseTrials.join('\n\n');
        typewriteText(textContainer, allQuestions, 60, function() {
          // Step 4: "算了。也许只是错觉吧。"
          setTimeout(function() {
            var dismissText = document.createElement('div');
            dismissText.className = 'false-ending-dismiss';
            dismissText.textContent = '算了。也许只是错觉吧。';
            overlay.appendChild(dismissText);

            setTimeout(function() {
              // Step 5: 系统提示
              var systemPrompt = document.createElement('div');
              systemPrompt.className = 'false-ending-system';
              systemPrompt.innerHTML = '是否开始新的诊疗周期？<br><br>' +
                '<button class="false-ending-btn" id="false-ending-restart">是 (Y)</button>';
              overlay.appendChild(systemPrompt);

              document.getElementById('false-ending-restart').addEventListener('click', function() {
                // 删除存档，重新加载
                deleteSaveGame();
                location.reload();
              });

              // 键盘 Y 键也可以
              function keyHandler(e) {
                if (e.key === 'y' || e.key === 'Y') {
                  document.removeEventListener('keydown', keyHandler);
                  deleteSaveGame();
                  location.reload();
                }
              }
              document.addEventListener('keydown', keyHandler);
            }, 2500);
          }, 2000);
        });
      }, 2000);
    }, 1500);
  }

  /**
   * 打字机效果显示文本
   * @param {HTMLElement} el - 目标元素
   * @param {string} text - 要显示的文本
   * @param {number} speed - 每字毫秒数
   * @param {Function} onComplete - 完成回调
   */
  function typewriteText(el, text, speed, onComplete) {
    var index = 0;
    el.textContent = '';

    function next() {
      if (index < text.length) {
        el.textContent = text.substring(0, index + 1);
        index++;
        if (index % 3 === 0) {
          AudioManager.playType && AudioManager.playType();
        }
        setTimeout(next, speed);
      } else {
        if (onComplete) onComplete();
      }
    }
    next();
  }

  // ==================== Trial 4 特殊机制 ====================

  /**
   * 启动倒计时
   */
  function startCountdown() {
    if (!GAME_DATA.trials.trial_4 || !GAME_DATA.trials.trial_4.special) return;

    var specialConfig = GAME_DATA.trials.trial_4.special;
    state.countdownRemaining = specialConfig.countdown_seconds || 180;

    stopCountdown();

    state.countdownTimer = setInterval(function() {
      if (state.gameOver) {
        stopCountdown();
        return;
      }

      state.countdownRemaining--;

      var total = specialConfig.countdown_seconds || 180;
      var percent = (state.countdownRemaining / total) * 100;
      Renderer.updateCountdownBar(percent);
      Renderer.updateHUD({ progress: 100 - percent });

      // 最后30秒倒计时音效
      if (state.countdownRemaining <= 30 && state.countdownRemaining > 0) {
        AudioManager.playCountdownTick();
      }

      // 倒计时结束 → 结局 B
      if (state.countdownRemaining <= 0) {
        stopCountdown();
        triggerEndingB();
      }
    }, 1000);
  }

  /**
   * 停止倒计时
   */
  function stopCountdown() {
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
    Renderer.removeCountdownBar();
  }

  /**
   * 触发结局 A（反抗/救赎）
   * Phase A.6: 可使用 CutsceneSystem.play('ending_true_a', ...) 播放结局过场
   * Phase B 将在此处集成完整的结局过场流程
   */
  function triggerEndingA() {
    stopCountdown();
    state.gameOver = true;
    deleteSaveGame();

    Renderer.stopGlitch();
    Renderer.showFlash('white', 1000);

    // Phase A.6 集成示例（Phase B 启用）:
    // CutsceneSystem.play('ending_true_a', function() {
    //   var endingData = GAME_DATA.trials.trial_4.endings.A;
    //   Renderer.showEnding(endingData, 'A');
    // });

    setTimeout(function() {
      var endingData = GAME_DATA.trials.trial_4.endings.A;
      Renderer.showEnding(endingData, 'A');
    }, 1200);
  }

  /**
   * 触发结局 B（懦弱/循环）
   * Phase A.6: 可使用 CutsceneSystem.play('ending_true_b', ...) 播放结局过场
   * Phase B 将在此处集成完整的结局过场流程
   */
  function triggerEndingB() {
    if (state.gameOver) return; // 防止重复触发
    state.gameOver = true;
    stopCountdown();
    deleteSaveGame();

    Renderer.stopGlitch();
    AudioManager.playWarning();

    // Phase A.6 集成示例（Phase B 启用）:
    // CutsceneSystem.play('ending_true_b', function() {
    //   var endingData = GAME_DATA.trials.trial_4.endings.B;
    //   Renderer.showEnding(endingData, 'B');
    // });

    // Glitch 剧烈闪烁后恢复诊所态
    document.body.classList.add('glitch-burst');
    setTimeout(function() {
      document.body.classList.remove('glitch-burst');
      Renderer.setTheme('clinic', true);

      setTimeout(function() {
        var endingData = GAME_DATA.trials.trial_4.endings.B;
        Renderer.showEnding(endingData, 'B');
      }, 500);
    }, 800);
  }

  // ==================== 初始化 ====================

  /**
   * 初始化游戏（绑定标题画面按钮事件）
   */
  function init() {
    var btnNew = document.getElementById('btn-new-game');
    var btnContinue = document.getElementById('btn-continue');
    var btnRestart = document.getElementById('btn-restart');

    // Phase A.5/A.6: 初始化教程系统和过场动画系统
    TutorialSystem.init();
    CutsceneSystem.init();

    // Phase A.4: 初始化开场动画系统
    IntroSystem.init();

    // 检测存档
    if (hasSaveGame()) {
      btnContinue.style.display = 'inline-block';
    }

    // 新游戏
    btnNew.addEventListener('click', function() {
      AudioManager.init();
      newGame();
    });

    // 继续游戏
    btnContinue.addEventListener('click', function() {
      AudioManager.init();
      continueGame();
    });

    // 重新开始
    btnRestart.addEventListener('click', function() {
      deleteSaveGame();
      location.reload();
    });

    // Phase A.4: 页面加载后自动播放开场动画
    // 开场动画覆盖标题画面，播放完毕后淡出显示标题画面
    IntroSystem.play(function() {
      // 开场动画结束，标题画面已可见
      // 初始化音频上下文（需要用户交互后才能播放声音，这里仅准备）
      AudioManager.init();
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 公开接口
  return {
    findRecipe: findRecipe,
    newGame: newGame,
    continueGame: continueGame,
    triggerEndingA: triggerEndingA,
    triggerEndingB: triggerEndingB
  };
})();
