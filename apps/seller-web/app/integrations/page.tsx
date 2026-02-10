"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";
import { useRequireAuth } from "../../lib/use-require-auth";

export default function IntegrationsPage() {
  const canLoad = useRequireAuth();
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function connectMercadoLivre() {
    if (!canLoad) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/integrations/mercadolivre/connect");
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function connectShopee() {
    if (!canLoad) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/integrations/shopee/connect");
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Integrations</h2>
      <p className="muted">MVP usa stubs para OAuth de Mercado Livre e Shopee.</p>
      <div className="row">
        <button
          type="button"
          className="button"
          onClick={connectMercadoLivre}
          disabled={loading || !canLoad}
        >
          Connect Mercado Livre
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={connectShopee}
          disabled={loading || !canLoad}
        >
          Connect Shopee
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {result ? (
        <pre>{result}</pre>
      ) : null}
    </section>
  );
}
