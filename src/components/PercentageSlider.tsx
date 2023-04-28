import {
  SliderInput as ReachSlider,
  SliderHandle,
  SliderRange,
  SliderTrack,
} from "@reach/slider";
import { clsx } from "clsx";

interface Props {
  input: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}

export const PercentageSlider: React.FC<Props> = ({
  input,
  onChange,
  disabled,
}: Props) => {
  return (
    <div className="flex w-full items-center justify-between rounded-lg">
      <div className="flex">
        <div className="w-16 justify-center rounded-xl text-xl text-default">
          {input.toFixed(0)}%
        </div>
      </div>
      <div className="mr-3 w-5/6">
        <ReachSlider
          className={clsx(
            "bg-none",
            "data-[reach-slider-range]:(h-1 bg-blue) rounded",
            "data-[reach-slider-track]:(h-1 rounded) bg-gray-500",
            "data-[reach-slider-handle]:(bg-white shadow-sm) mt-[-6px] h-[18px] w-[18px] cursor-pointer appearance-none rounded-xl"
          )}
          style={{ background: "none" }}
          value={input}
          min={0}
          max={100}
          step={1}
          onChange={(e) => onChange(e)}
          disabled={disabled}
        >
          <SliderTrack>
            <SliderRange />
            <SliderHandle />
          </SliderTrack>
        </ReachSlider>
      </div>
    </div>
  );
};
