import { clsx } from "clsx";
import type { DetailedHTMLProps } from "react";
import { useState } from "react";

type Variant = "danger" | "primary" | "inverse";

interface AdditionalButtonProps {
  variant?: Variant;
}

export interface ButtonProps
  extends DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    AdditionalButtonProps {
  onClick?:
    | ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
    | ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>);
  children?: React.ReactNode;
}

export default function Button({
  children,
  disabled,
  className,
  onClick,
  variant = "primary",
  ...props
}: ButtonProps) {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <button
      {...props}
      onClick={
        onClick
          ? async (e) => {
              setLoading(true);
              await onClick(e);
              setLoading(false);
            }
          : undefined
      }
      disabled={disabled || loading}
      className={clsx(
        className,
        "p2 flex flex-row items-center justify-center rounded-xl px-4 py-2 leading-normal text-white",
        "transistion-transform active:scale-98 hover:bg-opacity-90",
        variant === "primary" && "bg-black",
        variant === "inverse" && "bg-white text-default",
        variant === "danger" && "bg-red",
        "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-secondary"
      )}
      style={{
        ...props.style,
      }}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          {children}
          {/* <LoadingSpinner tw="ml-2 mb-0.5" /> */}
        </div>
      ) : (
        children
      )}
    </button>
  );
}
