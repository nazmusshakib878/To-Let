const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

/**
 * Resolves full asset URL for listing photos:
 * - If path is already absolute (Cloudinary / HTTPS), returns as is.
 * - If path is a local upload path (/uploads/...) and VITE_API_BASE_URL is set to a remote backend,
 *   prefixes with the remote backend origin.
 */
export function getFullAssetUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (RAW_API_BASE_URL.startsWith('http://') || RAW_API_BASE_URL.startsWith('https://')) {
    try {
      const parsed = new URL(RAW_API_BASE_URL);
      return `${parsed.origin}${path.startsWith('/') ? path : `/${path}`}`;
    } catch {
      // fallback
    }
  }
  return path;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${formattedEndpoint}`;
  const headers = new Headers(options.headers || {});

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `সার্ভার ত্রুটি (${response.status})`;
      throw new ApiError(errorMessage, response.status, data?.errors);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error?.message || 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। সার্ভার চালু আছে কিনা নিশ্চিত করুন।',
      0
    );
  }
}
