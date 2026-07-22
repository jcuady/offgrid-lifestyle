import { isValidEmail, validatePassword } from "@/src/lib/formValidation";

/** Pure validation for self-service credential forms (ChangeEmail / ChangePassword). */

export function validateChangeEmailInput(input: {
  currentEmail: string;
  newEmail: string;
  confirmEmail: string;
}): string | null {
  const next = input.newEmail.trim().toLowerCase();
  const confirm = input.confirmEmail.trim().toLowerCase();
  if (!isValidEmail(next)) return "Enter a valid email address.";
  if (next === input.currentEmail.trim().toLowerCase()) {
    return "New email must be different from your current email.";
  }
  if (next !== confirm) return "Email addresses do not match.";
  return null;
}

export function validateChangePasswordInput(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): string | null {
  if (!input.currentPassword) return "Enter your current password.";
  const pwErr = validatePassword(input.newPassword);
  if (pwErr) return pwErr;
  if (input.newPassword !== input.confirmPassword) return "Passwords do not match.";
  if (input.newPassword === input.currentPassword) {
    return "New password must be different from your current password.";
  }
  return null;
}
