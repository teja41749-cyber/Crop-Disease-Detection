import { getDashboardStats } from './api.js';
import { initI18n, t } from './i18n.js';
import { initShell } from './nav.js';

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

function setState(message, isError = false) {
  const state = byId('dashboardState');

  if (!state) {
    return;
  }

  state.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>' +
    escapeHtml(message) + '</span>';
  state.hidden = false;
  state.className = 'dashboard-state' + (isError ? ' dashboard-error' : '');

  const content = byId('dashboardContent');
  if (content) content.hidden = true;
}

function emptyMessage(message) {
  const state = byId('dashboardState');

  if (!state) {
    return;
  }

  state.innerHTML = `<span>${escapeHtml(message)}</span>`;
  state.hidden = false;
  state.className = 'dashboard-state';

  const content = byId('dashboardContent');
  if (content) content.hidden = true;
}

function renderDiseaseBars(diseaseCounts) {
  const container = byId('diseaseBars');

  if (!container) {
    return;
  }

  if (!Array.isArray(diseaseCounts) || !diseaseCounts.length) {
    container.innerHTML = `<p class="state-msg">${escapeHtml(t('dashboard.empty'))}</p>`;
    return;
  }

  const max = Math.max(...diseaseCounts.map((item) => Number(item.count) || 0));

  container.innerHTML = diseaseCounts.map((item) => {
    const count = Number(item.count) || 0;
    const width = max > 0 ? Math.round((count / max) * 100) : 0;

    return `
      <div class="bar-item">
        <span class="bar-label" title="${escapeHtml(item.disease || t('dashboard.unknown'))}">
          ${escapeHtml(item.disease || t('dashboard.unknown'))}
        </span>
        <span class="bar-track">
          <span class="bar-fill" style="width:${width}%"></span>
        </span>
        <span class="bar-value">${count}</span>
      </div>
    `;
  }).join('');
}

function renderDistrictTable(districtCounts) {
  const container = byId('districtTableWrap');

  if (!container) {
    return;
  }

  if (!Array.isArray(districtCounts) || !districtCounts.length) {
    container.innerHTML = `<p class="state-msg">${escapeHtml(t('dashboard.empty'))}</p>`;
    return;
  }

  const rows = districtCounts.map((item) => `
    <tr>
      <td>${escapeHtml(item.district || t('dashboard.unknown'))}</td>
      <td>${Number(item.count) || 0}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="district-table-wrap">
      <table class="district-table">
        <thead>
          <tr>
            <th scope="col" data-i18n="dashboard.tableDistrict">District</th>
            <th scope="col" data-i18n="dashboard.tableScans">Scans</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderStats(stats) {
  const content = byId('dashboardContent');

  if (!content) {
    return;
  }

  const hasData = Number(stats.total_scans) > 0;

  if (!hasData) {
    emptyMessage(t('dashboard.empty'));
    return;
  }

  const total = byId('statTotal');
  if (total) total.textContent = String(Number(stats.total_scans) || 0);

  const pending = byId('statPending');
  if (pending) pending.textContent = String(Number(stats.pending_confirmations) || 0);

  renderDiseaseBars(stats.disease_counts);
  renderDistrictTable(stats.district_counts);

  const state = byId('dashboardState');
  if (state) state.hidden = true;

  content.hidden = false;
}

async function loadStats() {
  setState(t('dashboard.loading'));

  try {
    const stats = await getDashboardStats();
    renderStats(stats || {});
  } catch (error) {
    console.warn('Dashboard loading failed:', error);
    setState(t('dashboard.error'), true);
  }
}

async function init() {
  await initI18n();
  initShell({ page: 'dashboard' });
  loadStats();
}

document.addEventListener('DOMContentLoaded', init);