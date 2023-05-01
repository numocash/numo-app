interface ItemProps {
  label: string;
  item: React.ReactNode;
}

const Item: React.FC<ItemProps> = ({ label, item }: ItemProps) => {
  return (
    <div className="flex flex-col gap-1 sm:items-center">
      <p className="p5">{label}</p>
      <div className="p1">{item}</div>
    </div>
  );
};

interface Props {
  items:
    | readonly [ItemProps, ItemProps]
    | readonly [ItemProps, ItemProps, ItemProps]
    | readonly [ItemProps, ItemProps, ItemProps, ItemProps];
}

export default function MainStats({ items }: Props) {
  return (
    <div className="flex w-full flex-col flex-wrap justify-around gap-2 sm:flex-row sm:gap-4">
      {items.map((i) => (
        <Item key={i.label} label={i.label} item={i.item} />
      ))}
    </div>
  );
}
