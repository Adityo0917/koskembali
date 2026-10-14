import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export const KOORDINATOR_COOKIE = "kk_koordinator";

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function isValidKey(candidate: string | undefined | null): boolean {
  const expected = process.env.KOSKEMBALI_COORDINATOR_KEY;
  if (!expected || !candidate) return false;
  return timingSafeEqual(digest(expected), digest(candidate));
}

export function keyConfigured(): boolean {
  return Boolean(process.env.KOSKEMBALI_COORDINATOR_KEY);
}