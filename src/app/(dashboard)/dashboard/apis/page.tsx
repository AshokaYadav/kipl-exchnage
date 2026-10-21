"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Link2, Pencil, Plug, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { OperatorMappingModal } from "@/components/apis/operator-mapping-modal";
import { useApis, useSaveApi } from "@/hooks/useApis";
import type { ProviderApi, ProviderApiInput, StatusMap, StringMap } from "@/services/apis.service";

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

type FieldDef = { name: string; label: string; type?: "number" | "email"; required?: boolean; placeholder?: string };
// kv = { key: "value" }, status = { SUCCESS: ["1", "OK"] }
type MapDef = { name: string; label: string; kind: "kv" | "status"; keyLabel: string; valueLabel: string; hint?: string };

type TabDef = {
  key: string;
  label: string;
  hint: string;
  // URL + request template ek hi field mein: https://x.com/api?mobile={{mobile}}&amount={{amount}}
  url?: { name: string; template: string; label: string; required?: boolean };
  methodField?: string;
  text: FieldDef[];
  maps: MapDef[];
  tokens: string[];
};

// Placeholder jo URL / header mein click se daal sakte ho
const TOKEN_INFO: Record<string, string> = {
  api_user: "Username",
  api_pass: "Password",
  apikey: "API Key",
  mobile: "Mobile number",
  amount: "Amount",
  operator: "Operator code",
  client_id: "Hamari txn id",
  transaction_id: "Txn id",
  message: "Complaint message",
};

const headersDef = (name: string): MapDef => ({
  name,
  label: "Headers",
  kind: "kv",
  keyLabel: "Header",
  valueLabel: "Value",
});
const responseDef = (name: string): MapDef => ({
  name,
  label: "Response Mapping",
  kind: "kv",
  keyLabel: "Hamara field",
  valueLabel: "API response ka field",
  hint: "Provider ke response mein kis key se value uthani hai",
});
const statusDef = (name: string, label = "Status Mapping"): MapDef => ({
  name,
  label,
  kind: "status",
  keyLabel: "Status",
  valueLabel: "API values (comma se alag)",
  hint: "Provider ka status kis value par SUCCESS / PENDING / FAILED mana jaye",
});

const TABS: TabDef[] = [
  {
    key: "main",
    label: "Main",
    hint: "Recharge request — ye zaroori hai",
    url: { name: "url", template: "request_template", label: "Recharge URL", required: true },
    methodField: "method",
    text: [
      { name: "timeout", label: "Timeout (ms)", type: "number" },
      { name: "maxqueue", label: "Max Queue", type: "number" },
      { name: "username", label: "Username" },
      { name: "password", label: "Password" },
      { name: "api_key", label: "API Key" },
    ],
    maps: [headersDef("headers"), responseDef("response_mapping"), statusDef("status_mapping")],
    tokens: ["api_user", "api_pass", "apikey", "mobile", "amount", "operator", "client_id"],
  },
  {
    key: "balance",
    label: "Balance",
    hint: "Provider ke paas bacha balance check karna",
    url: { name: "balance_url", template: "balance_request_template", label: "Balance URL" },
    methodField: "balance_method",
    text: [],
    maps: [headersDef("balance_headers"), responseDef("balance_response_mapping"), statusDef("balance_status_mapping")],
    tokens: ["api_user", "api_pass", "apikey"],
  },
  {
    key: "status",
    label: "Status Check",
    hint: "Pending recharge ka status poochna",
    url: { name: "status_url", template: "status_request_template", label: "Status URL" },
    methodField: "status_method",
    text: [],
    maps: [headersDef("status_headers"), responseDef("status_response_mapping"), statusDef("txn_status_mapping", "Txn Status Mapping")],
    tokens: ["api_user", "api_pass", "apikey", "mobile", "transaction_id", "client_id"],
  },
  {
    key: "complaint",
    label: "Complaint",
    hint: "Recharge par complaint / dispute daalna",
    url: { name: "complaint_url", template: "complaint_request_template", label: "Complaint URL" },
    methodField: "complain_method",
    text: [{ name: "dispute_email", label: "Dispute Email", type: "email" }],
    maps: [headersDef("complaint_headers"), responseDef("complaint_response_mapping"), statusDef("complaint_status_mapping")],
    tokens: ["api_user", "api_pass", "apikey", "mobile", "transaction_id", "message"],
  },
  {
    key: "callback",
    label: "Callback",
    hint: "Provider jo callback bhejta hai use kaise padhna hai",
    text: [{ name: "callback_ip", label: "Callback IP", placeholder: "e.g. 103.20.10.5" }],
    maps: [responseDef("callback_response_mapping"), statusDef("callback_status_mapping", "Callback Status Mapping")],
    tokens: [],
  },
];

