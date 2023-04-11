import type { Placement } from "@popperjs/core";
import { clsx } from "clsx";
import React, { useCallback, useRef, useState } from "react";
import { usePopper } from "react-popper";

import { useOnClickOutside } from "@/src/utils/onClickOutside";

interface Props {
  onDismiss: () => void;
  show: boolean;
  target: Element | null;
  children: React.ReactNode;
  placement?: Placement;
  className?: string;
}

export const Drop: React.FC<Props> = ({
  show,
  target,
  onDismiss,
  children,
  placement = "auto",
  className,
}: Props) => {
  const popperElRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, _setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  useOnClickOutside(popperElRef, show ? () => onDismiss() : undefined);

  const setPopperElement = useCallback((el: HTMLDivElement) => {
    popperElRef.current = el;
    _setPopperElement(el);
  }, []);

  const { styles, attributes } = usePopper(target, popperElement, {
    placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 20],
        },
      },
    ],
  });

  // one container for positioning
  // one container for enter animation

  return (
    <div
      className={clsx(
        className,
        "invisible opacity-0 transition-opacity",
        show && "visible w-auto opacity-100"
      )}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      {children}
    </div>
  );
};
