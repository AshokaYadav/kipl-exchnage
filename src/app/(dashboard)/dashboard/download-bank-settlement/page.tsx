"use client";

import { CsvDownloadCard } from "@/components/reports/csv-download-card";

export default function DownloadBankSettlementPage() {
  return (
    <CsvDownloadCard
      kind="settlement"
      title="Bank Settlement"
      subtitle="Bank settlements ki CSV download karo"
      fileName="bank-settlements"
      select={{ key: "status", label: "Status", options: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] }}
    />
  );
}
