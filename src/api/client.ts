import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { resolveApiBaseUrl } from './resolveApiUrl';
import type {
  AbandonAnalysisResult,
  AuthUser,
  ChatSession,
  DeleteExperienceResult,
  EditExperienceResult,
  Friend,
  RelationshipType,
} from './types';

const TOKEN_KEY = 'vibemeter_auth_token';
const API_URL = resolveApiBaseUrl();
const REQUEST_TIMEOUT_MS = 30_000;
const ANALYSIS_REQUEST_TIMEOUT_MS = 120_000;

if (__DEV__) {
  console.log('[VibeMeter] API URL:', API_URL);
}

let memoryToken: string | null = null;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getStoredToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(TOKEN_KEY)
      : null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string | null): Promise<void> {
  memoryToken = token;
  if (Platform.OS === 'web') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    return;
  }
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<T> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body != null && options.body !== '') {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. Check your connection and try again.',
        0,
      );
    }
    const hint =
      Platform.OS !== 'web' && API_URL.includes('localhost')
        ? ` Cannot reach localhost from a ${Platform.OS} device — set EXPO_PUBLIC_API_URL to your computer's LAN IP (e.g. http://192.168.x.x:3000).`
        : ` Check that the API server is running at ${API_URL}.`;
    throw new ApiError(
      `Network request failed.${hint}`,
      0,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error ?? 'Request failed', response.status);
  }

  return data as T;
}

export const api = {
  register(email: string, password: string) {
    return request<{ user: AuthUser; token: string; }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  login(email: string, password: string) {
    return request<{ user: AuthUser; token: string; }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    return request<{ user: AuthUser; }>('/auth/me');
  },

  listFriends() {
    return request<{ friends: Friend[]; }>('/friends');
  },

  createFriend(data: {
    displayName: string;
    relationshipType: RelationshipType;
    relationshipOther?: string;
  }) {
    return request<{ friend: Friend; }>('/friends', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getFriend(id: string) {
    return request<{ friend: Friend; }>(`/friends/${id}`);
  },

  getMessages(friendId: string) {
    return request<ChatSession>(`/friends/${friendId}/messages`);
  },

  sendMessage(friendId: string, content: string) {
    return request<ChatSession & { messages: ChatSession['messages']; }>(
      `/friends/${friendId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      },
      ANALYSIS_REQUEST_TIMEOUT_MS,
    );
  },

  submitClarification(analysisId: string, answer: string) {
    return request<ChatSession & { messages: ChatSession['messages']; }>(
      `/analyses/${analysisId}/clarifications`,
      {
        method: 'POST',
        body: JSON.stringify({ answer }),
      },
      ANALYSIS_REQUEST_TIMEOUT_MS,
    );
  },

  abandonActiveAnalysis(friendId: string) {
    return request<AbandonAnalysisResult>(`/friends/${friendId}/analyses/abandon`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  deleteExperience(friendId: string, analysisId: string, userMessageId: string) {
    const query = new URLSearchParams({ userMessageId }).toString();
    return request<DeleteExperienceResult>(
      `/friends/${friendId}/analyses/${analysisId}?${query}`,
      {
        method: 'DELETE',
      },
    );
  },

  editExperience(
    friendId: string,
    analysisId: string,
    userMessageId: string,
    content: string,
  ) {
    return request<EditExperienceResult>(
      `/friends/${friendId}/analyses/${analysisId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ userMessageId, content }),
      },
      ANALYSIS_REQUEST_TIMEOUT_MS,
    );
  },
};
