import { axiosInstance } from "@/lib/axios";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

export type StringMap = Record<string, string>;
export type StatusMap = Record<string, string[]>;

export type ProviderApi = {
  id: string;
  apicode: number;
  name: string;
  type: string;
  url: string;
  method: string;
  timeout: number;
  username: string | null;
  password: string | null;
  api_key: string | null;
  balance_url: string | null;
  status_url: string | null;
  callback_ip: string | null;
  headers: StringMap | null;
  request_template: StringMap | null;
  response_mapping: StringMap | null;
  status_mapping: StatusMap | null;
  status: boolean | number;
  [key: string]: unknown;
};

// Create / Update dono mein yahi fields jaate hain (update mein sirf badle hue bhi chalenge)
export type ProviderApiInput = {
  name?: string;
  url?: string;
  method?: string;
  timeout?: number;
  username?: string;
  password?: string;
  api_key?: string;
  status_url?: string;
  balance_url?: string;
  callback_ip?: string;
  headers?: StringMap;
  request_template?: StringMap;
  response_mapping?: StringMap;
  status_mapping?: StatusMap;
  status?: number;
};

export type OperatorMapping = {
  id: string;
  operator_code: string;
  circle_code: string;
  operator_id: string;
  margin: string;
  // Backend "" / true / "true" bhejta hai — UI mein boolean bana lete hain
  surcharge: string | boolean;
  margin_type: string;
  category_id: string;
  circle: string;
  mapped: boolean;
  operator: { id: string; name: string; image_url: string };
  provider_api: { id: string; name: string; status: boolean };
  category: { id: string; name: string };
};

export type OperatorMappingInput = {
  id?: string;
  operator_id: string;
  category_id: string;
  operator_code?: string;
  circle_code?: string;
  margin?: string;
  margin_type?: string;
  surcharge?: boolean;
};

export type Category = { id: string; name: string; status: boolean | number };

// categories API fail ho toh yahi category use hogi
export const DEMO_CATEGORY_ID = "13667e38-475c-4d18-9ff3-f6d0fbd125ca";
export const DEMO_CATEGORY: Category = { id: DEMO_CATEGORY_ID, name: "DEMO Prepaid", status: true };

// err aaye toh throw karo, taaki react-query ka onError toast dikha de
function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// 📋 Apni APIs ki list
export const getApis = async (): Promise<ProviderApi[]> => {
  const res = await axiosInstance.get("/apis/exchange");
  return unwrap<ProviderApi[]>(res.data) ?? [];
};

// ➕ Nayi API banana
export const createApi = async (input: ProviderApiInput) => {
  const res = await axiosInstance.post("/apis/exchange/register", input);
  return unwrap<ProviderApi[]>(res.data);
};

// ✏️ API update
export const updateApi = async (id: string, input: ProviderApiInput) => {
  const res = await axiosInstance.put(`/apis/exchange/${id}`, input);
  return unwrap<ProviderApi>(res.data);
};

// 🗂️ Saari categories
export const getCategories = async (): Promise<Category[]> => {
  const res = await axiosInstance.get("/categories/get-all");
  return unwrap<Category[]>(res.data) ?? [];
};

// 🔗 Operator + margin mapping ki list (ek category ke liye)
export const getOperatorMappings = async (
  apiId: string,
  categoryId: string
): Promise<OperatorMapping[]> => {
  const res = await axiosInstance.post("/apis/exchange/operators/get", {
    category_id: categoryId,
    api_id: apiId,
  });
  return unwrap<OperatorMapping[]>(res.data) ?? [];
};

// 💾 Operator + margin mapping update
export const updateOperatorMappings = async (
  apiId: string,
  mappings: OperatorMappingInput[]
) => {
  const res = await axiosInstance.put(`/apis/exchange/${apiId}/operators`, {
    mappings,
  });
  if (res.data?.err) throw new Error(res.data.message ?? "Mapping save nahi hui");
  return res.data;
};
