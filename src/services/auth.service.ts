import { axiosInstance } from "@/lib/axios";
import { saveSession, type AppUser } from "@/lib/session";

const formHeaders = {
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
};

export type SendOtpResponse = {
  err: unknown;
  message?: string;
  data?: { newuser?: boolean };
};

export type VerifyOtpResponse = {
  message?: string;
  token?: string;
  user?: AppUser;
  newuser?: boolean;
};

export type CreateUserResponse = {
  status?: boolean | string;
  message?: string;
  [key: string]: unknown;
};

// 🔥 Send OTP
export const sendOTP = async (mobile: string): Promise<SendOtpResponse> => {
  const res = await axiosInstance.post("/auth/login-exchange", { mobile });
  return res.data;
};

// 🔥 Verify OTP
export const verifyOTP = async (
  otp: string,
  mobile: string
): Promise<VerifyOtpResponse> => {
  const res = await axiosInstance.post("/auth/verify-otp-exchange", {
    mobile,
    otp,
  });

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
