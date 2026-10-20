import {
  CreditCard,
  Download,
  Code2,
  HelpCircle,
  LayoutDashboard,
  Percent,
  Plug,
  ShoppingCart,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import type { DashboardNavItem } from "@/config/site";

const map = {
  dashboard: LayoutDashboard,
  payment: CreditCard,
  margin: Percent,
  apis: Plug,
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