type Row = { k: string; v: string };
type FormState = { text: Record<string, string>; maps: Record<string, Row[]> };

const OK_FAIL = { SUCCESS: ["SUCCESS", "001", "OK", "1", "true"], FAILED: ["FAILED", "0", "ERROR", "false"] };

// Nayi API ke liye sample values (backend ke example se)
const SAMPLE_URL: Record<string, string> = {
  url: "?username={{api_user}}&password={{api_pass}}&mobile={{mobile}}&amount={{amount}}&operator={{operator}}&client_id={{client_id}}",
  balance_url: "?username={{api_user}}&password={{api_pass}}&apikey={{apikey}}",
  status_url: "?username={{api_user}}&password={{api_pass}}&mobile={{mobile}}&txn_id={{transaction_id}}",
  complaint_url: "?username={{api_user}}&password={{api_pass}}&mobile={{mobile}}&txn_id={{transaction_id}}&message={{message}}",
};

const SAMPLE_MAPS: Record<string, StringMap | StatusMap> = {
  headers: { "Content-Type": "application/json" },
  response_mapping: { status: "status", txn_id: "transaction_id", operator_id: "operator_id", message: "msg" },
  status_mapping: { SUCCESS: ["SUCCESS", "1"], PENDING: ["PENDING", "2"], FAILED: ["FAILED", "0"] },
  balance_response_mapping: { status: "status", balance: "balance", message: "msg" },
  balance_status_mapping: OK_FAIL,
  status_response_mapping: {
    status: "status",
    txn_id: "transaction_id",
    operator_id: "operator_id",
    message: "msg",
    hit_id: "hit_id",
    rec_api_id: "rec_api_id",
  },
  txn_status_mapping: { SUCCESS: OK_FAIL.SUCCESS, PENDING: ["PENDING", "2", "PROCESSING", "queued"], FAILED: OK_FAIL.FAILED },
  complaint_response_mapping: { status: "status", message: "msg", complaint_id: "complaint_id" },
  complaint_status_mapping: OK_FAIL,
  callback_response_mapping: {
    status: "status",
    txn_id: "txnid",
    api_ref: "refid",
    operator_ref: "operatorrefno",
    mobile: "mobileno",
    amount: "amount",
    message: "statusDetails",
    errorMsg: "errorMsg",
    raw_status: "statuscode",
    operator_name: "operatorname",
    circle_name: "circlename",
  },
  callback_status_mapping: {
    SUCCESS: ["SUCCESS", "001", "OK", "TXN_SUCCESS", "1", "true", "sent", "SUCCESSFUL"],
    PENDING: ["PENDING", "0", "2", "PROCESSING", "queued"],
    FAILED: ["FAILED", "ERROR", "FAILURE", "TXN_FAILED", "false", "failed"],
  },
};

// url + template → "url?key=value&..." (braces encode nahi karte, taaki {{mobile}} padhne mein aaye)
function joinUrl(url: unknown, template: unknown): string {
  const base = (url as string) ?? "";
  const qs = Object.entries((template as StringMap) ?? {})
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  if (!qs) return base;
  return `${base}${base.includes("?") ? "&" : "?"}${qs}`;
}

// "url?key=value&..." → { url, template }
function splitUrl(full: string): { url: string; template: StringMap } {
  const i = full.indexOf("?");
  if (i < 0) return { url: full, template: {} };
  const template: StringMap = {};
  for (const part of full.slice(i + 1).split("&")) {
    const j = part.indexOf("=");
    const k = (j < 0 ? part : part.slice(0, j)).trim();
    if (k) template[k] = j < 0 ? "" : part.slice(j + 1).trim();
  }
  return { url: full.slice(0, i), template };
}

