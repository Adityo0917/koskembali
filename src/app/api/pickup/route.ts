import { NextResponse } from "next/server";
import { z } from "zod";

import { createPickupRequest } from "@/lib/queries";

const Schema = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter").max(80),
  whatsapp: z
    .string()
    .trim()
    .regex(/^08\d{8,11}$/, "Nomor WhatsApp tidak valid"),
  campusId: z.number().int().positive(),
  fakultas: z.string().trim().min(2, "Fakultas wajib diisi").max(60),
  cohort: z.string().trim().max(30).optional().default(""),
  rekening: z.string().trim().max(40).optional().default(""),
  tglJemput: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  slot: z.enum(["pagi", "siang"]),
  catatan: z.string().trim().max(300).optional().default(""),
  totalEstimasi: z.number().int().min(1).max(50),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const today = new Date().toISOString().slice(0, 10);
  if (d.tglJemput < today) {
    return NextResponse.json(
      { error: "Tanggal penjemputan tidak boleh di masa lalu" },
      { status: 400 },
    );
  }

  const { kode } = createPickupRequest({
    nama: d.nama,
    whatsapp: d.whatsapp,
    campusId: d.campusId,
    fakultas: d.fakultas,
    cohort: d.cohort ?? "",
    rekening: d.rekening ?? "",
    tglJemput: d.tglJemput,
    slot: d.slot,
    catatan: d.catatan ?? "",
    totalEstimasi: d.totalEstimasi,
  });

  return NextResponse.json({ kode }, { status: 201 });
}