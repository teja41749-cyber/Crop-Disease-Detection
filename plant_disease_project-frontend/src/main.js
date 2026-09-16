import { getApiUrl, predictDisease } from './api.js';
import { init as initUi, getSelectedFile, showLoading, showError, showResult } from './ui.js';
import { initI18n, setLang as setLocale, t } from './i18n.js';
import { createLeafScanAnimation, createLoadingAnimation, createResultAnimation } from './animation.js';
import { cropData, getCropIcon } from './crops.js';

let heroAnim = null;
let loadingAnim = null;
let resultAnim = null;

async function init() {
  await initI18n();

  initHeroAnimation();
  initSteps();
  initCrops();
  initMobileMenu();
  initLangSelector();

  initUi({
    onFileSelected: onFileSelected,
    onPredict: handlePredict,
    onAnalyzing: startLoadingAnimation,
    onResult: onResultShown
  });
}

function onFileSelected(file) {
  console.log('File selected:', file.name, file.type, file.size);
}

function initHeroAnimation() {
  const container = document.getElementById('heroAnimation');
  if (container) {
    heroAnim = createLeafScanAnimation(container);
  }
}

function startLoadingAnimation() {
  stopAnimation(loadingAnim);
  const container = document.getElementById('loadingAnimation');
  if (container) {
    loadingAnim = createLoadingAnimation(container);
  }
}

function onResultShown(data) {
  stopAnimation(resultAnim);
  const container = document.getElementById('resultAnimation');
  if (container) {
    const isHealthy = data && data.disease && /healthy/i.test(data.disease);
    resultAnim = createResultAnimation(container, !!isHealthy);
  }
}

function stopAnimation(anim) {
  if (anim && typeof anim.destroy === 'function') {
    anim.destroy();
  }
}

function initSteps() {
  const grid = document.getElementById('stepsGrid');
  if (!grid) return;

  const fallbackSteps = [
    { title: 'Take a Photo', description: 'Take a clear photo of the crop leaf.' },
    { title: 'AI Checks the Leaf', description: 'Our AI analyzes the image for possible disease signs.' },
    { title: 'Get Guidance', description: 'See the detected disease and recommended treatment guidance.' }
  ];

  const translated = t('howItWorks.steps');
  const steps = Array.isArray(translated) && translated.length ? translated : fallbackSteps;

  grid.innerHTML = steps.map((step, i) => `
    <article class="step-card">
      <span class="step-number">${i + 1}</span>
      <h3>${escapeHtml(step.title)}</h3>
      <p>${escapeHtml(step.description)}</p>
    </article>
  `).join('');
}

function initCrops() {
  const grid = document.getElementById('cropsGrid');
  if (!grid) return;

  grid.innerHTML = cropData.map(crop => `
    <article class="crop-card" role="listitem">
      <div class="crop-icon" aria-hidden="true">
        ${getCropIcon(crop.icon)}
      </div>
      <span class="crop-name">${escapeHtml(crop.name)}</span>
    </article>
  `).join('');
}

function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    btn.setAttribute('aria-expanded', String(!isOpen));
    btn.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

function initLangSelector() {
  const selector = document.getElementById('langSelector');
  if (!selector) return;
  selector.addEventListener('change', (e) => {
    setLocale(e.target.value);
  });
}

async function handlePredict() {
  const file = getSelectedFile();
  if (!file) {
    showError(t('errors.noImage'));
    return;
  }

  const apiUrl = getApiUrl();
  if (!apiUrl) {
    showError(t('errors.analysisFailed'));
    return;
  }

  showLoading();

  try {
    const data = await predictDisease(file, apiUrl);
    showResult(data);
  } catch (err) {
    showError(`${t('errors.analysisFailed')} (${err.message})`);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', init);