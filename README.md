# PlanetSpark Configurator

End-to-end counsellor flow for student identification, curriculum customization, and pricing with embedded admission form and payment.

## Stack
- Frontend: React + Vite + TypeScript (`spark-configurator-src/client`)
- Backend: Express + TypeScript (`spark-configurator-src/server`)

## Development
```bash
cd spark-configurator-src
npm install
npm run dev
# open http://localhost:5000/
```

## Environment
- `VITE_API_BASE_URL` (frontend) when API is hosted separately (e.g., Vercel frontend + Railway API).
- `CORS_ORIGIN` (backend) comma-separated list of frontend origins.
- `RAZORPAY_WEBHOOK_SECRET` (backend) to verify Razorpay webhooks.

## Payment Success
- Redirect: set Razorpay success URL to `https://<frontend>/payment-success?txn=<ID>`.
- Webhook: point Razorpay webhook to `https://<backend>/api/webhooks/razorpay`.
- Client polls `/api/payments/status` while payment modal is open and auto-shows the welcome note.

## Commands
```bash
npm run check    # typecheck
npm run build    # production bundle
npm run start    # serve production dist
```
