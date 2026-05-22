export function sanitizeData<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item)) as any;
  }

  if (typeof data === 'object') {
    const sanitized = { ...data };
    for (const key in sanitized) {
      if (key === 'role' && (sanitized as any)[key] === null) {
        delete (sanitized as any)[key];
      } else if ((sanitized as any)[key] === '') {
        const val = (sanitized as any)[key];
        (sanitized as any)[key] = val === '' ? undefined : val;
      } else if (typeof (sanitized as any)[key] === 'object') {
        (sanitized as any)[key] = sanitizeData((sanitized as any)[key]);
      }
    }
    return sanitized;
  }

  return data;
}
