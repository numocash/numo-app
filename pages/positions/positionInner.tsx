import Liquidity from "./liquidity";
import PowerTokens from "./powerTokens";

export default function PositionInner() {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 pt-6">
      <Liquidity />
      <PowerTokens />
    </div>
  );
}
