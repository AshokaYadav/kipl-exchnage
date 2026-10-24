"use client";

import { CsvDownloadCard } from "@/components/reports/csv-download-card";

export default function DownloadSellerLedgerPage() {
  return (
    <CsvDownloadCard
      kind="resales-ledger"
      title="Seller Ledger"
      subtitle="ReSales (seller) ledger ki CSV download karo"
      fileName="resales-ledger"
      singleDate
    />
  );
}
