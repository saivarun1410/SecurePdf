export interface SupportOption {
  readonly label: string;
  readonly description: string;
  readonly href?: string;
}

export function getSupportOptions(): SupportOption[] {
  return [
    {
      label: "Support from India",
      description: "Pay securely with UPI, card or net banking.",
      href: process.env.NEXT_PUBLIC_SUPPORT_INR_URL,
    },
    {
      label: "Support internationally",
      description: "Pay securely with an international card.",
      href: process.env.NEXT_PUBLIC_SUPPORT_USD_URL,
    },
  ];
}
