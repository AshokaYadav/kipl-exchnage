import {
  Banknote,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  CreditCard,
  Download,
  Gauge,
  Code2,
  HandCoins,
  HelpCircle,
  History,
  LayoutDashboard,
  NotebookTabs,
  Percent,
  Plug,
  ShoppingCart,
  UserCircle,
  Users,
  Wallet,
  WalletCards,
} from "lucide-react";
import type { DashboardNavItem } from "@/config/site";

const map = {
  dashboard: LayoutDashboard,
  payment: CreditCard,
  margin: Percent,
  requiredMargin: Gauge,
  rechargeHistory: History,
  daybook: BookOpen,
  sellerHistory: HandCoins,
  sellerLedger: NotebookTabs,
  fundRequest: WalletCards,
  settlementBanks: Building2,
  settlement: Banknote,
  apis: Plug,
  stock: Boxes,
  availableStock: BarChart3,
  purchase: ShoppingCart,
  reseller: Users,
  account: Wallet,
  profile: UserCircle,
  downloads: Download,
  developer: Code2,
  help: HelpCircle,
} as const;

export function NavIcon({
  name,
  className,
}: {
  name: DashboardNavItem["icon"];
  className?: string;
}) {
  const Icon = map[name];
  return <Icon className={className} />;
}
