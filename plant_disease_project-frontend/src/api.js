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

export async function predictDisease(file, apiUrl, location = {}) {
  const formData = new FormData();
  formData.append('file', file);

  let requestUrl = apiUrl;

  const params = new URLSearchParams();

  if (
    location &&
    Number.isFinite(Number(location.latitude)) &&
    Number.isFinite(Number(location.longitude))
  ) {
    params.set('lat', Number(location.latitude));
    params.set('lon', Number(location.longitude));
  }

  if (params.toString()) {
    requestUrl += requestUrl.includes('?') ? '&' : '?';
    requestUrl += params.toString();
  }

  const response = await fetch(requestUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        message =
          typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
      } else if (errorData.error) {
        message = errorData.error;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}


/* ================================
   AGRIGUARD FEATURE APIs
   ================================ */

export async function getScans() {
  const response = await fetch('/scans');

  if (!response.ok) {
    throw new Error('Failed to load scan history');
  }

  return response.json();
}


export async function submitFeedback(
  scanId,
  confirmed,
  actualDisease = null
) {
  const response = await fetch('/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scan_id: scanId,
      confirmed,
      actual_disease: actualDisease
    })
  });

  if (!response.ok) {
    throw new Error('Failed to submit feedback');
  }

  return response.json();
}


export async function getWeatherRisk(latitude, longitude) {
  const params = new URLSearchParams();

  if (latitude !== undefined && latitude !== null) {
    params.set('lat', latitude);
  }

  if (longitude !== undefined && longitude !== null) {
    params.set('lon', longitude);
  }

  const response = await fetch(`/weather-risk?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to load weather risk');
  }

  return response.json();
}


export async function getDashboardStats() {
  const response = await fetch('/dashboard/stats');

  if (!response.ok) {
    throw new Error('Failed to load dashboard statistics');
  }

  return response.json();
}