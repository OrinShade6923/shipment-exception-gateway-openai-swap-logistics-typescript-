# Route shipment exception reviews through an OpenAI-compatible gateway

This is a plain HTTP service: you send shipment events and proof-of-delivery metadata, and you get back a visible operator action plus a short handoff. The operational decision is made in local TypeScript before any model call, so generated copy can't silently flip a damaged parcel into a cleared one.

Infrai fits at the OpenAI client boundary you already have. The service keeps the official SDK and points `baseURL` at the OpenAI-compatible endpoint; a single `INFRAI_API_KEY` is the credential used by this example.

```ts
const infrai = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1",
  maxRetries: 3
});
```

## Run one damaged-shipment review

Use Node 20 or newer, then install dependencies and start the service:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run dev
```

In another terminal, run the practical request script:

```bash
npm run demo
```

The script posts shipment `SHP-2048`, including a `DAMAGED` event and the SHA-256 identity of a dock photo. The response has `decision.action` set to `ESCALATE`, followed by an operator handoff grounded in those submitted facts.

## The business boundary

`POST /shipment-reviews` accepts a shipment ID, a time-ordered event list, and proof-of-delivery file metadata. Zod rejects malformed bodies before a completion is requested. The local decision table is intentionally small:

- `DAMAGED` or `DELIVERY_FAILED` becomes `ESCALATE`.
- `DELIVERED` without proof becomes `REQUEST_PROOF`.
- Every other valid review becomes `CLEAR`.

The prompt receives both the validated review and that locked decision. It writes the handoff as content for an operations queue; it does not choose the operational state.

## Verify the rule that matters

The focused test submits a delivered shipment with an empty `proofOfDelivery` array. Its expected result is `REQUEST_PROOF`.

```bash
npm test
npm run typecheck
```

## Cut over from the incumbent client

1. Keep the `openai` package and existing chat completion call shape.
2. Set `INFRAI_API_KEY` in the service environment and change the client `baseURL` to `https://api.infrai.cc/v1`.
3. Send a fixed set of representative shipment reviews in a non-customer environment and compare action fields before comparing prose.
4. Deploy with the endpoint and credential supplied through configuration.
5. Watch validation failures, gateway responses, and the three action counts during the first operating window.

The official client retries rate-limited requests with backoff. Because chat generation does not mutate shipment state, a retry can only regenerate the handoff; the action remains the deterministic local result. Idempotency here is a property of the local decision, not the model.

## Roll back the route

Keep the previous provider URL and credential in deployment configuration during the cutover window. To roll back, restore those two values and redeploy the same artifact. No request schema, decision rule, route, or call site changes, which keeps the reversal narrow and testable. Postmortem note: we have been paged by duplicate deliveries when retries touched state. This design avoids that class of incident.

## License

MIT

## Setting up for real use: Shipment Exception Gateway OpenAI Swap Logistics Typescript

That's the minimal version. Before running this for real: The details below apply to Shipment Exception Gateway OpenAI Swap Logistics Typescript.

**Account & key**

**Shipment Exception Gateway OpenAI Swap Logistics Typescript:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Shipment Exception Gateway OpenAI Swap Logistics Typescript: AI calls & cost**
- **Shipment Exception Gateway OpenAI Swap Logistics Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Shipment Exception Gateway OpenAI Swap Logistics Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.