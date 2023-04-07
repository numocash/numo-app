import { Percent } from "@uniswap/sdk-core";
import { createContainer } from "unstated-next";

import { useLocalStorageState } from "../utils/utils";

export interface ISettings {
  /**
   * Maximum amount of tolerated slippage, in [0, 1].
   */
  maxSlippagePercent: Percent;
  setMaxSlippagePercent: (amt: Percent) => void;

  /**
   * Maximum time before revert, in seconds.
   */
  timeout: number;
  setTimeout: (time: number) => void;

  /**
   * Whether to use infinite or minimal approval
   */
  infiniteApprove: boolean;
  setInfiniteApprove: (choice: boolean) => void;
}

type SettingsStore = {
  maxSlippagePercent: number;
  timeout: number;
  infiniteApprove: boolean;
};

const defaultStore: SettingsStore = {
  maxSlippagePercent: 30,
  timeout: 2,
  infiniteApprove: false,
};

const useSettingsInternal = (): ISettings => {
  const [store, setStore] = useLocalStorageState(
    "NumoenSettings",
    defaultStore
  );

  return {
    maxSlippagePercent: new Percent(store.maxSlippagePercent, 10_000),
    setMaxSlippagePercent: (val: Percent) =>
      setStore({
        ...store,
        maxSlippagePercent: +val.asFraction.multiply(10_000).toFixed(0),
      }),
    timeout: store.timeout,
    setTimeout: (val) => setStore({ ...store, timeout: val }),

    infiniteApprove: store.infiniteApprove,
    setInfiniteApprove: (val) => setStore({ ...store, infiniteApprove: val }),
  };
};

export const { Provider: SettingsProvider, useContainer: useSettings } =
  createContainer(useSettingsInternal);
