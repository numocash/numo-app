import LoadingBox from "@/components/loadingBox";
import MainStats from "@/components/mainStats";

export default function Stats() {
  return (
    <MainStats
      items={
        [
          {
            label: "Total deposited",
            item: <LoadingBox className="h-10 w-20 bg-gray-300" />,
          },
          {
            label: "Est. APR",
            item: <LoadingBox className="h-10 w-20 bg-gray-300" />,
          },
          {
            label: "Balance",
            item: <LoadingBox className="h-10 w-20 bg-gray-300" />,
          },
          {
            label: "IL hedge",
            item: <LoadingBox className="h-10 w-20 bg-gray-300" />,
          },
        ] as const
      }
    />
  );
}
