import { axiosInstance } from "@/lib/axios";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

export type Business = {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  turnover: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  pan_owner: string;
  pan_verified: boolean;
  gstin: string;
  gst_verified: boolean;
  aadhaar: string;
  aadhaar_verified: boolean;
  admin_remark: string | null;
  verified_by: string | null;
  verified_at: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BusinessInput = Pick<
  Business,
  "business_name" | "business_type" | "turnover" | "address" | "city" | "state" | "pincode" | "pan" | "pan_owner" | "gstin" | "aadhaar"
>;

function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// 🏢 Apni business details — abhi tak nahi bhari toh null
export const getBusiness = async (): Promise<Business | null> => {
  const res = await axiosInstance.get("/apis/exchange/business");
  return unwrap<{ business: Business | null }>(res.data)?.business ?? null;
};

// ✏️ Details save — save hote hi verification dobara hoti hai
export const updateBusiness = async (input: BusinessInput): Promise<Business> => {
  const res = await axiosInstance.put("/apis/exchange/business", input);
  return unwrap<Business>(res.data);
};
