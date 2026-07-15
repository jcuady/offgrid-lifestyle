const STORAGE_KEY = "og_custom_team_prompt_dismissed";

export function isCustomTeamPromptDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissCustomTeamPrompt(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}
