import { APP_CONFIG } from '../config/constants';
import { useAdminUIStore } from '../store/useAdminUIStore';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiOptions<T = unknown> {
  method?: HttpMethod;
  body?: T;
  headers?: Record<string, string>;
  isMultipart?: boolean;
}

// Backend validation failures (ZodValidationPipe) send { message, errors: [{path,message}] };
// some endpoints attach extra structured fields (e.g. category-delete's
// subcategoryCount/productCount). Previously only `.message` survived the
// throw — this preserves the rest so callers can render field-level errors
// or act on the extra data instead of a generic "Validation failed" toast.
export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  errors?: Array<{ path: string; message: string }>;

  constructor(message: string, status: number, data: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.errors = data.errors as Array<{ path: string; message: string }> | undefined;
  }
}

// Renders field-level Zod validation errors (e.g. "price: must be positive")
// when present, falling back to the generic message otherwise.
export function formatApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (error instanceof ApiError && error.errors?.length) {
    const fieldErrors = error.errors.map((e) => `${e.path}: ${e.message}`).join('; ');
    return `${error.message} — ${fieldErrors}`;
  }
  if (error instanceof Error) return error.message;
  return fallback;
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
    throw new ApiError(
      errorData.message || `API Error: ${response.status}`,
      response.status,
      errorData,
    );
  }

  return response.json();
};
