import { initI18n } from './i18n.js';
import { initShell } from './nav.js';
import { renderHistory } from './history.js';

async function init() {
  await initI18n();
  initShell({ page: 'history' });
  renderHistory();
}

document.addEventListener('DOMContentLoaded', init);