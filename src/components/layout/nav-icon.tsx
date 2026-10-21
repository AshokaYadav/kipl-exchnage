import {
  Boxes,
  CreditCard,
  Download,
  Gauge,
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
  requiredMargin: Gauge,
  apis: Plug,
  stock: Boxes,
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
