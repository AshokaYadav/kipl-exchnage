"use client";

import Link from "next/link";
import { useState } from "react";
import { Smartphone } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpStep } from "@/components/auth/otp-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendOtp } from "@/hooks/useAuth";
import { useRedirectIfLoggedIn } from "@/hooks/useSession";

export default function LoginPage() {
  useRedirectIfLoggedIn();

  const [mobile, setMobile] = useState("");
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const sendOtp = useSendOtp(setOtpToken);

  const valid = /^[6-9]\d{9}$/.test(mobile);

  return (
    <AuthShell
      title={otpToken ? "Verify OTP" : "Welcome back 👋"}
      subtitle={otpToken ? "Enter the 6-digit code we sent you." : "Login with your registered mobile number."}
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {otpToken ? (
        <OtpStep mobile={mobile} token={otpToken} onTokenChange={setOtpToken} onBack={() => setOtpToken(null)} />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) sendOtp.mutate(mobile);
          }}
          className="space-y-5"
        >
          <Input
            label="Mobile number"
            name="mobile"
            type="tel"
            inputMode="numeric"
            placeholder="98XXXXXXXX"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            icon={<Smartphone className="size-4" />}
            hint="10-digit Indian mobile number"
            required
          />
          <Button type="submit" className="w-full" loading={sendOtp.isPending} disabled={!valid}>
            Send OTP
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
