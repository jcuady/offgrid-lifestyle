/**
 * Portal mounts NotificationBell twice (CSS-hidden mobile + desktop).
 * Channel names must be unique per subscribe() or supabase-js throws:
 * "cannot add postgres_changes callbacks … after subscribe()"
 */
function channelName(userId: string, instanceId: string): string {
  return `og-notifications:${userId}:${instanceId}`;
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const a = channelName("00000000-0000-0000-0000-000000000002", "aaa");
const b = channelName("00000000-0000-0000-0000-000000000002", "bbb");
assert(a !== b, "two mounts must not share channel name");
assert(a.startsWith("og-notifications:00000000-0000-0000-0000-000000000002:"), "prefix");
console.log("useNotifications channel naming selfcheck ok");
