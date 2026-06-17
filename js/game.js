/**
 * 语义缝合师 - 游戏主控模块
 * 负责游戏状态管理、流程控制、存档系统、合成引擎
 */
var Game = (function() {
  'use strict';

  // ==================== 游戏状态 ====================
  var state = {
    currentTrial: null,     // 当前 Trial ID ('trial_1' ~ 'trial_4')
    currentStage: null,     // 当前 Stage ID
    completedTrials: [],    // 已完成的 Trial 列表
    theme: 'clinic',        // 当前主题
    isTrial4Active: false,  // Trial 4 是否激活
    countdownTimer: null,   // 倒计时定时器
    countdownRemaining: 0,  // 倒计时剩余秒数
    gameOver: false         // 游戏是否结束
  };

  // ==================== 存档系统 ====================

  /**
   * 保存游戏进度到 localStorage
   */
  function saveGame() {
    var saveData = {
      currentTrial: state.currentTrial,
      currentStage: state.currentStage,
      completedTrials: state.completedTrials.slice(),
      theme: state.theme
    };
    try {
      localStorage.setItem('semantic_weaver_save', JSON.stringify(saveData));
    } catch (e) {
      console.warn('存档失败:', e);
    }
  }

  /**
   * 读取游戏存档
   * @returns {Object|null} 存档数据
   */
  function loadGame() {
    try {
      var data = localStorage.getItem('semantic_weaver_save');
      if (data) {
        return JSON.parse(data);
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
   */
  function onCombineFail(x, y) {
    // 提示已在 BoardSystem 中处理
  }

  /**
   * 提交卡片回调（含 Trial 4 特殊逻辑）
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

    // 普通提交验证
    if (cardText === stageData.required_submit) {
      AudioManager.playSubmit();
      Renderer.showFlash('white', 300);
      advanceStage(stageData.next_stage);
    } else {
      Renderer.showMessage('这不是正确的最终线索……', 'combine-error');
      AudioManager.playFail();
    }
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

    // 绑定回调
    BoardSystem.setCallbacks({
      onCombine: onCombineSuccess,
      onCombineFail: onCombineFail,
      onSubmit: onSubmitCard,
      onCardDeleted: onCardDeleted
    });

    // 绑定关键词拖拽回调
    DialogueSystem.setKeywordDragCallback(function(keywordText, e, sourceEl) {
      BoardSystem.startKeywordDrag(keywordText, e, sourceEl);
    });

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

    state.currentTrial = saveData.currentTrial;
    state.currentStage = saveData.currentStage;
    state.completedTrials = saveData.completedTrials || [];
    state.theme = saveData.theme || 'clinic';
    state.isTrial4Active = (saveData.currentTrial === 'trial_4');
    state.gameOver = false;

    Renderer.showScreen('game-screen');
    Renderer.setTheme(state.theme, true);
    Renderer.startMemFlicker();

    DialogueSystem.clearDialogue();
    BoardSystem.clearBoard();
    BoardSystem.initSkillCards();
    BoardSystem.initGlobalListeners();

    BoardSystem.setCallbacks({
      onCombine: onCombineSuccess,
      onCombineFail: onCombineFail,
      onSubmit: onSubmitCard,
      onCardDeleted: onCardDeleted
    });

    DialogueSystem.setKeywordDragCallback(function(keywordText, e, sourceEl) {
      BoardSystem.startKeywordDrag(keywordText, e, sourceEl);
    });

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
   */
  function startTrial(trialId) {
    var trialData = GAME_DATA.trials[trialId];
    if (!trialData) return;

    state.currentTrial = trialId;
    state.isTrial4Active = (trialId === 'trial_4');

    updateHUDForTrial(trialId);

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
    saveGame();

    var stageData = trialData.stages[stageId];

    // 设置所需提交线索
    BoardSystem.setRequiredSubmit(stageData.required_submit);

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
      // Trial 4 的结束由 triggerEndingA/B 处理，这里只是安全兜底
      // 如果到这里说明没有走 endings 路径，游戏自然结束
      saveGame();
      return;
    }

    DialogueSystem.archiveCurrentDialogue();
    DialogueSystem.showNarration(trialData.outro, function() {
      stopCountdown();
      setTimeout(function() {
        startTrial(nextTrialId);
      }, 500);
    });

    saveGame();
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
   */
  function triggerEndingA() {
    stopCountdown();
    state.gameOver = true;
    deleteSaveGame();

    Renderer.stopGlitch();
    Renderer.showFlash('white', 1000);

    setTimeout(function() {
      var endingData = GAME_DATA.trials.trial_4.endings.A;
      Renderer.showEnding(endingData, 'A');
    }, 1200);
  }

  /**
   * 触发结局 B（懦弱/循环）
   */
  function triggerEndingB() {
    if (state.gameOver) return; // 防止重复触发
    state.gameOver = true;
    stopCountdown();
    deleteSaveGame();

    Renderer.stopGlitch();
    AudioManager.playWarning();

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
