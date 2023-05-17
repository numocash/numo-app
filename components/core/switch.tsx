import { Switch as HeadlessSwitch } from "@headlessui/react";
import { clsx } from "clsx";

export default function Switch({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
}) {
  return (
    <HeadlessSwitch
      checked={enabled}
      onChange={setEnabled}
      className={clsx(
        "relative inline-flex h-7 w-11 items-center rounded-2xl",
        enabled ? "bg-brand" : "bg-gray-700",
      )}
    >
      <span className="sr-only">Enable notifications</span>
      <span
        className={clsx(
          enabled ? "translate-x-5" : "translate-x-1",
          "inline-block h-5 w-5 transform rounded-full bg-white transition",
        )}
      />
    </HeadlessSwitch>
  );
}
