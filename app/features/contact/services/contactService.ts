import type {
  ContactFields,
  ContactResult,
} from "../types/contactTypes";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export function isValidContactEmail(value: string): boolean {
  const normalized = value.trim();
  return (
    normalized.includes("@") &&
    normalized.includes(".") &&
    !normalized.includes(" ")
  );
}

export async function submitContactMessage(
  fields: ContactFields,
  accessKey: string,
): Promise<ContactResult> {
  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `SecurePDF contact from ${fields.name.trim()}`,
      from_name: "SecurePDF contact",
      name: fields.name.trim(),
      email: fields.email.trim(),
      replyto: fields.email.trim(),
      message: fields.message.trim(),
      source: "securepdf-contact",
      botcheck: "",
    }),
  });
  const result = (await response.json().catch(() => null)) as ContactResult | null;
  if (!response.ok || !result?.success) {
    return {
      success: false,
      message: result?.message ?? "The contact service could not accept the message.",
    };
  }
  return { success: true };
}
