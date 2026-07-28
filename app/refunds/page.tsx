import { LegalPage } from "../features/legal/components/LegalPage";

export const metadata = { title: "Refunds" };

export default function RefundsPage(): React.JSX.Element {
  return (
    <LegalPage
      title="Support and refunds"
      summary="SecurePDF is free. Payments are optional contributions and do not unlock product features."
      sections={[
        {
          heading: "Voluntary support",
          content: (
            <p>
              A contribution is not a subscription or purchase. The complete
              PDF workspace remains available without payment.
            </p>
          ),
        },
        {
          heading: "Payment issues",
          content: (
            <p>
              For a duplicate or mistaken contribution, use the contact or
              dispute link on the payment provider&apos;s receipt. Requests are
              reviewed using that provider&apos;s transaction record.
            </p>
          ),
        },
        {
          heading: "Delivery",
          content: (
            <p>
              No physical or paid digital item is shipped. A contribution does
              not alter access, storage, processing limits, or service level.
            </p>
          ),
        },
      ]}
    />
  );
}
