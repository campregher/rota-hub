import { apiGet } from "../../lib/api";

export default async function OrdersPage() {
  const orders = await apiGet("/orders");

  return (
    <section className="card">
      <h2>Orders</h2>
      <p>Pedidos normalizados vindos de marketplaces (MVP com sync stub).</p>
      <ul>
        {orders.map((order: any) => (
          <li key={order.id}>
            <strong>{order.marketplace}</strong> - {order.marketplaceOrderId} -{" "}
            {order.status}
          </li>
        ))}
      </ul>
    </section>
  );
}
