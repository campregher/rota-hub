import Link from "next/link";

export default function HomePage() {
  return (
    <section className="card">
      <h2>Seller Console</h2>
      <p className="muted">
        Faca login para conectar marketplaces, listar pedidos e acompanhar jobs.
      </p>
      <p>
        <Link href="/login">Ir para login</Link>
      </p>
    </section>
  );
}
