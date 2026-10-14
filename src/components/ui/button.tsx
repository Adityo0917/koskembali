interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-light active:bg-primary-dark",
    secondary:
      "bg-card text-primary border border-primary hover:bg-primary/5 active:bg-primary/10",
    // bg-accent (#f98806) hanya memberi kontras 2,46:1 terhadap teks putih,
    // sehingga tombol aksen memakai --color-accent-solid yang lolos AA.
    accent:
      "bg-accent-solid text-white hover:brightness-110 active:brightness-95",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-base",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
