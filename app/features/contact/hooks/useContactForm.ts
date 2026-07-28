"use client";

import { useMemo, useState } from "react";
import {
  isValidContactEmail,
  submitContactMessage,
} from "../services/contactService";
import type {
  ContactFields,
  ContactSubmitState,
} from "../types/contactTypes";

const EMPTY_FIELDS: ContactFields = { name: "", email: "", message: "" };

export function useContactForm() {
  const [fields, setFields] = useState<ContactFields>(EMPTY_FIELDS);
  const [state, setState] = useState<ContactSubmitState>("idle");
  const [error, setError] = useState<string | null>(null);
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() ?? "";
  const configured = accessKey.length > 0;
  const valid = useMemo(
    () =>
      fields.name.trim().length > 0 &&
      isValidContactEmail(fields.email) &&
      fields.message.trim().length >= 10,
    [fields],
  );

  const update = (field: keyof ContactFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
    if (state === "error") setState("idle");
  };

  const submit = async () => {
    setError(null);
    if (!configured || !valid) {
      setState("error");
      setError(
        configured
          ? "Enter your name, a valid email, and a message of at least 10 characters."
          : "Contact delivery is being configured. Please try again later.",
      );
      return;
    }
    setState("sending");
    try {
      const result = await submitContactMessage(fields, accessKey);
      setState(result.success ? "success" : "error");
      if (!result.success) setError(result.message ?? "Message delivery failed.");
    } catch {
      setState("error");
      setError("The network request failed. Please try again.");
    }
  };

  return { fields, state, error, configured, valid, update, submit };
}
