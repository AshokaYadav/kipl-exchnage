"use client";

import { useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Link2, Pencil, Plug, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { OperatorMappingModal } from "@/components/apis/operator-mapping-modal";
import { useApis, useSaveApi } from "@/hooks/useApis";
import type { ProviderApi, ProviderApiInput } from "@/services/apis.service";

const apiHelper = createColumnHelper<ProviderApi>();




export default function ApisPage() {
  const { data = [], isLoading, isError, refetch } = useApis();
  // undefined = form band, null = nayi API, object = edit
  const [editing, setEditing] = useState<ProviderApi | null | undefined>(undefined);
  const [mappingApi, setMappingApi] = useState<ProviderApi | null>(null);

  const columns = useMemo(
    () => [
      apiHelper.accessor("apicode", { header: "Code" }),
      apiHelper.accessor("name", {
        header: "Name",
        cell: (i) => <span className="font-semibold">{i.getValue()}</span>,
      }),
      apiHelper.accessor("type", { header: "Type" }),
      apiHelper.accessor("method", { header: "Method" }),
      apiHelper.accessor("url", {
        header: "URL",
        cell: (i) => (
          <span className="block max-w-[260px] truncate text-slate-500 dark:text-slate-400" title={i.getValue()}>
            {i.getValue()}
          </span>
        ),
      }),
      apiHelper.accessor("timeout", { header: "Timeout (ms)" }),
      apiHelper.accessor("status", {
        header: "Status",
        cell: (i) =>
          i.getValue() ? (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Active</span>
          ) : (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">Inactive</span>
          ),
      }),
      apiHelper.display({
        id: "actions",
        header: "Actions",
        cell: (i) => (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(i.row.original)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-600/20"
            >
              <Pencil className="size-3.5" /> Edit
            </button>
            <button
              onClick={() => setMappingApi(i.row.original)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-600/20"
            >
              <Link2 className="size-3.5" /> Operators
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
            <Plug className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">My APIs</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Provider APIs aur operator margin mapping</p>
          </div>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="size-4" /> Add API
        </Button>
      </div>

      <Card title="API List">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
        ) : isError ? (
          <div className="p-5 text-sm text-red-600 dark:text-red-300">
            APIs load nahi hui.{" "}
            <button onClick={() => refetch()} className="font-semibold underline">Retry</button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} emptyText="Abhi koi API nahi hai — Add API dabao" />
        )}
      </Card>

      {mappingApi && (
        <OperatorMappingModal key={mappingApi.id} api={mappingApi} onClose={() => setMappingApi(null)} />
      )}

      {editing !== undefined && (
        <ApiFormModal api={editing} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}





















function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="p-1">{children}</div>
    </section>
  );
}

// ───────────── API create / edit form ─────────────

const TEXT_FIELDS = [
  { name: "name", label: "Name", required: true },
  { name: "url", label: "Recharge URL", required: true },
  { name: "timeout", label: "Timeout (ms)", type: "number" },
  { name: "username", label: "Username" },
  { name: "password", label: "Password" },
  { name: "api_key", label: "API Key" },
  { name: "status_url", label: "Status URL" },
  { name: "balance_url", label: "Balance URL" },
  { name: "callback_ip", label: "Callback IP" },
] as const;

const JSON_FIELDS = [
  { name: "headers", label: "Headers" },
  { name: "request_template", label: "Request Template" },
  { name: "response_mapping", label: "Response Mapping" },
  { name: "status_mapping", label: "Status Mapping" },
] as const;

type TextField = (typeof TEXT_FIELDS)[number]["name"];
type JsonField = (typeof JSON_FIELDS)[number]["name"];
type FormState = Record<TextField | JsonField | "method", string>;

// Nayi API ke liye sample templates (backend ke example se)
const SAMPLE_JSON: Record<JsonField, unknown> = {
  headers: { "Content-Type": "application/json" },
  request_template: {
    username: "{{api_user}}",
    password: "{{api_pass}}",
    mobile: "{{mobile}}",
    amount: "{{amount}}",
    operator: "{{operator}}",
    client_id: "{{client_id}}",
  },
  response_mapping: {
    status: "status",
    txn_id: "transaction_id",
    operator_id: "operator_id",
    message: "msg",
  },
  status_mapping: {
    SUCCESS: ["SUCCESS", "1"],
    FAILED: ["FAILED", "0"],
    PENDING: ["PENDING", "2"],
  },
};

const pretty = (v: unknown) => (v ? JSON.stringify(v, null, 2) : "");

function toFormState(api: ProviderApi | null): FormState {
  return {
    name: api?.name ?? "",
    url: api?.url ?? "",
    method: api?.method ?? "POST",
    timeout: String(api?.timeout ?? 10000),
    username: api?.username ?? "",
    password: api?.password ?? "",
    api_key: api?.api_key ?? "",
    status_url: api?.status_url ?? "",
    balance_url: api?.balance_url ?? "",
    callback_ip: api?.callback_ip ?? "",
    headers: pretty(api ? api.headers : SAMPLE_JSON.headers),
    request_template: pretty(api ? api.request_template : SAMPLE_JSON.request_template),
    response_mapping: pretty(api ? api.response_mapping : SAMPLE_JSON.response_mapping),
    status_mapping: pretty(api ? api.status_mapping : SAMPLE_JSON.status_mapping),
  };
}

// Form → API body. Khaali fields nahi bhejte; galat JSON par field ka naam throw karte hain.
function toPayload(form: FormState): ProviderApiInput {
  const body: Record<string, unknown> = { method: form.method };
  for (const f of TEXT_FIELDS) {
    const v = form[f.name].trim();
    if (v) body[f.name] = f.name === "timeout" ? Number(v) : v;
  }
  for (const f of JSON_FIELDS) {
    const v = form[f.name].trim();
    if (!v) continue;
    try {
      body[f.name] = JSON.parse(v);
    } catch {
      throw new Error(`${f.label} ka JSON sahi nahi hai`);
    }
  }
  return body as ProviderApiInput;
}

function ApiFormModal({ api, onClose }: { api: ProviderApi | null; onClose: () => void }) {
  const [form, setForm] = useState<FormState>(() => toFormState(api));
  const save = useSaveApi(onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (name: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [name]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let input: ProviderApiInput;
    try {
      input = toPayload(form);
    } catch (err) {
      toast.error((err as Error).message);
      return;
    }
    save.mutate({ id: api?.id, input });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-3xl rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <h2 className="text-lg font-bold">{api ? `Edit API — ${api.name}` : "Add New API"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {TEXT_FIELDS.map((f) => (
            <Input
              key={f.name}
              name={f.name}
              label={f.label}
              type={"type" in f ? f.type : "text"}
              required={"required" in f && f.required}
              value={form[f.name]}
              onChange={set(f.name)}
            />
          ))}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Method</span>
            <select
              value={form.method}
              onChange={set("method")}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-500/20"
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
            </select>
          </label>

          {JSON_FIELDS.map((f) => (
            <label key={f.name} className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{f.label} (JSON)</span>
              <textarea
                rows={6}
                spellCheck={false}
                value={form[f.name]}
                onChange={set(f.name)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-500/20"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-white/10">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={save.isPending}>{api ? "Update API" : "Create API"}</Button>
        </div>
      </form>
    </div>
  );
}
