"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSendOtp, useVerifyOtp } from "@/hooks/useAuth";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function OtpStep({
  mobile,
  token,
  onTokenChange,
  onBack,
}: {
  mobile: string;
  token: string;
  onTokenChange: (t: string) => void;
  onBack: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const verify = useVerifyOtp();
  const resend = useSendOtp((t) => {
    onTokenChange(t);
    setTimer(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    refs.current[0]?.focus();
  });

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const otp = digits.join("");

  const setDigit = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, idx) => (next[idx] = d));
    setDigits(next);
    refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (otp.length === OTP_LENGTH) verify.mutate({ otp, token });
      }}
      className="space-y-6"
    >
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
        <ArrowLeft className="size-4" /> Change number
      </button>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        OTP sent to <span className="font-semibold text-slate-900 dark:text-white">+91 {mobile}</span>
      </p>

      <div className="flex justify-between gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
            aria-label={`OTP digit ${i + 1}`}
            className="size-12 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-500/20 sm:size-14"
          />
        ))}
      </div>

      <Button type="submit" className="w-full" loading={verify.isPending} disabled={otp.length !== OTP_LENGTH}>
        Verify &amp; Continue
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        {timer > 0 ? (
          <>Resend OTP in <span className="font-semibold">{timer}s</span></>
        ) : (
          <button type="button" disabled={resend.isPending} onClick={() => resend.mutate(mobile)} className="font-semibold text-brand-600 hover:underline disabled:opacity-50 dark:text-brand-400">
            {resend.isPending ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </p>
    </form>
  );
}
