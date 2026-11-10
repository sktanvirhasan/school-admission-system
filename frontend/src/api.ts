import { API_BASE_URL } from './config';
import { bn } from './i18n/bn';
import { en } from './i18n/en';
import type {
  ClassItem,
  CreateClassRequest,
  CreateClassResponse,
  HoldCreatedResponse,
  HoldStatusResponse,
  HoldConfirmedResponse,
  MyHold,
} from './types';

export class AppApiError extends Error {
  statusCode: number;
  userMessage: string;

  constructor(statusCode: number, message: string, userMessage: string) {
    super(message);
    this.name = 'AppApiError';
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}

export function translateBackendError(status: number, message: string): string {
  const currentLang = localStorage.getItem('school_admission_language') === 'en' ? 'en' : 'bn';
  const dict = currentLang === 'en' ? en.apiErrors : bn.apiErrors;
  const lower = message.toLowerCase();

  if (lower.includes('no seats available')) return dict.no_seats;
  if (lower.includes('already have an active application')) return dict.already_applied;
  if (lower.includes('expired') || lower.includes('cancelled')) return dict.expired_or_cancelled;
  if (lower.includes('another student') || status === 403) return dict.another_student;
  if (lower.includes('confirmed application cannot be cancelled')) return dict.confirmed_cant_cancel;
  if (lower.includes('17 digits') || lower.includes('x-student-id')) return dict.id_invalid;
  if (lower.includes('class not found') || (status === 404 && lower.includes('class'))) return dict.class_not_found;
  if (lower.includes('hold not found') || (status === 404 && lower.includes('hold'))) return dict.hold_not_found;
  if (lower.includes('class name is required') || lower.includes('totalseats')) return dict.invalid_input;
  if (status >= 500) return dict.server_error;

  return message || dict.default_error;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  studentId?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  headers.set('Accept', 'application/json');

  if (options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (studentId) {
    headers.set('X-Student-Id', studentId.trim());
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    const currentLang = localStorage.getItem('school_admission_language') === 'en' ? 'en' : 'bn';
    const netErr = currentLang === 'en' ? en.apiErrors.network_error : bn.apiErrors.network_error;
    throw new AppApiError(
      0,
      networkError instanceof Error ? networkError.message : 'Network error',
      netErr
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      if (data && typeof data.message === 'string') {
        errorMessage = data.message;
      }
    } catch {}
    const userFriendlyMessage = translateBackendError(response.status, errorMessage);
    throw new AppApiError(response.status, errorMessage, userFriendlyMessage);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

export const api = {
  getClasses: () => request<ClassItem[]>('/classes'),
  getClass: (classId: string) => request<ClassItem>(`/classes/${encodeURIComponent(classId)}`),
  createClass: (payload: CreateClassRequest) =>
    request<CreateClassResponse>('/classes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createHold: (classId: string, studentId: string) =>
    request<HoldCreatedResponse>(
      `/classes/${encodeURIComponent(classId)}/holds`,
      { method: 'POST' },
      studentId
    ),
  getHold: (holdId: string) =>
    request<HoldStatusResponse>(`/holds/${encodeURIComponent(holdId)}`),
  confirmHold: (holdId: string, studentId: string) =>
    request<HoldConfirmedResponse>(
      `/holds/${encodeURIComponent(holdId)}/confirm`,
      { method: 'POST' },
      studentId
    ),
  cancelHold: (holdId: string, studentId: string) =>
    request<void>(
      `/holds/${encodeURIComponent(holdId)}`,
      { method: 'DELETE' },
      studentId
    ),
  getMyHolds: (studentId: string) =>
    request<MyHold[]>('/me/holds', { method: 'GET' }, studentId),
};
