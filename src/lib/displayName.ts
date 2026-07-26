/** Self-service portal display-name validation. */
export function validateDisplayName(current: string, next: string): string | null {
  const trimmed = next.trim();
  if (trimmed.length < 2) return "Enter a name with at least 2 characters.";
  if (trimmed === current.trim()) return "New name must be different from your current name.";
  return null;
}
