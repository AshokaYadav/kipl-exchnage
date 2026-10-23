"use client";

import { CsvDownloadCard } from "@/components/reports/csv-download-card";

export default function DownloadTopupRequestPage() {
  return (
    <CsvDownloadCard
      kind="topup"
      title="Topup Request"
      subtitle="Topup / fund requests ki CSV download karo"
      fileName="topup-requests"
      select={{ key: "status", label: "Status", options: ["PENDIND", "APPROVED", "REJECTED"] }}
    />
  );
}
