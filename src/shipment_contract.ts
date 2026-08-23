import { z } from "zod";

export const ShipmentReviewSchema = z.object({
  shipmentId: z.string().min(1),
  events: z.array(
    z.object({
      type: z.enum(["PICKED_UP", "IN_TRANSIT", "DELIVERED", "DAMAGED", "DELIVERY_FAILED"]),
      occurredAt: z.string().datetime(),
      note: z.string().max(500).optional()
    })
  ).min(1),
  proofOfDelivery: z.array(
    z.object({
      name: z.string().min(1),
      mediaType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
      sha256: z.string().regex(/^[a-f0-9]{64}$/)
    })
  )
});

export type ShipmentReview = z.infer<typeof ShipmentReviewSchema>;

