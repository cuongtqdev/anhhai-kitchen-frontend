"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Tracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type");
    const table = searchParams.get("table");

    if (type) {
      sessionStorage.setItem("anhhai_order_type", type);
    }
    if (table) {
      sessionStorage.setItem("anhhai_table_number", table);
    }
  }, [searchParams]);

  return null;
}

export function QRContextTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
