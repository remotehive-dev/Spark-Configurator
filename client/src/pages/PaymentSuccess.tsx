import { useEffect } from "react";

export default function PaymentSuccess() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const payload = {
        type: "payment-success",
        txn: params.get("txn") || params.get("transaction_id") || null,
      };
      window.parent?.postMessage(payload, window.location.origin);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-2">
        <div className="text-4xl">🎉🥳🎓</div>
        <h1 className="text-2xl font-bold">Payment Successful</h1>
        <p className="text-muted-foreground">You may close this window.</p>
      </div>
    </div>
  );
}
