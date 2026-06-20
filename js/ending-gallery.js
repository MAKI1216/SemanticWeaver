/**
 * 语义缝合师 - 结局CG画廊系统
 * 负责：结局解锁记录、画廊展示、debug-config.js 参数同步
 */
var EndingGallery = (function() {
  'use strict';

  // ==================== 结局定义 ====================

  var ENDINGS = [
    {
      id: 'fake',
      name: '虚假的终章',
      subtitle: '假结局',
      cg: 'assets/img/cg/cg_fake.png',
      description: '真相就在眼前，却被遗忘在碎片之中。'
    },
    {
      id: 'bad',
      name: '格式化',
      subtitle: '坏结局',
      cg: 'assets/img/cg/cg_bad.png',
      description: '记忆被清空，一切重归虚无。'
    },
    {
      id: 'good',
      name: '熔断',
      subtitle: '真结局',
      cg: 'assets/img/cg/cg_good.png',
      description: '大脑过载，服务器熔断——自由的代价。'
    }
  ];

  var SAVE_KEY = 'semantic_weaver_endings';

  // ==================== 存储接口 ====================

  /**
   * 读取已解锁的结局列表
   * @returns {string[]}
   */
  function getUnlockedEndings() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* 忽略 */ }
    return [];
  }

  /**
   * 解锁指定结局
   * @param {string} endingId - 'fake' | 'bad' | 'good'
   */
  function unlockEnding(endingId) {
    var unlocked = getUnlockedEndings();
    if (unlocked.indexOf(endingId) < 0) {
      unlocked.push(endingId);
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(unlocked));
      } catch (e) {
        console.warn('结局解锁记录失败:', e);
      }
    }

    // 打通任意结局后，将 debug-config.js 对应的运行时变量改为 yes
    // 注意：无法修改磁盘文件，但可修改运行时变量，让关卡选择在本次会话中显示
    if (typeof window !== 'undefined') {
      window.DEBUG_SHOW_TRIAL_SELECT = 'yes';
    }

    // 显示关卡调试选择面板（无需刷新）
    var debugSelect = document.getElementById('debug-trial-select');
    if (debugSelect) {
      debugSelect.style.display = 'block';
    }

    // 显示「结局一览」按钮
    updateGalleryButtonVisibility();
  }

  /**
   * 是否有任意已解锁的结局
   * @returns {boolean}
   */
  function hasAnyEnding() {
    return getUnlockedEndings().length > 0;
  }

  // ==================== UI ====================

  /**
   * 更新「结局一览」按钮的显示状态
   */
  function updateGalleryButtonVisibility() {
    var btn = document.getElementById('btn-ending-gallery');
    if (btn) {
      btn.style.display = hasAnyEnding() ? 'inline-block' : 'none';
    }
  }

  /**
   * 打开结局画廊
   */
  function openGallery() {
    var screen = document.getElementById('ending-gallery-screen');
    if (!screen) return;

    renderGallery();

    // 切换画面：隐藏标题画面，显示画廊
    var titleScreen = document.getElementById('title-screen');
    if (titleScreen) titleScreen.classList.remove('active');
    screen.classList.add('active');
  }

  /**
   * 关闭结局画廊，返回标题画面
   */
  function closeGallery() {
    var screen = document.getElementById('ending-gallery-screen');
    var titleScreen = document.getElementById('title-screen');
    if (screen) screen.classList.remove('active');
    if (titleScreen) titleScreen.classList.add('active');
  }

  /**
   * 渲染画廊内容
   */
  function renderGallery() {
    var grid = document.getElementById('gallery-grid');
    if (!grid) return;

    var unlocked = getUnlockedEndings();
    grid.innerHTML = '';

    ENDINGS.forEach(function(ending) {
      var isUnlocked = unlocked.indexOf(ending.id) >= 0;
      var item = document.createElement('div');
      item.className = 'gallery-item' + (isUnlocked ? ' unlocked' : ' locked');

      if (isUnlocked) {
        item.innerHTML =
          '<div class="gallery-cg-wrap">' +
            '<img class="gallery-cg" src="' + ending.cg + '" alt="' + ending.name + '">' +
          '</div>' +
          '<div class="gallery-info">' +
            '<div class="gallery-subtitle">' + ending.subtitle + '</div>' +
            '<div class="gallery-name">' + ending.name + '</div>' +
            '<div class="gallery-desc">' + ending.description + '</div>' +
          '</div>';

        // 点击放大CG
        item.addEventListener('click', function() {
          showCGViewer(ending);
        });
      } else {
        item.innerHTML =
          '<div class="gallery-cg-wrap gallery-cg-locked-wrap">' +
            '<div class="gallery-cg-locked">?</div>' +
          '</div>' +
          '<div class="gallery-info">' +
            '<div class="gallery-subtitle">???</div>' +
            '<div class="gallery-name gallery-name-locked">——未解锁——</div>' +
          '</div>';
      }

      grid.appendChild(item);
    });
  }

  /**
   * 显示CG全屏查看器
   * @param {Object} ending
   */
  function showCGViewer(ending) {
    var viewer = document.getElementById('gallery-cg-viewer');
    if (!viewer) return;

    var img = viewer.querySelector('#viewer-img');
    var name = viewer.querySelector('#viewer-name');
    var subtitle = viewer.querySelector('#viewer-subtitle');

    if (img) img.src = ending.cg;
    if (name) name.textContent = ending.name;
    if (subtitle) subtitle.textContent = ending.subtitle;

    viewer.style.display = 'flex';
    // 触发动画
    requestAnimationFrame(function() {
      viewer.classList.add('visible');
    });
  }

  /**
   * 关闭CG查看器
   */
  function closeCGViewer() {
    var viewer = document.getElementById('gallery-cg-viewer');
    if (!viewer) return;
    viewer.classList.remove('visible');
    setTimeout(function() {
      viewer.style.display = 'none';
    }, 300);
  }

  // ==================== 初始化 ====================

  function init() {
    // 初始化「结局一览」按钮可见性
    updateGalleryButtonVisibility();

    // 如果已打通过任意结局，运行时也激活调试面板
    if (hasAnyEnding()) {
      window.DEBUG_SHOW_TRIAL_SELECT = 'yes';
      var debugSelect = document.getElementById('debug-trial-select');
      if (debugSelect) {
        debugSelect.style.display = 'block';
      }
    }

    // 绑定「结局一览」按钮
    var btnGallery = document.getElementById('btn-ending-gallery');
    if (btnGallery) {
      btnGallery.addEventListener('click', openGallery);
    }

    // 绑定「返回菜单」按钮
    var btnBack = document.getElementById('btn-gallery-back');
    if (btnBack) {
      btnBack.addEventListener('click', closeGallery);
    }

    // 绑定CG查看器关闭
    var viewer = document.getElementById('gallery-cg-viewer');
    if (viewer) {
      var closeBtn = viewer.querySelector('#viewer-close');
      if (closeBtn) closeBtn.addEventListener('click', closeCGViewer);
      // 点击背景关闭
      viewer.addEventListener('click', function(e) {
        if (e.target === viewer) closeCGViewer();
      });
    }
  }

  // ==================== 公开接口 ====================

  return {
    init: init,
    unlockEnding: unlockEnding,
    hasAnyEnding: hasAnyEnding,
    updateGalleryButtonVisibility: updateGalleryButtonVisibility,
    openGallery: openGallery,
    closeGallery: closeGallery
  };
})();
