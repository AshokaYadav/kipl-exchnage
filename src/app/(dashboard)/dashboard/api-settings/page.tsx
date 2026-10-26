"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Copy, Eye, EyeOff, KeyRound, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  useApiTokens,
  useDeleteApiToken,
  useDeleteIp,
  useIps,
  useRegenerateApiToken,
  useSaveApiToken,
  useToggleApiToken,
} from "@/hooks/useApiAccess";
import type { ApiToken, WhitelistIp } from "@/services/api-access.service";

const tokenHelper = createColumnHelper<ApiToken>();
const ipHelper = createColumnHelper<WhitelistIp>();

const IP_STATUSES = ["", "PENDING", "APPROVED", "REJECTED"];
const IP_LIMIT = 50;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function ApiSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
          <KeyRound className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">API Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Apne API tokens, callback URL aur whitelisted IPs</p>
        </div>
      </div>

      <TokensSection />
      <IpsSection />
    </div>
  );
}

// ───────────── API tokens ─────────────

function TokensSection() {
  const { data = [], isLoading, isError, refetch } = useApiTokens();
  // undefined = form band, null = naya token, object = edit
  const [editing, setEditing] = useState<ApiToken | null | undefined>(undefined);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const toggle = useToggleApiToken();
  const regenerate = useRegenerateApiToken();
  const remove = useDeleteApiToken();
  const togglingId = toggle.isPending ? toggle.variables?.id : undefined;

  const columns = useMemo(
    () => [
      tokenHelper.display({
        id: "sr",
        header: "Sr No",
        cell: (i) => i.table.getRowModel().rows.findIndex((r) => r.id === i.row.id) + 1,
      }),
      tokenHelper.accessor("name", {
        header: "Name",
        cell: (i) => <span className="font-semibold">{i.getValue()}</span>,
      }),
      tokenHelper.accessor("token", {
        header: "Token",
        cell: (i) => {
          const { id } = i.row.original;
          const token = i.getValue();
          const shown = visible[id];
          return (
            <div className="flex items-center gap-1.5">
              <code className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-white/10">
                {shown ? token : `${token.slice(0, 6)}••••••••${token.slice(-4)}`}
              </code>
              <button
                onClick={() => setVisible((v) => ({ ...v, [id]: !shown }))}
                title={shown ? "Chhupao" : "Dikhao"}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(token).then(() => toast.success("Token copy ho gaya"))}
                title="Copy"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          );
        },
      }),
      tokenHelper.accessor("callback_url", {
        header: "Callback URL",
        cell: (i) => (
          <span className="block max-w-[260px] truncate text-slate-500 dark:text-slate-400" title={i.getValue() ?? ""}>
            {i.getValue() || "—"}
          </span>
        ),
      }),
      tokenHelper.accessor("status", {
        header: "Status",
        // Click par ACTIVE ↔ INACTIVE
        cell: (i) => {
          const { id } = i.row.original;
          const active = i.getValue() === "ACTIVE";
          return (
            <button
              role="switch"
              aria-checked={active}
              onClick={() => toggle.mutate({ id, status: active ? "INACTIVE" : "ACTIVE" })}
              disabled={togglingId === id}
              title={active ? "Inactive karo" : "Active karo"}
              className="inline-flex items-center gap-2 text-xs font-semibold disabled:opacity-50"
            >
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                  active ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                    active ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </span>
              <span className={active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"}>
                {active ? "Active" : "Inactive"}
              </span>
            </button>
          );
        },
      }),
      tokenHelper.accessor("last_used_at", {
        header: "Last Used",
        cell: (i) => (
          <div className="text-xs">
            <div>{formatDate(i.getValue())}</div>
            {i.row.original.last_used_ip && (
              <div className="text-slate-500 dark:text-slate-400">{i.row.original.last_used_ip}</div>
            )}
          </div>
        ),
      }),
      tokenHelper.accessor("createdAt", { header: "Created", cell: (i) => formatDate(i.getValue()) }),
      tokenHelper.display({
        id: "actions",
        header: "Actions",
        cell: (i) => {
          const row = i.row.original;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(row)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-600/20"
              >
                <Pencil className="size-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${row.name}" ka naya token banana hai? Purana token turant band ho jaayega.`)) {
                    regenerate.mutate(row.id);
                  }
                }}
                disabled={regenerate.isPending && regenerate.variables === row.id}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:text-amber-300 dark:hover:bg-amber-500/10"
              >
                <RefreshCw className="size-3.5" /> Regenerate
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${row.name}" token delete karna hai?`)) remove.mutate(row.id);
                }}
                disabled={remove.isPending && remove.variables === row.id}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                <Trash2 className="size-3.5" /> Delete
              </button>
            </div>
          );
        },
      }),
    ],
    [visible, toggle.mutate, togglingId, regenerate, remove]
  );

  return (
    <>
      <Card
        title="API Tokens"
        action={
          <Button onClick={() => setEditing(null)} className="h-9 px-4">
            <Plus className="size-4" /> Generate Token
          </Button>
        }
      >
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
        ) : isError ? (
          <div className="p-5 text-sm text-red-600 dark:text-red-300">
            Tokens load nahi hue.{" "}
            <button onClick={() => refetch()} className="font-semibold underline">Retry</button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} getRowId={(r) => r.id} emptyText="Abhi koi token nahi hai — Generate Token dabao" />
        )}
      </Card>

      {editing !== undefined && <TokenFormModal token={editing} onClose={() => setEditing(undefined)} />}
    </>
  );
}

