import {
  getApiUrl,
  predictDisease
} from './api.js';

import {
  init as initUi,
  getSelectedFile,
  showLoading,
  showError,
  showResult
} from './ui.js';

import {
  initI18n,
  setLang as setLocale,
  t
} from './i18n.js';

import {
  createLeafScanAnimation,
  createLoadingAnimation,
  createResultAnimation
} from './animation.js';

import {
  cropData,
  getCropIcon
} from './crops.js';


let heroAnim = null;
let loadingAnim = null;
let resultAnim = null;


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


/* =========================================
   MAIN INITIALIZATION
   ========================================= */

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
       Keep ORIGINAL result UI
       ----------------------------------------- */

    showResult(data);

  } catch (err) {
    showError(
      `${t('errors.analysisFailed')} (${err.message})`
    );
  }
}


/* =========================================
   HOW IT WORKS
   ========================================= */

function initSteps() {
  const container = document.getElementById('stepsGrid');

  if (!container) {
    return;
  }

  const steps = [
    {
      number: '01',
      title: 'Take a Photo',
      description: 'Capture a clear photo of the crop leaf.'
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our AI analyzes the leaf for possible disease.'
    },
    {
      number: '03',
      title: 'Get Guidance',
      description: 'View the detected condition and recommended guidance.'
    }
  ];

  container.innerHTML = steps.map((step) => `
    <article class="step-card">
      <span class="step-number">${step.number}</span>
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
        ${crop.diseaseCount} conditions
      </p>
    </article>
  `).join('');
}


/* =========================================
   MOBILE MENU
   ========================================= */

function initMobileMenu() {
  const button = document.querySelector('.mobile-menu-btn');
  const menu = document.getElementById('mobileMenu');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute(
      'aria-expanded',
      String(!isOpen)
    );

    menu.hidden = isOpen;
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      button.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    });
  });
}


/* =========================================
   LANGUAGE SELECTOR
   ========================================= */

function initLangSelector() {
  const selector = document.getElementById('langSelector');

  if (!selector) {
    return;
  }

  selector.addEventListener('change', async (event) => {
    await setLocale(event.target.value);
  });
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

window.openOfficerLogin = function () {
  window.location.href = '/officer-login.html';
};


document.addEventListener('DOMContentLoaded', init);