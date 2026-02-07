"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";

const SELLER_USER_ID = "11111111-1111-1111-1111-111111111111";

export default function IntegrationsPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function connectMercadoLivre() {
    setLoading(true);
    try {
      const data = await apiPost("/integrations/mercadolivre/connect", {
        sellerUserId: SELLER_USER_ID
      });
      setResult(JSON.stringify(data, null, 2));
    } finally {
      setLoading(false);
    }
  }

  async function connectShopee() {
    setLoading(true);
    try {
      const data = await apiPost("/integrations/shopee/connect", {
        sellerUserId: SELLER_USER_ID
      });
      setResult(JSON.stringify(data, null, 2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Integrations</h2>
      <p>MVP usa stubs para OAuth de Mercado Livre e Shopee.</p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={connectMercadoLivre} disabled={loading}>
          Connect Mercado Livre
        </button>
        <button onClick={connectShopee} disabled={loading}>
          Connect Shopee
        </button>
      </div>
      {result ? (
        <pre style={{ marginTop: 16, overflowX: "auto" }}>{result}</pre>
      ) : null}
    </section>
  );
}
