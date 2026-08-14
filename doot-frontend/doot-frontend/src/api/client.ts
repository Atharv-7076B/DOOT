export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Thin wrapper around fetch for the backend documented in the README.
 * Requests go to `/api/*`, proxied to the Spring Boot server (localhost:8080
 * in dev, see vite.config.ts) so no CORS configuration is needed.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('/api')
    ? path
    : `/api${path.startsWith('/') ? '' : '/'}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { reason?: string; message?: string };
      message = body.reason ?? body.message ?? message;
    } catch {
      // response had no JSON body — fall back to statusText
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
