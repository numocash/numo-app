import type { ForwardedRef, RefObject } from "react";
import { useEffect, useRef } from "react";

const updateRef = <T>(ref: ForwardedRef<T>, innerRef: RefObject<T>): void => {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(innerRef.current);
  } else {
    ref.current = innerRef.current;
  }
};

// https://medium.com/the-non-traditional-developer/how-to-use-the-forwarded-ref-in-react-1fb108f4e6af
export const useForwardedRef = <T>(ref: ForwardedRef<T>): RefObject<T> => {
  const innerRef = useRef<T>(null);
  updateRef(ref, innerRef);
  // useLayoutEffect(() => updateRef(ref, innerRef));
  useEffect(() => updateRef(ref, innerRef));

  return innerRef;
};
