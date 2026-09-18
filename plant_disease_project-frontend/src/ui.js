import { t } from './i18n.js';

const RING_CIRCUMFERENCE = 2 * Math.PI * 54;

function byId(id) {
  return document.getElementById(id);
}

const elements = {
  stepUpload: byId('stepUpload'),
  stepPreview: byId('stepPreview'),
  stepAnalyzing: byId('stepAnalyzing'),
  stepResult: byId('stepResult'),
  takePhotoBtn: byId('takePhotoBtn'),
  uploadImageBtn: byId('uploadImageBtn'),
  fileInput: byId('fileInput'),
  cameraInput: byId('cameraInput'),
  chooseAnotherBtn: byId('chooseAnotherBtn'),
  previewImg: byId('previewImg'),
  detectBtn: byId('detectBtn'),
  loadingAnimation: byId('loadingAnimation'),
  resultAnimation: byId('resultAnimation'),
  healthyResult: byId('healthyResult'),
  diseaseResult: byId('diseaseResult'),
  lowConfidenceResult: byId('lowConfidenceResult'),
  healthyActions: byId('healthyActions'),
  healthyConfidenceValue: byId('healthyConfidenceValue'),
  diseaseName: byId('diseaseName'),
  confidenceBadge: byId('confidenceBadge'),
  confidenceValue: byId('confidenceValue'),
  confidenceRing: byId('confidenceRing'),
  lowConfidenceValue: byId('lowConfidenceValue'),
  lowConfidenceRing: byId('lowConfidenceRing'),
  resultDetails: byId('resultDetails'),
  treatmentText: byId('treatmentText'),
  preventionSection: byId('preventionSection'),
  preventionText: byId('preventionText'),
  importantSection: byId('importantSection'),
  importantText: byId('importantText'),
  scanAnotherBtn: byId('scanAnotherBtn'),
  errorState: byId('errorState'),
  errorMessage: byId('errorMessage'),
  errorTryAgain: byId('errorTryAgain'),
  errorChooseAnother: byId('errorChooseAnother'),
  resultImageBlock: byId('resultImageBlock'),
  resultImg: byId('resultImg'),
  locationStatus: byId('locationStatus'),
  weatherRiskBlock: byId('weatherRiskBlock'),
  weatherRiskBadge: byId('weatherRiskBadge'),
  weatherRiskExplanation: byId('weatherRiskExplanation'),
  weatherRiskMetrics: byId('weatherRiskMetrics'),
  weatherTemp: byId('weatherTemp'),
  weatherHumidity: byId('weatherHumidity'),
  weatherRain: byId('weatherRain'),
  weatherRiskUnavailable: byId('weatherRiskUnavailable'),
  feedbackBlock: byId('feedbackBlock'),
  feedbackButtons: byId('feedbackButtons'),
  feedbackYesBtn: byId('feedbackYesBtn'),
  feedbackNoBtn: byId('feedbackNoBtn'),
  feedbackForm: byId('feedbackForm'),
  feedbackDiseaseInput: byId('feedbackDiseaseInput'),
  feedbackSubmitBtn: byId('feedbackSubmitBtn'),
  feedbackCancelBtn: byId('feedbackCancelBtn'),
  feedbackStatus: byId('feedbackStatus')
};

const scannerSteps = [
  elements.stepUpload,
  elements.stepPreview,
  elements.stepAnalyzing,
  elements.stepResult
];

let selectedFile = null;
let selectedPreviewUrl = null;
let options = {};

const LOCATION_PIN_ICON =
  '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

