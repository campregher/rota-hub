import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function IntegrationsPage() {
  const [message, setMessage] = useState('');

  const connectMercadoLivre = async () => {
    const response = await fetch(`${API_URL}/integrations/mercadolivre/connect`, { method: 'POST' });
    const data = await response.json();
    setMessage(`URL: ${data.url}`);
  };

  const connectShopee = async () => {
    const response = await fetch(`${API_URL}/integrations/shopee/connect`, { method: 'POST' });
    const data = await response.json();
    setMessage(`URL: ${data.url}`);
  };

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Integrações</h1>
      <p>Conecte seus marketplaces.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={connectMercadoLivre}>Conectar Mercado Livre</button>
        <button onClick={connectShopee}>Conectar Shopee</button>
      </div>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </main>
  );
}
