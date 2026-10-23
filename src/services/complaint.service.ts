import { axiosInstance } from "@/lib/axios";
import type { Paged, RechargeStatus } from "@/services/history.service";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

export type ComplaintStatus = "PENDING" | "RESOLVED" | "REJECTED" | (string & {});

export type Complaint = {
  id: string;
  recharge_id: string;
  buyer_id: string;
  amount: number;
  net_charge: number;
  hold_amount: number;
  refund_amount: number;
  message: string | null;
  status: ComplaintStatus;
  admin_remark: string | null;
  resolved_at: string | null;
  ticket_id: string | null;
  createdAt: string;
  updatedAt: string;
  recharge: {
    id: string;
    mobile: string;
    status: RechargeStatus;
    order_id: string | null;
    createdAt: string;
    operator: { id: string; name: string; image_url: string | null };
  };
  buyer: { id: string; name: string; mobile: string };
};

export type ComplaintParams = {
  as: "buyer" | "seller";
  page?: number;
  limit?: number;
  status?: string;
};

function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// Khaali filters query mein nahi jaate
function clean(params: Record<string, string | number | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}

// 📝 Complaints list — as=buyer (maine ki) / as=seller (mere against)
export const getComplaints = async (params: ComplaintParams): Promise<Paged<Complaint>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const res = await axiosInstance.get("/apis/exchange/complaints", { params: clean({ ...params, page, limit }) });
  const data = unwrap<Paged<Complaint>>(res.data);
  return {
    total: data?.total ?? 0,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    data: data?.data ?? [],
  };
};
