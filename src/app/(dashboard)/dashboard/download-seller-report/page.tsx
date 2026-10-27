"use client";

import { CsvDownloadCard } from "@/components/reports/csv-download-card";

export default function DownloadSellerReportPage() {
  return (
    <CsvDownloadCard
      kind="resales-report"
      title="Seller Report"
      subtitle="ReSales (seller) recharges ki CSV download karo"
      fileName="resales-report"
      singleDate
      select={{ key: "status", label: "Status", options: ["SUCCESS", "FAILED", "PENDING"] }}
      // text={{ key: "operator_id", label: "Operator ID", placeholder: "Operator ID" }}
    />
  );
}
