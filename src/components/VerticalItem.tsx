import { clsx } from "clsx";

interface Props {
  label: string;
  item: React.ReactElement | string;
  className?: string;
}
export const VerticalItem: React.FC<Props> = ({
  label,
  item,
  className,
}: Props) => {
  return (
    <div className={clsx(className, "flex flex-col")}>
      {typeof item === "string" ? (
        <p className="text-lg font-semibold">{item}</p>
      ) : (
        item
      )}
      <p className="text-sm text-secondary">{label}</p>
    </div>
  );
};
