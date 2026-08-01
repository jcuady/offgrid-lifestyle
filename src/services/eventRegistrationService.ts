import { isValidEmail, isValidPhone } from "@/src/lib/formValidation";
import { supabase } from "@/src/lib/supabase";

export type EventSkillLevel = "beginner" | "intermediate" | "advanced";

export interface EventRegistrationInput {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  skillLevel: EventSkillLevel;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  skillLevel: EventSkillLevel;
  createdAt: string;
}

export function validateEventRegistrationInput(input: EventRegistrationInput): string | null {
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  if (name.length < 2) return "Enter your full name.";
  if (!isValidEmail(email)) return "Enter a valid email address.";
  if (!isValidPhone(phone)) return "Enter a valid phone number.";
  if (!["beginner", "intermediate", "advanced"].includes(input.skillLevel)) {
    return "Select a skill level.";
  }
  if (!input.eventId.trim()) return "Select an event first.";
  return null;
}

export async function submitEventRegistration(input: EventRegistrationInput): Promise<void> {
  const error = validateEventRegistrationInput(input);
  if (error) throw new Error(error);

  const { error: insertError } = await supabase.from("og_event_registrations").insert({
    event_id: input.eventId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    skill_level: input.skillLevel,
  });

  if (insertError) {
    if (/duplicate|unique/i.test(insertError.message)) {
      throw new Error("You are already registered for this event with that email.");
    }
    throw new Error(insertError.message || "Could not submit registration.");
  }
}

export async function listEventRegistrations(eventId?: string): Promise<EventRegistration[]> {
  let query = supabase
    .from("og_event_registrations")
    .select("id, event_id, name, email, phone, skill_level, created_at")
    .order("created_at", { ascending: false });

  if (eventId) query = query.eq("event_id", eventId);

  const { data, error } = await query;
  if (error) throw new Error(error.message || "Could not load registrations.");

  return (data ?? []).map((row) => ({
    id: row.id as string,
    eventId: row.event_id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    skillLevel: row.skill_level as EventSkillLevel,
    createdAt: row.created_at as string,
  }));
}
