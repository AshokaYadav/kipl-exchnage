import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, icon, hint, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label htmlFor={inputId} className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </span>
        <span className="relative block">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
              icon && "pl-10",
              className
            )}
            {...rest}
          />
        </span>
        {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      </label>
    );
  }
);
Input.displayName = "Input";
