/**
 * 语义缝合师 - 完整音乐音效系统 v3
 * 
 * 全部基于 Web Audio API 程序化合成，无需外部音频文件。
 * v3: 卷积混响 + 和弦进行 + 电影级音色设计，全面柔化
 * 设计：季元策 | 实现：马立航 | 日期：2026-06-19
 */
var AudioManager = (function() {
  'use strict';

  var ctx = null;
  var masterGain = null;
  var compressor = null;
  var reverbNode = null;
  var reverbReturn = null;
  var initialized = false;

  // === 背景氛围状态 ===
  var clinicAmbNodes = null;
  var interrogationNodes = null;

  // === 倒计时音乐状态 ===
  var countdownMusicNodes = null;
  var currentTier = 0;

  // === 心跳定时器 ===
  var heartbeatTimer = null;

  // === 警报状态 ===
  var alarmLoopNode = null;

  // === Trial 4 警报 MP3 ===
  var alarmMp3El = null;
  var alarmMp3Gain = null;

  // === Trial 1-3 背景音乐 MP3 ===
  var trail13BgmEl = null;
  var trail13BgmGain = null;

  // === Trial 1-3 雨声（与开场动画同款，循环） ===
  var trail13RainSource = null;
  var trail13RainGain = null;

  // === 预加载 BGM（在用户点击时立即创建，解决浏览器自动播放策略） ===
  var preloadedTrial4El = null;
  var preloadedTrial4Gain = null;
  var preloadedTrail13El = null;
  var preloadedTrail13Gain = null;
  var preloadedAlarmEl = null;
  var preloadedAlarmGain = null;

  // ==================== 初始化 ====================

  function init() {
    if (initialized) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Master chain: masterGain -> compressor -> destination
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.35;

      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 12;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.25;

      masterGain.connect(compressor);
      compressor.connect(ctx.destination);

      // Convolution reverb
      reverbNode = ctx.createConvolver();
      reverbNode.buffer = createReverbImpulse(4.0, 2.5);
      reverbReturn = ctx.createGain();
      reverbReturn.gain.value = 0.5;
      reverbNode.connect(reverbReturn);
      reverbReturn.connect(masterGain);

      initialized = true;
    } catch (e) {
      console.warn('Web Audio API 不可用:', e);
    }
  }

  /**
   * 预加载所有 BGM MP3 文件
   * 必须在 init() 中调用（此时处于用户点击手势内），
   * 创建 Audio 元素并立即 play()，绕过浏览器自动播放策略。
   * 后续 BGM 函数只需调整 gain 即可，无需新建 Audio 元素。
   */
  function preloadAllBgm() {
    var bgms = [
      { el: 'preloadedTrail13El', gain: 'preloadedTrail13Gain', url: 'assets/audio/trail1-3_bgm.mp3', vol: 0 },
      { el: 'preloadedTrial4El',  gain: 'preloadedTrial4Gain',  url: 'assets/audio/trail4_bgm.mp3',    vol: 0 },
      { el: 'preloadedAlarmEl',   gain: 'preloadedAlarmGain',   url: 'assets/audio/alarm.mp3',         vol: 0 }
    ];
    var self = this;

    bgms.forEach(function(bgm) {
      try {
        var audioEl = new Audio(bgm.url);
        audioEl.loop = true;
        audioEl.volume = 0;  // 静音预播放，仅用于"解锁"浏览器自动播放
        
        var gainNode = null;
        if (ctx) {
          var source = ctx.createMediaElementSource(audioEl);
          gainNode = ctx.createGain();
          gainNode.gain.value = 0;  // 初始静音，后续由 BGM 函数调整
          source.connect(gainNode);
          gainNode.connect(masterGain);
        }

        audioEl.play().catch(function(e) {
          console.warn('BGM 预播放失败 (' + bgm.url + '):', e.message);
        });

        // 存储引用
        if (bgm.el === 'preloadedTrail13El') {
          preloadedTrail13El = audioEl;
          preloadedTrail13Gain = gainNode;
        } else if (bgm.el === 'preloadedTrial4El') {
          preloadedTrial4El = audioEl;
          preloadedTrial4Gain = gainNode;
        } else if (bgm.el === 'preloadedAlarmEl') {
          preloadedAlarmEl = audioEl;
          preloadedAlarmGain = gainNode;
        }
      } catch (e) {
        console.warn('BGM 预加载失败 (' + bgm.url + '):', e.message);
      }
    });
  }

  function createReverbImpulse(duration, decay) {
    var rate = ctx.sampleRate;
    var length = Math.floor(rate * duration);
    var impulse = ctx.createBuffer(2, length, rate);
    for (var ch = 0; ch < 2; ch++) {
      var data = impulse.getChannelData(ch);
      for (var i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function ensureCtx() {
    if (!ctx || !initialized) return false;
    resume();
    return true;
  }

  // ==================== 工具函数 ====================

  // 创建一个 send 通路到混响
  function sendToReverb(sourceGain, amount) {
    if (!reverbNode) return;
    var send = ctx.createGain();
    send.gain.value = amount || 0.3;
    sourceGain.connect(send);
    send.connect(reverbNode);
  }

  function createOsc(type, freq, gainVal, start, duration, extra) {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, now + (start || 0));
    g.gain.linearRampToValueAtTime(gainVal || 0.1, now + (start || 0) + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + (start || 0) + (duration || 0.3));
    osc.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.2);
    osc.start(now + (start || 0));
    osc.stop(now + (start || 0) + (duration || 0.3) + 0.05);
    if (extra && extra.onEnded) osc.onended = extra.onEnded;
    return { osc: osc, gain: g };
  }

  function createNoise(duration, gainVal, bandpassLow, bandpassHigh) {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;
    var bufferSize = ctx.sampleRate * (duration || 0.3);
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    var source = ctx.createBufferSource();
    source.buffer = buffer;

    var chain = source;
    if (bandpassLow && bandpassHigh) {
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = (bandpassLow + bandpassHigh) / 2;
      bp.Q.value = bandpassHigh / (bandpassHigh - bandpassLow);
      chain.connect(bp);
      chain = bp;
    }

    var g = ctx.createGain();
    g.gain.setValueAtTime(gainVal || 0.05, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    chain.connect(g);
    g.connect(masterGain);
    source.start(now);
    source.stop(now + duration + 0.05);
  }

  // ==================== P0-A1: 诊所氛围 ====================
  // 温暖舒缓的环境音乐：Am-F-C-G 和弦进行， sine pad + 混响 + 高音shimmer

  function playClinicAmbience() {
    if (!ensureCtx() || clinicAmbNodes) return;
    var now = ctx.currentTime;

    // 和弦进行: Am - F - C - G (温暖、略带忧伤)
    var chords = [
      [110, 130.81, 164.81],   // Am: A2, C3, E3
      [87.31, 110, 130.81],    // F:  F2, A2, C3
      [130.81, 164.81, 196],   // C:  C3, E3, G3
      [98, 123.47, 146.83]     // G:  G2, B2, D3
    ];
    var chordDuration = 10; // 每个和弦10秒
    var notesPerChord = 3;
    var oscs = [];
    var gains = [];

    // 创建所有和弦的振荡器（初始静音，后续调度淡入淡出）
    chords.forEach(function(chord) {
      chord.forEach(function(freq) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.value = 0;
        o.connect(g);
        g.connect(masterGain);
        sendToReverb(g, 0.5); // 较多混响，营造空间感
        o.start(now);
        oscs.push(o);
        gains.push(g);
      });
    });

    // 慢速 LFO 呼吸感（调制整体音量微弱起伏）
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.003;
    lfo.connect(lfoGain);
    lfo.start(now);

    // 调度和弦切换
    var chordIdx = 0;
    var totalChords = chords.length;

    function scheduleChord(idx, startTime) {
      var vol = 0.014;
      for (var j = 0; j < notesPerChord; j++) {
        var g = gains[idx * notesPerChord + j];
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(vol, startTime + 2); // 2秒淡入
        g.gain.setValueAtTime(vol, startTime + chordDuration - 3);
        g.gain.linearRampToValueAtTime(0, startTime + chordDuration); // 3秒淡出
      }
    }

    scheduleChord(0, now);

    var scheduleInterval = setInterval(function() {
      if (!clinicAmbNodes) return;
      chordIdx = (chordIdx + 1) % totalChords;
      scheduleChord(chordIdx, ctx.currentTime);
    }, chordDuration * 1000);

    // 偶尔的高音 shimmer（每18秒，像远处的风铃）
    var shimmerInterval = setInterval(function() {
      if (!clinicAmbNodes) return;
      var shimmerFreqs = [659.25, 783.99, 880, 1046.5]; // E5, G5, A5, C6
      var freq = shimmerFreqs[Math.floor(Math.random() * shimmerFreqs.length)];
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.006, ctx.currentTime + 1.5);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 5);
      o.connect(g);
      g.connect(masterGain);
      sendToReverb(g, 0.8);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 5.5);
    }, 18000);

    clinicAmbNodes = {
      oscs: oscs, lfo: lfo, lfoGain: lfoGain,
      scheduleInterval: scheduleInterval, shimmerInterval: shimmerInterval
    };
  }

  function stopClinicAmbience() {
    if (!clinicAmbNodes) return;
    if (clinicAmbNodes.scheduleInterval) clearInterval(clinicAmbNodes.scheduleInterval);
    if (clinicAmbNodes.shimmerInterval) clearInterval(clinicAmbNodes.shimmerInterval);
    if (clinicAmbNodes.oscs) {
      clinicAmbNodes.oscs.forEach(function(o) { try { o.stop(); } catch(e) {} });
    }
    if (clinicAmbNodes.lfo) { try { clinicAmbNodes.lfo.stop(); } catch(e) {} }
    clinicAmbNodes = null;
  }

  // ==================== P0-A2: 审讯室氛围 ====================
  // 深沉、压抑但柔和的暗色环境：低频 drone + 缓慢滤波扫描 + 偶发低音

  function playInterrogationAmbience() {
    if (!ensureCtx() || interrogationNodes) return;
    var now = ctx.currentTime;

    // 深沉 drone: D1 + A1 + F2 (D 小调，暗沉但柔和)
    var droneFreqs = [36.71, 55, 87.31];
    var oscs = [];
    droneFreqs.forEach(function(freq) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = 0.011;
      o.connect(g);
      g.connect(masterGain);
      sendToReverb(g, 0.6); // 大量混响，洞穴感
      o.start(now);
      oscs.push(o);
    });

    // 缓慢滤波扫描（用锯齿波 + 低通滤波器 + LFO，营造暗色谐波运动）
    var harmonic = ctx.createOscillator();
    var harmonicGain = ctx.createGain();
    var harmonicFilter = ctx.createBiquadFilter();
    harmonic.type = 'sawtooth';
    harmonic.frequency.value = 146.83; // D3
    harmonicFilter.type = 'lowpass';
    harmonicFilter.frequency.value = 180;
    harmonicFilter.Q.value = 3;
    harmonicGain.gain.value = 0.003;
    harmonic.connect(harmonicFilter);
    harmonicFilter.connect(harmonicGain);
    harmonicGain.connect(masterGain);
    sendToReverb(harmonicGain, 0.5);
    harmonic.start(now);

    // 慢速 LFO 扫描滤波器频率 (33秒一个周期)
    var filterLFO = ctx.createOscillator();
    var filterLFOGain = ctx.createGain();
    filterLFO.type = 'sine';
    filterLFO.frequency.value = 0.03;
    filterLFOGain.gain.value = 80;
    filterLFO.connect(filterLFOGain);
    filterLFOGain.connect(harmonicFilter.frequency);
    filterLFO.start(now);

    // 偶发深沉"钢琴"音（每25秒，极轻）
    var pianoInterval = setInterval(function() {
      if (!interrogationNodes) return;
      var notes = [73.42, 87.31, 55, 65.41]; // D2, F2, A1, C2
      var freq = notes[Math.floor(Math.random() * notes.length)];
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.008, ctx.currentTime + 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);
      o.connect(g);
      g.connect(masterGain);
      sendToReverb(g, 0.8);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 7);
    }, 25000);

    interrogationNodes = {
      oscs: oscs, harmonic: harmonic, harmonicFilter: harmonicFilter,
      filterLFO: filterLFO, pianoInterval: pianoInterval
    };
  }

  function stopInterrogationAmbience() {
    if (!interrogationNodes) return;
    if (interrogationNodes.pianoInterval) clearInterval(interrogationNodes.pianoInterval);
    if (interrogationNodes.oscs) {
      interrogationNodes.oscs.forEach(function(o) { try { o.stop(); } catch(e) {} });
    }
    try { interrogationNodes.harmonic.stop(); } catch(e) {}
    try { interrogationNodes.filterLFO.stop(); } catch(e) {}
    interrogationNodes = null;
  }

  // ==================== P0-A3: 倒计时音乐 ====================
  // 使用外部 MP3 音乐（Archive.org 免版税音乐 by Serge Quadrado "Chase"）
  // 搭配渐进式 Web Audio 低频增强层

  function startCountdownMusic() {
    if (countdownMusicNodes) return;

    // 尝试加载外部 MP3
    var audioEl = null;
    var audioSourceNode = null;
    var audioGain = null;

    function initMP3() {
      // 优先使用预加载的 Audio 元素（已在用户手势期间 unlock）
      if (preloadedTrial4El && preloadedTrial4Gain) {
        audioEl = preloadedTrial4El;
        countdownMusicNodes.audioEl = audioEl;
        countdownMusicNodes.audioGain = preloadedTrial4Gain;
        audioGain = preloadedTrial4Gain;
        audioGain.gain.value = 0.45;
        // 预加载时已经连接了混响，无需重复
      } else {
        // 回退：创建新的 Audio 元素
        try {
          audioEl = new Audio('assets/audio/trail4_bgm.mp3');
          audioEl.loop = true;
          audioEl.volume = 0.4;
          countdownMusicNodes.audioEl = audioEl;

          if (ctx) {
            audioSourceNode = ctx.createMediaElementSource(audioEl);
            audioGain = ctx.createGain();
            audioGain.gain.value = 0.45;
            audioSourceNode.connect(audioGain);
            audioGain.connect(masterGain);
            countdownMusicNodes.audioGain = audioGain;
            var wet = ctx.createGain();
            wet.gain.value = 0.2;
            audioGain.connect(wet);
            wet.connect(reverbNode);
          }

          audioEl.play().catch(function(e) {
            console.warn('MP3 播放失败，使用程序化合成:', e.message);
            fallbackSynthesis();
          });
        } catch (e) {
          console.warn('MP3 加载失败，使用程序化合成:', e.message);
          fallbackSynthesis();
        }
      }
    }

    function fallbackSynthesis() {
      if (!ensureCtx()) return;
      var now = ctx.currentTime;

      var tier1Gain = ctx.createGain();
      tier1Gain.gain.value = 1;
      tier1Gain.connect(masterGain);
      var tier2Gain = ctx.createGain();
      tier2Gain.gain.value = 0;
      tier2Gain.connect(masterGain);
      var tier3Gain = ctx.createGain();
      tier3Gain.gain.value = 0;
      tier3Gain.connect(masterGain);

      // 弦乐 drone
      var stringOscs = [];
      [73.42, 110].forEach(function(freq) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        var f = ctx.createBiquadFilter();
        o.type = 'sawtooth';
        o.frequency.value = freq;
        f.type = 'lowpass';
        f.frequency.value = 250;
        g.gain.value = 0.018;
        o.connect(f);
        f.connect(g);
        g.connect(tier1Gain);
        g.connect(tier2Gain);
        g.connect(tier3Gain);
        sendToReverb(g, 0.4);
        o.start(now);
        stringOscs.push(o);
      });

      var pulseOsc = ctx.createOscillator();
      var pulseLFO = ctx.createGain();
      pulseOsc.type = 'sine';
      pulseOsc.frequency.value = 55;
      pulseLFO.gain.value = 0;
      pulseOsc.connect(pulseLFO);
      var pulseLFOGain = ctx.createGain();
      pulseLFOGain.gain.value = 0.012;
      pulseLFO.connect(pulseLFOGain);
      pulseLFOGain.connect(tier1Gain);
      pulseLFOGain.connect(tier2Gain);
      pulseLFOGain.connect(tier3Gain);
      pulseOsc.start(now);
      var pulseLFOSpeed = ctx.createOscillator();
      var pulseLFOSpeedGain = ctx.createGain();
      pulseLFOSpeed.type = 'sine';
      pulseLFOSpeed.frequency.value = 1.2;
      pulseLFOSpeedGain.gain.value = 0.012;
      pulseLFOSpeed.connect(pulseLFOSpeedGain);
      pulseLFOSpeedGain.connect(pulseLFO.gain);
      pulseLFOSpeed.start(now);

      var dissonanceOsc = ctx.createOscillator();
      var dissonanceGain = ctx.createGain();
      var dissonanceFilter = ctx.createBiquadFilter();
      dissonanceOsc.type = 'sawtooth';
      dissonanceOsc.frequency.value = 277.18;
      dissonanceFilter.type = 'lowpass';
      dissonanceFilter.frequency.value = 400;
      dissonanceGain.gain.value = 0;
      dissonanceOsc.connect(dissonanceFilter);
      dissonanceFilter.connect(dissonanceGain);
      dissonanceGain.connect(tier2Gain);
      dissonanceGain.connect(tier3Gain);
      sendToReverb(dissonanceGain, 0.4);
      dissonanceOsc.start(now);

      var tritoneOsc = ctx.createOscillator();
      var tritoneGain = ctx.createGain();
      var tritoneFilter = ctx.createBiquadFilter();
      tritoneOsc.type = 'sawtooth';
      tritoneOsc.frequency.value = 233.08;
      tritoneFilter.type = 'lowpass';
      tritoneFilter.frequency.value = 350;
      tritoneGain.gain.value = 0;
      tritoneOsc.connect(tritoneFilter);
      tritoneFilter.connect(tritoneGain);
      tritoneGain.connect(tier3Gain);
      sendToReverb(tritoneGain, 0.4);
      tritoneOsc.start(now);

      var subBoom = ctx.createOscillator();
      var subBoomGain = ctx.createGain();
      subBoom.type = 'sine';
      subBoom.frequency.value = 36.71;
      subBoomGain.gain.value = 0;
      subBoom.connect(subBoomGain);
      subBoomGain.connect(tier3Gain);
      sendToReverb(subBoomGain, 0.3);
      subBoom.start(now);

      var tensionHigh = ctx.createOscillator();
      var tensionHighGain = ctx.createGain();
      tensionHigh.type = 'sine';
      tensionHigh.frequency.value = 1318.51;
      tensionHighGain.gain.value = 0;
      tensionHigh.connect(tensionHighGain);
      tensionHighGain.connect(tier3Gain);
      sendToReverb(tensionHighGain, 0.6);
      tensionHigh.start(now);

      countdownMusicNodes = {
        tier1Gain: tier1Gain, tier2Gain: tier2Gain, tier3Gain: tier3Gain,
        stringOscs: stringOscs,
        pulseOsc: pulseOsc, pulseLFO: pulseLFO, pulseLFOSpeed: pulseLFOSpeed,
        dissonanceOsc: dissonanceOsc, dissonanceGain: dissonanceGain,
        tritoneOsc: tritoneOsc, tritoneGain: tritoneGain,
        subBoom: subBoom, subBoomGain: subBoomGain,
        tensionHigh: tensionHigh, tensionHighGain: tensionHighGain,
        tier: 1, useMp3: false,
        audioEl: null, audioGain: null
      };
      currentTier = 1;
    }

    // 先尝试 MP3，失败则回退
    countdownMusicNodes = {
      tier1Gain: null, tier2Gain: null, tier3Gain: null,
      stringOscs: null, pulseOsc: null, dissonanceOsc: null,
      tritoneOsc: null, subBoom: null, tensionHigh: null,
      tier: 1, useMp3: true,
      audioEl: null, audioGain: null
    };
    currentTier = 1;
    initMP3();
  }

  function updateCountdownMusicTier(tier) {
    if (!countdownMusicNodes || tier === currentTier) return;
    var n = countdownMusicNodes;

    if (n.useMp3 && n.audioGain) {
      // MP3 模式：渐进提高音量
      var now = ctx ? ctx.currentTime : 0;
      if (tier === 2) {
        n.audioGain.gain.linearRampToValueAtTime(0.55, now + 1.5);
      } else if (tier === 3) {
        n.audioGain.gain.linearRampToValueAtTime(0.65, now + 1.5);
      }
      currentTier = tier;
      return;
    }

    if (!n.tier1Gain || !ensureCtx()) return;
    var now = ctx.currentTime;

    if (tier === 2 && currentTier === 1) {
      n.tier1Gain.gain.linearRampToValueAtTime(0.3, now + 2);
      n.tier2Gain.gain.linearRampToValueAtTime(1, now + 2);
      n.pulseLFOSpeed.frequency.linearRampToValueAtTime(2.0, now + 2);
      n.dissonanceGain.gain.linearRampToValueAtTime(0.01, now + 1.5);
    } else if (tier === 3) {
      n.tier2Gain.gain.linearRampToValueAtTime(0.2, now + 1.5);
      n.tier3Gain.gain.linearRampToValueAtTime(1.1, now + 1.5);
      n.pulseLFOSpeed.frequency.linearRampToValueAtTime(3.0, now + 1.5);
      n.tritoneGain.gain.linearRampToValueAtTime(0.008, now + 1);
      n.subBoomGain.gain.linearRampToValueAtTime(0.02, now + 1);
      n.tensionHighGain.gain.linearRampToValueAtTime(0.004, now + 2);
    }

    currentTier = tier;
  }

  function stopCountdownMusic() {
    if (!countdownMusicNodes) return;
    var n = countdownMusicNodes;

    if (n.useMp3 && n.audioEl) {
      // 预加载元素只静音不销毁
      if (n.audioEl === preloadedTrial4El) {
        if (n.audioGain) n.audioGain.gain.value = 0;
      } else {
        try {
          n.audioEl.pause();
          n.audioEl.src = '';
          n.audioEl.load();
        } catch(e) {}
      }
    }

    if (n.stringOscs) n.stringOscs.forEach(function(o) { try { o.stop(); } catch(e) {} });
    try { if (n.pulseOsc) n.pulseOsc.stop(); } catch(e) {}
    try { if (n.pulseLFOSpeed) n.pulseLFOSpeed.stop(); } catch(e) {}
    try { if (n.dissonanceOsc) n.dissonanceOsc.stop(); } catch(e) {}
    try { if (n.tritoneOsc) n.tritoneOsc.stop(); } catch(e) {}
    try { if (n.subBoom) n.subBoom.stop(); } catch(e) {}
    try { if (n.tensionHigh) n.tensionHigh.stop(); } catch(e) {}

    countdownMusicNodes = null;
    currentTier = 0;
  }

  // ==================== P0-B1: 心跳声 ====================

  function playHeartbeat(rate) {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;

    // 主脉冲：低沉 sine @ 42Hz
    var osc1 = ctx.createOscillator();
    var g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 42;
    g1.gain.setValueAtTime(0.06, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(g1);
    g1.connect(masterGain);
    sendToReverb(g1, 0.2);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // sub-bass 共振
    var osc2 = ctx.createOscillator();
    var g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 24;
    g2.gain.setValueAtTime(0.08, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(g2);
    g2.connect(masterGain);
    osc2.start(now);
    osc2.stop(now + 0.35);
  }

  function startHeartbeatLoop(initialRate) {
    stopHeartbeatLoop();
    var rate = initialRate || 2.0;
    scheduleHeartbeat(rate);
  }

  function scheduleHeartbeat(rate) {
    if (!ensureCtx()) return;
    playHeartbeat(rate);
    heartbeatTimer = setTimeout(function() {
      scheduleHeartbeat(rate);
    }, rate * 1000);
  }

  function updateHeartbeatRate(rate) {
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
      heartbeatTimer = null;
      scheduleHeartbeat(rate);
    }
  }

  function stopHeartbeatLoop() {
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  // ==================== P0-B2: 警报声 ====================

  function startAlarmLoop() {
    if (!ensureCtx() || alarmLoopNode) return;
    var now = ctx.currentTime;

    // 柔和的紧张弦乐 swell（替代刺耳的警报）
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 330; // E4
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    filter.Q.value = 2;

    // 慢速 LFO 调制频率，产生紧张起伏
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.8;
    lfoGain.gain.value = 30;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    g.gain.value = 0.015;
    osc.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.5);
    osc.start(now);
    lfo.start(now);

    alarmLoopNode = { osc: osc, gain: g, lfo: lfo, filter: filter };
  }

  function stopAlarmLoop() {
    if (alarmLoopNode) {
      try { alarmLoopNode.osc.stop(); } catch(e) {}
      try { alarmLoopNode.lfo.stop(); } catch(e) {}
      alarmLoopNode = null;
    }
  }

  // ==================== Trial 4 警报 MP3（循环，与主 BGM 同时播放） ====================

  function startAlarmMp3() {
    if (alarmMp3El) return;
    
    // 优先使用预加载的 Audio 元素
    if (preloadedAlarmEl && preloadedAlarmGain) {
      alarmMp3El = preloadedAlarmEl;
      alarmMp3Gain = preloadedAlarmGain;
      alarmMp3Gain.gain.value = 0.35;
    } else {
      // 回退
      try {
        alarmMp3El = new Audio('assets/audio/alarm.mp3');
        alarmMp3El.loop = true;
        alarmMp3El.volume = 0.35;

        if (ctx) {
          var sourceNode = ctx.createMediaElementSource(alarmMp3El);
          alarmMp3Gain = ctx.createGain();
          alarmMp3Gain.gain.value = 0.35;
          sourceNode.connect(alarmMp3Gain);
          alarmMp3Gain.connect(masterGain);
        }

        alarmMp3El.play().catch(function(e) {
          console.warn('警报 MP3 播放失败:', e.message);
        });
      } catch (e) {
        console.warn('警报 MP3 加载失败:', e.message);
      }
    }
  }

  function stopAlarmMp3() {
    if (alarmMp3El) {
      // 预加载元素只静音不销毁
      if (alarmMp3El === preloadedAlarmEl) {
        if (alarmMp3Gain) alarmMp3Gain.gain.value = 0;
      } else {
        try {
          alarmMp3El.pause();
          alarmMp3El.src = '';
          alarmMp3El.load();
        } catch(e) {}
      }
      alarmMp3El = null;
      alarmMp3Gain = null;
    }
  }

  // ==================== Trial 1-3 背景音乐 MP3 ====================

  // ==================== Trial 1-3 雨声（与开场动画同款，循环） ====================

  function startTrail13Rain() {
    if (trail13RainSource || !ensureCtx()) return;
    try {
      // 白噪音缓冲（2秒循环，与 intro 完全相同的滤波参数）
      var bufferSize = ctx.sampleRate * 2;
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      var source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // 低通滤波（截止 800Hz，与 intro 一致）
      var filter1 = ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.value = 800;
      filter1.Q.value = 0.5;

      // 高通滤波去除极低频（200Hz，与 intro 一致）
      var filter2 = ctx.createBiquadFilter();
      filter2.type = 'highpass';
      filter2.frequency.value = 200;

      trail13RainGain = ctx.createGain();
      trail13RainGain.gain.value = 0; // 从静音渐入

      source.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(trail13RainGain);
      trail13RainGain.connect(masterGain);

      source.start();
      trail13RainSource = source;

      // 渐入至 75% 原始音量（intro 原值 0.12 × 0.75 = 0.09）
      trail13RainGain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 3);
    } catch (e) {
      console.warn('Trail1-3 雨声启动失败:', e);
    }
  }

  function stopTrail13Rain() {
    if (!trail13RainSource || !ctx) return;
    try {
      trail13RainGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      trail13RainSource.stop(ctx.currentTime + 0.9);
    } catch(e) {}
    trail13RainSource = null;
    trail13RainGain = null;
  }

  // ==================== Trial 1-3 背景音乐 MP3 ====================

  function startTrail13Bgm() {
    if (trail13BgmEl) return;
    
    // 优先使用预加载的 Audio 元素（已在用户手势期间 unlock）
    if (preloadedTrail13El && preloadedTrail13Gain) {
      trail13BgmEl = preloadedTrail13El;
      trail13BgmGain = preloadedTrail13Gain;
      trail13BgmGain.gain.value = 0.15;
    } else {
      // 回退：创建新的 Audio 元素
      try {
        trail13BgmEl = new Audio('assets/audio/trail1-3_bgm.mp3');
        trail13BgmEl.loop = true;
        trail13BgmEl.volume = 0.15;

        if (ctx) {
          var sourceNode = ctx.createMediaElementSource(trail13BgmEl);
          trail13BgmGain = ctx.createGain();
          trail13BgmGain.gain.value = 0.15;
          sourceNode.connect(trail13BgmGain);
          trail13BgmGain.connect(masterGain);
        }

        trail13BgmEl.play().catch(function(e) {
          console.warn('Trail1-3 BGM 播放失败:', e.message);
        });
      } catch (e) {
        console.warn('Trail1-3 BGM 加载失败:', e.message);
      }
    }

    // 同步启动雨声
    startTrail13Rain();
  }

  function stopTrail13Bgm() {
    if (trail13BgmEl) {
      // 如果是预加载元素，只静音不销毁
      if (trail13BgmEl === preloadedTrail13El) {
        if (trail13BgmGain) trail13BgmGain.gain.value = 0;
      } else {
        try {
          trail13BgmEl.pause();
          trail13BgmEl.src = '';
          trail13BgmEl.load();
        } catch(e) {}
      }
      trail13BgmEl = null;
      trail13BgmGain = null;
    }
    stopTrail13Rain();
  }

  // ==================== 净化专用音效（75% 音量） ====================

  function playPurifySuccess() {
    if (!ensureCtx()) return;
    var notes = [523.25, 659.25, 783.99];
    var now = ctx.currentTime;
    notes.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now + i * 0.1);
      g.gain.linearRampToValueAtTime(0.075, now + i * 0.1 + 0.01); // 0.1 * 75% = 0.075
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
      osc.connect(g);
      g.connect(masterGain);
      sendToReverb(g, 0.2);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.55);
    });
    // 高频点缀（原0.03 * 75% = 0.0225）
    var oscH = ctx.createOscillator();
    var gH = ctx.createGain();
    oscH.type = 'sine';
    oscH.frequency.value = 2400;
    gH.gain.setValueAtTime(0.0225, now + 0.35);
    gH.gain.exponentialRampToValueAtTime(0.001, now + 0.41);
    oscH.connect(gH);
    gH.connect(masterGain);
    oscH.start(now + 0.35);
    oscH.stop(now + 0.42);
  }

  function playAlarmBurst() {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;

    // 弦乐渐强 swell（替代刺耳的双频警报）
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.linearRampToValueAtTime(330, now + 0.4); // E4
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 2;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.018, now + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.6);
    osc.start(now);
    osc.stop(now + 0.65);
  }

  // ==================== P0-B4: 数据损坏音 ====================

  function playDataCorruption() {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;

    // 柔和的数字 glitch（降低音量+频率）
    var bufferSize = Math.floor(ctx.sampleRate * 0.12);
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    var step = Math.floor(ctx.sampleRate / 1500);
    var val = 0;
    for (var i = 0; i < bufferSize; i++) {
      if (i % step === 0) val = (Math.random() * 2 - 1);
      data[i] = val * 0.3;
    }
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2000;
    bp.Q.value = 2;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.025, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    src.connect(bp);
    bp.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.3);
    src.start(now);
    src.stop(now + 0.17);

    // 频率跳跃（柔和版本）
    var osc = ctx.createOscillator();
    var og = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(3000, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    og.gain.setValueAtTime(0.018, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(filter);
    filter.connect(og);
    og.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  // ==================== P1-B3: 电影级低频冲击（替代工业杂音） ====================

  function playIndustrialNoise() {
    if (!ensureCtx()) return;
    var choice = Math.floor(Math.random() * 3);

    if (choice === 0) {
      // 柔和低频冲击（电影 boom）
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.4);
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      g.gain.setValueAtTime(0.035, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(filter);
      filter.connect(g);
      g.connect(masterGain);
      sendToReverb(g, 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.65);
    } else if (choice === 1) {
      // 低沉的弦乐拨弦 (pizzicato 感)
      createOsc('triangle', 110, 0.02, 0, 0.3);
    } else {
      // 极轻的空气流声
      createNoise(0.4, 0.008, 200, 800);
    }
  }

  // 撕纸音效 — 模拟从页面撕下一张纸的清脆声
  function playKeywordPickup(variant) {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;
    var isFresh = (variant === 'fresh');

    // 生成纸张撕裂质感：宽带噪声 + 中高频带通 + 快速爆发
    function createTearBurst(startTime, duration, centerFreq, q, vol) {
      var bufSize = Math.floor(ctx.sampleRate * duration);
      var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) {
        // 指数衰减包络模拟纤维断裂
        var env = Math.exp(-i / (bufSize * 0.25));
        d[i] = (Math.random() * 2 - 1) * env;
      }
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = centerFreq || 3200;
      bp.Q.value = q || 1.2;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(vol || 0.025, startTime + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      src.connect(bp);
      bp.connect(g);
      g.connect(masterGain);
      sendToReverb(g, 0.15);
      src.start(startTime);
      src.stop(startTime + duration + 0.02);
    }

    if (isFresh) {
      // 首次提取：更清晰的撕纸声，多次微爆模拟纤维断裂
      createTearBurst(now, 0.06, 3500, 1.8, 0.028);
      createTearBurst(now + 0.015, 0.04, 4200, 2.0, 0.018);
      createTearBurst(now + 0.03, 0.05, 2800, 1.5, 0.02);
      createTearBurst(now + 0.05, 0.03, 5000, 2.2, 0.012);
    } else {
      // 重复提取：更轻、更短的撕纸尾音
      createTearBurst(now, 0.03, 3000, 1.5, 0.015);
      createTearBurst(now + 0.01, 0.02, 3800, 1.8, 0.008);
    }
  }

  // ==================== P1-C3: Stage 推进过渡音 ====================

  function playStageTransition() {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;

    // Whoosh sweep (柔和版本)
    var bufferSize = ctx.sampleRate * 0.4;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(150, now);
    bp.frequency.exponentialRampToValueAtTime(2000, now + 0.35);
    bp.Q.value = 0.8;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.03, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    src.connect(bp);
    bp.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.5);
    src.start(now);
    src.stop(now + 0.5);

    // 柔和的低音"咚"
    var osc = ctx.createOscillator();
    var og = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.value = 70;
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    og.gain.setValueAtTime(0.04, now + 0.05);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(filter);
    filter.connect(og);
    og.connect(masterGain);
    sendToReverb(og, 0.4);
    osc.start(now + 0.05);
    osc.stop(now + 0.45);
  }

  // ==================== P1-C4: Meta 入侵专用音效 ====================

  function playMetaIntrusion(target) {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;

    // 数字化撕裂 — 柔和版本（降低音量+低通滤波）
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 2;
    g.gain.setValueAtTime(0.035, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.5);
    osc.start(now);
    osc.stop(now + 0.3);

    // bit-crushed noise (柔和)
    var bufSize = Math.floor(ctx.sampleRate * 0.1);
    var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var d = buf.getChannelData(0);
    var st = Math.floor(ctx.sampleRate / 3000);
    var v = 0;
    for (var i = 0; i < bufSize; i++) {
      if (i % st === 0) v = Math.random() * 2 - 1;
      d[i] = v * 0.3;
    }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2000;
    bp.Q.value = 1.5;
    var ng = ctx.createGain();
    ng.gain.setValueAtTime(0.025, now + 0.05);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    src.connect(bp);
    bp.connect(ng);
    ng.connect(masterGain);
    sendToReverb(ng, 0.4);
    src.start(now + 0.05);
    src.stop(now + 0.25);

    // 系统确认"叮"（柔和的高频 sine）
    createOsc('sine', 1200, 0.025, 0.25, 0.1);
  }

  // ==================== P0-C5: 矛盾标记成功专用音 ====================

  function playContradictionMark() {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;

    // 不协和音程 (柔和版本: sine 替代 sawtooth)
    var osc1 = ctx.createOscillator();
    var g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 523.25; // C5
    g1.gain.setValueAtTime(0.035, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(g1);
    g1.connect(masterGain);
    sendToReverb(g1, 0.4);
    osc1.start(now);
    osc1.stop(now + 0.35);

    var osc2 = ctx.createOscillator();
    var g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 554.37; // C#5
    g2.gain.setValueAtTime(0.035, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(g2);
    g2.connect(masterGain);
    sendToReverb(g2, 0.4);
    osc2.start(now);
    osc2.stop(now + 0.35);

    // 解决的"叮": C6
    createOsc('sine', 1046.5, 0.04, 0.3, 0.2);
  }

  // ==================== P1-C7: 卡片入垃圾桶 ====================

  function playTrash(isGolden) {
    if (!ensureCtx()) return;

    // 柔和的纸张声
    createNoise(0.12, 0.02, 800, 3000);

    if (isGolden) {
      // 金色卡片入垃圾桶：低频冲击（柔和）
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.value = 50;
      filter.type = 'lowpass';
      filter.frequency.value = 120;
      g.gain.setValueAtTime(0.06, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(filter);
      filter.connect(g);
      g.connect(masterGain);
      sendToReverb(g, 0.4);
      osc.start(ctx.currentTime + 0.05);
      osc.stop(ctx.currentTime + 0.45);
    }
  }

  // ==================== P2: 推演板重置 ====================

  function playBoardReset() {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;

    // 柔和的消散音
    createNoise(0.25, 0.025, 1500, 5000);

    // 低频"呼"
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 90;
    g.gain.setValueAtTime(0.025, now);
    g.gain.linearRampToValueAtTime(0.035, now + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.4);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  // ==================== 继承原有音效（保留并微调） ====================

  function playSuccess() {
    if (!ensureCtx()) return;
    var notes = [523.25, 659.25, 783.99];
    notes.forEach(function(freq, i) {
      createOsc('sine', freq, 0.1, i * 0.1, 0.5);
    });
    createOsc('sine', 2400, 0.03, 0.35, 0.06);
  }

  function playFail() {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 100;
    osc.frequency.linearRampToValueAtTime(70, now + 0.3);
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.3);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  function playType() {
    if (!ensureCtx()) return;
    createOsc('sine', 600 + Math.random() * 200, 0.008, 0, 0.025);
  }

  function playWarning() {
    if (!ensureCtx()) return;
    for (var i = 0; i < 3; i++) {
      createOsc('sine', 660, 0.04, i * 0.2, 0.1);
    }
  }

  function playGlitch() {
    if (!ensureCtx()) return;
    createNoise(0.1, 0.03);
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var og = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    og.gain.setValueAtTime(0.03, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(filter);
    filter.connect(og);
    og.connect(masterGain);
    sendToReverb(og, 0.3);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  function playDrop() {
    if (!ensureCtx()) return;
    // 柔和的卡片放置音
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.015, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.3);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  function playDropLight() {
    if (!ensureCtx()) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 150;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.01, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(g);
    g.connect(masterGain);
    sendToReverb(g, 0.25);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  function playSubmit() {
    if (!ensureCtx()) return;
    var notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach(function(freq, i) {
      createOsc('sine', freq, 0.08, i * 0.08, 0.35);
    });
  }

  function playCountdownTick() {
    if (!ensureCtx()) return;
    // 非常柔和的滴答声（低频 sine）
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 150;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.012, now + 0.002);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  function playEnding(type) {
    if (!ensureCtx()) return;
    if (type === 'A') {
      var notes = [261.63, 329.63, 392, 523.25, 659.25];
      notes.forEach(function(freq, i) {
        createOsc('sine', freq, 0.08, i * 0.15, 2.0);
      });
    } else {
      var notesB = [440, 392, 349.23, 293.66, 220];
      notesB.forEach(function(freq, i) {
        createOsc('triangle', freq, 0.06, i * 0.2, 0.8);
      });
    }
  }

  // ==================== 全局停音 ====================

  function stopAllAmbience() {
    stopClinicAmbience();
    stopInterrogationAmbience();
    stopCountdownMusic();
    stopHeartbeatLoop();
    stopAlarmLoop();
    stopTrail13Bgm(); // 内部会同时调用 stopTrail13Rain
  }

  // ==================== 公开接口 ====================

  return {
    init: init,
    resume: resume,
    preloadAllBgm: preloadAllBgm,  // 由 game.js 在按钮点击时调用
    mute: function() { if (masterGain) masterGain.gain.value = 0; },
    unmute: function() { if (masterGain) masterGain.gain.value = 0.35; },

    // 保存原有接口
    playSuccess: playSuccess,
    playFail: playFail,
    playType: playType,
    playWarning: playWarning,
    playGlitch: playGlitch,
    playDrop: playDrop,
    playDropLight: playDropLight,
    playSubmit: playSubmit,
    playCountdownTick: playCountdownTick,
    playEnding: playEnding,

    // 背景氛围
    playClinicAmbience: playClinicAmbience,
    stopClinicAmbience: stopClinicAmbience,
    playInterrogationAmbience: playInterrogationAmbience,
    stopInterrogationAmbience: stopInterrogationAmbience,

    // 倒计时音乐
    startCountdownMusic: startCountdownMusic,
    updateCountdownMusicTier: updateCountdownMusicTier,
    stopCountdownMusic: stopCountdownMusic,

    // Trial 4 专属
    playHeartbeat: playHeartbeat,
    startHeartbeatLoop: startHeartbeatLoop,
    updateHeartbeatRate: updateHeartbeatRate,
    stopHeartbeatLoop: stopHeartbeatLoop,
    startAlarmLoop: startAlarmLoop,
    stopAlarmLoop: stopAlarmLoop,
    playAlarmBurst: playAlarmBurst,
    playIndustrialNoise: playIndustrialNoise,
    playDataCorruption: playDataCorruption,
    startAlarmMp3: startAlarmMp3,
    stopAlarmMp3: stopAlarmMp3,

    // Trial 1-3 背景音乐 + 雨声
    startTrail13Bgm: startTrail13Bgm,
    stopTrail13Bgm: stopTrail13Bgm,
    startTrail13Rain: startTrail13Rain,
    stopTrail13Rain: stopTrail13Rain,

    // 净化音效（75% 音量）
    playPurifySuccess: playPurifySuccess,

    // 增强音效
    playKeywordPickup: playKeywordPickup,
    playStageTransition: playStageTransition,
    playMetaIntrusion: playMetaIntrusion,
    playContradictionMark: playContradictionMark,
    playBoardReset: playBoardReset,
    playTrash: playTrash,

    // 全局
    stopAllAmbience: stopAllAmbience
  };
})();