function toRows(def: MapDef, value: unknown): Row[] {
  const entries = Object.entries((value as Record<string, string | string[]>) ?? {});
  if (!entries.length && def.kind === "status") {
    return ["SUCCESS", "PENDING", "FAILED"].map((k) => ({ k, v: "" }));
  }
  if (!entries.length) return [{ k: "", v: "" }];
  return entries.map(([k, v]) => ({ k, v: Array.isArray(v) ? v.join(", ") : String(v ?? "") }));
}

function fromRows(def: MapDef, rows: Row[]): StringMap | StatusMap | undefined {
  const out: Record<string, string | string[]> = {};
  for (const { k, v } of rows) {
    const key = k.trim();
    if (!key) continue;
    if (def.kind === "status") {
      const list = v.split(",").map((s) => s.trim()).filter(Boolean);
      if (list.length) out[key] = list;
    } else {
      out[key] = v.trim();
    }
  }
  return Object.keys(out).length ? (out as StringMap | StatusMap) : undefined;
}

function toFormState(api: ProviderApi | null): FormState {
  const form: FormState = { text: { name: api?.name ?? "" }, maps: {} };
  for (const tab of TABS) {
    if (tab.url) {
      form.text[tab.url.name] = api ? joinUrl(api[tab.url.name], api[tab.url.template]) : SAMPLE_URL[tab.url.name] ?? "";
    }
    if (tab.methodField) form.text[tab.methodField] = (api?.[tab.methodField] as string) ?? "";
    for (const f of tab.text) form.text[f.name] = api?.[f.name] == null ? "" : String(api[f.name]);
    for (const m of tab.maps) form.maps[m.name] = toRows(m, api ? api[m.name] : SAMPLE_MAPS[m.name]);
  }
  form.text.method ||= "POST";
  if (!api) {
    form.text.timeout = "10000";
    form.text.maxqueue = "10";
  }
  return form;
}

// Galat field par uska tab bhi saath bhejte hain, taaki form wahi tab khol de
class FormError extends Error {
  constructor(message: string, public tab: string) {
    super(message);
  }
}

// Form → API body. Khaali fields nahi bhejte.
function toPayload(form: FormState): ProviderApiInput {
  const name = form.text.name.trim();
  if (!name) throw new FormError("API Name zaroori hai", TABS[0].key);
  const body: Record<string, unknown> = { name };
  for (const tab of TABS) {
    if (tab.url) {
      const full = form.text[tab.url.name].trim();
      const { url, template } = splitUrl(full);
      if (tab.url.required && !url.trim()) throw new FormError(`${tab.url.label} zaroori hai`, tab.key);
      if (url.trim()) body[tab.url.name] = url.trim();
      if (url.trim() || Object.keys(template).length) body[tab.url.template] = template;
    }
    if (tab.methodField && form.text[tab.methodField]) body[tab.methodField] = form.text[tab.methodField];
    for (const f of tab.text) {
      const v = form.text[f.name].trim();
      if (!v) {
        if (f.required) throw new FormError(`${f.label} zaroori hai`, tab.key);
        continue;
      }
      body[f.name] = f.type === "number" ? Number(v) : v;
    }
    for (const m of tab.maps) {
      const v = fromRows(m, form.maps[m.name]);
      if (v) body[m.name] = v;
    }
  }
  return body as ProviderApiInput;
}

const fieldCls =
  "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-brand-500/20";

type InsertTarget = { el: HTMLInputElement; apply: (value: string) => void };

