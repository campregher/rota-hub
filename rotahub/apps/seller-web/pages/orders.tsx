import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type Order = {
  id: string;
  marketplace: string;
  marketplaceOrderId: string;
  status: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/orders`)
      .then((res) => res.json())
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Pedidos</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.marketplace} #{order.marketplaceOrderId} - {order.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
