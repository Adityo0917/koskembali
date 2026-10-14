interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-card rounded-xl border border-border shadow-sm ${
        hover ? "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
