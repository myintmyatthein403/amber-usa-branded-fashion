export function getApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
}

/** Unwrap NestJS TransformInterceptor envelope `{ data: T }` */
export function unwrapApiResponse<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}
