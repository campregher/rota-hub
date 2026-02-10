"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAccessToken, getAccessToken } from "../lib/auth";

export function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getAccessToken()));
  }, [pathname]);

  function handleLogout() {
    clearAccessToken();
    setIsAuthenticated(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="nav">
      {isAuthenticated ? (
        <>
          <Link href="/integrations">Integrations</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/jobs">Jobs</Link>
          <button
            type="button"
            className="button button-secondary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </nav>
  );
}
