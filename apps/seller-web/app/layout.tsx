import "./globals.css";
import { ReactNode } from "react";
import { AppNav } from "../components/app-nav";

export const metadata = {
  title: "RotaHub Seller Web",
  description: "Seller dashboard MVP"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <main>
          <h1>RotaHub Seller</h1>
          <AppNav />
          {children}
        </main>
      </body>
    </html>
  );
}
