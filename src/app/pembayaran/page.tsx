import type { Metadata } from "next";
import { PaymentDemo } from "./payment-demo";

export const metadata: Metadata = {
  title: "Simulasi Pembayaran",
  description: "Coba alur pembayaran DP KosKembali dengan QRIS, virtual account, atau dompet digital dalam mode simulasi.",
};

export default async function PaymentPage({ searchParams }: {
  searchParams: Promise<{ booking?: string | string[] }>;
}) {
  const { booking } = await searchParams;
  const bookingCode = typeof booking === "string" && /^BK-\d{4}-\d{4,}$/.test(booking) ? booking : "";

  return <PaymentDemo key={bookingCode} initialBooking={bookingCode} />;
}
