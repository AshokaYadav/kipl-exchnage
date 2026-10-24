"use client";

import { CsvDownloadCard } from "@/components/reports/csv-download-card";

export default function DownloadBuyerReportPage() {
  return (
    <CsvDownloadCard
      kind="purchase-report"
      title="Buyer Report"
      subtitle="Purchase (buyer) recharges ki CSV download karo"
      fileName="purchase-report"
      singleDate
      select={{ key: "status", label: "Status", options: ["SUCCESS", "FAILED", "PENDING"] }}
      text={{ key: "mobile", label: "Mobile", placeholder: "9876543210" }}
    />
  );
}
