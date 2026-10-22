import { axiosInstance } from "@/lib/axios";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

export type RechargeStatus = "SUCCESS" | "FAILED" | "PENDING" | (string & {});

export type Paged<T> = { total: number; page: number; limit: number; data: T[] };

// ───────────── Buyer recharge history ─────────────
export type BuyerRecharge = {
  id: string;
  mobile: string;
  price: string;
  category_id: string;
  charge_amount: number;
  status: RechargeStatus;
  msg: string | null;
  op_id: string | null;
  clientRefNo: string | null;
  api_txn_id: string | null;
  operator_id: string;
  circle_id: string;
  opening_balance: number;
  closing_balance: number;
  createdAt: string;
  operator: { id: string; name: string; image_url: string | null };
  margin: number;
  margin_percent: number;
  net_charge: number;
};

export type BuyerRechargeParams = {
  page?: number;
  limit?: number;
  status?: string;
  from?: string;
  to?: string;
  mobile?: string;
};

// ───────────── Buyer daybook ─────────────
export type DaybookRow = {
  date: string;
  opening_balance: number;
  closing_balance: number;
  credit: number;
  debit: number;
  recharge_debit: number;
  refund: number;
  margin_earned: number;
  wallet_topup: number;
  other: number;
  recharges: {
    total: number;
    success: number;
    failed: number;
    pending: number;
    success_amount: number;
    success_charge: number;
  };
  net_spend: number;
};

export type Daybook = { from: string; to: string; data: DaybookRow[] };

// ───────────── Seller history ─────────────
export type SellerHistoryRow = {
  id: string;
  date: string;
  status: RechargeStatus;
  amount: number;
  margin_percent: number;
  margin_amount: number;
  payout: number;
  api: { id: string; name: string };
  recharge: {
    id: string;
    mobile: string;
    price: number;
    status: RechargeStatus;
    order_id: string | null;
    client_ref: string | null;
    op_ref: string | null;
    operator: { id: string; name: string; image_url: string | null };
    circle: { id: string; name: string };
  };
};

export type SellerHistoryParams = { page?: number; limit?: number; from?: string; to?: string };

// ───────────── Seller ledger ─────────────
export type SellerLedgerType = "RECHARGE_CREDIT" | "RECHARGE_REVERSAL" | (string & {});

export type SellerLedgerRow = {
  id: string;
  seller_id: string;
  buyer_id: string;
  api_id: string;
  recharge_id: string | null;
  operator_id: string | null;
  amount: number;
  margin: number;
  delta: number;
  opening_balance: number;
  closing_balance: number;
  type: SellerLedgerType;
  status: RechargeStatus;
  msg: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerLedgerParams = { page?: number; limit?: number; type?: string; from?: string; to?: string };

// err aaye toh throw karo, taaki react-query error state mein jaaye
function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// Khaali filters query mein nahi jaate
function clean(params: Record<string, string | number | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}

function toPaged<T>(data: Paged<T> | undefined, page: number, limit: number): Paged<T> {
  return {
    total: data?.total ?? 0,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    data: data?.data ?? [],
  };
}

// 🧾 Buyer ki recharge history
export const getBuyerRecharges = async (params: BuyerRechargeParams = {}): Promise<Paged<BuyerRecharge>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const res = await axiosInstance.get("/apis/exchange/recharges", { params: clean({ ...params, page, limit }) });
  return toPaged(unwrap<Paged<BuyerRecharge>>(res.data), page, limit);
};

// 📒 Buyer daybook — din-wise hisaab
export const getBuyerDaybook = async (params: { from?: string; to?: string } = {}): Promise<DaybookRow[]> => {
  const res = await axiosInstance.get("/apis/exchange/buyer-daybook", { params: clean(params) });
  return unwrap<Daybook>(res.data)?.data ?? [];
};

// 💸 Seller history — meri API se hue recharges
export const getSellerHistory = async (params: SellerHistoryParams = {}): Promise<Paged<SellerHistoryRow>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const res = await axiosInstance.get("/apis/exchange/seller-history", { params: clean({ ...params, page, limit }) });
  return toPaged(unwrap<Paged<SellerHistoryRow>>(res.data), page, limit);
};

// 📗 Seller ledger — wallet mein credit / reversal ki entries
export const getSellerLedger = async (params: SellerLedgerParams = {}): Promise<Paged<SellerLedgerRow>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const res = await axiosInstance.get("/apis/exchange/seller-ledger", { params: clean({ ...params, page, limit }) });
  return toPaged(unwrap<Paged<SellerLedgerRow>>(res.data), page, limit);
};
