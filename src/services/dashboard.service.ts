// 📊 Dashboard data
// ⚠️ Wallet balance real API (/apis/exchange/wallet) se aata hai, baaki abhi DEMO data hai.
// Jab backend ka dashboard endpoint mile, `getDashboard()` mein woh bhi laga dena.

import { axiosInstance } from "@/lib/axios";

export type TxnRow = {
  operator: string;
  amount: number;
  count: number;
  margin: number;
  avgPercent: number;
};

export type StockRow = {
  operator: string;
  maxMargin: number;
  stock: number;
};

export type DashboardData = {
  wallet: { buyer: number; seller: number };
  pending: {
    purchaseTxns: number;
    salesTxns: number;
    purchaseComplaints: number;
    salesComplaints: number;
  };
  today: {
    purchaseTotal: number;
    salesTotal: number;
    topupRequest: number;
    bankSettlement: number;
    blockAmount: number;
  };
  purchases: TxnRow[];
  sales: TxnRow[];
  stock: StockRow[];
};

const demo: DashboardData = {
  wallet: { buyer: 485143.8374, seller: 326629.2724 },
  pending: { purchaseTxns: 1, salesTxns: 0, purchaseComplaints: 0, salesComplaints: 0 },
  today: {
    purchaseTotal: 105788,
    salesTotal: 300452,
    topupRequest: 0,
    bankSettlement: 0,
    blockAmount: 0,
  },
  purchases: [
    { operator: "BSNL", amount: 39, count: 1, margin: 0.312, avgPercent: 0.8 },
    { operator: "Jio", amount: 101817, count: 249, margin: 1995.5814, avgPercent: 1.96 },
    { operator: "Vi", amount: 3932, count: 9, margin: 140.3168, avgPercent: 3.569 },
  ],
  sales: [
    { operator: "Tata Play", amount: 3886, count: 22, margin: 194.3, avgPercent: 5 },
    { operator: "Dish TV", amount: 4639, count: 22, margin: 231.95, avgPercent: 5 },
    { operator: "Airtel", amount: 291927, count: 731, margin: 2905.4705, avgPercent: 0.995 },
  ],
  stock: [
    { operator: "Airtel Digital TV", maxMargin: 4.21, stock: 25254970 },
    { operator: "Dish TV", maxMargin: 7.9, stock: 320325228 },
    { operator: "Sun Direct", maxMargin: 4.37, stock: 144531528 },
    { operator: "Tata Play", maxMargin: 5.06, stock: 66368575 },
    { operator: "Videocon D2H", maxMargin: 5.25, stock: 1019381544 },
    { operator: "Airtel", maxMargin: 2.12, stock: 550096354 },
    { operator: "BSNL", maxMargin: 4.23, stock: 25072688 },
    { operator: "Jio", maxMargin: 5.45, stock: 718710976 },
    { operator: "Vi", maxMargin: 3.9, stock: 49568617 },
    { operator: "MTNL", maxMargin: 4.6, stock: 25493588 },
  ],
};

export type WalletInfo = { id: string; balance: number; is_active: boolean };

export type UserWallet = {
  user_id: string;
  buyer_wallet: WalletInfo;
  seller_wallet: WalletInfo;
  total_balance: number;
};

// 💰 User ka buyer + seller wallet balance
export const getWallet = async (): Promise<UserWallet> => {
  const res = await axiosInstance.get("/apis/exchange/wallet");
  if (res.data?.err) throw new Error(res.data.message ?? "Wallet balance nahi mila");
  return res.data.data;
};

// Wallet real API se aata hai, baaki abhi demo
export async function getDashboard(): Promise<DashboardData> {
  const wallet = await getWallet();
  return {
    ...demo,
    wallet: {
      buyer: Number(wallet?.buyer_wallet?.balance ?? 0),
      seller: Number(wallet?.seller_wallet?.balance ?? 0),
    },
  };
}
