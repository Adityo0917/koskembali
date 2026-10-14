import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "success" | "warning" | "error" | "neutral" | "accent";
  className?: string;
}

const TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  // Teks memakai varian gelap (--*-text) agar kontras di atas >= 4,5:1,
  // sementara latar dan border tetap memakai warna terang versi translucent.
  success: "bg-success/10 text-success-text border-success/30",
  warning: "bg-warning/10 text-warning-text border-warning/30",
  error: "bg-error/10 text-error-text border-error/30",
  neutral: "bg-secondary/10 text-text-secondary border-secondary/20",
  accent: "bg-accent/10 text-accent-text border-accent/30",
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}