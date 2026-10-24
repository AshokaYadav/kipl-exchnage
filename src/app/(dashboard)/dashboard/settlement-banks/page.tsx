import { redirect } from "next/navigation";

// Banks ab Settlement page ke top par hain — purana link wahin bhej do
export default function SettlementBanksPage() {
  redirect("/dashboard/settlement");
}
