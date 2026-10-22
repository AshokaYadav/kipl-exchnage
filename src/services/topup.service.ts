import { axiosInstance } from "@/lib/axios";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

// Admin ke bank jahan paisa jama karna hai
export type TopupBank = {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  branch: string | null;
  upi_id: string | null;
};

export type TopupRequest = {
  id: string;
  bank_id: string;
  user_id: string;
  deposite_amount: number | string;
  payment_method: string;
  bank_name: string;
  account_number: string;
  bank_utr: string;
  remark: string | null;
  date: string;
  // Backend abhi "PENDIND" bhejta hai (typo) — UI mein PENDING hi dikhate hain
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type TopupPage = { total: number; page: number; limit: number; data: TopupRequest[] };

export type TopupInput = {
  bank_id: string;
  amount: number;
  payment_method: string;
  bank_utr: string;
  date: string;
  remark?: string;
};

// err aaye toh throw karo, taaki react-query error state mein jaaye
function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// 📋 Meri fund / top-up requests
export const getTopups = async (params: { page?: number; limit?: number } = {}): Promise<TopupPage> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const res = await axiosInstance.get("/apis/exchange/topup", { params: { page, limit } });
  const data = unwrap<TopupPage>(res.data);
  return {
    total: data?.total ?? 0,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    data: data?.data ?? [],
  };
};

// ➕ Nayi fund request
export const createTopup = async (input: TopupInput) => {
  const res = await axiosInstance.post("/apis/exchange/topup", input);
  return unwrap<TopupRequest>(res.data);
};

// 🏦 Kis bank mein paisa daalna hai
export const getTopupBanks = async (): Promise<TopupBank[]> => {
  const res = await axiosInstance.get("/apis/exchange/topup/banks");
  return unwrap<TopupBank[]>(res.data) ?? [];
};
