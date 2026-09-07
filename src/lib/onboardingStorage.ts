const KEY = "vg-onboarding-seen";

export function isOnboardingSeen(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // stockage indisponible (navigation privée, etc.) — pas bloquant pour une démo
  }
}
