interface Props {
  numMarkets?: number;
}
export const Display: React.FC<Props> = ({ numMarkets }: Props) => {
  return (
    <div className="text-paragraph flex gap-1 text-xs">
      Displaying
      {numMarkets ? (
        <span className="font-semibold">
          {numMarkets} market{numMarkets !== 1 ? "s" : ""}
        </span>
      ) : (
        <div className="bg-secondary h-5 w-16 transform animate-pulse rounded-lg ease-in-out" />
      )}
    </div>
  );
};
