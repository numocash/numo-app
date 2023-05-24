import LoadingBox from "../loadingBox";
import MainStats from "../mainStats";

export default function Stats() {
  return (
    <MainStats
      items={
        [
          {
            label: "Open Interest",
            item: <LoadingBox className="h-10 w-20 bg-gray-300" />,
          },
          {
            label: "Funding APR",
            item: <LoadingBox className="h-10 w-20 bg-gray-300" />,
          },
          {
            label: "Leverage",
            item: "x²",
          },
        ] as const
      }
    />
  );
}
