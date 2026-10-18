"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Mail, Smartphone, User } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpStep } from "@/components/auth/otp-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateUser, useSendOtp } from "@/hooks/useAuth";
import { useRedirectIfLoggedIn } from "@/hooks/useSession";

export default function RegisterPage() {
  useRedirectIfLoggedIn();

  const [form, setForm] = useState({ name: "", mobile: "", email: "" });
  const [otpToken, setOtpToken] = useState<string | null>(null);

  const createUser = useCreateUser();
  const sendOtp = useSendOtp(setOtpToken);

  const valid =
    form.name.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(form.mobile) &&
    /^\S+@\S+\.\S+$/.test(form.email);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // 1️⃣ user create → 2️⃣ OTP bhejo → 3️⃣ verify
    createUser.mutate(
      { name: form.name.trim(), mobile: form.mobile, email: form.email.trim() },
      {
        onSuccess: (res) => {
          toast.success(res?.message ?? "Account created ✅");
          sendOtp.mutate(form.mobile);
        },
      }
    );
  };

  return (
    <AuthShell
      title={otpToken ? "Verify your number" : "Create your account"}
      subtitle={otpToken ? "Enter the OTP to activate your account." : "Start trading recharges in under a minute."}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Login
          </Link>
        </>
      }
    >
      {otpToken ? (
        <OtpStep mobile={form.mobile} token={otpToken} onTokenChange={setOtpToken} onBack={() => setOtpToken(null)} />
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="Full name"
            name="name"
            placeholder="Your name / business name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            icon={<User className="size-4" />}
            required
          />
          <Input
            label="Mobile number"
            name="mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="98XXXXXXXX"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
            icon={<Smartphone className="size-4" />}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@business.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            icon={<Mail className="size-4" />}
            required
          />
          <Button type="submit" className="w-full" loading={createUser.isPending || sendOtp.isPending} disabled={!valid}>
            Sign Up &amp; Get OTP
          </Button>
          <p className="text-center text-xs text-slate-500">
            By signing up you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
