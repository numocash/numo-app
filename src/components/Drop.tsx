import type { Placement } from "@popperjs/core";
import React, { useCallback, useRef, useState } from "react";
import { usePopper } from "react-popper";

import { useOnClickOutside } from "@/src/utils/onClickOutside";

const PopoverContainer = styled.div<{ show: boolean }>(({ show }) => [
  tw`invisible opacity-0`,
  show && tw`visible w-auto opacity-100`,
  css`
    z-index: 9997;
    transition: visibility 150ms linear, opacity 150ms linear;
  `,
]);

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
    <PopoverContainer
      className={className}
      show={show}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      {children}
    </PopoverContainer>
  );
};
