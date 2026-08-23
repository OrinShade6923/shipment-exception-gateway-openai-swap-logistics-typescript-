import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { ZodError } from "zod";
import { decideException } from "./exception_decision.js";
import { writeOperatorHandoff } from "./handoff_writer.js";
import { ShipmentReviewSchema } from "./shipment_contract.js";

const port = Number(process.env.PORT ?? 3000);

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function send(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/shipment-reviews") {
    send(response, 404, { error: "Route not found" });
    return;
  }

  try {
    const review = ShipmentReviewSchema.parse(await readJson(request));
    const decision = decideException(review);
    const handoff = await writeOperatorHandoff(review, decision);
    send(response, 200, { shipmentId: review.shipmentId, decision, handoff });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      send(response, 400, { error: "Invalid shipment review", details: error.message });
      return;
    }
    console.error(error);
    send(response, 502, { error: "Operator handoff could not be generated" });
  }
});

server.listen(port, () => {
  console.log(`Shipment exception service listening on http://localhost:${port}`);
});

