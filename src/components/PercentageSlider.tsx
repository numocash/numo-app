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
    <div className="flex items-center justify-between w-full rounded-lg">
      <div className="flex">
        <div className="justify-center w-16 text-xl rounded-xl text-default">
          {input.toFixed(0)}%
        </div>
      </div>
      <div className="w-5/6 mr-3">
        <ReachSlider
          className={clsx(
            "bg-none",
            "data-[reach-slider-range]:(h-1 rounded bg-blue)",
            "data-[reach-slider-track]:(h-1 bg-gray-500 rounded)",
            "data-[reach-slider-handle]:(bg-white mt-[-6px] h-[18px] w-[18px] rounded-xl appearance-none cursor-pointer shadow-sm)"
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
