import { clsx } from "clsx";
import React from "react";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

import { TokenSearch } from "./TokenSearch";
import { Modal } from "../Modal";

export enum TokenModalView {
  search,
}
interface SelectTokenDialogProps {
  tokens?: readonly WrappedTokenInfo[];
  isOpen: boolean;
  onDismiss: () => void;
  onSelect?: (value: WrappedTokenInfo) => void;
  selectedToken?: WrappedTokenInfo;
  className?: string;
}

const SelectTokenDialog: React.FC<SelectTokenDialogProps> = ({
  tokens,
  isOpen,
  onDismiss,
  onSelect,
  className,
  selectedToken,
}) => {
  return (
    <Modal
      className={clsx(className, "rounded-xl")}
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <TokenSearch
        selectedToken={selectedToken}
        tokens={tokens}
        isOpen={isOpen}
        onSelect={onSelect}
      />
    </Modal>
  );
};

export default SelectTokenDialog;
