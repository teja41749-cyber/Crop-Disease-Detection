import {
  setLang,
  applyTranslations,
  updateLangSelector
} from './i18n.js';

const LOGO_SVG = `
  <svg class="navbar-logo" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M29 5C19 9 11 17 9 25c5 3 12 0 13-6 1-3 3-8 7-14z" fill="currentColor" opacity="0.9"/>
    <line x1="27" y1="7" x2="12" y2="22" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="0.55"/>
    <circle cx="18" cy="13" r="7" stroke="currentColor" stroke-width="2.75" fill="none"/>
    <line x1="23" y1="18" x2="29" y2="24" stroke="currentColor" stroke-width="2.75" stroke-linecap="round"/>
  </svg>
`;

const FOOTER_LOGO_SVG = `
  <svg class="footer-logo" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M29 5C19 9 11 17 9 25c5 3 12 0 13-6 1-3 3-8 7-14z" fill="currentColor" opacity="0.9"/>
    <line x1="27" y1="7" x2="12" y2="22" stroke="#1B3A24" stroke-width="1" stroke-linecap="round" opacity="0.45"/>
    <circle cx="18" cy="13" r="7" stroke="currentColor" stroke-width="2.75" fill="none"/>
    <line x1="23" y1="18" x2="29" y2="24" stroke="currentColor" stroke-width="2.75" stroke-linecap="round"/>
  </svg>
`;

const HAMBURGER_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
`;

const NAV_ITEMS = [
  { key: 'scan', href: '/', labelKey: 'nav.scan' },
  { key: 'history', href: '/history.html', labelKey: 'nav.history' },
  { key: 'weather', href: '/weather.html', labelKey: 'nav.weather' },
  { key: 'hotspots', href: '/hotspot.html', labelKey: 'nav.hotspots' },
  { key: 'dashboard', href: '/dashboard.html', labelKey: 'nav.dashboard' }
];

const FOOTER_LINKS = [
  { href: '/', labelKey: 'nav.scan' },
  { href: '/history.html', labelKey: 'nav.history' },
  { href: '/weather.html', labelKey: 'nav.weather' },
  { href: '/hotspot.html', labelKey: 'nav.hotspots' },
  { href: '/dashboard.html', labelKey: 'nav.dashboard' }
];

function buildLink(item, page) {
  const href = (item.key === 'scan' && page === 'home') ? '#scanner' : item.href;
  const active = item.key === page;
  const ariaCurrent = active ? ' aria-current="page"' : '';
  const activeClass = active ? ' navbar-link-active' : '';
  return (
    `<a href="${href}" class="navbar-link${activeClass}" data-i18n="${item.labelKey}"${ariaCurrent}></a>`
  );
}

function buildMobileLink(item, page) {
  const href = (item.key === 'scan' && page === 'home') ? '#scanner' : item.href;
  return `<a href="${href}" class="mobile-menu-link" data-i18n="${item.labelKey}"></a>`;
}

function buildNavbar(page) {
  const links = NAV_ITEMS.map((item) => buildLink(item, page)).join('');
  const mobileLinks = NAV_ITEMS.map((item) => buildMobileLink(item, page)).join('');
  const ctaHref = (page === 'home') ? '#scanner' : '/';

  return `
    <header class="navbar" role="banner">
      <div class="container navbar-inner">
        <a href="/" class="navbar-brand" aria-label="Agrigaurd Home" data-i18n-attr="app.name:aria-label">
          ${LOGO_SVG}
          <span class="navbar-title" data-i18n="app.name">Agrigaurd</span>
        </a>

        <nav class="navbar-nav" aria-label="Main navigation">
          ${links}
        </nav>

        <div class="lang-selector-wrapper">
          <label for="langSelector" class="sr-only" data-i18n="lang.select">Select language</label>
          <select id="langSelector" class="lang-selector" aria-label="Select language">
            <option value="en" data-i18n="lang.english">English</option>
            <option value="mr" data-i18n="lang.marathi">मराठी</option>
          </select>
        </div>

        <a href="${ctaHref}" class="btn btn-primary navbar-cta" data-i18n="hero.scanLeaf">Scan a Leaf</a>

        <button class="mobile-menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
          ${HAMBURGER_SVG}
        </button>
      </div>

      <div class="mobile-menu" id="mobileMenu" hidden>
        ${mobileLinks}
      </div>
    </header>
  `;
}

function buildFooter() {
  const links = FOOTER_LINKS.map(
    (item) => `<a href="${item.href}" class="footer-link" data-i18n="${item.labelKey}"></a>`
  ).join('');

  return `
    <footer class="footer" role="contentinfo">
      <div class="container footer-inner">
        <div class="footer-brand">
          ${FOOTER_LOGO_SVG}
          <p data-i18n="app.name">Agrigaurd</p>
        </div>
        <p class="footer-copyright" data-i18n="footer.copyright">AI-powered crop health analysis for farmers</p>
        <div class="footer-links">
          ${links}
        </div>
        <p class="footer-disclaimer" data-i18n="footer.disclaimer">This tool provides AI-assisted detection for informational purposes.</p>
      </div>
    </footer>
  `;
}

function bindMobileMenu() {
  const button = document.querySelector('.mobile-menu-btn');
  const menu = document.getElementById('mobileMenu');

  if (!button || !menu || button.dataset.bound) {
    return;
  }

  button.dataset.bound = 'true';

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    menu.hidden = isOpen;
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      button.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    });
  });
}

function bindLangSelector() {
  const selector = document.getElementById('langSelector');

  if (!selector || selector.dataset.bound) {
    return;
  }

  selector.dataset.bound = 'true';

  selector.addEventListener('change', (event) => {
    setLang(event.target.value);
  });
}

export function initShell({ page = 'home' } = {}) {
  const navMount = document.getElementById('shell-nav');
  const footerMount = document.getElementById('shell-footer');

  if (navMount) {
    navMount.innerHTML = buildNavbar(page);
  }

  if (footerMount) {
    footerMount.innerHTML = buildFooter();
  }

  applyTranslations();
  updateLangSelector();
  bindLangSelector();
  bindMobileMenu();
}