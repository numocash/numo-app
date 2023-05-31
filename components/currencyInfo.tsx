import CurrencyIcon from "./currencyIcon";
import { Currency } from "@/lib/types/currency";
import { clsx } from "clsx";

export default function CurrencyInfo({
  currency,
  showName,
  size,
}: {
  currency: Currency;
  showName: boolean;
  size?: number;
}) {
  return (
    <div
      className={clsx(
        "flex items-center",
        showName ? "space-x-4" : "space-x-2",
      )}
    >
      <CurrencyIcon currency={currency} size={size ?? showName ? 44 : 32} />
      <div className="">
        <p className="p1">{showName ? currency.name : currency.symbol}</p>
        {showName && <p className="p3">{currency.symbol}</p>}
      </div>
    </div>
  );
}
