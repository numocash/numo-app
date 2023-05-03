import { Popover as HeadlessPopover } from "@headlessui/react";
import type { Placement } from "@popperjs/core";
import { clsx } from "clsx";
import { useState } from "react";
import { usePopper } from "react-popper";

export default function Popover({
  button,
  contents,
  className,
  placement,
  ...props
}: {
  button: React.ReactNode;
  contents: React.ReactNode;
  placement: Placement;
} & React.ComponentProps<typeof HeadlessPopover>) {
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
    ],
  });
  return (
    <HeadlessPopover {...props} className={clsx(className, "relative")}>
      <HeadlessPopover.Button ref={setReferenceElement} className="rounded-xl ">
        {button}
      </HeadlessPopover.Button>

      <HeadlessPopover.Panel
        className="absolute z-10"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        {contents}
      </HeadlessPopover.Panel>
    </HeadlessPopover>
  );
}
