type StatusBadgeProps = {
  label: string;
  variant?: "default" | "success" | "warning" | "danger";
};

export default function StatusBadge({
  label,
  variant = "default",
}: StatusBadgeProps) {
  const styles = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
}