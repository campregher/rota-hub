import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata = {
  title: "RotaHub Seller Web",
  description: "Seller dashboard MVP"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>RotaHub Seller</h1>
          <nav style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <Link href="/integrations">Integrations</Link>
            <Link href="/orders">Orders</Link>
            <Link href="/jobs">Jobs</Link>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
