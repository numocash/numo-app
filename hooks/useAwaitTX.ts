import type { Provider, SendTransactionResult } from "@wagmi/core";
import type { ContractReceipt } from "ethers";
import { useCallback } from "react";
import { useProvider, useWebSocketProvider } from "wagmi";

export const useAwaitTX = () => {
  const provider = useProvider();
  const webSocketProvider = useWebSocketProvider();

  return useCallback(
    async (transaction: SendTransactionResult) =>
      awaitTX(webSocketProvider ?? provider, transaction),
    [provider, webSocketProvider],
  );
};

const awaitTX = async (
  provider: Provider,
  transaction: SendTransactionResult,
) =>
  Promise.race([
    new Promise((resolve: (e: ContractReceipt) => void) =>
      provider.once(transaction.hash, (e: ContractReceipt) => {
        resolve(e);
        return e;
      }),
    ),
    transaction.wait(),
  ]);
