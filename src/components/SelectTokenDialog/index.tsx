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
}

const SelectTokenDialog: React.FC<SelectTokenDialogProps> = ({
  tokens,
  isOpen,
  onDismiss,
  onSelect,
  selectedToken,
}) => {
  return (
    <Modal className="rounded-xl" isOpen={isOpen} onDismiss={onDismiss}>
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
