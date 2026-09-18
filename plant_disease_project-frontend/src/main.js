import {
  getApiUrl,
  predictDisease,
  submitFeedback,
  getWeatherRisk
} from './api.js';

import {
  init as initUi,
  getSelectedFile,
  showLoading,
  showError,
  showResult,
  renderLocationStatus,
  showWeatherLoading,
  drawWeatherRisk,
  drawWeatherConditions,
  showWeatherUnavailable,
  hideWeatherBlock,
  isHealthyResult,
  initResultFeedback,
  showResultFeedback
} from './ui.js';

import {
  initI18n,
  t
} from './i18n.js';

import {
  renderHistory
} from './history.js';

import {
  createLeafScanAnimation,
  createLoadingAnimation,
  createResultAnimation
} from './animation.js';

import {
  cropData,
  getCropIcon
} from './crops.js';

import {
  initShell
} from './nav.js';


let heroAnim = null;
let loadingAnim = null;
let resultAnim = null;
let lastScanId = null;


/* =========================================
   LOCATION
   ========================================= */

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        // Location is optional.
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000
      }
    );
  });
}

function hasValidLocation(location) {
  return !!(
    location &&
    Number.isFinite(Number(location.latitude)) &&
    Number.isFinite(Number(location.longitude))
  );
}


/* =========================================
   MAIN INITIALIZATION
   ========================================= */

async function init() {
  await initI18n();
  initShell({ page: 'home' });

  initHeroAnimation();
  initSteps();
  initCrops();

  initUi({
    onFileSelected: onFileSelected,
    onPredict: handlePredict,
    onAnalyzing: startLoadingAnimation,
    onResult: onResultShown
  });

  initResultFeedback(handleFeedbackSubmit);
  renderHistory();
}


/* =========================================
   HERO ANIMATION
   ========================================= */

function initHeroAnimation() {
  const container = document.getElementById('heroAnimation');

  if (!container) {
    return;
  }

  heroAnim = createLeafScanAnimation(container);
}


/* =========================================
   LOADING ANIMATION
   ========================================= */

function startLoadingAnimation() {
  const container = document.getElementById('loadingAnimation');

  if (!container) {
    return;
  }

  if (loadingAnim) {
    loadingAnim.destroy?.();
  }

  loadingAnim = createLoadingAnimation(container);
}


/* =========================================
   RESULT ANIMATION
   ========================================= */

function onResultShown(data) {
  const container = document.getElementById('resultAnimation');

  if (!container) {
    return;
  }

  if (resultAnim) {
    resultAnim.destroy?.();
  }

  resultAnim = createResultAnimation(container, data);
}


/* =========================================
   FILE SELECTED
   ========================================= */

function onFileSelected(file) {
  if (!file) {
    return;
  }

  console.log('Selected image:', file.name);
}


/* =========================================
   AI PREDICTION
   ========================================= */

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
    /*
     * GPS is optional.
     * If the farmer denies location permission,
     * prediction continues normally.
     */
    const location = await getCurrentLocation();

    const data = await predictDisease(
      file,
      apiUrl,
      location
    );


    /* -----------------------------------------
       Leaf validator rejected the image
       ----------------------------------------- */

    if (data && data.status === 'invalid_image') {
      showError(t('errors.notLeaf'));
      return;
    }


    /* -----------------------------------------
       Store latest result for other pages
       ----------------------------------------- */

    try {
      sessionStorage.setItem(
        'agrigaurd_latest_scan',
        JSON.stringify({
          ...data,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          imageName: file.name,
          scannedAt: new Date().toISOString()
        })
      );
    } catch (storageError) {
      console.warn(
        'Could not save scan result:',
        storageError
      );
    }


    /* -----------------------------------------
       Keep ORIGINAL result UI + new extras
       ----------------------------------------- */

    lastScanId = data && typeof data.scan_id !== 'undefined'
      ? data.scan_id
      : null;

    showResult(data);

    /*
     * Weather risk, location status and farmer feedback
     * appear ONLY for confident (success) predictions.
     * Healthy results get neutral weather conditions
     * (no disease-risk wording) and skip the location ring.
     */
    if (data.status === 'success') {
      if (isHealthyResult(data)) {
        renderWeatherConditionsForLocation(location);
        showResultFeedback();
      } else {
        renderLocationStatus(location);
        renderWeatherRiskForLocation(location);
        showResultFeedback();
      }
    }

  } catch (err) {
    showError(
      `${t('errors.analysisFailed')} (${err.message})`
    );
  }
}


