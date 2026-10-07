export const getAuthToken = (): string => {
  return (
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken") ||
    ""
  );
};

export const getStoredValue = (key: string): string => {
  return localStorage.getItem(key) || sessionStorage.getItem(key) || "";
};

export const clearAuthStorage = (): void => {
  const keys = ["authToken", "name", "avatar", "role", "user_id", "email"];
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const setAuthStorage = (
  payload: Record<string, string>,
  rememberMe: boolean,
): void => {
  clearAuthStorage();
  const storage = rememberMe ? localStorage : sessionStorage;
  Object.entries(payload).forEach(([key, value]) => {
    storage.setItem(key, value ?? "");
  });
};