function TokenFormModal({ token, onClose }: { token: ApiToken | null; onClose: () => void }) {
  const [name, setName] = useState(token?.name ?? "");
  const [callbackUrl, setCallbackUrl] = useState(token?.callback_url ?? "");
  const save = useSaveApiToken(onClose);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      save.mutate({ id: token.id, input: { callback_url: callbackUrl.trim() } });
    } else {
      if (!name.trim()) return toast.error("Token ka naam daalo");
      save.mutate({ input: { name: name.trim(), callback_url: callbackUrl.trim() } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="font-bold">{token ? `Edit Token — ${token.name}` : "Generate New Token"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website"
            disabled={Boolean(token)}
            required={!token}
          />
          <Input
            label="Callback URL"
            name="callback_url"
            type="url"
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
            placeholder="https://example.com/recharge-callback"
            hint="Recharge ka final status is URL par bheja jaayega"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-white/10">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={save.isPending}>{token ? "Save" : "Generate"}</Button>
        </div>
      </form>
    </div>
  );
}

// ───────────── Whitelisted IPs ─────────────

function IpsSection() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useIps({ status, page, limit: IP_LIMIT });
  const remove = useDeleteIp();
  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / IP_LIMIT));

  const columns = useMemo(
    () => [
      ipHelper.display({
        id: "sr",
        header: "Sr No",
        cell: (i) => (page - 1) * IP_LIMIT + i.table.getRowModel().rows.findIndex((r) => r.id === i.row.id) + 1,
      }),
      ipHelper.accessor("ip", {
        header: "IP",
        cell: (i) => <span className="font-mono font-semibold">{i.getValue()}</span>,
      }),
      ipHelper.accessor("status", {
        header: "Status",
        cell: (i) => {
          const v = i.getValue();
          const tone =
            v === "APPROVED" || v === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              : v === "PENDING"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
          return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{v}</span>;
        },
      }),
      ipHelper.accessor("source", { header: "Source" }),
      ipHelper.accessor("remark", { header: "Remark", cell: (i) => i.getValue() || "—" }),
      ipHelper.accessor("hits", { header: "Hits" }),
      ipHelper.accessor("last_seen_at", { header: "Last Seen", cell: (i) => formatDate(i.getValue()) }),
      ipHelper.accessor("approved_at", { header: "Approved At", cell: (i) => formatDate(i.getValue()) }),
      ipHelper.accessor("createdAt", { header: "Added", cell: (i) => formatDate(i.getValue()) }),
      ipHelper.display({
        id: "actions",
        header: "Actions",
        cell: (i) => {
          const row = i.row.original;
          return (
            <button
              onClick={() => {
                if (confirm(`IP ${row.ip} list se hatana hai?`)) remove.mutate(row.id);
              }}
              disabled={remove.isPending && remove.variables === row.id}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          );
        },
      }),
    ],
    [page, remove]
  );

  return (
    <Card
      title="Whitelisted IPs"
      action={
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 dark:border-white/15 dark:bg-slate-900 dark:text-white"
        >
          {IP_STATUSES.map((s) => (
            <option key={s} value={s}>{s || "All Status"}</option>
          ))}
        </select>
      }
    >
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
      ) : isError ? (
        <div className="p-5 text-sm text-red-600 dark:text-red-300">
          IP list load nahi hui.{" "}
          <button onClick={() => refetch()} className="font-semibold underline">Retry</button>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={rows} getRowId={(r) => r.id} emptyText="Koi IP nahi mila" />
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 px-4 py-3 text-sm">
              <Button variant="outline" className="h-9 px-3" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <span className="text-slate-500 dark:text-slate-400">
                Page {page} / {totalPages}
              </span>
              <Button variant="outline" className="h-9 px-3" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <h2 className="font-bold">{title}</h2>
        {action}
      </div>
      <div className="p-1">{children}</div>
    </section>
  );
}
