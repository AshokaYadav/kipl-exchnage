"use client";

import { CsvDownloadCard } from "@/components/reports/csv-download-card";

export default function DownloadBuyerLedgerPage() {
  return (
    <CsvDownloadCard
      kind="purchase-ledger"
      title="Buyer Ledger"
      subtitle="Purchase (buyer) ledger ki CSV download karo"
      fileName="purchase-ledger"
      singleDate
      select={{ key: "type", label: "Type", options: ["RECHARGE_DEBIT", "RECHARGE_REFUND", "RECHARGE_COMMISSION", "CREDIT"] }}
    />
  );
}
