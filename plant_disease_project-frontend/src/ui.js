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
  errorChooseAnother: byId('errorChooseAnother')
};

const scannerSteps = [
  elements.stepUpload,
  elements.stepPreview,
  elements.stepAnalyzing,
  elements.stepResult
];

let selectedFile = null;
let options = {};

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
      elements.previewImg.src = e.target.result;
      showStep('preview');
    };
    reader.readAsDataURL(file);
  } else {
    showStep('preview');
  }

  if (typeof options.onFileSelected === 'function') {
    options.onFileSelected(file);
  }
}

export function getSelectedFile() {
  return selectedFile;
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
  const isLowConfidence = data && data.warning && !data.disease;

  hideAllResultBlocks();
  showStep('result');

  if (isLowConfidence) {
    renderLowConfidence(data);
  } else if (isHealthyResult(data)) {
    renderHealthy(data);
  } else {
    renderDisease(data);
  }

  if (typeof options.onResult === 'function') {
    options.onResult(data);
  }
}

function isHealthyResult(data) {
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

function renderLowConfidence(data) {
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
  if (elements.fileInput) elements.fileInput.value = '';
  if (elements.cameraInput) elements.cameraInput.value = '';
  if (elements.previewImg) elements.previewImg.src = '';
  hideAllResultBlocks();
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