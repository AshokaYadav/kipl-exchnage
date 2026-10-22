import { axiosInstance } from "@/lib/axios";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

// Seller ka apna bank — settlement / payout yahin aayega
export type SettlementBank = {
  id: string;
  user_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch: string | null;
  upi_id: string | null;
  // List mein 0 / 1, create response mein true / false aata hai
  is_default: boolean | number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SettlementBankInput = {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch?: string;
  upi_id?: string;
  is_default: boolean;
};

// err aaye toh throw karo, taaki react-query error state mein jaaye
function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// 🏦 Mere settlement banks
export const getSettlementBanks = async (): Promise<SettlementBank[]> => {
  const res = await axiosInstance.get("/apis/exchange/settlement/banks");
  return unwrap<SettlementBank[]>(res.data) ?? [];
};

// ➕ Naya bank add
export const addSettlementBank = async (input: SettlementBankInput) => {
  const res = await axiosInstance.post("/apis/exchange/settlement/banks", input);
  return unwrap<SettlementBank>(res.data);
};

// ✏️ Bank update — sirf badle hue fields bhi chalenge (jaise { is_default: true })
export const updateSettlementBank = async (id: string, input: Partial<SettlementBankInput>) => {
  const res = await axiosInstance.put(`/apis/exchange/settlement/banks/${id}`, input);
  return unwrap<SettlementBank>(res.data);
};

// 🗑️ Bank delete
export const deleteSettlementBank = async (id: string) => {
  const res = await axiosInstance.delete(`/apis/exchange/settlement/banks/${id}`);
  return unwrap<{ id: string; deleted: boolean }>(res.data);
};

// ───────────── Settlement requests ─────────────
export type SettlementRequest = {
  id: string;
  user_id: string;
  user_bank_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string | null;
  amount: number;
  status: string;
  remark: string | null;
  admin_remark: string | null;
  utr: string | null;
  processed_at: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SettlementPage = { total: number; page: number; limit: number; data: SettlementRequest[] };

export type SettlementParams = { page?: number; limit?: number; status?: string };

export type SettlementInput = { user_bank_id: string; amount: number; remark?: string };

// 📋 Meri settlement requests — khaali status query mein nahi jaata
export const getSettlements = async (params: SettlementParams = {}): Promise<SettlementPage> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const query: Record<string, string | number> = { page, limit };
  if (params.status) query.status = params.status;
  const res = await axiosInstance.get("/apis/exchange/settlement", { params: query });
  const data = unwrap<SettlementPage>(res.data);
  return {
    total: data?.total ?? 0,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    data: data?.data ?? [],
  };
};

// ➕ Nayi settlement request
export const createSettlement = async (input: SettlementInput) => {
  const res = await axiosInstance.post("/apis/exchange/settlement", input);
  return unwrap<SettlementRequest>(res.data);
};

// ✖️ Pending request cancel
export const cancelSettlement = async (id: string) => {
  const res = await axiosInstance.put(`/apis/exchange/settlement/${id}/cancel`);
  return unwrap<SettlementRequest>(res.data);
};
