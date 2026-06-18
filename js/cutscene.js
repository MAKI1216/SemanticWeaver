/**
 * 语义缝合师 - 过场动画框架模块
 * 负责游戏中的过场动画编排：Trial 间过渡、假结局、Trial 4 入口仪式、结局画面
 * 使用 async/await 编排步骤，支持跳过（可配置）
 */
var CutsceneSystem = (function() {
  'use strict';

  // ==================== 内部状态 ====================

  var overlayEl = null;        // 全屏遮罩层
  var textLayerEl = null;      // 文字层
  var skipBtnEl = null;        // 跳过按钮
  var initialized = false;     // 是否已初始化
  var isPlaying = false;       // 是否正在播放过场
  var currentCutsceneId = null;// 当前播放的过场 ID
  var skipRequested = false;   // 是否请求跳过
  var currentSkippable = false;// 当前过场是否可跳过
  var activeTimers = [];       // 当前活动的定时器（用于跳过时清理）
  var onCompleteCallback = null; // 完成回调

  // ==================== 原子操作函数 ====================

  /**
   * 等待指定毫秒数（可被跳过打断）
   * @param {number} ms - 等待毫秒
   * @returns {Promise}
   */
  function wait(ms) {
    return new Promise(function(resolve) {
      if (skipRequested) {
        resolve();
        return;
      }
      var timer = setTimeout(function() {
        // 从活动定时器列表中移除
        var idx = activeTimers.indexOf(timer);
        if (idx >= 0) activeTimers.splice(idx, 1);
        resolve();
      }, ms);
      activeTimers.push(timer);
    });
  }

  /**
   * 显示文字（支持打字机效果）
   * @param {string} text - 要显示的文字
   * @param {Object} options - 选项
   *   @param {number} options.speed - 打字速度（毫秒/字），默认 50
   *   @param {string} options.position - 位置 'center'|'top'|'bottom'，默认 'center'
   *   @param {string} options.color - 文字颜色，默认继承
   *   @param {string} options.className - 额外 CSS 类
   *   @param {boolean} options.typewriter - 是否启用打字机效果，默认 true
   *   @param {number} options.fontSize - 字号(px)
   *   @param {boolean} options.waitForClick - 是否等待点击才继续（不自动消失）
   * @returns {Promise} 文字显示完成（打字结束）后 resolve
   */
  function showText(text, options) {
    return new Promise(function(resolve) {
      var opts = options || {};
      var speed = opts.speed || 50;
      var position = opts.position || 'center';
      var typewriter = opts.typewriter !== false; // 默认 true

      // 创建文字元素
      var el = document.createElement('div');
      el.className = 'cutscene-text cutscene-text-' + position;
      if (opts.className) el.classList.add(opts.className);
      if (opts.color) el.style.color = opts.color;
      if (opts.fontSize) el.style.fontSize = opts.fontSize + 'px';

      textLayerEl.appendChild(el);

      // 淡入
      requestAnimationFrame(function() {
        el.classList.add('cutscene-text-visible');
      });

      if (!typewriter || skipRequested) {
        // 直接显示全部文字
        el.textContent = text;
        resolve(el);
        return;
      }

      // 打字机效果
      var index = 0;
      var typeTimer = null;

      function typeNext() {
        if (skipRequested) {
          // 跳过：显示全部文字
          el.textContent = text;
          resolve(el);
          return;
        }

        if (index < text.length) {
          el.textContent = text.substring(0, index + 1);
          index++;

          // 播放打字音效（每3个字符一次）
          if (index % 3 === 0 && typeof AudioManager !== 'undefined' && AudioManager.playType) {
            AudioManager.playType();
          }

          typeTimer = setTimeout(typeNext, speed);
          activeTimers.push(typeTimer);
          // 清理已执行的定时器引用
          if (activeTimers.length > 50) {
            activeTimers = activeTimers.filter(function(t) {
              return t !== typeTimer;
            });
            activeTimers.push(typeTimer);
          }
        } else {
          resolve(el);
        }
      }

      typeNext();
    });
  }

  /**
   * 隐藏指定文字元素（淡出后移除）
   * @param {HTMLElement} el - 文字元素（showText 返回的）
   * @returns {Promise}
   */
  function hideText(el) {
    return new Promise(function(resolve) {
      if (!el) {
        resolve();
        return;
      }
      el.classList.remove('cutscene-text-visible');
      el.classList.add('cutscene-text-hiding');
      setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
        resolve();
      }, skipRequested ? 0 : 400);
    });
  }

  /**
   * 清除所有文字
   * @returns {Promise}
   */
  function clearText() {
    return new Promise(function(resolve) {
      if (!textLayerEl) {
        resolve();
        return;
      }
      var texts = textLayerEl.querySelectorAll('.cutscene-text');
      texts.forEach(function(el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      resolve();
    });
  }

  /**
   * 显示全屏遮罩
   * @param {string} color - 遮罩颜色（CSS 颜色值），默认 '#000000'
   * @param {number} opacity - 不透明度 (0-1)，默认 1
   * @param {number} fadeMs - 淡入毫秒，0 为瞬间，默认 0
   * @returns {Promise}
   */
  function showOverlay(color, opacity, fadeMs) {
    return new Promise(function(resolve) {
      if (!overlayEl) {
        resolve();
        return;
      }
      overlayEl.style.background = color || '#000000';
      overlayEl.style.opacity = '0';
      overlayEl.style.display = 'flex';
      overlayEl.style.pointerEvents = 'auto';

      // 强制重排
      void overlayEl.offsetHeight;

      var targetOpacity = (opacity !== undefined) ? opacity : 1;
      var duration = fadeMs || 0;

      if (duration === 0 || skipRequested) {
        overlayEl.style.opacity = targetOpacity;
        overlayEl.style.transition = '';
        resolve();
        return;
      }

      overlayEl.style.transition = 'opacity ' + duration + 'ms ease-in-out';
      requestAnimationFrame(function() {
        overlayEl.style.opacity = targetOpacity;
      });

      var timer = setTimeout(function() {
        resolve();
      }, duration);
      activeTimers.push(timer);
    });
  }

  /**
   * 隐藏全屏遮罩
   * @param {number} fadeMs - 淡出毫秒，0 为瞬间，默认 0
   * @returns {Promise}
   */
  function hideOverlay(fadeMs) {
    return new Promise(function(resolve) {
      if (!overlayEl) {
        resolve();
        return;
      }
      var duration = fadeMs || 0;

      if (duration === 0 || skipRequested) {
        overlayEl.style.opacity = '0';
        overlayEl.style.display = 'none';
        overlayEl.style.pointerEvents = 'none';
        resolve();
        return;
      }

      overlayEl.style.transition = 'opacity ' + duration + 'ms ease-in-out';
      overlayEl.style.opacity = '0';

      var timer = setTimeout(function() {
        overlayEl.style.display = 'none';
        overlayEl.style.pointerEvents = 'none';
        resolve();
      }, duration);
      activeTimers.push(timer);
    });
  }

  /**
   * 播放音效
   * @param {string} soundId - 音效 ID，映射到 AudioManager 方法
   */
  function playSound(soundId) {
    if (typeof AudioManager === 'undefined') return;

    var soundMap = {
      'success': 'playSuccess',
      'fail': 'playFail',
      'glitch': 'playGlitch',
      'warning': 'playWarning',
      'drop': 'playDrop',
      'submit': 'playSubmit',
      'ending_a': function() { AudioManager.playEnding('A'); },
      'ending_b': function() { AudioManager.playEnding('B'); },
      'type': 'playType'
    };

    var target = soundMap[soundId];
    if (!target) return;

    if (typeof target === 'function') {
      target();
    } else if (typeof AudioManager[target] === 'function') {
      AudioManager[target]();
    }
  }

  /**
   * 切换主题
   * @param {string} themeName - 主题名称 ('clinic' | 'interrogation')
   * @param {boolean} instant - 是否瞬间切换
   */
  function setTheme(themeName, instant) {
    if (typeof Renderer !== 'undefined' && Renderer.setTheme) {
      Renderer.setTheme(themeName, instant);
    }
  }

  /**
   * CRT 故障效果
   * @param {number} intensity - 强度 (0-1)
   * @param {number} duration - 持续毫秒
   * @returns {Promise}
   */
  function glitchEffect(intensity, duration) {
    return new Promise(function(resolve) {
      // 在 body 上添加临时 glitch 类
      document.body.classList.add('cutscene-glitch');

      // 播放故障音效
      playSound('glitch');

      // 随机抖动
      var glitchCount = Math.floor((intensity || 0.5) * 5) + 2;
      var elapsed = 0;
      var interval = (duration || 500) / glitchCount;

      function doGlitch() {
        if (elapsed >= (duration || 500) || skipRequested) {
          document.body.classList.remove('cutscene-glitch');
          resolve();
          return;
        }
        elapsed += interval;
        var timer = setTimeout(doGlitch, interval);
        activeTimers.push(timer);
      }

      doGlitch();
    });
  }

  /**
   * 显示白色闪光
   * @param {number} duration - 持续毫秒
   * @returns {Promise}
   */
  function whiteFlash(duration) {
    return new Promise(function(resolve) {
      if (typeof Renderer !== 'undefined' && Renderer.showFlash) {
        Renderer.showFlash('white', duration || 500);
      }
      var timer = setTimeout(resolve, duration || 500);
      activeTimers.push(timer);
    });
  }

  /**
   * 显示红色闪光
   * @param {number} duration - 持续毫秒
   * @returns {Promise}
   */
  function redFlash(duration) {
    return new Promise(function(resolve) {
      if (typeof Renderer !== 'undefined' && Renderer.showFlash) {
        Renderer.showFlash('red', duration || 500);
      }
      var timer = setTimeout(resolve, duration || 500);
      activeTimers.push(timer);
    });
  }

  /**
   * 启动 CRT 扫描线抖动效果（持续型）
   * @param {number} duration - 持续毫秒
   * @returns {Promise}
   */
  function crtShake(duration) {
    return new Promise(function(resolve) {
      var crtOverlay = document.getElementById('crt-overlay');
      if (crtOverlay) {
        crtOverlay.classList.add('crt-shake');
      }

      var timer = setTimeout(function() {
        if (crtOverlay) crtOverlay.classList.remove('crt-shake');
        resolve();
      }, duration || 1000);
      activeTimers.push(timer);
    });
  }

  // ==================== 过场定义 ====================

  /**
   * 过场 API 对象，传递给每个过场的 run 函数
   * 包含所有原子操作
   */
  function createApi() {
    return {
      wait: wait,
      showText: showText,
      hideText: hideText,
      clearText: clearText,
      showOverlay: showOverlay,
      hideOverlay: hideOverlay,
      playSound: playSound,
      setTheme: setTheme,
      glitchEffect: glitchEffect,
      whiteFlash: whiteFlash,
      redFlash: redFlash,
      crtShake: crtShake
    };
  }

  /**
   * 过场定义表
   * 每个过场包含：
   *   - skippable: 是否可跳过
   *   - run: async 函数，接收 api 对象，使用原子操作编排过场序列
   */
  var CUTSCENES = {
    /**
     * Trial 1 → Trial 2 过渡（~5s）
     * 档案翻页动画 + 新 NPC 简介文字
     */
    'trial1_to_2': {
      skippable: true,
      run: async function(api) {
        await api.showOverlay('#1a1410', 0.97, 600);
        await api.wait(300);

        // 档案翻页效果
        var t1 = await api.showText('—— 档案归档 ——', {
          position: 'center', speed: 40, className: 'cutscene-text-meta'
        });
        await api.wait(1000);
        await api.hideText(t1);

        await api.wait(300);

        // 新 NPC 简介
        var t2 = await api.showText('第二位病人', {
          position: 'center', speed: 60, fontSize: 28,
          className: 'cutscene-text-title'
        });
        await api.wait(1500);
        await api.hideText(t2);

        var t3 = await api.showText('焦虑的主妇 · 记忆中的裂缝', {
          position: 'center', speed: 50,
          className: 'cutscene-text-subtitle'
        });
        await api.wait(1500);
        await api.hideText(t3);

        await api.hideOverlay(600);
      }
    },

    /**
     * Trial 2 → Trial 3 过渡（~5s）
     * 同 trial1_to_2 结构，不同文案
     */
    'trial2_to_3': {
      skippable: true,
      run: async function(api) {
        await api.showOverlay('#1a1410', 0.97, 600);
        await api.wait(300);

        var t1 = await api.showText('—— 档案归档 ——', {
          position: 'center', speed: 40, className: 'cutscene-text-meta'
        });
        await api.wait(1000);
        await api.hideText(t1);

        await api.wait(300);

        var t2 = await api.showText('第三位病人', {
          position: 'center', speed: 60, fontSize: 28,
          className: 'cutscene-text-title'
        });
        await api.wait(1500);
        await api.hideText(t2);

        var t3 = await api.showText('PTSD 雇佣兵 · 被抹去的任务', {
          position: 'center', speed: 50,
          className: 'cutscene-text-subtitle'
        });
        await api.wait(1500);
        await api.hideText(t3);

        await api.hideOverlay(600);
      }
    },

    /**
     * 假结局过场（~15s）
     * 黑屏 + 白色打字机反问句 + "算了。也许只是错觉吧。" + 系统提示
     * 不可跳过
     */
    'false_ending': {
      skippable: false,
      run: async function(api) {
        // 渐变到黑屏
        await api.showOverlay('#000000', 1, 1000);
        await api.wait(2000);

        // 白色打字机反问句
        var t1 = await api.showText('你确定……你看到了全部吗？', {
          position: 'center', speed: 80, color: '#cccccc',
          fontSize: 22, className: 'cutscene-text-question'
        });
        await api.wait(2000);
        await api.hideText(t1);

        await api.wait(500);

        // "算了。也许只是错觉吧。"
        var t2 = await api.showText('算了。也许只是错觉吧。', {
          position: 'center', speed: 70, color: '#888888',
          fontSize: 18
        });
        await api.wait(2000);
        await api.hideText(t2);

        await api.wait(1000);

        // 系统提示（绿色等宽字体）
        var t3 = await api.showText('> 是否开始新的诊疗周期？ [Y/N]', {
          position: 'center', speed: 30, color: '#00ff66',
          fontSize: 16, className: 'cutscene-text-system',
          typewriter: false
        });
        await api.wait(3000);
        await api.hideText(t3);

        await api.hideOverlay(1000);
      }
    },

    /**
     * Trial 4 入口仪式（~28s）
     * 8 步过场：NPC沉默→剪影闪现→径向暗化→CRT关闭→纯黑→台词→白噪音→换皮
     * 不可跳过
     */
    'trial4_entrance': {
      skippable: false,
      run: async function(api) {
        // === Step 1-3: NPC 沉默 + 剪影闪现（~8s）===

        // 渐暗
        await api.showOverlay('#000000', 0.8, 1500);
        await api.wait(500);

        // 剪影闪现（三次 glitch 闪烁）
        await api.glitchEffect(0.6, 400);
        await api.wait(300);
        await api.glitchEffect(0.8, 400);
        await api.wait(300);
        await api.glitchEffect(1.0, 500);
        await api.wait(500);

        // NPC 沉默文字
        var t1 = await api.showText('……', {
          position: 'center', speed: 200, color: '#666666',
          fontSize: 32
        });
        await api.wait(2000);
        await api.hideText(t1);

        // === Step 4-5: 径向暗化 + CRT 关闭 + 纯黑静默（~8s）===

        // 径向暗化（完全黑屏）
        await api.showOverlay('#000000', 1, 1000);
        await api.wait(500);

        // CRT 关闭效果（白色横线收缩）
        var crtClose = await api.showText('', {
          position: 'center', typewriter: false,
          className: 'cutscene-crt-close'
        });
        await api.wait(1500);
        await api.hideText(crtClose);

        // 3 秒纯黑静默
        await api.wait(3000);

        // === Step 6: "手术刀，你的休假结束了。"（打字机，~4s）===

        var t2 = await api.showText('手术刀，你的休假结束了。', {
          position: 'center', speed: 90, color: '#cc3333',
          fontSize: 24, className: 'cutscene-text-system'
        });
        await api.wait(2000);
        await api.hideText(t2);

        await api.wait(500);

        // === Step 7: 白噪音静电 1s ===

        await api.glitchEffect(1.0, 1000);
        await api.wait(200);

        // === Step 8: 换皮 + Trial 4 开始 ===

        // 切换到审讯主题（瞬间，无闪光过渡）
        api.setTheme('interrogation', true);

        await api.wait(500);

        // 红色警告闪光
        await api.redFlash(500);

        await api.wait(500);

        // 系统启动文字
        var t3 = await api.showText('> 系统重连成功', {
          position: 'center', speed: 30, color: '#ff4444',
          fontSize: 16, className: 'cutscene-text-system',
          typewriter: false
        });
        await api.wait(1500);
        await api.hideText(t3);

        await api.hideOverlay(800);
      }
    },

    /**
     * 真结局 A - 燃烧救赎（~10s）
     * 不可跳过
     */
    'ending_true_a': {
      skippable: false,
      run: async function(api) {
        // 白色闪光
        await api.whiteFlash(800);
        await api.wait(300);

        await api.showOverlay('#1a1000', 0.95, 800);
        await api.wait(500);

        var t1 = await api.showText('火焰吞噬了一切碎片……', {
          position: 'center', speed: 60, color: '#ffaa44',
          fontSize: 22
        });
        await api.wait(2000);
        await api.hideText(t1);

        var t2 = await api.showText('但你看到了真相。', {
          position: 'center', speed: 60, color: '#ffd700',
          fontSize: 24, className: 'cutscene-text-title'
        });
        await api.wait(2500);
        await api.hideText(t2);

        await api.whiteFlash(600);
        await api.hideOverlay(1000);
      }
    },

    /**
     * 真结局 B - 温柔牢笼（~10s）
     * 不可跳过
     */
    'ending_true_b': {
      skippable: false,
      run: async function(api) {
        await api.showOverlay('#000814', 0.97, 1000);
        await api.wait(500);

        var t1 = await api.showText('你选择了安全。', {
          position: 'center', speed: 70, color: '#4488aa',
          fontSize: 22
        });
        await api.wait(2000);
        await api.hideText(t1);

        var t2 = await api.showText('但牢笼也是温柔的。', {
          position: 'center', speed: 70, color: '#66aacc',
          fontSize: 22, className: 'cutscene-text-title'
        });
        await api.wait(2500);
        await api.hideText(t2);

        await api.wait(500);

        // 温暖的渐暗
        await api.showOverlay('#0a0a14', 1, 1500);
        await api.wait(1000);
        await api.hideOverlay(800);
      }
    }
  };

  // ==================== 播放控制 ====================

  /**
   * 播放指定过场
   * @param {string} cutsceneId - 过场 ID
   * @param {Function} onComplete - 过场完成后的回调
   */
  async function play(cutsceneId, onComplete) {
    var cutscene = CUTSCENES[cutsceneId];
    if (!cutscene) {
      console.warn('过场系统: 未知过场 ID', cutsceneId);
      if (onComplete) onComplete();
      return;
    }

    // 如果有过场正在播放，先强制结束
    if (isPlaying) {
      _forceEnd();
    }

    isPlaying = true;
    currentCutsceneId = cutsceneId;
    skipRequested = false;
    currentSkippable = cutscene.skippable || false;
    onCompleteCallback = onComplete;
    activeTimers = [];

    // 显示跳过按钮（仅可跳过的过场）
    if (currentSkippable && skipBtnEl) {
      skipBtnEl.style.display = 'block';
    } else if (skipBtnEl) {
      skipBtnEl.style.display = 'none';
    }

    var api = createApi();

    try {
      await cutscene.run(api);
    } catch (e) {
      console.warn('过场系统: 播放异常', cutsceneId, e);
    }

    // 清理
    _cleanup();

    if (onCompleteCallback) {
      var cb = onCompleteCallback;
      onCompleteCallback = null;
      cb();
    }
  }

  /**
   * 跳过当前过场（仅可跳过的过场有效）
   */
  function skip() {
    if (!isPlaying || !currentSkippable) return;

    skipRequested = true;

    // 清理所有活动的定时器
    activeTimers.forEach(function(timer) {
      clearTimeout(timer);
    });
    activeTimers = [];
  }

  /**
   * 强制结束当前过场（内部用）
   */
  function _forceEnd() {
    skipRequested = true;
    activeTimers.forEach(function(timer) {
      clearTimeout(timer);
    });
    activeTimers = [];
    _cleanup();
  }

  /**
   * 清理过场状态
   */
  function _cleanup() {
    // 清理所有定时器
    activeTimers.forEach(function(timer) {
      clearTimeout(timer);
    });
    activeTimers = [];

    // 清除文字
    if (textLayerEl) {
      var texts = textLayerEl.querySelectorAll('.cutscene-text');
      texts.forEach(function(el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }

    // 清除 body 上的临时类
    document.body.classList.remove('cutscene-glitch');
    var crtOverlay = document.getElementById('crt-overlay');
    if (crtOverlay) crtOverlay.classList.remove('crt-shake');

    // 隐藏遮罩
    if (overlayEl) {
      overlayEl.style.display = 'none';
      overlayEl.style.opacity = '0';
      overlayEl.style.pointerEvents = 'none';
      overlayEl.style.transition = '';
    }

    // 隐藏跳过按钮
    if (skipBtnEl) {
      skipBtnEl.style.display = 'none';
    }

    isPlaying = false;
    currentCutsceneId = null;
    skipRequested = false;
  }

  // ==================== DOM 初始化 ====================

  /**
   * 初始化过场系统，创建 DOM 元素
   */
  function init() {
    if (initialized) return;
    initialized = true;

    // 创建全屏遮罩层
    overlayEl = document.createElement('div');
    overlayEl.className = 'cutscene-overlay';
    overlayEl.style.display = 'none';
    overlayEl.style.opacity = '0';
    overlayEl.style.pointerEvents = 'none';

    // 文字层（用于显示过场文字）
    textLayerEl = document.createElement('div');
    textLayerEl.className = 'cutscene-text-layer';

    // 跳过按钮
    skipBtnEl = document.createElement('button');
    skipBtnEl.className = 'cutscene-skip-btn';
    skipBtnEl.textContent = '跳过 >>';
    skipBtnEl.style.display = 'none';

    // 组装 DOM
    overlayEl.appendChild(textLayerEl);
    overlayEl.appendChild(skipBtnEl);
    document.body.appendChild(overlayEl);

    // 绑定跳过按钮事件
    skipBtnEl.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      skip();
    });

    // 阻止遮罩层点击穿透
    overlayEl.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  // ==================== 公开接口 ====================

  return {
    init: init,
    play: play,
    skip: skip
  };
})();