function ApiFormModal({ api, onClose }: { api: ProviderApi | null; onClose: () => void }) {
  const [form, setForm] = useState<FormState>(() => toFormState(api));
  const [tabKey, setTabKey] = useState(TABS[0].key);
  const save = useSaveApi(onClose);
  const tab = TABS.find((t) => t.key === tabKey)!;

  // Chip click par placeholder isi input mein cursor par jayega (default: URL)
  const urlRef = useRef<HTMLInputElement>(null);
  const target = useRef<InsertTarget | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setText = (name: string, value: string) => setForm((f) => ({ ...f, text: { ...f.text, [name]: value } }));
  const setRows = (name: string, rows: Row[]) => setForm((f) => ({ ...f, maps: { ...f.maps, [name]: rows } }));

  const track = (apply: (value: string) => void) => (e: React.FocusEvent<HTMLInputElement>) => {
    target.current = { el: e.currentTarget, apply };
  };

  const insertToken = (token: string) => {
    let t = target.current;
    if (!t || !t.el.isConnected) {
      if (!urlRef.current || !tab.url) return;
      const name = tab.url.name;
      t = { el: urlRef.current, apply: (v) => setText(name, v) };
    }
    const { el, apply } = t;
    const text = `{{${token}}}`;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    apply(el.value.slice(0, start) + text + el.value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let input: ProviderApiInput;
    try {
      input = toPayload(form);
    } catch (err) {
      if (err instanceof FormError) setTabKey(err.tab);
      toast.error((err as Error).message);
      return;
    }
    save.mutate({ id: api?.id, input });
  };

  const isConfigured = (t: TabDef) =>
    t.url ? !!splitUrl(form.text[t.url.name] ?? "").url.trim() : !!form.text.callback_ip?.trim();

  const selected = tab.url ? splitUrl(form.text[tab.url.name] ?? "") : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-950"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
              <Plug className="size-4" />
            </span>
            <div>
              <h2 className="font-bold leading-tight">{api ? `Edit API — ${api.name}` : "Add New API"}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{tab.label} · {tab.hint}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={save.isPending}>{api ? "Update API" : "Create API"}</Button>
            <button type="button" onClick={onClose} className="ml-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[260px_minmax(0,1fr)_340px] lg:overflow-hidden">
          {/* Left: naam + tabs */}
          <aside className="space-y-5 border-b border-slate-200 bg-white p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r dark:border-white/10 dark:bg-slate-900">
            <Input
              name="name"
              label="API Name *"
              placeholder="e.g. Kohinoor"
              value={form.text.name}
              onChange={(e) => setText("name", e.target.value)}
            />
            <nav className="flex gap-1 overflow-x-auto lg:flex-col">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTabKey(t.key)}
                  className={`flex shrink-0 items-start gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                    t.key === tabKey
                      ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200 dark:bg-brand-600/15 dark:text-brand-200 dark:ring-brand-500/30"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {t.label}
                      {isConfigured(t) && <span className="size-1.5 rounded-full bg-emerald-500" />}
                    </span>
                    <span className="hidden text-xs text-slate-500 lg:block dark:text-slate-400">{t.hint}</span>
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Middle: selected tab ka form */}
          <div className="space-y-5 p-5 lg:overflow-y-auto">
            {tab.url && (
              <Section title="Request" hint="URL ke saath hi parameters likho — ?key=value&key=value. Right side ke chip par click karo, cursor wali jagah value aa jayegi.">
                <div className="flex flex-col gap-3 sm:flex-row">
                  {tab.methodField && (
                    <select
                      value={form.text[tab.methodField]}
                      onChange={(e) => setText(tab.methodField!, e.target.value)}
                      className={`${fieldCls} font-semibold sm:w-32`}
                    >
                      {tab.key !== "main" && <option value="">Method</option>}
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                    </select>
                  )}
                  <input
                    ref={urlRef}
                    value={form.text[tab.url.name]}
                    onChange={(e) => setText(tab.url!.name, e.target.value)}
                    onFocus={track((v) => setText(tab.url!.name, v))}
                    placeholder={`${tab.url.label}${tab.url.required ? " *" : ""} — https://provider.com/api?mobile={{mobile}}`}
                    spellCheck={false}
                    className={`${fieldCls} flex-1 font-mono text-xs`}
                  />
                </div>
              </Section>
            )}

            {tab.text.length > 0 && (
              <Section title="Settings">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {tab.text.map((f) => (
                    <Input
                      key={f.name}
                      name={f.name}
                      label={f.required ? `${f.label} *` : f.label}
                      type={f.type ?? "text"}
                      placeholder={f.placeholder}
                      value={form.text[f.name]}
                      onChange={(e) => setText(f.name, e.target.value)}
                    />
                  ))}
                </div>
              </Section>
            )}

            {tab.maps.map((m) => (
              <Section key={m.name} title={m.label} hint={m.hint}>
                <RowsEditor
                  def={m}
                  rows={form.maps[m.name]}
                  onChange={(rows) => setRows(m.name, rows)}
                  onValueFocus={m.kind === "kv" && m.name.endsWith("headers") ? track : undefined}
                />
              </Section>
            ))}
          </div>

          {/* Right: selected tab ka summary + placeholders */}
          <aside className="space-y-5 border-t border-slate-200 bg-white p-5 lg:overflow-y-auto lg:border-l lg:border-t-0 dark:border-white/10 dark:bg-slate-900">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selected</p>
              <h3 className="mt-1 text-lg font-bold">{tab.label}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{tab.hint}</p>
            </div>

            {selected && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Request</p>
                <div className="rounded-xl bg-slate-100 p-3 font-mono text-xs break-all dark:bg-white/5">
                  <span className="font-bold text-brand-700 dark:text-brand-200">
                    {(tab.methodField && form.text[tab.methodField]) || "—"}
                  </span>{" "}
                  {selected.url || <em className="text-slate-400">URL nahi daala</em>}
                </div>
                <ParamPreview url={form.text[tab.url!.name]} />
              </div>
            )}

            {tab.tokens.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Placeholders — click karo, cursor par add ho jayega
                </p>
                <TokenChips tokens={tab.tokens} onPick={insertToken} />
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tabs</p>
              {TABS.map((t) => (
                <div key={t.key} className="flex items-center justify-between text-sm">
                  <span>{t.label}</span>
                  {isConfigured(t) ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Set</span>
                  ) : (
                    <span className="text-xs text-slate-400">Khaali</span>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
      <h3 className="text-sm font-bold">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function TokenChips({ tokens, onPick }: { tokens: string[]; onPick: (token: string) => void }) {
  if (!tokens.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((t) => (
        <button
          key={t}
          type="button"
          title={TOKEN_INFO[t]}
          // mouseDown par focus mat chhodo, warna cursor ki position kho jayegi
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(t)}
          className="rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 font-mono text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-600/15 dark:text-brand-200 dark:hover:bg-brand-600/25"
        >
          {`{{${t}}}`}
        </button>
      ))}
    </div>
  );
}

// URL ke parameters ko table mein dikhata hai, taaki galti turant dikhe
function ParamPreview({ url }: { url: string }) {
  const params = Object.entries(splitUrl(url).template);
  if (!params.length) return null;
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-white/5 dark:border-white/10">
      {params.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 px-3 py-1.5 font-mono text-[11px]">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{k}</span>
          <span className="truncate text-slate-500 dark:text-slate-400">{v || <em className="text-red-500">khaali</em>}</span>
        </div>
      ))}
    </div>
  );
}

function RowsEditor({
  def,
  rows,
  onChange,
  onValueFocus,
}: {
  def: MapDef;
  rows: Row[];
  onChange: (rows: Row[]) => void;
  onValueFocus?: (apply: (value: string) => void) => (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  const update = (i: number, patch: Partial<Row>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1.4fr_auto] gap-2 px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>{def.keyLabel}</span>
        <span>{def.valueLabel}</span>
        <span className="w-9" />
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
          <input
            value={r.k}
            onChange={(e) => update(i, { k: e.target.value })}
            spellCheck={false}
            className={`${fieldCls} font-mono text-xs ${def.kind === "status" ? "font-bold" : ""}`}
          />
          <input
            value={r.v}
            onChange={(e) => update(i, { v: e.target.value })}
            onFocus={onValueFocus?.((v) => update(i, { v }))}
            placeholder={def.kind === "status" ? "SUCCESS, 1, OK" : ""}
            spellCheck={false}
            className={`${fieldCls} font-mono text-xs`}
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            className="grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            aria-label="Row hatao"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { k: "", v: "" }])}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-600/20"
      >
        <Plus className="size-3.5" /> Row add karo
      </button>
    </div>
  );
}
