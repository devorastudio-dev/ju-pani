import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = ({
  className,
  variant = "primary",
  ...props
}: ButtonProps) => {
  return (
    <button
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
