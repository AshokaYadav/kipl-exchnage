// 📊 Dashboard data
// ⚠️ Abhi DEMO data hai (tumhare purane dashboard ke numbers se).
// Jab backend ka dashboard endpoint mile, sirf `getDashboard()` ke andar
// axiosInstance.get("/dashboard") laga dena — baaki UI apne aap chalega.

// import { axiosInstance } from "@/lib/axios";

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

export async function getDashboard(): Promise<DashboardData> {
  // const res = await axiosInstance.get("/dashboard");
  // return res.data;
  await new Promise((r) => setTimeout(r, 400));
  return demo;
}
