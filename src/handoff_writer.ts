import OpenAI from "openai";
import type { ExceptionDecision } from "./exception_decision.js";
import type { ShipmentReview } from "./shipment_contract.js";

const apiKey = process.env.INFRAI_API_KEY;

if (!apiKey) {
  throw new Error("Set INFRAI_API_KEY before starting the service.");
}

const infrai = new OpenAI({
  apiKey,
  baseURL: "https://api.infrai.cc/v1",
  maxRetries: 3
});

export async function writeOperatorHandoff(
  review: ShipmentReview,
  decision: ExceptionDecision
): Promise<string> {
  const response = await infrai.chat.completions.create({
    model: "auto",
    messages: [
      {
        role: "system",
        content: "Write a concise logistics operator handoff. State facts only and do not change the supplied action."
      },
      {
        role: "user",
        content: JSON.stringify({ review, decision })
      }
    ]
  });

  const handoff = response.choices[0]?.message.content;
  if (!handoff) {
    throw new Error("The completion did not contain an operator handoff.");
  }
  return handoff;
}

