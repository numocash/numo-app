import "@reach/dialog/styles.css";

import { DialogContent, DialogOverlay } from "@reach/dialog";
import { clsx } from "clsx";
import React from "react";

export interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onDismiss: () => void;
  topMargin?: number;
  maxHeight?: number;
  scrollBehavior?: "outside" | "inside";
  minHeight?: boolean | number;
  pinToTop?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  onDismiss,
  topMargin,
  pinToTop,
  scrollBehavior,
  className,
}: ModalProps) => {
  return (
    <DialogOverlay
      className={clsx(
        className,
        "flex items-center justify-center overflow-hidden",
        scrollBehavior === "outside" && "items-start overflow-y-scroll py-8",
        "data-[reach-dialog-overlay]:(z-50 bg-[rgba(0, 0, 0, 0.7)]"
      )}
      as="div"
      aria-label={"dialog overlay"}
      onDismiss={onDismiss}
    >
      <DialogContent
        as="div"
        className={clsx(
          pinToTop && "mt-[10vh]",
          topMargin && `mt-[${topMargin}px]`
        )}
        aria-label="dialog content"
      >
        {children}
      </DialogContent>
    </DialogOverlay>
  );
};
