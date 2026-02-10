const API_URL = process.env.API_URL ?? "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  let data;
  try {
    data = await response.json();
  } catch {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} ${path}: ${
        typeof data === "string" ? data : JSON.stringify(data)
      }`
    );
  }
  return data;
}

async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return data.accessToken;
}

async function main() {
  console.log(`Running smoke test against ${API_URL}`);

  const sellerToken = await login("seller@rotahub.dev", "password");
  const courierToken = await login("courier1@rotahub.dev", "password");

  const createPayload = {
    orderId: "99999999-9999-9999-9999-999999999999",
    pickupAddressId: "77777777-7777-7777-7777-777777777777",
    dropoffAddressId: "88888888-8888-8888-8888-888888888888",
    priceCents: 1500,
    notes: "smoke"
  };

  const job = await request("/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sellerToken}`
    },
    body: JSON.stringify(createPayload)
  });
  console.log(`Created job ${job.id}`);

  await request(`/jobs/${job.id}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${courierToken}`
    }
  });
  console.log(`Accepted job ${job.id}`);

  const form = new FormData();
  form.append("receiverName", "Smoke Receiver");
  await request(`/jobs/${job.id}/pod`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${courierToken}`
    },
    body: form
  });
  console.log(`Uploaded POD for ${job.id}`);

  for (const status of ["PICKED_UP", "IN_TRANSIT", "DELIVERED"]) {
    await request(`/jobs/${job.id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${courierToken}`
      },
      body: JSON.stringify({ status })
    });
    console.log(`Moved ${job.id} to ${status}`);
  }

  console.log("Smoke test passed");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
