import { NextResponse } from "next/server";
import { z } from "zod";

import { KOORDINATOR_COOKIE, isValidKey, keyConfigured } from "@/lib/auth";

const Schema = z.object({
  key: z.string().trim().min(1, "Kunci wajib diisi").max(200),
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
    return NextResponse.json({ error: "Kunci wajib diisi" }, { status: 400 });
  }

  if (!keyConfigured()) {
    return NextResponse.json(
      { error: "Kunci koordinator belum diatur di server" },
      { status: 503 },
    );
  }

  if (!isValidKey(parsed.data.key)) {
    return NextResponse.json({ error: "Kunci salah" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(KOORDINATOR_COOKIE, parsed.data.key, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(KOORDINATOR_COOKIE);
  return res;
}