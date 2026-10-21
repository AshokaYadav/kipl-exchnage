// 🔧 Saari company details yahin se change karo — poori website mein yahi use hota hai.
export const siteConfig = {
  brand: "KIPLExchange",
  company: "KASHISHINDIA PVT LTD",
  tagline: "Mobile & DTH Recharge Market Place",
  description:
    "B2B recharge exchange — connect your APIs, set your margins and automate your entire recharge flow.",
    contact: {
    phone: "+91 9570007333",
    email: "Support@kiplexchange.com",
    altEmail: "Support@kiplexchange.com",
    // Ek line wala address (Contact section mein use hota hai)
    address:
      "Plot No. 102, Sherpur, N.H.-48, Behror, District: Kotputli Behror, Rajasthan - 301701",
    // Footer mein line-by-line dikhane ke liye
    addressLines: [
      "Plot No. 102, Sherpur",
      "N.H.-48, Behror",
      "District: Kotputli Behror",
      "Rajasthan - 301701",
    ],
  },
  social: {
    facebook: "#",
    instagram: "#",
    x: "#",
  },
};

export type DashboardNavItem = {
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "payment"
    | "margin"
    | "requiredMargin"
    | "apis"
    | "stock"
    | "purchase"
    | "reseller"
    | "account"
    | "profile"
    | "downloads"
    | "developer"
    | "help";
};

export const dashboardNav: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Payment", href: "/dashboard/payment", icon: "payment" },
  { label: "Fix Margin", href: "/dashboard/fix-margin", icon: "margin" },
  { label: "My APIs", href: "/dashboard/apis", icon: "apis" },
  { label: "Stock", href: "/dashboard/stock", icon: "stock" },
  { label: "Required Margin", href: "/dashboard/required-margin", icon: "requiredMargin" },
  { label: "Purchase", href: "/dashboard/purchase", icon: "purchase" },
  { label: "ReSeller", href: "/dashboard/reseller", icon: "reseller" },
  { label: "Account", href: "/dashboard/account", icon: "account" },
  { label: "Profile", href: "/dashboard/profile", icon: "profile" },
  { label: "Downloads CSV", href: "/dashboard/downloads", icon: "downloads" },
  { label: "DeveloperZone", href: "/dashboard/developer", icon: "developer" },
  { label: "Help & More", href: "/dashboard/help", icon: "help" },
];
