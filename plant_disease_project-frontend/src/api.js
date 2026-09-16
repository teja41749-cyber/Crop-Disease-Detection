const API_URL_KEY = 'plant_disease_api_url';
const DEFAULT_API_URL = '/predict';

export function getApiUrl() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

export function setApiUrl(url) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(API_URL_KEY, url.trim());
  }
}

export async function predictDisease(file, apiUrl) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    let message = `Server responded with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        message = Array.isArray(errorData.detail)
          ? errorData.detail.map(d => d.msg || JSON.stringify(d)).join(', ')
          : errorData.detail;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json();
}