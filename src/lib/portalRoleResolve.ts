/**
 * Portal role resolution when JWT metadata disagrees with DB status.
 * Keep in sync with og_portal_role() (inactive lockout migration).
 */
export function resolvePortalRoleFromSources(input: {
  activeDbRole: string | null;
  hasPortalRow: boolean;
  jwtPortalRole: string | null;
}): string {
  if (input.activeDbRole) return input.activeDbRole;
  if (input.hasPortalRow) return "customer"; // inactive/non-active row → no elevated role
  return input.jwtPortalRole?.trim() || "customer";
}
