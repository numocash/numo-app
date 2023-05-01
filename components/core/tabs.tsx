import { Tab as HeadlessTab } from "@headlessui/react";
import { clsx } from "clsx";
import { objectKeys } from "ts-extras";

export default function Tab<T extends string>({
  tabs,
}: {
  tabs: { [key in T]: { tab: string; panel: React.ReactElement } };
}) {
  return (
    <HeadlessTab.Group>
      <HeadlessTab.List
        className={"flex h-12 w-full items-center rounded-xl bg-gray-200 p-0.5"}
      >
        {objectKeys(tabs).map((t) => {
          return (
            <HeadlessTab
              key={t}
              className={(selected) =>
                clsx(
                  "p1 grid h-full w-full items-center rounded-[10px]",
                  "transform duration-300 ease-in-out hover:text-default",
                  selected.selected
                    ? "bg-white text-default"
                    : "text-secondary",
                )
              }
            >
              {tabs[t as T].tab}
            </HeadlessTab>
          );
        })}
      </HeadlessTab.List>
      <HeadlessTab.Panels>
        {objectKeys(tabs).map((t) => {
          return (
            <HeadlessTab.Panel key={t}>{tabs[t as T].panel}</HeadlessTab.Panel>
          );
        })}
      </HeadlessTab.Panels>
    </HeadlessTab.Group>
  );
}
