import { getScans } from './api.js';
import { t, getCurrentLang } from './i18n.js';

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function prettyDisease(name) {
  if (!name) {
    return t('history.unknownDisease');
  }

  return String(name)
    .replace(/___/g, ' — ')
    .replace(/_/g, ' ');
}

function formatDate(iso) {
  if (!iso) {
    return '—';
  }

  const locale = getCurrentLang() === 'mr' ? 'mr-IN' : 'en-IN';

  try {
    return new Date(iso).toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return String(iso);
  }
}

function formatScanConfidence(value) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return '—';
  }
  return `${Math.round(num * 1000) / 10}%`;
}

function formatCoordinate(value) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return t('history.locationUnavailable');
  }
  return num.toFixed(3);
}

function feedbackStatusKey(scan) {
  if (scan.confirmed === 1) {
    return 'history.feedback.confirmed';
  }
  if (scan.confirmed === 0) {
    return 'history.feedback.incorrect';
  }
  return 'history.feedback.pending';
}

function historyCardHtml(scan) {
  const hasLocation = Number.isFinite(Number(scan.latitude)) &&
    Number.isFinite(Number(scan.longitude));

  return `
    <li class="history-card" role="listitem">
      <div class="history-card-header">
        <div>
          <h3 class="history-disease">${escapeHtml(prettyDisease(scan.disease))}</h3>
          <div class="history-meta">
            <span class="confidence-pill">${escapeHtml(formatScanConfidence(scan.confidence))}</span>
            <span>${escapeHtml(formatDate(scan.created_at))}</span>
            <span>${escapeHtml(t(hasLocation ? 'history.locationAvailable' : 'history.locationUnavailable'))}</span>
            <span>${escapeHtml(t(feedbackStatusKey(scan)))}</span>
          </div>
        </div>
        <button type="button" class="btn btn-outline history-view-btn" data-action="toggle" aria-expanded="false">
          ${escapeHtml(t('history.view'))}
        </button>
      </div>

      <div class="history-details" hidden data-role="details">
        <dl>
          <dt>${escapeHtml(t('history.date'))}</dt>
          <dd>${escapeHtml(formatDate(scan.created_at))}</dd>
          ${hasLocation ? `
            <dt>${escapeHtml(t('history.latitude'))}</dt>
            <dd>${formatCoordinate(scan.latitude)}</dd>
            <dt>${escapeHtml(t('history.longitude'))}</dt>
            <dd>${formatCoordinate(scan.longitude)}</dd>
          ` : ''}
          <dt>${escapeHtml(t('history.confidence'))}</dt>
          <dd>${escapeHtml(formatScanConfidence(scan.confidence))}</dd>
        </dl>
      </div>
    </li>
  `;
}

function bindHistoryToggles() {
  const list = byId('historyList');

  if (!list) {
    return;
  }

  list.querySelectorAll('button[data-action="toggle"]').forEach((button) => {
    if (button.dataset.bound) {
      return;
    }

    button.dataset.bound = 'true';

    button.addEventListener('click', () => {
      const details = button.closest('.history-card')
        ?.querySelector('[data-role="details"]');

      if (!details) {
        return;
      }

      const isOpen = !details.hidden;
      details.hidden = isOpen;
      button.textContent = t(isOpen ? 'history.view' : 'history.hide');
      button.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

function setHistoryState(content, isError = false) {
  const state = byId('historyState');

  if (!state) {
    return;
  }

  state.innerHTML = content;
  state.hidden = false;
  state.className = isError
    ? 'history-state history-error'
    : 'history-state';

  const list = byId('historyList');
  if (list) list.innerHTML = '';
}

function historyLoadingState() {
  setHistoryState(`
    <span class="spinner" aria-hidden="true"></span>
    <span>${escapeHtml(t('history.loading'))}</span>
  `);
}

function historyErrorState() {
  setHistoryState(`
    <span>${escapeHtml(t('history.error'))}</span>
    <button type="button" class="btn btn-outline" data-action="retry-history">
      ${escapeHtml(t('history.retry'))}
    </button>
  `, true);

  const retryBtn = document.querySelector('button[data-action="retry-history"]');
  if (retryBtn && !retryBtn.dataset.bound) {
    retryBtn.dataset.bound = 'true';
    retryBtn.addEventListener('click', renderHistory);
  }
}

function historyEmptyState() {
  setHistoryState(`<span>${escapeHtml(t('history.empty'))}</span>`);
}

export async function renderHistory() {
  const list = byId('historyList');

  if (!list) {
    return;
  }

  historyLoadingState();

  try {
    const scans = await getScans();

    if (!Array.isArray(scans) || !scans.length) {
      historyEmptyState();
      return;
    }

    const state = byId('historyState');
    if (state) state.hidden = true;

    list.innerHTML = scans.map(historyCardHtml).join('');
    bindHistoryToggles();
  } catch (err) {
    console.warn('History loading failed:', err);
    historyErrorState();
  }
}