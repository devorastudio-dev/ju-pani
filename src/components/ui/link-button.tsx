import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps } from "react";

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export const LinkButton = ({
  variant = "primary",
  className,
  ...props
}: LinkButtonProps) => {
  return (
    <Link
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-[#3a231c] text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#5a362c]",
        variant === "secondary" &&
          "border border-[#f1d0c7] bg-white text-[#3a231c] hover:-translate-y-0.5 hover:bg-[#fdf3ee]",
        variant === "ghost" &&
          "text-[#7b3b30] hover:-translate-y-0.5 hover:bg-white/60",
        className
      )}
      {...props}
    />
  );
};
