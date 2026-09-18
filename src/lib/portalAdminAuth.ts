/** DB-backed portal admin gate — edge functions mirror this check. */

export type PortalUserAuthRow = {
  id: string;
  role: string;
  status: string;
};

export function isActivePortalAdmin(row: PortalUserAuthRow | null | undefined): boolean {
  return row?.role === "admin" && row.status === "active";
}
