"use client";

import { useState } from "react";
import { BadgeCheck, Building2, Clock, CreditCard, FileText, IdCard, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBox, PageHeader, fieldCls, formatDateTime } from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import { useBusiness, useUpdateBusiness } from "@/hooks/useBusiness";
import type { Business, BusinessInput } from "@/services/business.service";

const BUSINESS_TYPES = ["Proprietorship", "Partnership", "LLP", "Private Limited", "Public Limited", "Others"];
const TURNOVERS = ["below 40 lakh", "40 lakh - 1 crore", "1 crore - 5 crore", "5 crore - 10 crore", "above 10 crore"];
const STATES = [
  "ANDAMAN AND NICOBAR ISLANDS", "ANDHRA PRADESH", "ARUNACHAL PRADESH", "ASSAM", "BIHAR", "CHANDIGARH", "CHHATTISGARH",
  "DADRA AND NAGAR HAVELI AND DAMAN AND DIU", "DELHI", "GOA", "GUJARAT", "HARYANA", "HIMACHAL PRADESH", "JAMMU AND KASHMIR",
  "JHARKHAND", "KARNATAKA", "KERALA", "LADAKH", "LAKSHADWEEP", "MADHYA PRADESH", "MAHARASHTRA", "MANIPUR", "MEGHALAYA",
  "MIZORAM", "NAGALAND", "ODISHA", "PUDUCHERRY", "PUNJAB", "RAJASTHAN", "SIKKIM", "TAMIL NADU", "TELANGANA", "TRIPURA",
  "UTTAR PRADESH", "UTTARAKHAND", "WEST BENGAL",
];

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

const EMPTY: BusinessInput = {
  business_name: "",
  business_type: "",
  turnover: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  pan: "",
  pan_owner: "",
  gstin: "",
  aadhaar: "",
};

export default function CompanyDetailsPage() {
  const { data: business, isLoading, isError, refetch } = useBusiness();

  return (
    <div className="space-y-6">
      <PageHeader icon={<Building2 className="size-5" />} title="Company Details" subtitle="Aapki business / KYC details" />

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-white/5" />
      ) : isError ? (
        <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
          <ErrorBox what="Business details" onRetry={() => refetch()} />
        </section>
      ) : (
        <>
          {business && <VerificationStrip business={business} />}
          {/* Naya data aaye toh form dobara fill ho */}
          <BusinessForm key={business?.updatedAt ?? "new"} business={business ?? null} />
        </>
      )}
    </div>
  );
}

// ───────────── Verification status ─────────────

function VerificationStrip({ business: b }: { business: Business }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <VerifyCard icon={<CreditCard className="size-5" />} label="PAN" value={b.pan} verified={b.pan_verified} />
        <VerifyCard icon={<FileText className="size-5" />} label="GSTIN" value={b.gstin} verified={b.gst_verified} />
        <VerifyCard icon={<IdCard className="size-5" />} label="Aadhaar" value={maskAadhaar(b.aadhaar)} verified={b.aadhaar_verified} />
      </div>
      {b.admin_remark && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <Info className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Admin remark</p>
            <p>{b.admin_remark}</p>
            {b.verified_at && <p className="mt-1 text-xs opacity-80">{formatDateTime(b.verified_at)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function VerifyCard({ icon, label, value, verified }: { icon: React.ReactNode; label: string; value: string; verified: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="truncate font-mono font-bold">{value || "—"}</p>
        <p
          className={cn(
            "mt-0.5 inline-flex items-center gap-1 text-xs font-semibold",
            verified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          )}
        >
          {verified ? <BadgeCheck className="size-3.5" /> : <Clock className="size-3.5" />}
          {verified ? "Verified" : "Verification pending"}
        </p>
      </div>
    </div>
  );
}

const maskAadhaar = (a: string) => (a && a.length >= 4 ? `XXXX XXXX ${a.slice(-4)}` : a);

// ───────────── Form ─────────────

function BusinessForm({ business }: { business: Business | null }) {
  const [form, setForm] = useState<BusinessInput>(() =>
    business ? (Object.fromEntries(Object.keys(EMPTY).map((k) => [k, business[k as keyof BusinessInput] ?? ""])) as BusinessInput) : EMPTY
  );
  const save = useUpdateBusiness();
  const anyVerified = Boolean(business && (business.pan_verified || business.gst_verified || business.aadhaar_verified));

  const set = (key: keyof BusinessInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  // PAN / GSTIN capital mein, number wale fields mein sirf digits
  const setUpper = (key: keyof BusinessInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value.toUpperCase().replace(/\s/g, "") }));
  const setDigits = (key: keyof BusinessInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value.replace(/\D/g, "") }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])) as BusinessInput;
    if (!PAN_RE.test(input.pan)) return toast.error("PAN sahi nahi hai (e.g. ABCDE1234F)");
    if (input.gstin && !GSTIN_RE.test(input.gstin)) return toast.error("GSTIN sahi nahi hai (15 characters)");
    if (input.aadhaar.length !== 12) return toast.error("Aadhaar 12 digit ka hona chahiye");
    if (input.pincode.length !== 6) return toast.error("Pincode 6 digit ka hona chahiye");
    if (anyVerified && !confirm("Save karne par PAN / GST / Aadhaar verification dobara hogi. Continue karna hai?")) return;
    save.mutate(input);
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <h2 className="font-bold">{business ? "Business details update karo" : "Business details bharo"}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Save karte hi details admin verification ke liye chali jaayengi</p>
      </div>

      <div className="space-y-6 p-5">
        <FormGroup title="Business">
          <div className="sm:col-span-2">
            <Input label="Business Name" name="business_name" value={form.business_name} onChange={set("business_name")} required />
          </div>
          <SelectField label="Business Type" value={form.business_type} options={BUSINESS_TYPES} onChange={set("business_type")} />
          <SelectField label="Turnover" value={form.turnover} options={TURNOVERS} onChange={set("turnover")} />
        </FormGroup>

        <FormGroup title="Address">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</span>
            <textarea
              name="address"
              rows={2}
              required
              value={form.address}
              onChange={set("address")}
              className={cn(fieldCls, "h-auto py-2.5")}
            />
          </label>
          <Input label="City" name="city" value={form.city} onChange={set("city")} required />
          <SelectField label="State" value={form.state} options={STATES} onChange={set("state")} />
          <Input label="Pincode" name="pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={setDigits("pincode")} required />
        </FormGroup>

        <FormGroup title="KYC">
          <Input label="PAN" name="pan" maxLength={10} placeholder="ABCDE1234F" value={form.pan} onChange={setUpper("pan")} required className="font-mono" />
          <Input label="PAN Owner Name" name="pan_owner" value={form.pan_owner} onChange={set("pan_owner")} required />
          <Input label="GSTIN" name="gstin" maxLength={15} placeholder="06ABCDE1234F1Z5" value={form.gstin} onChange={setUpper("gstin")} className="font-mono" />
          <Input
            label="Aadhaar"
            name="aadhaar"
            inputMode="numeric"
            maxLength={12}
            placeholder="12 digit Aadhaar"
            value={form.aadhaar}
            onChange={setDigits("aadhaar")}
            required
            className="font-mono"
          />
        </FormGroup>
      </div>

      <div className="flex justify-end border-t border-slate-100 px-5 py-4 dark:border-white/10">
        <Button type="submit" loading={save.isPending}>
          {business ? "Save Changes" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  // Backend ki value list mein na ho tab bhi dikhe
  const all = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <select className={fieldCls} value={value} onChange={onChange} required>
        <option value="">Select {label}</option>
        {all.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