export function init(opts) {
  options = opts || {};

  if (elements.takePhotoBtn) {
    elements.takePhotoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (elements.cameraInput) elements.cameraInput.click();
    });
  }

  if (elements.uploadImageBtn) {
    elements.uploadImageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (elements.fileInput) elements.fileInput.click();
    });
  }

  [elements.fileInput, elements.cameraInput].forEach(input => {
    if (input) {
      input.addEventListener('change', () => {
        if (input.files.length) {
          handleFileSelect(input.files[0]);
        }
      });
    }
  });

  if (elements.chooseAnotherBtn) {
    elements.chooseAnotherBtn.addEventListener('click', clearSelection);
  }

  if (elements.detectBtn) {
    elements.detectBtn.addEventListener('click', () => {
      if (typeof options.onPredict === 'function') options.onPredict();
    });
  }

  if (elements.scanAnotherBtn) {
    elements.scanAnotherBtn.addEventListener('click', clearSelection);
  }

  if (elements.errorTryAgain) {
    elements.errorTryAgain.addEventListener('click', () => {
      if (typeof options.onPredict === 'function') options.onPredict();
    });
  }

  if (elements.errorChooseAnother) {
    elements.errorChooseAnother.addEventListener('click', clearSelection);
  }

  for (const dragArea of document.querySelectorAll('.scanner-card')) {
    dragArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dragArea.classList.add('dragover');
    });
    dragArea.addEventListener('dragleave', () => {
      dragArea.classList.remove('dragover');
    });
    dragArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dragArea.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
  }
}

function handleFileSelect(file) {
  if (!file.type.startsWith('image/')) {
    showError(t('errors.invalidImage', 'Please choose a valid image file.'));
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showError('File size must be less than 10MB.');
    return;
  }

  selectedFile = file;

  if (elements.previewImg) {
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedPreviewUrl = e.target.result;
      elements.previewImg.src = selectedPreviewUrl;
      showStep('preview');
    };
    reader.readAsDataURL(file);
  } else {
    selectedPreviewUrl = null;
    showStep('preview');
  }

  if (typeof options.onFileSelected === 'function') {
    options.onFileSelected(file);
  }
}

export function getSelectedFile() {
  return selectedFile;
}

export function getSelectedPreviewUrl() {
  return selectedPreviewUrl;
}

