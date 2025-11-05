'use client';

/**
 * API helper that automatically prefixes the backend URL and applies JSON defaults.
 * Keeping the logic in one place makes it trivial to swap transports or add
 * features like tracing headers later on.
 */
export const apiRequest = async <T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    // No content body to parse.
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.message ?? response.statusText;
  } catch (error) {
    return response.statusText;
  }
};
