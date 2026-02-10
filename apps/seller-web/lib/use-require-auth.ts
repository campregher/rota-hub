"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccessToken } from "./auth";

export function useRequireAuth(): boolean {
  const router = useRouter();
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setCanLoad(true);
  }, [router]);

  return canLoad;
}
