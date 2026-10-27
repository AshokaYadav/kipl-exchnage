"use client";

import { useEffect, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import { getAvailableStock, type AvailableStockParams } from "@/services/available-stock.service";

// 📈 Available stock list — page badalte waqt purana data dikhta rahe
export function useAvailableStock(params: AvailableStockParams) {
  const { operator_id = "", circle_id = "", page = 1, limit = 20 } = params;
  const query = useQuery({
    queryKey: ["available-stock", { operator_id, circle_id, page, limit }],
    queryFn: () => getAvailableStock({ operator_id, circle_id, page, limit }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.isError) toast.error(getErrorMessage(query.error));
  }, [query.isError, query.error]);

  return query;
}

// 🔽 Filter dropdowns ke options — ek bada bina filter wala call
// TODO: operators / circles ki list API aane par ye hata ke wahi lagani hai
export function useAvailableStockOptions() {
  return useQuery({
    queryKey: ["available-stock", "options"],
    queryFn: () => getAvailableStock({ page: 1, limit: 500 }),
    staleTime: 5 * 60 * 1000,
  });
}

// 🔽 Operator / circle dropdown options — available stock se nikale hue, naam se sorted
export function useOperatorCircleOptions() {
  const query = useAvailableStockOptions();
  const options = useMemo(() => {
    const ops = new Map<string, string>();
    const circles = new Map<string, string>();
    for (const r of query.data?.data ?? []) {
      ops.set(r.operator.id, r.operator.name);
      if (!r.circle.all && r.circle.id) circles.set(r.circle.id, r.circle.name);
    }
    const sort = (m: Map<string, string>) =>
      [...m].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    return { operatorOptions: sort(ops), circleOptions: sort(circles) };
  }, [query.data]);
  return { ...options, isLoading: query.isLoading };
}
