// Store functions migrated to API calls
// See: @/services/api.ts

export function getUsername(): string | null {
  return localStorage.getItem("user_name");
}

export function setUsername(name: string) {
  localStorage.setItem("user_name", name);
}
