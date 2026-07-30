type BackendRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
};

export type BackendApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  setCookie?: string | null;
};

function getBackendBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}

export async function callBackendApi<T>(
  path: string,
  options: BackendRequestOptions = {}
): Promise<BackendApiResult<T>> {
  const { method = "GET", body, headers } = options;

  try {
    const response = await fetch(`${getBackendBaseUrl()}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const raw = await response.text();
    const data = raw ? (JSON.parse(raw) as T & { error?: string; message?: string }) : null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: data as T | null,
        error: data?.error || data?.message || "Backend request failed.",
        setCookie: response.headers.get("set-cookie")
      };
    }

    return {
      ok: true,
      status: response.status,
      data: data as T | null,
      setCookie: response.headers.get("set-cookie")
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? `Backend API is unavailable at ${getBackendBaseUrl()}. ${error.message}`
        : `Backend API is unavailable at ${getBackendBaseUrl()}.`;

    return {
      ok: false,
      status: 503,
      data: null,
      error: message
    };
  }
}
