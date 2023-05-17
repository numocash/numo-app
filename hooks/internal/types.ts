import type { QueryFunctionContext } from "@tanstack/react-query";
import type { ReadContractConfig } from "@wagmi/core";
import type { Abi } from "abitype";

/**
 * Makes {@link TKeys} optional in {@link TType} while preserving type inference.
 */
// s/o trpc (https://github.com/trpc/trpc/blob/main/packages/server/src/types.ts#L6)
export type PartialBy<TType, TKeys extends keyof TType> = Partial<
  Pick<TType, TKeys>
> &
  Omit<TType, TKeys>;

export type DeepPartial<
  T,
  MaxDepth extends number,
  Depth extends readonly number[] = [],
> = Depth["length"] extends MaxDepth
  ? T
  : T extends object
  ? { [P in keyof T]?: DeepPartial<T[P], MaxDepth, [...Depth, 1]> }
  : T;

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export type QueryFunctionArgs<T extends (...args: any) => any> =
  QueryFunctionContext<ReturnType<T>>;

export type ReadConfig<
  TAbi extends Abi = Abi,
  TFunctionName extends string = string,
> = Pick<
  ReadContractConfig<TAbi, TFunctionName>,
  "abi" | "address" | "args" | "functionName"
>;

export type HookArg<T> = T | null | undefined;
