import { clsx } from "clsx";
import type { DetailedHTMLProps } from "react";
import React, { useState } from "react";

import { LoadingSpinner } from "./LoadingSpinner";

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

/**
 * A button.
 * @returns
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  disabled,
  className,
  onClick,
  variant,
  ...props
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <button
      className={clsx(
        className,
        "flex flex-row items-center justify-center leading-normal",
        "rounded-lg text-sm font-semibold text-white transistion-transform",
        "active:scale-98 hover:bg-opacity-90 disabled:(bg-gray-100 text-gray-500  cursor-not-allowed)",
        variant === "primary" && "bg-black shadow",
        variant === "inverse" && "text-black bg-white shadow",
        variant === "danger" && "font-bold shadow bg-red"
      )}
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
      style={{
        ...props.style,
      }}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          {children}
          <LoadingSpinner className="ml-2 mb-0.5" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};
