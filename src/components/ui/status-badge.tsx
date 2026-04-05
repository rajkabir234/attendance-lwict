type StatusBadgeProps = {
  label: string;
  variant?: "default" | "success" | "warning" | "danger";
};

export default function StatusBadge({
  label,
  variant = "default",
}: StatusBadgeProps) {
  const variantClassName =
    variant === "success"
      ? "status-success"
      : variant === "warning"
        ? "status-warning"
        : variant === "danger"
          ? "status-danger"
          : "status-info";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClassName}`}
    >
      {label}
    </span>
  );
}