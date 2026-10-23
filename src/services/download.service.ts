import { axiosInstance } from "@/lib/axios";

// 📥 CSV downloads — /apis/exchange/download/<kind>
export type DownloadKind =
  | "topup"
  | "settlement"
  | "purchase-report"
  | "resales-report"
  | "purchase-ledger"
  | "resales-ledger";

export type DownloadParams = {
  from: string;
  to: string;
  status?: string;
  type?: string;
  mobile?: string;
  operator_id?: string;
};

// Khaali filters query mein nahi jaate
function clean(params: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}

// Error aaye toh backend JSON bhejta hai, par blob mode mein woh bhi blob ban jaata hai — padh ke message nikalo
async function blobError(blob: Blob): Promise<string> {
  try {
    const body = JSON.parse(await blob.text()) as { message?: string; error?: string };
    return body.message ?? body.error ?? "Download fail ho gaya";
  } catch {
    return "Download fail ho gaya";
  }
}

// Server se CSV laao aur browser mein file save karwa do
export const downloadCsv = async (kind: DownloadKind, params: DownloadParams, fileName: string) => {
  let blob: Blob;
  try {
    const res = await axiosInstance.get(`/apis/exchange/download/${kind}`, {
      params: clean(params),
      responseType: "blob",
    });
    blob = res.data as Blob;
  } catch (err) {
    const data = (err as { response?: { data?: unknown } })?.response?.data;
    if (data instanceof Blob) throw new Error(await blobError(data));
    throw err;
  }

  // 200 ke saath bhi kabhi { err, message } aa jaata hai
  if (blob.type.includes("application/json")) throw new Error(await blobError(blob));

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}_${params.from}_to_${params.to}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
