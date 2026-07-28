export interface ContactFields {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

export type ContactSubmitState = "idle" | "sending" | "success" | "error";

export interface ContactResult {
  readonly success: boolean;
  readonly message?: string;
}
