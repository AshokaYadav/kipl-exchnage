import { axiosInstance } from "@/lib/axios";
import { saveSession, type AppUser } from "@/lib/session";

const formHeaders = {
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
};

// Backend ka exact response shape pata nahi, isliye flexible types
export type SendOtpResponse = {
  status?: boolean | string;
  message?: string;
  token?: string;
  data?: { token?: string; [key: string]: unknown };
  [key: string]: unknown;
};

export type VerifyOtpResponse = {
  status?: boolean | string;
  message?: string;
  token?: string;
  user?: AppUser;
  [key: string]: unknown;
};

export type CreateUserResponse = {
  status?: boolean | string;
  message?: string;
  [key: string]: unknown;
};

// 🔥 Send OTP
export const sendOTP = async (mobile: string): Promise<SendOtpResponse> => {
  const res = await axiosInstance.post(
    "/auth/login-app",
    new URLSearchParams({ mobile }),
    formHeaders
  );

  // Kuch backends token header mein bhejte hain — woh bhi utha lo
  const headerToken =
    res.headers?.["token"] ??
    res.headers?.["x-otp-token"] ??
    res.headers?.["x-token"];

  // Response kabhi string bhi hota hai (sirf token ya JSON text)
  let body: unknown = res.data;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = { message: body };
    }
  }

  return {
    ...(body as SendOtpResponse),
    ...(headerToken ? { headerToken: String(headerToken) } : {}),
  };
};

// 🔥 Verify OTP
export const verifyOTP = async (
  otp: string,
  token: string
): Promise<VerifyOtpResponse> => {
  const res = await axiosInstance.post(
    "/auth/verify-otp",
    new URLSearchParams({ otp, token }),
    formHeaders
  );

  const data: VerifyOtpResponse = res.data;

  // ✅ store token + user
  saveSession(data?.token, data?.user);

  return data;
};

// 🔥 Create User
export const createUser = async (
  name: string,
  mobile: string,
  email: string
): Promise<CreateUserResponse> => {
  const res = await axiosInstance.post(
    "/user/create",
    new URLSearchParams({ name, mobile, email, role: "APP_USER" }),
    formHeaders
  );
  return res.data;
};

// OTP token response mein kahin bhi ho sakta hai (token, otp_token, data.token,
// result.otpToken, ...). Poore response mein "token" naam wali key dhoondhte hain.
export function extractOtpToken(res: unknown): string | null {
  const seen = new Set<unknown>();

  const search = (node: unknown, depth: number): string | null => {
    if (!node || typeof node !== "object" || depth > 4 || seen.has(node)) return null;
    seen.add(node);
    const obj = node as Record<string, unknown>;

    // 1) pehle seedhi keys jinke naam mein "token" ho
    for (const [key, val] of Object.entries(obj)) {
      if (/token/i.test(key) && typeof val === "string" && val.trim()) return val;
    }
    // 2) phir andar ke objects mein
    for (const val of Object.values(obj)) {
      const found = search(val, depth + 1);
      if (found) return found;
    }
    return null;
  };

  return search(res, 0);
}
