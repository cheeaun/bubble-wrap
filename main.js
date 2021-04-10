import './style.css';
import { Howl } from 'howler/src/howler.core';

const bubbleSize = 50;
const $ = (id) => document.getElementById(id);
const $wrap = $('bubble-wrap');
const $wrapInner = $('bubble-wrap-inner');
console.log(1, $wrapInner);
const $resetButton = $('reset-button');
const $level = $('level');
const $postLevel = $('post-level');
const $optionsForm = $('options-form');

const crossFadeDuration = 1000;
let isDialog = true;
document.body.onclick = (e) => {
  if (/dialog\-button/i.test(e.target.className)) {
    e.preventDefault();
    const allDialogs = document.querySelectorAll('.dialog');
    allDialogs.forEach((dialog) => (dialog.hidden = true));
    const [_, dialog] = e.target.className.match(/([^-]+)-dialog-button/i) || [
      ,
      null,
    ];
    console.log({ dialog });
    if (dialog && $(dialog)) {
      $(dialog).hidden = false;
      if (!isDialog) {
        bgMusic2.fade(0.3, 0, crossFadeDuration).once('fade', () => {
          bgMusic2.stop();
        });
        bgMusic1.fade(0, 0.3, crossFadeDuration * 2);
        bgMusic1.play();
      }
      isDialog = true;
    } else {
      if (isDialog) {
        bgMusic1.fade(0.3, 0, crossFadeDuration).once('fade', () => {
          bgMusic1.stop();
        });
        bgMusic2.fade(0, 0.3, crossFadeDuration * 2);
        bgMusic2.play();
      }
      isDialog = false;
    }
  }
};

let level = 1;
function renderLevel() {
  $level.textContent = level;
}

let unpopTimers = [];
function resetUnpop() {
  unpopTimers.forEach(function (t) {
    clearTimeout(t);
  });
  unpopTimers = [];
}

let total = 0;
const wrapHorizontalPadding = 12 * 2;
const wrapVerticalPadding = 24 * 2;
const bubbleMargin = 2 * 2;
function render() {
  console.log(2, 'render');
  resetUnpop();
  resetResetButton();
  renderLevel();

  const wrapWidth = $wrap.offsetWidth - wrapHorizontalPadding;
  const wrapHeight = $wrap.offsetHeight - wrapVerticalPadding;
  const bubbleColCount = Math.floor(wrapWidth / (bubbleSize + bubbleMargin));
  const bubbleAltColCount = bubbleColCount - 1;
  const bubbleRowCount = Math.floor(wrapHeight / bubbleSize);
  const bubbleAltRowCount = Math.floor(bubbleRowCount / 2);
  const count = bubbleColCount * bubbleRowCount - bubbleAltRowCount;
  total = count;
  let html = '';
  let toggleRow = true;
  console.log(2.1, $wrap.offsetWidth, $wrap.offsetHeight);
  for (let i = 0, col = 1; i < count; i++, col++) {
    html += '<span class="bubble"></span>';
    if (
      (toggleRow && col === bubbleColCount) ||
      (!toggleRow && col === bubbleAltColCount)
    ) {
      html += '<br>';
      toggleRow = !toggleRow;
      col = 0;
    }
  }
  $wrap.classList.add('reset');
  setTimeout(() => {
    $wrap.classList.remove('reset');
  }, 1000);
  console.log(3, $wrapInner, html);
  $wrapInner.innerHTML = html;
  console.log(3, $wrapInner.innerHTML);
}

function showPostLevel() {
  $postLevel.querySelector(
    '.dialog-inner .content',
  ).innerHTML = `You've popped all ${total} of them in just ${Math.ceil(
    (Date.now() - startTime) / 1000,
  )} seconds!`;
  $postLevel.hidden = false;
  levelUpSound.play();
}

let resetButton = false;
function resetResetButton() {
  resetButton = false;
  $resetButton.disabled = true;
}

$resetButton.onclick = (e) => {
  e.preventDefault();
  render();
};

import bgMusic1m4aURL from './assets/background-music-1.m4a';
import bgMusic1mp3URL from './assets/background-music-1.mp3';
const bgMusic1 = new Howl({
  src: [bgMusic1m4aURL, bgMusic1mp3URL],
  volume: 0.5,
  loop: true,
  autoplay: true,
});

import bgMusic2m4aURL from './assets/background-music-2.m4a';
import bgMusic2mp3URL from './assets/background-music-2.mp3';
const bgMusic2 = new Howl({
  src: [bgMusic2m4aURL, bgMusic2mp3URL],
  volume: 0.3,
  loop: true,
});

