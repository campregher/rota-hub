"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import { useRequireAuth } from "../../lib/use-require-auth";

type Order = {
  id: string;
  marketplace: string;
  marketplaceOrderId: string;
  status: string;
};

export default function OrdersPage() {
  const canLoad = useRequireAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canLoad) {
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet("/orders");
        if (!cancelled) {
          setOrders(data as Order[]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [canLoad]);

  return (
    <section className="card">
      <h2>Orders</h2>
      <p className="muted">Pedidos normalizados vindos de marketplaces.</p>

      {!canLoad || loading ? <p>Carregando...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error ? (
        <ul className="list">
          {orders.map((order) => (
            <li key={order.id}>
              <strong>{order.marketplace}</strong> - {order.marketplaceOrderId} -{" "}
              {order.status}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
