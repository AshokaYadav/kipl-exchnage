"use client";

import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import { getComplaints, type ComplaintParams } from "@/services/complaint.service";

// 📝 Complaints list — page badalte waqt purana data dikhta rahe
export function useComplaints(params: ComplaintParams) {
  const query = useQuery({
    queryKey: ["complaints", params],
    queryFn: () => getComplaints(params),
    placeholderData: keepPreviousData,
  });
  useEffect(() => {
    if (query.isError) toast.error(getErrorMessage(query.error));
  }, [query.isError, query.error]);
  return query;
}
