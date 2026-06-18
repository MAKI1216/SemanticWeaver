/**
 * 语义缝合师 - 音效管理模块
 * 使用 Web Audio API 合成简单音效，无需外部音频文件
 */
var AudioManager = (function() {
  'use strict';

  var ctx = null;         // AudioContext 实例
  var masterGain = null;  // 主音量控制
  var initialized = false;

  /**
   * 初始化音频上下文（需要用户交互后调用）
   */
  function init() {
    if (initialized) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.3;
      masterGain.connect(ctx.destination);
      initialized = true;
    } catch (e) {
      console.warn('Web Audio API 不可用:', e);
    }
  }

  /**
   * 确保音频上下文已恢复（浏览器策略要求用户手势后才能播放）
   */
  function resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  /**
   * 播放合成成功音效 - 上升的明亮和弦
   */
  function playSuccess() {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    // 三个递升音符
    var notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  }

  /**
   * 播放合成失败音效 - 低沉的嗡嗡声
   */
  function playFail() {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 120;
    osc.frequency.linearRampToValueAtTime(80, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * 播放打字声 - 轻微的点击
   */
  function playType() {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 800 + Math.random() * 400;
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * 播放警告音 - 急促的蜂鸣
   */
  function playWarning() {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    for (var i = 0; i < 3; i++) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.08, now + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.1);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.15);
    }
  }

  /**
   * 播放故障/噪声音效
   */
  function playGlitch() {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    // 白噪声
    var bufferSize = ctx.sampleRate * 0.15;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    source.connect(gain);
    gain.connect(masterGain);
    source.start(now);
    source.stop(now + 0.2);

    // 扫频
    var osc = ctx.createOscillator();
    var oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
    oscGain.gain.setValueAtTime(0.05, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * 播放拖拽放下音效
   */
  function playDrop() {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 播放重复提取音效（更轻更短）
   * Phase 1.3: 同一关键词重复提取时使用
   */
  function playDropLight() {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 330;
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * 播放提交成功音效 - 华丽的上升音阶
   */
  function playSubmit() {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    var notes = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    notes.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.35);
    });
  }

  /**
   * 播放倒计时警告 - 持续的低频蜂鸣
   */
  function playCountdownTick() {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 220;
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * 播放结局音效
   * @param {string} type - 'A'(救赎) 或 'B'(循环)
   */
  function playEnding(type) {
    if (!ctx) return;
    resume();
    var now = ctx.currentTime;

    if (type === 'A') {
      // 救赎 - 宏大的和弦
      var notes = [261.63, 329.63, 392, 523.25, 659.25];
      notes.forEach(function(freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.1, now + i * 0.15 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.15);
        osc.stop(now + 2.5);
      });
    } else {
      // 循环 - 沉降的音阶
      var notesB = [440, 392, 349.23, 293.66, 220];
      notesB.forEach(function(freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.2);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.2 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.8);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 1);
      });
    }
  }

  // 公开接口
  return {
    init: init,
    resume: resume,
    mute: function() { if (masterGain) masterGain.gain.value = 0; },
    unmute: function() { if (masterGain) masterGain.gain.value = 0.3; },
    playSuccess: playSuccess,
    playFail: playFail,
    playType: playType,
    playWarning: playWarning,
    playGlitch: playGlitch,
    playDrop: playDrop,
    playDropLight: playDropLight,
    playSubmit: playSubmit,
    playCountdownTick: playCountdownTick,
    playEnding: playEnding
  };
})();
