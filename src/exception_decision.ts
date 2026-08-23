import type { ShipmentReview } from "./shipment_contract.js";

export type ReviewAction = "ESCALATE" | "REQUEST_PROOF" | "CLEAR";

export interface ExceptionDecision {
  action: ReviewAction;
  reason: string;
}

export function decideException(review: ShipmentReview): ExceptionDecision {
  const eventTypes = new Set(review.events.map((event) => event.type));

  if (eventTypes.has("DAMAGED") || eventTypes.has("DELIVERY_FAILED")) {
    return { action: "ESCALATE", reason: "The shipment contains an exception event." };
  }

  if (eventTypes.has("DELIVERED") && review.proofOfDelivery.length === 0) {
    return { action: "REQUEST_PROOF", reason: "Delivery is recorded without proof-of-delivery files." };
  }

  return { action: "CLEAR", reason: "No shipment exception requires operator action." };
}

