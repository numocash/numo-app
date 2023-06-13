import LoadingBox from "../loadingBox";

export default function MarketLoading() {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white w-full max-w-lg h-20 flex items-center p-6 gap-2 justify-between">
      <div className="flex items-center gap-2">
        <div className="flex overflow-hidden rounded-[100%] bg-gray-200 h-12 w-12 transform animate-pulse duration-3000 ease-in-out" />
        <LoadingBox className=" bg-gray-200" />
      </div>
      <div className="w-1/3 transform animate-pulse duration-3000 ease-in-out border-b-2 border-gray-200 border-dashed" />
      <LoadingBox className=" bg-gray-200" />
    </div>
  );
}
