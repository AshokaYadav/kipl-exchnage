"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, PageHeader, fieldCls, monthStart, today } from "@/components/reports/report-parts";
import { getErrorMessage } from "@/lib/axios";
import { downloadCsv, type DownloadKind, type DownloadParams } from "@/services/download.service";

// ♻️ Saare "Downloads CSV" pages isi card se bante hain

type SelectFilter = { key: "status" | "type"; label: string; options: string[] };
type TextFilter = { key: "mobile" | "operator_id"; label: string; placeholder?: string };

type Props = {
  kind: DownloadKind;
  title: string;
  subtitle: string;
  fileName: string;
  select?: SelectFilter;
  text?: TextFilter;
  // Sirf ek date — wahi from aur to dono mein jaati hai
  singleDate?: boolean;
};

export function CsvDownloadCard({ kind, title, subtitle, fileName, select, text, singleDate }: Props) {
  const [from, setFrom] = useState(singleDate ? today : monthStart);
  const [to, setTo] = useState(today);
  const [selected, setSelected] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  const onDownload = async () => {
    if (!from || !to) return toast.error(singleDate ? "Date chahiye" : "From aur To date dono chahiye");
    if (from > to) return toast.error("From date, To date se pehle honi chahiye");

    const params: DownloadParams = { from, to };
    if (select) params[select.key] = selected;
    if (text) params[text.key] = typed.trim();

    setBusy(true);
    try {
      await downloadCsv(kind, params, fileName);
      toast.success("CSV download ho gayi ✅");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={<FileSpreadsheet className="size-5" />} title={title} subtitle={subtitle} />

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3 px-5 py-5">
          {singleDate ? (
            <Field label="Date">
              <input
                type="date"
                className={fieldCls}
                value={from}
                max={today()}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setTo(e.target.value);
                }}
              />
            </Field>
          ) : (
            <>
              <Field label="From">
                <input type="date" className={fieldCls} value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label="To">
                <input type="date" className={fieldCls} value={to} min={from || undefined} max={today()} onChange={(e) => setTo(e.target.value)} />
              </Field>
            </>
          )}
          {select && (
            <Field label={select.label}>
              <select className={fieldCls} value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">All</option>
                {select.options.map((o) => (
                  // Backend topup mein "PENDIND" leta hai — dikhao PENDING hi
                  <option key={o} value={o}>{o.startsWith("PEND") ? "PENDING" : o.replaceAll("_", " ")}</option>
                ))}
              </select>
            </Field>
          )}
          {text && (
            <Field label={text.label}>
              <input className={fieldCls} value={typed} placeholder={text.placeholder} onChange={(e) => setTyped(e.target.value)} />
            </Field>
          )}
          <Button type="button" loading={busy} onClick={onDownload}>
            {!busy && <Download className="size-4" />} Download CSV
          </Button>
        </div>
      </section>
    </div>
  );
}