import levelUpmp3URL from './assets/level-up.mp3';
const levelUpSound = new Howl({
  src: [levelUpmp3URL],
  volume: 0.15,
});
import buttonTapmp3URL from './assets/button-tap.mp3';
const tapSound = new Howl({
  src: [buttonTapmp3URL],
  volume: 0.3,
});
import popmp3URL from './assets/bubble-wrap-single-pop.mp3';
const popSound = new Howl({
  src: [popmp3URL],
  volume: 0.5,
});
import unpopmp3URL from './assets/bubble-wrap-single-unpop.mp3';
const unpopSound = new Howl({
  src: [unpopmp3URL],
  volume: 0.3,
});

let startTime;
let checkTimer;
let lastPopTarget;
function pop(target) {
  if (!startTime) startTime = Date.now();
  target.classList.remove('unpop');
  target.classList.add('pop');
  lastPopTarget = target;
  popSound.play();
  if (!resetButton) {
    resetButton = true;
    $resetButton.disabled = false;
  }
  clearTimeout(checkTimer);
  checkTimer = setTimeout(() => {
    const poppedAll = $wrap.querySelectorAll('.pop').length === total;
    if (poppedAll) {
      showPostLevel();
      startTime = null;
      level++;
      render();
    }
  }, 300);

  unpopTimers.push(
    setTimeout(() => {
      const popped = [];
      $wrap.querySelectorAll('.pop').forEach(function (poppedEl, i, arr) {
        if (poppedEl !== lastPopTarget || arr.length <= 1) {
          popped.push(poppedEl);
        }
      });
      if (!popped.length) return;
      const randomIndex = Math.floor(Math.random() * popped.length);
      unpopSound.play();
      popped[randomIndex].classList.remove('pop');
      popped[randomIndex].classList.add('unpop');
      unpopTimers.shift();
    }, Math.max(100, (total * 1000) / level)),
  );
}

document.body.onpointerdown = (e) => {
  e.preventDefault();
  const target = e.target;
  if (target.matches('.bubble:not(.pop)')) {
    pop(target);
  } else if (target.tagName.toLowerCase() === 'button') {
    tapSound.play();
  }
};
let prevKeys = [];
document.body.onkeypress = (e) => {
  const dialogsOnTop = document.querySelector('.dialog:not([hidden])');
  if (dialogsOnTop) return;
  const key = e.key;
  if (key) e.preventDefault();
  if (key && !prevKeys.includes(key)) {
    prevKeys.push(key);
    prevKeys = prevKeys.slice(-5); // Only prevent previous 5 unique keys
    const prepops = $wrap.querySelectorAll('.bubble:not(.pop)');
    const randomIndex = Math.floor(Math.random() * prepops.length);
    const target = prepops[randomIndex];
    if (target) {
      pop(target);
    }
  }
};
document.body.addEventListener(
  'touchstart',
  (e) => {
    const tagName = e.target.tagName.toLowerCase();
    if (tagName === 'a' || tagName === 'button' || tagName === 'label') return;
    e.preventDefault();
  },
  { passive: false },
);

let resizeTimer;
window.onload = () => {
  render();

  setTimeout(() => {
    window.onresize = () => {
      console.log('resize');
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 1000);
    };
  }, 1000);
};

let bgm =
  sessionStorage.getItem('opts-bgm') === null ||
  sessionStorage.getItem('opts-bgm') === 'true';
let sfx =
  sessionStorage.getItem('opts-sfx') === null ||
  sessionStorage.getItem('opts-sfx') === 'true';

function setOpts() {
  bgMusic1.mute(!bgm);
  bgMusic2.mute(!bgm);
  levelUpSound.mute(!bgm);
  sessionStorage.setItem('opts-bgm', bgm);
  tapSound.mute(!sfx);
  popSound.mute(!sfx);
  unpopSound.mute(!sfx);
  sessionStorage.setItem('opts-sfx', sfx);
  $('bgm-check').checked = bgm;
  $('sfx-check').checked = sfx;
}
setOpts();

$optionsForm.oninput = (e) => {
  if (e.target.tagName.toLowerCase() === 'input') {
    if (e.target.id === 'bgm-check') {
      bgm = e.target.checked;
    } else if (e.target.id === 'sfx-check') {
      sfx = e.target.checked;
    }
    setOpts();
  }
};
