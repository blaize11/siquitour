import { Platform } from 'react-native';

function resolveDefaultBaseUrl(): string {
  // Android emulator can't reach the host machine via 127.0.0.1/localhost; it needs
  // the special 10.0.2.2 alias. iOS simulator and web share the host network directly.
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? resolveDefaultBaseUrl();

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown | FormData;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const url = `${API_BASE_URL}/api${path}`;

  console.log('[apiFetch]', {
    method: options.method ?? 'GET',
    url,
    isFormData,
    hasAuthToken: !!authToken,
  });

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      // For FormData: do NOT set Content-Type; browser must set multipart boundary.
      // For JSON: set Content-Type.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: options.body !== undefined ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
    credentials: 'include',
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    // Read response body to get actual error details
    const contentType = response.headers.get('content-type');
    let errorBody: unknown;

    if (contentType?.includes('application/json')) {
      errorBody = await response.json();
    } else {
      errorBody = await response.text();
    }

    console.error('[apiFetch] Request failed', {
      url,
      status: response.status,
      method: options.method ?? 'GET',
      body: isFormData ? '[FormData]' : options.body,
      errorBody,
    });

    throw new ApiError(
      response.status,
      typeof errorBody === 'object' && errorBody !== null && 'message' in errorBody
        ? (errorBody as Record<string, unknown>).message as string
        : typeof errorBody === 'string'
          ? errorBody
          : response.statusText || 'Request failed',
      typeof errorBody === 'object' && errorBody !== null && 'errors' in errorBody
        ? (errorBody as Record<string, unknown>).errors as Record<string, string[]>
        : undefined
    );
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  return payload as T;
}