/* =========================================
   WEATHER-BASED RISK (result screen)
   ========================================= */

async function renderWeatherRiskForLocation(location) {
  if (!hasValidLocation(location)) {
    showWeatherUnavailable('location');
    return;
  }

  showWeatherLoading();

  try {
    const weather = await getWeatherRisk(
      location.latitude,
      location.longitude
    );

    if (weather && weather.risk_level) {
      drawWeatherRisk(weather);
    } else {
      showWeatherUnavailable('error');
    }
  } catch (err) {
    console.warn('Weather risk failed:', err);
    showWeatherUnavailable('error');
  }
}

/*
 * Healthy results get a neutral weather-conditions card.
 * If weather data can't be obtained, the card is hidden.
 */
async function renderWeatherConditionsForLocation(location) {
  if (!hasValidLocation(location)) {
    hideWeatherBlock();
    return;
  }

  showWeatherLoading();

  try {
    const weather = await getWeatherRisk(
      location.latitude,
      location.longitude
    );

    const hasMetrics = weather &&
      (weather.temperature !== undefined ||
        weather.humidity !== undefined ||
        weather.rainfall !== undefined);

    if (hasMetrics) {
      drawWeatherConditions(weather);
    } else {
      hideWeatherBlock();
    }
  } catch (err) {
    console.warn('Weather fetch failed:', err);
    hideWeatherBlock();
  }
}


/* =========================================
   FARMER FEEDBACK
   ========================================= */

async function handleFeedbackSubmit(payload) {
  if (!lastScanId) {
    throw new Error('No scan id available for feedback');
  }

  return submitFeedback(
    lastScanId,
    payload.confirmed,
    payload.actualDisease || null
  );
}


/* =========================================
   HOW IT WORKS
   ========================================= */

function initSteps() {
  const container = document.getElementById('stepsGrid');

  if (!container) {
    return;
  }

  const steps = t('howItWorks.steps');

  if (!Array.isArray(steps) || !steps.length) {
    return;
  }

  container.innerHTML = steps.map((step, index) => `
    <article class="step-card">
      <span class="step-number">${String(index + 1).padStart(2, '0')}</span>
      <h3>${step.title}</h3>
      <p>${step.description}</p>
    </article>
  `).join('');
}


/* =========================================
   CROPS
   ========================================= */

function initCrops() {
  const container = document.getElementById('cropsGrid');

  if (!container) {
    return;
  }

  container.innerHTML = cropData.map((crop) => `
    <article class="crop-card" role="listitem">
      <div class="crop-icon">
        ${getCropIcon(crop.name)}
      </div>

      <h3>${crop.name}</h3>

      <p>
        ${crop.diseases} conditions
      </p>
    </article>
  `).join('');
}


/* =========================================
   GLOBAL PAGE NAVIGATION
   ========================================= */

window.openAdvisory = function () {
  window.location.href = '/advisory.html';
};

window.openWeather = function () {
  window.location.href = '/weather.html';
};

window.openHotspot = function () {
  window.location.href = '/hotspot.html';
};

window.openDashboard = function () {
  window.location.href = '/dashboard.html';
};

window.openOfficerLogin = function () {
  window.location.href = '/dashboard.html';
};


document.addEventListener('DOMContentLoaded', init);