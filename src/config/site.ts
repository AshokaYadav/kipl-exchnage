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
    | "rechargeHistory"
    | "daybook"
    | "sellerHistory"
    | "sellerLedger"
    | "fundRequest"
    | "settlementBanks"
    | "settlement"
    | "apis"
    | "stock"
    | "availableStock"
    | "purchase"
    | "reseller"
    | "account"
    | "profile"
    | "downloads"
    | "developer"
    | "help"
    | "buyer"
    | "complain"
    | "seller"
    | "fakeComplain"
    | "walletReverse"
    | "buyerLedger"
    | "sellerDaybook"
    | "summary"
    | "report"
    | "company"
    | "password"
    | "bank"
    | "ip"
    | "callback"
    | "helping"
    | "addApiRequest"
    | "invoice";
  // Dropdown ke andar wale pages
  children?: DashboardNavItem[];
};

export const dashboardNav: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  {
    label: "Buyer",
    href: "/dashboard/buyer",
    icon: "buyer",
    children: [
      { label: "Required Margin", href: "/dashboard/required-margin", icon: "requiredMargin" },
      { label: "Recharge History", href: "/dashboard/recharge-history", icon: "rechargeHistory" },
      { label: "Complain", href: "/dashboard/complain", icon: "complain" },
    ],
  },
  {
    label: "Seller",
    href: "/dashboard/seller",
    icon: "seller",
    children: [
      { label: "Seller History", href: "/dashboard/seller-history", icon: "sellerHistory" },
      { label: "Seller Margin", href: "/dashboard/seller-margin", icon: "stock" },
      { label: "Complain", href: "/dashboard/seller-complain", icon: "complain" },
      { label: "Fake Complain", href: "/dashboard/fake-complain", icon: "fakeComplain" },
      { label: "Wallet Reverse", href: "/dashboard/wallet-reverse", icon: "walletReverse" },
      { label: "My APIs", href: "/dashboard/apis", icon: "apis" },
    ],
  },
  {
    label: "Account",
    href: "/dashboard/account",
    icon: "account",
    children: [
      { label: "Seller Ledger", href: "/dashboard/seller-ledger", icon: "sellerLedger" },
      { label: "Buyer Ledger", href: "/dashboard/buyer-ledger", icon: "buyerLedger" },
      { label: "Seller Daybook", href: "/dashboard/seller-daybook", icon: "sellerDaybook" },
      { label: "Buyer Daybook", href: "/dashboard/daybook", icon: "daybook" },
      { label: "Summary", href: "/dashboard/summary", icon: "summary" },
      { label: "Settlement", href: "/dashboard/settlement", icon: "settlement" },
      { label: "Fund Request", href: "/dashboard/fund-request", icon: "fundRequest" },
    ],
  },
  {
    label: "Downloads CSV",
    href: "/dashboard/downloads",
    icon: "downloads",
    children: [
      { label: "Topup Request", href: "/dashboard/download-topup-request", icon: "fundRequest" },
      { label: "Bank Settlement", href: "/dashboard/download-bank-settlement", icon: "settlement" },
      { label: "Buyer Report", href: "/dashboard/download-buyer-report", icon: "report" },
      { label: "Seller Report", href: "/dashboard/download-seller-report", icon: "report" },
      { label: "Buyer Ledger", href: "/dashboard/download-buyer-ledger", icon: "buyerLedger" },
      { label: "Seller Ledger", href: "/dashboard/download-seller-ledger", icon: "sellerLedger" },
    ],
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: "profile",
    children: [
      { label: "Personal Details", href: "/dashboard/personal-details", icon: "profile" },
      { label: "Company Details", href: "/dashboard/company-details", icon: "company" },
      { label: "Change Password", href: "/dashboard/change-password", icon: "password" },
      { label: "Change Bank Details", href: "/dashboard/change-bank-details", icon: "bank" },
      { label: "IP", href: "/dashboard/ip", icon: "ip" },
      { label: "Callback", href: "/dashboard/callback", icon: "callback" },
    ],
  },
  {
    label: "Helping",
    href: "/dashboard/helping",
    icon: "helping",
    children: [
      // { label: "My APIs", href: "/dashboard/apis", icon: "apis" },
      { label: "Add API Request", href: "/dashboard/add-api-request", icon: "addApiRequest" },
    ],
  },
  {
    label: "Invoice",
    href: "/dashboard/invoice",
    icon: "invoice",
    children: [
      { label: "Seller Invoice", href: "/dashboard/seller-invoice", icon: "invoice" },
      { label: "Buyer Invoice", href: "/dashboard/buyer-invoice", icon: "invoice" },
    ],
  },
  // Ye abhi kisi dropdown mein nahi hain
  // { label: "Payment", href: "/dashboard/payment", icon: "payment" },d
  // Settlement Banks ab Settlement page ke andar hai
  // { label: "Settlement Banks", href: "/dashboard/settlement-banks", icon: "settlementBanks" },
  // { label: "Fix Margin", href: "/dashboard/fix-margin", icon: "margin" },
  { label: "Available Stock", href: "/dashboard/available-stock", icon: "availableStock" },
  // { label: "Purchase", href: "/dashboard/purchase", icon: "purchase" },
  // { label: "ReSeller", href: "/dashboard/reseller", icon: "reseller" },
  // { label: "DeveloperZone", href: "/dashboard/developer", icon: "developer" },
  // { label: "Help & More", href: "/dashboard/help", icon: "help" },
];

// Dropdown groups ko khol ke saare pages ki flat list (route lookup ke liye)
export const flatDashboardNav: DashboardNavItem[] = dashboardNav.flatMap((n) => n.children ?? [n]);




// buyer,seller,acount,downloadscsv,profile,helping,invoice


// buyer-dropdown ->required margin,recharge history,complain,
//seller-dropdown-> seller history,stock,complain,fake-complain,wallet-reverse,
//acount-dropdown->seller ledger,buyer-ledger,seller devbook ,buyer daybook ,summary, settlement, fund request
//downloadcsc -> topup request,bank setlment, buyer-report, seller-report, buyer-ledger ,seller ledger, 
// profile-dropdown->personal details , company details, change password,change bank details,  ip,callback, 
//helping-dropdown ->  my apis, add api request ,
// invoice -> seller invoice,buyer invoice 