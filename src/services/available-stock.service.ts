import { axiosInstance } from "@/lib/axios";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

export type AvailableStockRow = {
  operator: { id: string; name: string; image_url: string | null };
  category: { id: string; name: string };
  circle: { all: boolean; id: string | null; name: string };
  stock_count: number;
  margin: { min: number; max: number };
  amount: { min: number | null; max: number | null; all_amount: boolean };
  used_limit: number;
  available_limit: number;
  unlimited: boolean;
};

export type AvailableStockPage = {
  total: number;
  page: number;
  limit: number;
  data: AvailableStockRow[];
};

export type AvailableStockParams = {
  operator_id?: string;
  circle_id?: string;
  page?: number;
  limit?: number;
};

// err aaye toh throw karo, taaki react-query error state mein jaaye
function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// 📈 Market mein available stock — khaali filters query mein nahi jaate
export const getAvailableStock = async (params: AvailableStockParams = {}): Promise<AvailableStockPage> => {
  const query: Record<string, string | number> = {};
  if (params.operator_id) query.operator_id = params.operator_id;
  if (params.circle_id) query.circle_id = params.circle_id;
  query.page = params.page ?? 1;
  query.limit = params.limit ?? 20;

  const res = await axiosInstance.get("/apis/exchange/available-stock", { params: query });
  const data = unwrap<AvailableStockPage>(res.data);
  return {
    total: data?.total ?? 0,
    page: data?.page ?? query.page,
    limit: data?.limit ?? query.limit,
    data: data?.data ?? [],
  };
};
