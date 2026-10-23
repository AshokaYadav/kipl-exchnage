"use client";

import { useEffect } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import { createComplaint, getComplaints, type ComplaintInput, type ComplaintParams } from "@/services/complaint.service";

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

// ➕ Recharge par complaint raise karo
export function useCreateComplaint(onDone: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ComplaintInput) => createComplaint(input),
    onSuccess: () => {
      toast.success("Complaint register ho gayi ✅");
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
