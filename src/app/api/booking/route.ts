import { NextResponse } from "next/server";
import { z } from "zod";

import { createBooking } from "@/lib/queries";

const Schema = z.object({
  itemId: z.number().int().positive(),
  nama: z.string().trim().min(3, "Nama minimal 3 karakter").max(80),
  whatsapp: z
    .string()
    .trim()
    .regex(/^08\d{8,11}$/, "Nomor WhatsApp tidak valid"),
  campusId: z.number().int().positive().optional(),
  tgl: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  slot: z.enum(["pagi", "siang"]),
  catatan: z.string().trim().max(300).optional().default(""),
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
  if (d.tgl < today) {
    return NextResponse.json(
      { error: "Tanggal pengambilan tidak boleh di masa lalu" },
      { status: 400 },
    );
  }

  const result = createBooking({
    itemId: d.itemId,
    buyerNama: d.nama,
    buyerWa: d.whatsapp,
    buyerCampus: d.campusId,
    tglPickup: d.tgl,
    slot: d.slot,
    catatan: d.catatan ?? "",
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ kode: result.kode }, { status: 201 });
}