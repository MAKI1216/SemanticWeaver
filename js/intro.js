/**
 * 语义缝合师 - 开场动画系统模块
 * 负责游戏开场序列：黑屏雨声 → 雨夜街道 → 诊所内部 → CRT启动 → 标题显现
 * 使用 CSS 动画 + JS 序列控制，支持跳过
 * 美术素材就绪后可替换 CSS 占位效果为真实图片
 */
var IntroSystem = (function() {
  'use strict';

  // ==================== 内部状态 ====================

  var overlayEl = null;        // 全屏遮罩层
  var sceneEl = null;          // 场景容器
  var skipBtnEl = null;        // 跳过按钮
  var initialized = false;     // 是否已初始化
  var isPlaying = false;       // 是否正在播放
  var skipRequested = false;   // 是否请求跳过
  var activeTimers = [];       // 活动定时器
  var rainAudioNode = null;    // 雨声音频节点
  var audioCtx = null;         // 音频上下文（独立于 AudioManager，避免初始化顺序问题）
  var onCompleteCallback = null;

  // ==================== 工具函数 ====================

  /**
   * 等待指定毫秒（可被跳过打断）
   */
  function wait(ms) {
    return new Promise(function(resolve) {
      if (skipRequested) { resolve(); return; }
      var timer = setTimeout(function() {
        var idx = activeTimers.indexOf(timer);
        if (idx >= 0) activeTimers.splice(idx, 1);
        resolve();
      }, ms);
      activeTimers.push(timer);
    });
  }

  /**
   * 清除所有定时器
   */
  function clearAllTimers() {
    activeTimers.forEach(function(t) { clearTimeout(t); });
    activeTimers = [];
  }

  // ==================== 雨声合成（Web Audio API） ====================

  /**
   * 创建雨声音效（过滤白噪音模拟雨声）
   */
  function startRainSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();

      // 白噪音缓冲
      var bufferSize = audioCtx.sampleRate * 2;
      var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      var source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // 低通滤波器模拟雨声（过滤高频）
      var filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.5;

      // 高通滤波去除极低频
      var filter2 = audioCtx.createBiquadFilter();
      filter2.type = 'highpass';
      filter2.frequency.value = 200;

      var gain = audioCtx.createGain();
      gain.gain.value = 0; // 从静音开始渐入

      source.connect(filter);
      filter.connect(filter2);
      filter2.connect(gain);
      gain.connect(audioCtx.destination);

      source.start();
      rainAudioNode = { source: source, gain: gain };

      // 渐入
      gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 2);
    } catch (e) {
      console.warn('开场动画: 雨声合成失败', e);
    }
  }

  /**
   * 停止雨声
   */
  function stopRainSound() {
    if (rainAudioNode && audioCtx) {
      try {
        rainAudioNode.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        rainAudioNode.source.stop(audioCtx.currentTime + 0.6);
      } catch (e) { /* 忽略 */ }
      rainAudioNode = null;
    }
  }

  /**
   * 播放打字音效
   */
  function playTypeSound() {
    if (typeof AudioManager !== 'undefined' && AudioManager.playType) {
      AudioManager.playType();
    }
  }

  // ==================== 场景元素创建 ====================

  /**
   * 创建雨夜街道场景（CSS 占位，可替换为图片）
   */
  function createStreetScene() {
    var scene = document.createElement('div');
    scene.className = 'intro-scene intro-scene-street';

    // AI 生成漫画帧作为背景层
    var bgImg = document.createElement('img');
    bgImg.className = 'intro-scene-bg-img';
    bgImg.src = 'assets/img/comic/frame_1.png';
    bgImg.alt = '';
    bgImg.onerror = function() { this.style.display = 'none'; };
    scene.appendChild(bgImg);

    // 雨效果叠加
    var rain = document.createElement('div');
    rain.className = 'intro-rain';
    for (var i = 0; i < 60; i++) {
      var drop = document.createElement('div');
      drop.className = 'intro-raindrop';
      drop.style.left = Math.random() * 100 + '%';
      drop.style.animationDelay = Math.random() * 2 + 's';
      drop.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
      rain.appendChild(drop);
    }
    scene.appendChild(rain);

    // 霓虹灯招牌
    var sign = document.createElement('div');
    sign.className = 'intro-neon-sign';
    sign.innerHTML = '<span class="intro-neon-text">语义缝合诊所</span>';
    scene.appendChild(sign);

    // 模糊人影
    var figure = document.createElement('div');
    figure.className = 'intro-figure';
    scene.appendChild(figure);

    return scene;
  }

  /**
   * 创建诊所内部场景
   */
  function createClinicScene() {
    var scene = document.createElement('div');
    scene.className = 'intro-scene intro-scene-clinic';

    // AI 生成漫画帧作为背景层
    var bgImg = document.createElement('img');
    bgImg.className = 'intro-scene-bg-img';
    bgImg.src = 'assets/img/comic/frame_3.png';
    bgImg.alt = '';
    bgImg.onerror = function() { this.style.display = 'none'; };
    scene.appendChild(bgImg);

    // 暖黄台灯光晕
    var lamp = document.createElement('div');
    lamp.className = 'intro-lamp-glow';
    scene.appendChild(lamp);

    // 桌面（暗示）
    var desk = document.createElement('div');
    desk.className = 'intro-desk';
    scene.appendChild(desk);

    // 档案文件
    var file = document.createElement('div');
    file.className = 'intro-file';
    file.innerHTML = '<div class="intro-file-label">档案</div>';
    scene.appendChild(file);

    return scene;
  }

  /**
   * 创建 CRT 启动场景
   */
  function createCRTScene() {
    var scene = document.createElement('div');
    scene.className = 'intro-scene intro-scene-crt';

    // 扫描线
    var scanlines = document.createElement('div');
    scanlines.className = 'intro-crt-scanlines';
    scene.appendChild(scanlines);

    // CRT 扭曲效果
    var distortion = document.createElement('div');
    distortion.className = 'intro-crt-distortion';
    scene.appendChild(distortion);

    return scene;
  }

  /**
   * 创建文字元素（带打字机效果）
   */
  function createTextElement(text, className) {
    var el = document.createElement('div');
    el.className = 'intro-text ' + (className || '');
    el.textContent = '';
    return el;
  }

  /**
   * 逐字显示文字（打字机效果）
   */
  function typewrite(el, text, speed) {
    return new Promise(function(resolve) {
      var index = 0;
      speed = speed || 50;

      function next() {
        if (skipRequested) {
          el.textContent = text;
          resolve();
          return;
        }
        if (index < text.length) {
          el.textContent = text.substring(0, index + 1);
          index++;
          if (index % 2 === 0) playTypeSound();
          var timer = setTimeout(next, speed);
          activeTimers.push(timer);
        } else {
          resolve();
        }
      }
      next();
    });
  }

  // ==================== 开场序列 ====================

  /**
   * 播放开场动画
   * @param {Function} onComplete - 完成回调
   */
  async function play(onComplete) {
    if (isPlaying) return;
    isPlaying = true;
    skipRequested = false;
    onCompleteCallback = onComplete;
    activeTimers = [];

    // 显示遮罩
    overlayEl.style.display = 'flex';
    overlayEl.style.opacity = '1';
    skipBtnEl.style.display = 'block';

    try {
      // === Step 1 [0-3s]: 黑屏 → 雨声渐入 ===
      sceneEl.innerHTML = '';
      sceneEl.style.background = '#000000';
      startRainSound();
      await wait(2500);

      // === Step 2 [3-8s]: 雨夜街道场景 ===
      if (skipRequested) gotoEnd();

      var streetScene = createStreetScene();
      streetScene.style.opacity = '0';
      sceneEl.innerHTML = '';
      sceneEl.style.background = '#0a0a12';
      sceneEl.appendChild(streetScene);

      // 淡入街道
      requestAnimationFrame(function() {
        streetScene.style.transition = 'opacity 1.5s ease-in';
        streetScene.style.opacity = '1';
      });
      await wait(2000);

      // 霓虹灯闪烁
      var neonSign = streetScene.querySelector('.intro-neon-sign');
      if (neonSign) neonSign.classList.add('intro-neon-flicker');
      await wait(1500);

      // 人影走向门口
      var figure = streetScene.querySelector('.intro-figure');
      if (figure) figure.classList.add('intro-figure-walking');
      await wait(1500);

      // === Step 3 [8-12s]: 诊所内部 POV ===
      if (skipRequested) gotoEnd();

      // 雨声渐弱
      if (rainAudioNode && audioCtx) {
        rainAudioNode.gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 1);
      }

      var clinicScene = createClinicScene();
      clinicScene.style.opacity = '0';
      sceneEl.innerHTML = '';
      sceneEl.style.background = '#1a1410';
      sceneEl.appendChild(clinicScene);

      requestAnimationFrame(function() {
        clinicScene.style.transition = 'opacity 1.5s ease-in';
        clinicScene.style.opacity = '1';
      });
      await wait(2000);

      // 打字机文字："第一位病人已到达"
      var text1 = createTextElement('', 'intro-text-clinic');
      clinicScene.appendChild(text1);
      await typewrite(text1, '「第一位病人已到达。」', 80);
      await wait(1500);

      // === Step 4 [12-18s]: CRT 启动动画 ===
      if (skipRequested) gotoEnd();

      // 画面扭曲
      sceneEl.classList.add('intro-crt-boot');
      await wait(500);

      // 切换到 CRT 场景
      var crtScene = createCRTScene();
      crtScene.style.opacity = '0';
      sceneEl.innerHTML = '';
      sceneEl.style.background = '#000000';
      sceneEl.appendChild(crtScene);

      requestAnimationFrame(function() {
        crtScene.style.transition = 'opacity 0.3s';
        crtScene.style.opacity = '1';
      });

      // CRT 扫描线出现
      var scanlines = crtScene.querySelector('.intro-crt-scanlines');
      if (scanlines) scanlines.classList.add('intro-scanlines-active');
      await wait(1000);

      // 系统初始化文字
      var text2 = createTextElement('', 'intro-text-system');
      crtScene.appendChild(text2);
      await typewrite(text2, '> 系统初始化完成', 30);
      await wait(500);

      // 闪烁效果
      if (text2) text2.classList.add('intro-text-blink');
      await wait(1500);

      // === Step 5 [18-22s]: 标题显现 ===
      if (skipRequested) gotoEnd();

      // 停止雨声
      stopRainSound();

      // 清除场景，显示标题
      sceneEl.innerHTML = '';
      sceneEl.style.background = '#000000';
      sceneEl.classList.remove('intro-crt-boot');

      var titleWrap = document.createElement('div');
      titleWrap.className = 'intro-title-wrap';

      var titleEl = document.createElement('h1');
      titleEl.className = 'intro-title';
      titleEl.textContent = '语义缝合师';

      var subtitleEl = document.createElement('p');
      subtitleEl.className = 'intro-subtitle';
      subtitleEl.textContent = 'Semantic Weaver';

      var hintEl = document.createElement('p');
      hintEl.className = 'intro-click-hint';
      hintEl.textContent = '—— 记忆是碎片，真相在缝隙 ——';

      titleWrap.appendChild(titleEl);
      titleWrap.appendChild(subtitleEl);
      titleWrap.appendChild(hintEl);
      sceneEl.appendChild(titleWrap);

      // 标题 glitch 入场
      requestAnimationFrame(function() {
        titleEl.classList.add('intro-title-glitch-in');
      });
      await wait(800);
      subtitleEl.classList.add('intro-fade-in');
      await wait(600);
      hintEl.classList.add('intro-fade-in');
      await wait(1500);

      // === Step 6: 淡出，显示标题画面 ===
      if (skipRequested) gotoEnd();

      // 等待一小段时间后自动淡出
      await wait(1000);

    } catch (e) {
      console.warn('开场动画: 播放异常', e);
    }

    gotoEnd();
  }

  /**
   * 结束开场动画，淡出遮罩
   */
  function gotoEnd() {
    clearAllTimers();
    stopRainSound();

    // 淡出
    overlayEl.style.transition = 'opacity 0.8s ease-out';
    overlayEl.style.opacity = '0';

    var timer = setTimeout(function() {
      overlayEl.style.display = 'none';
      overlayEl.style.transition = '';
      sceneEl.innerHTML = '';
      sceneEl.classList.remove('intro-crt-boot');
      isPlaying = false;
      skipRequested = false;
      skipBtnEl.style.display = 'none';

      if (onCompleteCallback) {
        var cb = onCompleteCallback;
        onCompleteCallback = null;
        cb();
      }
    }, 800);
    activeTimers.push(timer);
  }

  /**
   * 跳过开场动画
   */
  function skip() {
    if (!isPlaying) return;
    skipRequested = true;
    clearAllTimers();
    gotoEnd();
  }

  // ==================== DOM 初始化 ====================

  /**
   * 初始化开场动画系统
   */
  function init() {
    if (initialized) return;
    initialized = true;

    // 创建全屏遮罩
    overlayEl = document.createElement('div');
    overlayEl.className = 'intro-overlay';
    overlayEl.style.display = 'none';
    overlayEl.style.opacity = '0';

    // 场景容器
    sceneEl = document.createElement('div');
    sceneEl.className = 'intro-scene-container';

    // 跳过按钮
    skipBtnEl = document.createElement('button');
    skipBtnEl.className = 'intro-skip-btn';
    skipBtnEl.textContent = '跳过 >>';
    skipBtnEl.style.display = 'none';

    overlayEl.appendChild(sceneEl);
    overlayEl.appendChild(skipBtnEl);
    document.body.appendChild(overlayEl);

    // 绑定跳过按钮
    skipBtnEl.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      skip();
    });

    // 阻止遮罩点击穿透
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
