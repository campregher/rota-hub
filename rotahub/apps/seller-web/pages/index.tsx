import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Rotahub Seller Web</h1>
      <p>Selecione uma área:</p>
      <ul>
        <li>
          <Link href="/integrations">Integrações</Link>
        </li>
        <li>
          <Link href="/orders">Pedidos</Link>
        </li>
        <li>
          <Link href="/jobs">Entregas</Link>
        </li>
      </ul>
    </main>
  );
}
