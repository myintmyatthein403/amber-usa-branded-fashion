import { APP_CONFIG } from '../config/constants';
import { useAdminUIStore } from '../store/useAdminUIStore';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiOptions<T = unknown> {
  method?: HttpMethod;
  body?: T;
  headers?: Record<string, string>;
  isMultipart?: boolean;
}

export const apiService = async <T = unknown, R = unknown>(endpoint: string, options: ApiOptions<T> = {}): Promise<R> => {
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
    body: isMultipart ? body as BodyInit : (body ? JSON.stringify(body) : undefined),
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
