const response = await fetch("http://localhost:3000/shipment-reviews", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    shipmentId: "SHP-2048",
    events: [
      { type: "PICKED_UP", occurredAt: "2026-08-20T08:15:00.000Z" },
      { type: "DAMAGED", occurredAt: "2026-08-20T14:30:00.000Z", note: "Outer carton is crushed." }
    ],
    proofOfDelivery: [
      { name: "dock-photo.jpg", mediaType: "image/jpeg", sha256: "a".repeat(64) }
    ]
  })
});

const result: unknown = await response.json();
console.log(JSON.stringify(result, null, 2));

export {};
