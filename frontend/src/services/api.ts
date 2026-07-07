const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getProperties: (rubro?: string) =>
    request<Property[]>(`/properties${rubro ? `?rubro=${encodeURIComponent(rubro)}` : ''}`),

  getProperty: (id: string) =>
    request<Property>(`/properties/${id}`),

  createProperty: (data: Partial<Property>) =>
    request<Property>('/properties', { method: 'POST', body: JSON.stringify(data) }),

  getUser: (id: string) =>
    request<UserProfile>(`/users/${id}`),

  updateUser: (id: string, data: Partial<UserProfile>) =>
    request<UserProfile>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  verifyDocument: (userId: string, docId: string) =>
    request<Document>(`/users/${userId}/documents/${docId}/verify`, { method: 'POST' }),

  calculateMatch: (propertyId: string, rubro: string) =>
    request<MatchResponse>('/match', {
      method: 'POST',
      body: JSON.stringify({ propertyId, rubro }),
    }),

  submitAssessment: (data: { userType: string; step: number; data: Record<string, unknown> }) =>
    request<{ profile: Record<string, unknown> }>('/assessment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  chat: (prompt: string, history: ChatMessage[], rubro?: string) =>
    request<{ text: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, history, rubro }),
    }),

  getTrends: (city: string) =>
    request<MarketTrend>(`/trends?city=${encodeURIComponent(city)}`),
};

import type { Property, UserProfile, Document, ChatMessage, MatchResponse, MarketTrend } from '@/types';
