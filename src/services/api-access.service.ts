import { axiosInstance } from "@/lib/axios";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

export type TokenStatus = "ACTIVE" | "INACTIVE";

export type ApiToken = {
  id: string;
  user_id: string;
  name: string;
  token: string;
  callback_url: string | null;
  ip: string | null;
  status: TokenStatus;
  last_used_at: string | null;
  last_used_ip: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiTokenInput = {
  name?: string;
  callback_url?: string;
  ip?: string;
  status?: TokenStatus;
};

export type WhitelistIp = {
  id: string;
  user_id: string;
  ip: string;
  status: string;
  source: string;
  remark: string | null;
  admin_id: string | null;
  approved_at: string | null;
  hits: number;
  last_seen_at: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IpListParams = { status?: string; page?: number; limit?: number };
export type IpList = { total: number; page: number; limit: number; data: WhitelistIp[] };

// err aaye toh throw karo, taaki react-query ka onError toast dikha de
function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// 🔑 Apne API tokens
export const getApiTokens = async (): Promise<ApiToken[]> => {
  const res = await axiosInstance.get("/api-access/tokens");
  return unwrap<ApiToken[]>(res.data) ?? [];
};

// ➕ Naya token generate
export const createApiToken = async (input: ApiTokenInput) => {
  const res = await axiosInstance.post("/api-access/tokens", input);
  return unwrap<ApiToken>(res.data);
};

// ✏️ Token update (callback_url / ip / status)
export const updateApiToken = async (id: string, input: ApiTokenInput) => {
  const res = await axiosInstance.put(`/api-access/tokens/${id}`, input);
  return unwrap<ApiToken>(res.data);
};

// 🔁 Token re-generate (purana token band ho jaata hai)
export const regenerateApiToken = async (id: string) => {
  const res = await axiosInstance.post(`/api-access/tokens/${id}/regenerate`);
  return unwrap<ApiToken>(res.data);
};

// 🗑️ Token delete
export const deleteApiToken = async (id: string) => {
  const res = await axiosInstance.delete(`/api-access/tokens/${id}`);
  return unwrap<{ id: string; deleted: boolean }>(res.data);
};

// 🌐 Whitelisted IPs ki list
export const getIps = async (params: IpListParams): Promise<IpList> => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));
  const res = await axiosInstance.get("/api-access/ips", { params: clean });
  return unwrap<IpList>(res.data) ?? { total: 0, page: 1, limit: 50, data: [] };
};

// 🗑️ IP list se hatao
export const deleteIp = async (id: string) => {
  const res = await axiosInstance.delete(`/api-access/ips/${id}`);
  return unwrap<{ id: string; deleted: boolean }>(res.data);
};
