import * as SecureStore from "expo-secure-store";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

const ACCESS_TOKEN_KEY = "rotahub_courier_access_token";
const REFRESH_TOKEN_KEY = "rotahub_courier_refresh_token";
const TOKEN_TYPE_KEY = "rotahub_courier_token_type";

let sessionCache: AuthSession | null = null;

async function hasSecureStore(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export function getSession(): AuthSession | null {
  return sessionCache;
}

export async function loadSession(): Promise<AuthSession | null> {
  const available = await hasSecureStore();
  if (!available) {
    return sessionCache;
  }

  const [accessToken, refreshToken, tokenType] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(TOKEN_TYPE_KEY)
  ]);

  if (!accessToken || !refreshToken) {
    sessionCache = null;
    return null;
  }

  sessionCache = {
    accessToken,
    refreshToken,
    tokenType: tokenType ?? "Bearer"
  };

  return sessionCache;
}

export async function saveSession(session: AuthSession): Promise<void> {
  sessionCache = session;

  const available = await hasSecureStore();
  if (!available) {
    return;
  }

  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken),
    SecureStore.setItemAsync(TOKEN_TYPE_KEY, session.tokenType || "Bearer")
  ]);
}

export async function clearSession(): Promise<void> {
  sessionCache = null;

  const available = await hasSecureStore();
  if (!available) {
    return;
  }

  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(TOKEN_TYPE_KEY)
  ]);
}
