export function Avatar({
  name,
  gradient,
  size = "md",
  online,
}: {
  name: string;
  gradient: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizes = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-lg",
  };

  return (
    <span className={`relative inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white ${gradient} ${sizes[size]}`}>
      {initials}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-surface-900 ${online ? "bg-emerald-400" : "bg-zinc-600"}`}
        />
      )}
    </span>
  );
}
