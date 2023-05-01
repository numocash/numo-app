import * as SliderPrimitive from "@radix-ui/react-slider";

export default function Slider({
  input,
  onChange,
}: {
  input: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex w-full items-center space-x-4">
      <p className="p1 w-12">{input}%</p>
      <form className="w-full">
        <SliderPrimitive.Root
          className="relative flex h-5 w-full touch-none select-none items-center"
          defaultValue={[input]}
          value={[input]}
          onValueChange={([input]) => onChange(input!)}
          max={100}
          step={1}
          aria-label="Volume"
        >
          <SliderPrimitive.Track className="relative  h-[4px] grow rounded-full bg-gray-200">
            <SliderPrimitive.Range className="absolute  h-full rounded-full bg-[#3b82f6]" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block  h-5 w-2 cursor-pointer rounded-[10px] bg-[#3b82f6]  " />
        </SliderPrimitive.Root>
      </form>
    </div>
  );
}
