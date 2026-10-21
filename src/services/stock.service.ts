import { axiosInstance } from "@/lib/axios";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

export type Named = { id: string; name: string };

export type Stock = {
  id: string;
  user_id: string;
  api_id: string;
  operator_id: string;
  category_id: string;
  amount_type: string;
  amount: string;
  circle_type: string;
  circle: string[];
  margin: string | number;
  limit_amount: number;
  limit_type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  admin_margin?: number;
  total_margin?: number;
  used_amount?: number;
  remaining_amount?: number;
  operator?: Named & { image_url?: string };
  category?: Named;
  api?: Named;
  circles?: Named[];
};

export type StockInput = {
  api_id: string;
  operator_id: string;
  category_id: string;
  amount_type: string;
  amount: string;
  circle_type: string;
  circle: string[];
  margin: number;
  limit_amount: number;
  limit_type: string;
};

// err aaye toh throw karo, taaki react-query ka onError toast dikha de
function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// 📦 Available stock list
export const getStock = async (): Promise<Stock[]> => {
  const res = await axiosInstance.get("/apis/exchange/stock");
  return unwrap<Stock[]>(res.data) ?? [];
};

// ➕ Naya available stock operator
export const createStock = async (input: StockInput) => {
  const res = await axiosInstance.post("/apis/exchange/stock", input);
  return unwrap<Stock>(res.data);
};

// ✏️ Stock update — sirf margin aur limit badalte hain
export type StockUpdateInput = Pick<StockInput, "margin" | "limit_amount" | "limit_type">;

export const updateStock = async (id: string, input: StockUpdateInput) => {
  const res = await axiosInstance.put(`/apis/exchange/stock/${id}`, input);
  return unwrap<Stock>(res.data);
};

// 🗑️ Stock delete
export const deleteStock = async (id: string) => {
  const res = await axiosInstance.delete(`/apis/exchange/stock/${id}`);
  return unwrap<{ id: string; deleted: boolean }>(res.data);
};
