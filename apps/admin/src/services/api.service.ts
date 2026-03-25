import { APP_CONFIG } from '../config/constants';
import { useAdminUIStore } from '../store/useAdminUIStore';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  isMultipart?: boolean;
}

export const apiService = async (endpoint: string, options: ApiOptions = {}) => {
  const { method = 'GET', body, headers = {}, isMultipart = false } = options;
  const token = useAdminUIStore.getState().token;

  const defaultHeaders: Record<string, string> = {
    ...headers,
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (!isMultipart) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `${APP_CONFIG.API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: defaultHeaders,
    body: isMultipart ? body : (body ? JSON.stringify(body) : undefined),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      useAdminUIStore.getState().logout();
    }
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};
