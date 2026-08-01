import type { SiteEvent } from "@/src/data/events";

/** True when the event has a finite capacity and registered count has filled it. */
export function isEventRegistrationFull(event: Pick<SiteEvent, "capacity" | "registered">): boolean {
  return (
    typeof event.capacity === "number" &&
    event.capacity > 0 &&
    typeof event.registered === "number" &&
    event.registered >= event.capacity
  );
}
