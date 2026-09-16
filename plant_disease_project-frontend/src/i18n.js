import enTranslations from './locales/en.json';
import mrTranslations from './locales/mr.json';

const STORAGE_KEY = 'crop-health-lang';
const DEFAULT_LANG = 'en';

const messages = {
  en: enTranslations,
  mr: mrTranslations
};

let currentLang = DEFAULT_LANG;
let translations = messages[DEFAULT_LANG];

export async function initI18n() {
  const savedLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  currentLang = messages[savedLang] ? savedLang : DEFAULT_LANG;
  translations = messages[currentLang];
  applyTranslations();
  updateLangSelector();
  document.documentElement.lang = currentLang;
  return currentLang;
}

export function getCurrentLang() {
  return currentLang;
}

export async function setLang(lang) {
  if (lang === currentLang) return;
  currentLang = messages[lang] ? lang : currentLang;
  translations = messages[currentLang];
  localStorage.setItem(STORAGE_KEY, currentLang);
  applyTranslations();
  updateLangSelector();
  document.documentElement.lang = currentLang;
}

export function t(key, fallback = '') {
  const value = getNested(translations, key);
  return value || fallback || key;
}

function getNested(obj, path) {
  return path.split('.').reduce((o, k) => (o || {})[k], obj);
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (value) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    }
  });

  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const attrs = el.getAttribute('data-i18n-attr').split(',');
    attrs.forEach(attr => {
      const [key, attrName] = attr.split(':');
      const value = t(key.trim());
      if (value) el.setAttribute(attrName.trim(), value);
    });
  });
}

function updateLangSelector() {
  const selector = document.getElementById('langSelector');
  if (selector) {
    selector.value = currentLang;
  }
}

export function createLangSelector() {
  const select = document.createElement('select');
  select.id = 'langSelector';
  select.className = 'lang-selector';
  select.setAttribute('aria-label', 'Select language');
  select.innerHTML = `
    <option value="en">English</option>
    <option value="mr">मराठी</option>
  `;
  select.value = currentLang;
  select.addEventListener('change', (e) => setLang(e.target.value));
  return select;
}