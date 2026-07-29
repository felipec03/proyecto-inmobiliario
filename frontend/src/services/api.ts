import type {
  Property,
  UserProfile,
  Document,
  ChatMessage,
  MatchResponse,
  MarketTrend,
  UserPreferences,
} from '@/types';

const API_BASE = '/api';

// ---- Token Management ----

function getToken(): string | null {
  return localStorage.getItem('milocal_token');
}

function clearAuth(): void {
  localStorage.removeItem('milocal_token');
  localStorage.removeItem('milocal_user');
}

// ---- HTTP Helpers ----

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  auth?: boolean;
  isFormData?: boolean;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, isFormData = false, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = { ...extraHeaders };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...rest,
    headers,
  });

  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(err.error || err.message || `Error HTTP ${res.status}`);
  }

  return res.json();
}

// ---- Auth ----

export const api = {
  // --- Auth ---
  login: (email: string, password: string) =>
    request<{ user: { id: string; name: string; email: string; type: string }; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        auth: false,
      }
    ),

  register: (name: string, email: string, password: string, type: string, rut?: string) =>
    request<{ user: { id: string; name: string; email: string; type: string }; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password, type, rut }),
        auth: false,
      }
    ),

  getMe: () =>
    request<UserProfile>('/auth/me'),

  // --- Properties ---
  getProperties: (rubro?: string) =>
    request<Property[]>(`/properties${rubro ? `?rubro=${encodeURIComponent(rubro)}` : ''}`),

  getProperty: (id: string) =>
    request<Property>(`/properties/${id}`),

  createProperty: (data: Partial<Property>) =>
    request<Property>('/properties', { method: 'POST', body: JSON.stringify(data) }),

  // --- Users ---
  getUser: (id: string) =>
    request<UserProfile>(`/users/${id}`),

  updateUser: (id: string, data: Partial<UserProfile>) =>
    request<UserProfile>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // --- Documents ---
  verifyDocument: (userId: string, docId: string) =>
    request<Document>(`/users/${userId}/documents/${docId}/verify`, { method: 'POST' }),

  uploadDocument: (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<Document>(`/users/${userId}/documents`, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  // --- Property Contact ---
  contactProperty: (propertyId: string, data: { type: 'visit' | 'proposal'; name: string; email: string; message: string }) =>
    request<{ ok: boolean }>(`/properties/${propertyId}/contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // --- Property Images ---
  uploadPropertyImage: (propertyId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ url: string }>(`/properties/${propertyId}/images`, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  // --- Match ---
  calculateMatch: (propertyId: string, rubro: string, prefs?: UserPreferences) =>
    request<MatchResponse>('/match', {
      method: 'POST',
      body: JSON.stringify({ propertyId, rubro, userPreferences: prefs }),
    }),

  // --- Assessment ---
  submitAssessment: (data: { userType: string; step: number; data: Record<string, unknown> }) =>
    request<{ profile: Record<string, unknown> }>('/assessment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // --- Chat ---
  chat: (prompt: string, history: ChatMessage[], rubro?: string) =>
    request<{ text: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, history, rubro }),
    }),

  // --- Trends ---
  getTrends: (city?: string) =>
    request<MarketTrend>(`/trends?city=${encodeURIComponent(city || 'Santiago')}`),
};

export { clearAuth, getToken };
