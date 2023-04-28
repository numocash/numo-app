import { Switch as HeadlessSwitch } from "@headlessui/react";
import { clsx } from "clsx";
import { useState } from "react";

export default function Switch() {
  const [enabled, setEnabled] = useState(false);

  return (
    <HeadlessSwitch
      checked={enabled}
      onChange={setEnabled}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-2xl",
        enabled ? "bg-[#3b82f6]" : "bg-gray-700"
      )}
    >
      <span className="sr-only">Enable notifications</span>
      <span
        className={clsx(
          enabled ? "translate-x-6" : "translate-x-1",
          "inline-block h-4 w-4 transform rounded-full bg-white transition"
        )}
      />
    </HeadlessSwitch>
  );
}
