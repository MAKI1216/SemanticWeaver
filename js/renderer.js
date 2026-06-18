/**
 * 语义缝合师 - 渲染引擎模块
 * 负责所有 DOM 操作、主题切换、特效渲染、画面管理
 */
var Renderer = (function() {
  'use strict';

  // ==================== 画面切换 ====================

  /**
   * 显示指定画面，隐藏其他画面
   * @param {string} screenId - 画面 ID ('title-screen', 'game-screen', 'ending-screen')
   */
  function showScreen(screenId) {
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function(s) {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    var target = document.getElementById(screenId);
    if (target) {
      target.style.display = 'flex';
      target.classList.add('active');
    }
  }

  // ==================== 主题切换 ====================

  /**
   * 切换页面主题
   * @param {string} theme - 'clinic' 或 'interrogation'
   * @param {boolean} instant - 是否瞬间切换（无过渡动画）
   */
  function setTheme(theme, instant) {
    var body = document.body;
    body.classList.remove('theme-clinic', 'theme-interrogation');
    body.classList.add('theme-' + theme);

    if (!instant) {
      // 闪白过渡
      showFlash('white', 300);
    }
  }

  /**
   * 获取当前主题
   * @returns {string} 'clinic' 或 'interrogation'
   */
  function getTheme() {
    if (document.body.classList.contains('theme-interrogation')) {
      return 'interrogation';
    }
    return 'clinic';
  }

  // ==================== HUD 更新 ====================

  /**
   * 更新 HUD 状态栏
   * @param {Object} options
   * @param {string} options.sessionText - 左侧会话ID文本
   * @param {number} options.progress - 进度条百分比 (0-100)
   * @param {string} options.progressLabel - 进度条标签
   * @param {string} options.memText - 右侧内存显示文本
   * @param {boolean} options.isWarning - 是否为警告模式
   */
  function updateHUD(options) {
    var defaults = {
      sessionText: null,
      progress: null,
      progressLabel: null,
      memText: null,
      isWarning: null
    };
    var opts = Object.assign({}, defaults, options);

    if (opts.sessionText !== null) {
      var sessionEl = document.getElementById('hud-session');
      if (sessionEl) sessionEl.textContent = opts.sessionText;
    }
    if (opts.progress !== null) {
      var fillEl = document.getElementById('progress-fill');
      if (fillEl) fillEl.style.width = opts.progress + '%';
    }
    if (opts.progressLabel !== null) {
      var labelEl = document.getElementById('hud-progress-label');
      if (labelEl) labelEl.textContent = opts.progressLabel;
    }
    if (opts.memText !== null) {
      var memEl = document.getElementById('hud-mem');
      if (memEl) memEl.textContent = opts.memText;
    }
    if (opts.isWarning !== null) {
      var hudEl = document.getElementById('hud');
      if (hudEl) {
        if (opts.isWarning) {
          hudEl.classList.add('hud-warning');
        } else {
          hudEl.classList.remove('hud-warning');
        }
      }
    }
  }

  // ==================== NPC 肖像 ====================

  /**
   * 渲染 NPC 肖像
   * @param {string} portraitClass - NPC 肖像 CSS 类名
   */
  function renderNPCPortrait(portraitClass) {
    var inner = document.getElementById('npc-portrait-inner');
    if (!inner) return;
    inner.innerHTML = '';
    inner.className = portraitClass || '';

    // 使用 AI 生成的油画风格立绘图片
    var portraitMap = {
      'npc-courier':    'assets/img/portraits/npc_portrait_courier.png',
      'npc-housewife':  'assets/img/portraits/npc_portrait_housewife.png',
      'npc-mercenary':  'assets/img/portraits/npc_portrait_mercenary.png',
      'npc-system':     'assets/img/portraits/npc_portrait_system.png'
    };

    var imgSrc = portraitMap[portraitClass];
    if (imgSrc) {
      var img = document.createElement('img');
      img.src = imgSrc;
      img.alt = portraitClass || '';
      img.className = 'npc-portrait-img';
      img.onerror = function() {
        // 图片加载失败时回退到 CSS 艺术
        this.style.display = 'none';
        inner.classList.add('css-fallback');
      };
      inner.appendChild(img);
    }
  }

  /**
   * 设置 NPC 名称显示
   * @param {string} name - NPC 名称
   */
  function setNPCName(name) {
    var el = document.getElementById('npc-name');
    if (el) el.textContent = name || '';
  }

  // ==================== 特效 ====================

  /**
   * 显示合成成功特效
   * @param {number} x - 特效中心 X 坐标
   * @param {number} y - 特效中心 Y 坐标
   */
  function showCombineSuccess(x, y) {
    var el = document.getElementById('combine-effect');
    if (!el) return;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.display = 'block';
    el.className = 'success';

    showFlash('white', 400);
    AudioManager.playSuccess();

    setTimeout(function() {
      el.style.display = 'none';
      el.className = '';
    }, 700);
  }

  /**
   * 显示合成失败特效
   * @param {number} x - 特效中心 X 坐标
   * @param {number} y - 特效中心 Y 坐标
   */
  function showCombineFail(x, y) {
    var el = document.getElementById('combine-effect');
    if (!el) return;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.display = 'block';
    el.className = 'fail';

    showFlash('red', 300);
    AudioManager.playFail();

    setTimeout(function() {
      el.style.display = 'none';
      el.className = '';
    }, 500);
  }

  /**
   * 显示闪光覆盖层
   * @param {string} type - 'white' 或 'red'
   * @param {number} duration - 持续时间(ms)
   */
  function showFlash(type, duration) {
    var el = (type === 'red')
      ? document.getElementById('red-flash-overlay')
      : document.getElementById('flash-overlay');
    if (!el) return;

    el.style.display = 'block';
    el.className = type;

    setTimeout(function() {
      el.style.display = 'none';
      el.className = '';
    }, duration || 500);
  }

  /**
   * 显示消息提示
   * @param {string} text - 消息文本
   * @param {string} cssClass - 额外 CSS 类
   */
  function showMessage(text, cssClass) {
    var el = document.createElement('div');
    el.className = cssClass || 'game-message';
    el.textContent = text;
    document.body.appendChild(el);

    setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1600);
  }

  // ==================== Glitch 特效（Trial 4）====================

  var glitchInterval = null;

  /**
   * 启动 Glitch 故障效果
   */
  function startGlitch() {
    if (glitchInterval) return;

    // 持续的轻微故障
    document.body.classList.add('glitch-active');

    // 间歇性剧烈故障
    glitchInterval = setInterval(function() {
      var dialogueArea = document.getElementById('dialogue-area');
      var board = document.getElementById('board-cards');

      if (Math.random() < 0.3) {
        // 随机对某个区域触发剧烈故障
        var targets = [dialogueArea, board];
        var target = targets[Math.floor(Math.random() * targets.length)];
        if (target) {
          target.classList.add('glitch-burst');
          AudioManager.playGlitch();
          setTimeout(function() {
            target.classList.remove('glitch-burst');
          }, 500);
        }
      }
    }, 2000);
  }

  /**
   * 停止 Glitch 故障效果
   */
  function stopGlitch() {
    document.body.classList.remove('glitch-active');
    if (glitchInterval) {
      clearInterval(glitchInterval);
      glitchInterval = null;
    }
  }

  // ==================== Trial 过渡 ====================

  /**
   * 显示 Trial 过渡动画
   * @param {string} title - Trial 标题
   * @param {string} subtitle - Trial 副标题
   * @param {Function} callback - 过渡完成后的回调
   */
  function showTrialTransition(title, subtitle, callback) {
    var transition = document.getElementById('trial-transition');
    var titleEl = document.getElementById('trial-title');
    var subtitleEl = document.getElementById('trial-subtitle');

    if (!transition) {
      if (callback) callback();
      return;
    }

    titleEl.textContent = title || '';
    subtitleEl.textContent = subtitle || '';
    transition.style.display = 'flex';
    transition.style.animation = 'none';
    // 强制重排以重置动画
    void transition.offsetHeight;
    transition.style.animation = 'transitionFade 2.5s ease-in-out forwards';

    setTimeout(function() {
      transition.style.display = 'none';
      if (callback) callback();
    }, 2500);
  }

  // ==================== 结局画面 ====================

  /**
   * 显示结局画面
   * @param {Object} ending - 结局数据 {title, text, css_class}
   * @param {string} endingType - 'A' 或 'B'
   */
  function showEnding(ending, endingType) {
    var screen = document.getElementById('ending-screen');
    var content = document.getElementById('ending-content');
    var titleEl = document.getElementById('ending-title');
    var textEl = document.getElementById('ending-text');
    var btnRestart = document.getElementById('btn-restart');

    if (!screen) return;

    // 清理
    content.className = ending.css_class || '';
    titleEl.textContent = ending.title || '';
    textEl.textContent = '';
    btnRestart.style.display = 'none';

    showScreen('ending-screen');

    // 播放结局音效
    AudioManager.playEnding(endingType);

    // 打字机效果展示结局文字
    var text = ending.text || '';
    var index = 0;
    var typeInterval = setInterval(function() {
      if (index < text.length) {
        textEl.textContent += text[index];
        index++;
      } else {
        clearInterval(typeInterval);
        btnRestart.style.display = 'inline-block';
      }
    }, 50);
  }

  // ==================== 提交区域 ====================

  /**
   * 显示/隐藏提交区域
   * @param {boolean} visible
   */
  function showSubmitZone(visible) {
    var el = document.getElementById('submit-zone');
    if (el) el.style.display = visible ? 'flex' : 'none';
  }

  /**
   * 高亮提交区域（拖拽悬停时）
   * @param {boolean} active
   */
  function activateSubmitZone(active) {
    var el = document.getElementById('submit-zone');
    if (el) {
      if (active) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  }

  /**
   * 显示/隐藏特殊目标区域（Trial 4）
   * @param {boolean} visible
   */
  function showSpecialTarget(visible) {
    var el = document.getElementById('special-target-zone');
    if (el) el.style.display = visible ? 'flex' : 'none';
  }

  /**
   * 高亮特殊目标区域
   * @param {boolean} active
   */
  function activateSpecialTarget(active) {
    var el = document.getElementById('special-target-zone');
    if (el) {
      if (active) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  }

  // ==================== 阶段提示 ====================

  /**
   * 显示阶段提示
   * @param {string} text - 提示文本
   */
  function showHint(text) {
    var el = document.getElementById('stage-hint');
    if (!el || !text) {
      if (el) el.style.display = 'none';
      return;
    }
    el.textContent = text;
    el.style.display = 'block';
    // 5秒后自动隐藏
    setTimeout(function() {
      el.style.display = 'none';
    }, 8000);
  }

  // ==================== 对话区域滚动 ====================

  /**
   * 将对话区域滚动到底部
   */
  function scrollDialogueToBottom() {
    var el = document.getElementById('dialogue-scroll');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  // ==================== 倒计时条 ====================

  var countdownBar = null;

  /**
   * 创建/更新倒计时进度条（Trial 4）
   * @param {number} percent - 剩余百分比 (0-100)
   */
  function updateCountdownBar(percent) {
    if (!countdownBar) {
      countdownBar = document.createElement('div');
      countdownBar.className = 'countdown-bar';
      var gameScreen = document.getElementById('game-screen');
      if (gameScreen) {
        gameScreen.appendChild(countdownBar);
      }
    }
    countdownBar.style.width = Math.max(0, percent) + '%';
  }

  /**
   * 移除倒计时进度条
   */
  function removeCountdownBar() {
    if (countdownBar && countdownBar.parentNode) {
      countdownBar.parentNode.removeChild(countdownBar);
      countdownBar = null;
    }
  }

  // ==================== HUD 内存数值跳动 ====================

  var memInterval = null;

  /**
   * 启动 HUD 内存数值随机跳动效果
   */
  function startMemFlicker() {
    stopMemFlicker();
    memInterval = setInterval(function() {
      if (!GAME_DATA || !GAME_DATA.hud || !GAME_DATA.hud.mem_values) return;
      var values = GAME_DATA.hud.mem_values;
      var val = values[Math.floor(Math.random() * values.length)];
      updateHUD({ memText: val });
    }, 3000);
  }

  /**
   * 停止 HUD 内存数值跳动
   */
  function stopMemFlicker() {
    if (memInterval) {
      clearInterval(memInterval);
      memInterval = null;
    }
  }

  // 公开接口
  return {
    showScreen: showScreen,
    setTheme: setTheme,
    getTheme: getTheme,
    updateHUD: updateHUD,
    renderNPCPortrait: renderNPCPortrait,
    setNPCName: setNPCName,
    showCombineSuccess: showCombineSuccess,
    showCombineFail: showCombineFail,
    showFlash: showFlash,
    showMessage: showMessage,
    startGlitch: startGlitch,
    stopGlitch: stopGlitch,
    showTrialTransition: showTrialTransition,
    showEnding: showEnding,
    showSubmitZone: showSubmitZone,
    activateSubmitZone: activateSubmitZone,
    showSpecialTarget: showSpecialTarget,
    activateSpecialTarget: activateSpecialTarget,
    showHint: showHint,
    scrollDialogueToBottom: scrollDialogueToBottom,
    updateCountdownBar: updateCountdownBar,
    removeCountdownBar: removeCountdownBar,
    startMemFlicker: startMemFlicker,
    stopMemFlicker: stopMemFlicker
  };
})();
