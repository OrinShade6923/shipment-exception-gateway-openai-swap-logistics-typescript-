import assert from "node:assert/strict";
import test from "node:test";
import { decideException } from "../src/exception_decision.js";
import { ShipmentReviewSchema } from "../src/shipment_contract.js";

test("a delivered shipment without proof requests proof", () => {
  const review = ShipmentReviewSchema.parse({
    shipmentId: "SHP-1024",
    events: [{ type: "DELIVERED", occurredAt: "2026-08-20T09:00:00.000Z" }],
    proofOfDelivery: []
  });

  assert.deepEqual(decideException(review), {
    action: "REQUEST_PROOF",
    reason: "Delivery is recorded without proof-of-delivery files."
  });
});

