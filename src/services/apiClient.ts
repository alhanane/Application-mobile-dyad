export type ApiError = {
  code?: string;
  message?: string;
};

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export class ApiHttpError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.payload = payload;
  }
}

export type ApiClientOptions = {
  baseUrl: string;
};

async function readJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

export function createApiClient({ baseUrl }: ApiClientOptions) {
  const normalized = baseUrl.replace(/\/+$/, "");

  async function request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const url = `${normalized}${path.startsWith("/") ? "" : "/"}${path}`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // IMPORTANT: sessions PHP via cookies
      body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });

    const payload = await readJsonSafe(res);

    if (!res.ok) {
      // Le backend retourne souvent {success:false,error:{...}} même en 401/422
      const msg =
        payload?.error?.message ||
        payload?.message ||
        `HTTP ${res.status} sur ${path}`;
      throw new ApiHttpError(msg, res.status, payload);
    }

    return payload as ApiResponse<T>;
  }

  return {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  };
}
