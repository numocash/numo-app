import { useCallback, useEffect, useState } from "react";

export function useLocalStorageState<T>(
  key: string,
  defaultState: T
): [T, (newState: T) => void] {
  const [state, setState] = useState<T>(defaultState);
  useEffect(() => {
    const storedState = localStorage.getItem(key);
    if (storedState) {
      setState(JSON.parse(storedState) as T);
      return;
    }
  }, [key]);

  const setLocalStorageState = useCallback(
    (newState: T) => {
      const changed = state !== newState;
      if (!changed) {
        return;
      }
      setState(newState);
      if (newState === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newState));
      }
    },
    [state, key]
  );

  return [state, setLocalStorageState];
}

/**
 * shorten the checksummed version of the input address to have 4 characters at start and end
 * @param address
 * @param chars
 * @returns
 */
export function shortenAddress(address: string, chars = 5): string {
  return `${address.substring(0, chars)}...${address.substring(
    address.length - chars
  )}`;
}
