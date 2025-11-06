export interface TranslationResponse {
  request_id: string;
  translated: string;
  duration_ms: number;
  source_char_length: number;
}

export interface ExecutionResponse {
  request_id: string;
  translated: string;
  stdout: string;
  stderr: string | null;
  duration_ms: number;
  status: "success" | "error" | "timeout";
}

export interface AssistResponse {
  request_id: string;
  message: string;
  model: string | null;
}

export interface ErrorResponse {
  request_id: string;
  timestamp: string;
  error: string;
  detail?: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly payload: ErrorResponse | null;

  constructor(message: string, status: number, payload: ErrorResponse | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const baseUrl = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL || "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
})();

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload.error === "string" && payload.error) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload as ErrorResponse | null);
  }

  return payload as T;
}

export async function translateBagh(source: string) {
  return handleResponse<TranslationResponse>(
    await fetch(`${baseUrl}/api/v1/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    }),
  );
}

export async function executeBagh(source: string) {
  return handleResponse<ExecutionResponse>(
    await fetch(`${baseUrl}/api/v1/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    }),
  );
}

export async function assistWithBagh(prompt: string, context?: string) {
  return handleResponse<AssistResponse>(
    await fetch(`${baseUrl}/api/v1/assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context }),
    }),
  );
}

export async function checkHealth() {
  return handleResponse<{ status: string; environment: string; timestamp: string }>(
    await fetch(`${baseUrl}/health`),
  );
}

export function buildAssetUrl(asset: string) {
  return `${baseUrl}/api/assets/${asset}`;
}
