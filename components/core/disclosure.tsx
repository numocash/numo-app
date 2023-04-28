import { Disclosure as HeadlessDisclosure } from "@headlessui/react";

export default function Disclosure({
  button,
  contents,
  className,
  ...props
}: {
  button: React.ReactNode;
  contents: React.ReactNode;
} & React.ComponentProps<typeof HeadlessDisclosure>) {
  return (
    <HeadlessDisclosure className={className} {...props}>
      <HeadlessDisclosure.Button>{button}</HeadlessDisclosure.Button>
      <HeadlessDisclosure.Panel className="">
        {contents}
      </HeadlessDisclosure.Panel>
    </HeadlessDisclosure>
  );
}