function showStep(name) {
  scannerSteps.forEach(step => {
    if (step) step.hidden = true;
  });
  if (elements.errorState) elements.errorState.hidden = true;

  const target = {
    upload: elements.stepUpload,
    preview: elements.stepPreview,
    analyzing: elements.stepAnalyzing,
    result: elements.stepResult
  }[name];

  if (target) {
    target.hidden = false;
    const card = target.closest('.scanner-card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function showLoading() {
  if (typeof options.onAnalyzing === 'function') {
    options.onAnalyzing();
  }
  showStep('analyzing');
}

export function hideLoading() {
  // After loading, UI transitions to result/error via showResult/showError.
}

export function showError(message) {
  if (elements.errorMessage) {
    elements.errorMessage.textContent = message;
  }
  showStep('upload');
  if (elements.errorState) {
    elements.errorState.hidden = false;
    elements.errorState.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function showResult(data) {
  const isUncertain = data && data.status === 'uncertain';

  hideAllResultBlocks();
  resetResultExtras();
  setResultImage();
  showStep('result');

  if (isUncertain) {
    renderUncertain(data);
  } else if (isHealthyResult(data)) {
    renderHealthy(data);
  } else {
    renderDisease(data);
  }

  if (typeof options.onResult === 'function') {
    options.onResult(data);
  }
}

function resetResultExtras() {
  if (elements.resultImageBlock) elements.resultImageBlock.hidden = true;
  if (elements.resultImg) {
    elements.resultImg.src = '';
    elements.resultImg.alt = '';
  }
  if (elements.locationStatus) {
    elements.locationStatus.hidden = true;
    elements.locationStatus.textContent = '';
  }
  if (elements.weatherRiskBlock) elements.weatherRiskBlock.hidden = true;
  if (elements.weatherRiskBadge) {
    elements.weatherRiskBadge.hidden = true;
    elements.weatherRiskBadge.textContent = '';
    elements.weatherRiskBadge.className = 'risk-badge';
  }
  if (elements.weatherRiskExplanation) elements.weatherRiskExplanation.textContent = '';
  if (elements.weatherRiskMetrics) elements.weatherRiskMetrics.hidden = true;
  if (elements.weatherRiskUnavailable) {
    elements.weatherRiskUnavailable.hidden = true;
    elements.weatherRiskUnavailable.textContent = '';
  }
  setWeatherTitle('risk');
  resetFeedbackUI();
}

function setResultImage() {
  if (!elements.resultImageBlock || !elements.resultImg) {
    return;
  }

  if (selectedPreviewUrl) {
    elements.resultImg.src = selectedPreviewUrl;
    elements.resultImg.alt = t('result.leafImageAlt');
    elements.resultImageBlock.hidden = false;
  }
}

export function renderLocationStatus(location) {
  if (!elements.locationStatus) {
    return;
  }

  const hasLocation = location &&
    Number.isFinite(Number(location.latitude)) &&
    Number.isFinite(Number(location.longitude));

  elements.locationStatus.innerHTML =
    LOCATION_PIN_ICON + '<span>' +
    escapeHtml(t(hasLocation ? 'location.detected' : 'location.unavailable')) +
    '</span>';
  elements.locationStatus.hidden = false;
}

export function showWeatherLoading() {
  if (!elements.weatherRiskBlock) {
    return;
  }

  elements.weatherRiskBlock.hidden = false;
  if (elements.weatherRiskBadge) elements.weatherRiskBadge.hidden = true;
  if (elements.weatherRiskMetrics) elements.weatherRiskMetrics.hidden = true;
  if (elements.weatherRiskUnavailable) {
    elements.weatherRiskUnavailable.hidden = true;
    elements.weatherRiskUnavailable.textContent = '';
  }
  if (elements.weatherRiskExplanation) {
    elements.weatherRiskExplanation.textContent = t('weather.loading');
  }
}

export function drawWeatherRisk(data) {
  if (!elements.weatherRiskBlock) {
    return;
  }

  const level = String(data.risk_level || '').toLowerCase();

  if (!level || !['low', 'moderate', 'high'].includes(level)) {
    showWeatherUnavailable('error');
    return;
  }

  elements.weatherRiskBlock.hidden = false;
  setWeatherTitle('risk');

  if (elements.weatherRiskBadge) {
    elements.weatherRiskBadge.textContent = t(`weather.riskLevels.${level}`);
    elements.weatherRiskBadge.className = `risk-badge ${level}`;
    elements.weatherRiskBadge.hidden = false;
  }

  if (elements.weatherRiskExplanation) {
    elements.weatherRiskExplanation.textContent = t(`weather.explanations.${level}`);
  }

  renderWeatherMetrics(data);
}

function renderWeatherMetrics(data) {
  if (elements.weatherTemp) {
    elements.weatherTemp.textContent =
      `${formatValue(data.temperature)}${t('weather.units.celsius')}`;
  }

  if (elements.weatherHumidity) {
    const humidity =
      data.humidity !== undefined
        ? data.humidity
        : data.relative_humidity;
    elements.weatherHumidity.textContent =
      `${formatValue(humidity)}${t('weather.units.percent')}`;
  }

  if (elements.weatherRain) {
    elements.weatherRain.textContent =
      `${formatValue(data.rainfall)}${t('weather.units.mm')}`;
  }

  if (elements.weatherRiskMetrics) elements.weatherRiskMetrics.hidden = false;
  if (elements.weatherRiskUnavailable) {
    elements.weatherRiskUnavailable.hidden = true;
  }
}

function setWeatherTitle(mode) {
  if (!elements.weatherRiskBlock) {
    return;
  }

  const title = elements.weatherRiskBlock.querySelector('.weather-risk-title');
  if (!title) {
    return;
  }

  if (mode === 'conditions') {
    title.textContent = t('result.weatherConditions');
    title.removeAttribute('data-i18n');
  } else {
    title.textContent = t('result.weatherRisk');
    title.setAttribute('data-i18n', 'result.weatherRisk');
  }
}

export function drawWeatherConditions(data) {
  if (!elements.weatherRiskBlock) {
    return;
  }

  elements.weatherRiskBlock.hidden = false;
  setWeatherTitle('conditions');

  if (elements.weatherRiskBadge) {
    elements.weatherRiskBadge.hidden = true;
    elements.weatherRiskBadge.textContent = '';
    elements.weatherRiskBadge.className = 'risk-badge';
  }

  if (elements.weatherRiskExplanation) {
    elements.weatherRiskExplanation.textContent = t('result.weatherMonitored');
  }

  renderWeatherMetrics(data);
}

export function hideWeatherBlock() {
  if (elements.weatherRiskBlock) elements.weatherRiskBlock.hidden = true;
}

export function showWeatherUnavailable(reason = 'error') {
  if (!elements.weatherRiskBlock) {
    return;
  }

  elements.weatherRiskBlock.hidden = false;

  if (elements.weatherRiskBadge) elements.weatherRiskBadge.hidden = true;
  if (elements.weatherRiskMetrics) elements.weatherRiskMetrics.hidden = true;
  if (elements.weatherRiskExplanation) {
    elements.weatherRiskExplanation.textContent = '';
  }

  const messageKey = reason === 'location'
    ? 'weather.unavailableLocation'
    : 'weather.unavailableError';

  if (elements.weatherRiskUnavailable) {
    elements.weatherRiskUnavailable.textContent = t(messageKey);
    elements.weatherRiskUnavailable.hidden = false;
  }
}

function formatValue(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return String(Math.round(num * 10) / 10);
}

/* =========================================
   FEEDBACK
   ========================================= */

let feedbackCallback = null;
let feedbackBusy = false;

function resetFeedbackUI() {
  feedbackBusy = false;

  if (elements.feedbackBlock) elements.feedbackBlock.hidden = true;
  if (elements.feedbackButtons) elements.feedbackButtons.hidden = false;
  if (elements.feedbackForm) elements.feedbackForm.hidden = true;
  if (elements.feedbackStatus) {
    elements.feedbackStatus.hidden = true;
    elements.feedbackStatus.textContent = '';
    elements.feedbackStatus.className = 'feedback-status';
  }

  if (elements.feedbackDiseaseInput) {
    elements.feedbackDiseaseInput.value = '';
  }

  setFeedbackEnabled(true);
}

function setFeedbackEnabled(enabled) {
  [elements.feedbackYesBtn, elements.feedbackNoBtn, elements.feedbackSubmitBtn].forEach((btn) => {
    if (btn) btn.disabled = !enabled;
  });
}

function setFeedbackStatus(type, message) {
  if (!elements.feedbackStatus) {
    return;
  }

  elements.feedbackStatus.textContent = message;
  elements.feedbackStatus.hidden = false;
  elements.feedbackStatus.className = type ? `feedback-status ${type}` : 'feedback-status';
}

function showFeedbackButtons() {
  if (elements.feedbackButtons) elements.feedbackButtons.hidden = false;
  if (elements.feedbackForm) elements.feedbackForm.hidden = true;
  if (elements.feedbackDiseaseInput) elements.feedbackDiseaseInput.value = '';
}

function showFeedbackForm() {
  if (elements.feedbackButtons) elements.feedbackButtons.hidden = true;
  if (elements.feedbackForm) elements.feedbackForm.hidden = false;
  if (elements.feedbackStatus) {
    elements.feedbackStatus.hidden = true;
    elements.feedbackStatus.textContent = '';
    elements.feedbackStatus.className = 'feedback-status';
  }
  if (elements.feedbackDiseaseInput) elements.feedbackDiseaseInput.focus();
}

function submitFeedback(payload) {
  if (feedbackBusy || typeof feedbackCallback !== 'function') {
    return;
  }

  feedbackBusy = true;
  setFeedbackEnabled(false);
  setFeedbackStatus('', t('result.feedbackProcessing'));

  Promise.resolve(feedbackCallback(payload))
    .then(() => {
      setFeedbackEnabled(false);
      if (elements.feedbackButtons) elements.feedbackButtons.hidden = true;
      if (elements.feedbackForm) elements.feedbackForm.hidden = true;
      setFeedbackStatus('success', t('result.feedbackSuccess'));
    })
    .catch(() => {
      feedbackBusy = false;
      setFeedbackEnabled(true);
      showFeedbackButtons();
      setFeedbackStatus('error', t('result.feedbackError'));
    });
}

export function initResultFeedback(onSubmit) {
  feedbackCallback = onSubmit || null;

  if (!elements.feedbackYesBtn || elements.feedbackYesBtn.dataset.bound) {
    return;
  }

  elements.feedbackYesBtn.dataset.bound = 'true';

  elements.feedbackYesBtn.addEventListener('click', () => {
    submitFeedback({ confirmed: true, actualDisease: null });
  });

  elements.feedbackNoBtn.addEventListener('click', () => {
    showFeedbackForm();
  });

  elements.feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const disease = elements.feedbackDiseaseInput
      ? elements.feedbackDiseaseInput.value.trim()
      : '';
    submitFeedback({
      confirmed: false,
      actualDisease: disease || null
    });
  });

  elements.feedbackCancelBtn.addEventListener('click', () => {
    showFeedbackButtons();
    if (elements.feedbackStatus) {
      elements.feedbackStatus.hidden = true;
      elements.feedbackStatus.textContent = '';
      elements.feedbackStatus.className = 'feedback-status';
    }
  });
}

export function showResultFeedback() {
  if (!elements.feedbackBlock) {
    return;
  }

  resetFeedbackUI();
  elements.feedbackBlock.hidden = false;
}

export function isHealthyResult(data) {
  return !!(data && data.disease && /healthy/i.test(data.disease));
}

function hideAllResultBlocks() {
  [elements.healthyResult, elements.diseaseResult, elements.lowConfidenceResult].forEach(el => {
    if (el) el.hidden = true;
  });
  if (elements.resultDetails) elements.resultDetails.hidden = true;
}

function renderHealthy(data) {
  if (elements.healthyResult) elements.healthyResult.hidden = false;

  const confidence = clampConfidence(data.confidence);

  if (elements.healthyConfidenceValue) {
    elements.healthyConfidenceValue.textContent = `${confidence}%`;
  }

  const actions = t('result.healthy.actions');
  if (elements.healthyActions && Array.isArray(actions)) {
    elements.healthyActions.innerHTML = actions
      .map(action => `<li>${escapeHtml(action)}</li>`)
      .join('');
  } else if (elements.healthyActions) {
    elements.healthyActions.innerHTML = '';
  }
}

function renderDisease(data) {
  if (elements.diseaseResult) elements.diseaseResult.hidden = false;

  const prettyName = String(data.disease)
    .replace(/___/g, ' — ')
    .replace(/_/g, ' ');

  if (elements.diseaseName) elements.diseaseName.textContent = prettyName;

  const confidence = clampConfidence(data.confidence);

  if (elements.confidenceBadge) {
    elements.confidenceBadge.textContent = `${confidence}%`;
    elements.confidenceBadge.className = 'confidence-badge confident';
  }
  if (elements.confidenceValue) elements.confidenceValue.textContent = `${confidence}%`;
  setRingProgress(elements.confidenceRing, confidence);

  if (elements.resultDetails) elements.resultDetails.hidden = false;
  if (elements.treatmentText) elements.treatmentText.textContent = data.remedy || '';

  if (elements.preventionSection) elements.preventionSection.hidden = true;
  if (elements.importantSection) elements.importantSection.hidden = true;
}

function renderUncertain(data) {
  if (elements.lowConfidenceResult) elements.lowConfidenceResult.hidden = false;

  const confidence = clampConfidence(data.confidence);

  if (elements.lowConfidenceValue) {
    elements.lowConfidenceValue.textContent = `${confidence}%`;
  }
  setRingProgress(elements.lowConfidenceRing, confidence, true);
}

function clampConfidence(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function setRingProgress(element, percentage, isWarning = false) {
  if (!element) return;
  const offset = RING_CIRCUMFERENCE * (1 - percentage / 100);
  element.style.strokeDashoffset = offset;
  element.classList.toggle('warning', isWarning);
}

export function clearSelection() {
  selectedFile = null;
  selectedPreviewUrl = null;
  if (elements.fileInput) elements.fileInput.value = '';
  if (elements.cameraInput) elements.cameraInput.value = '';
  if (elements.previewImg) elements.previewImg.src = '';
  hideAllResultBlocks();
  resetResultExtras();
  showStep('upload');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}