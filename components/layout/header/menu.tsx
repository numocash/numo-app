import SettingsInner from "./settings/settingsInner";
import Disclosure from "@/components/core/disclosure";
import Popover from "@/components/core/popover";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";
import { ImBook, ImGithub, ImTwitter } from "react-icons/im";
import { IoIosArrowDown, IoIosMenu } from "react-icons/io";
import { SiMedium } from "react-icons/si";

const size = 20;

export default function Menu() {
  return (
    <Popover
      placement="auto-end"
      className={"flex"}
      button={
        <div className="h-fit w-10 rounded-xl bg-gray-800 p-1 sm:hidden">
          <IoIosMenu className="flex h-full w-full items-center justify-center fill-white" />
        </div>
      }
      contents={
        <div className="flex w-full flex-col rounded-xl bg-gray-900 p-1">
          <Link className="p-2 hover:opacity-80" href="/earn">
            <p className="p2 text-white">Earn</p>
          </Link>
          <Link className="p-2 hover:opacity-80" href="/positions">
            <p className="p2 text-white">Positions</p>
          </Link>
          <Disclosure
            button={
              <div className="flex w-48 items-center justify-between p-2">
                <p className="p2 text-white">More</p>
                <IoIosArrowDown className=" fill-white " />
              </div>
            }
            contents={
              <div className="grid p-1">
                <Link
                  className="resource-item"
                  href="https://numoen.gitbook.io/numoen"
                >
                  <ImBook size={size} />

                  <p>Documentation</p>
                </Link>
                <Link
                  className="resource-item"
                  href="https://numoen.gitbook.io/numoen"
                >
                  <FaDiscord size={size} />

                  <p>Discord</p>
                </Link>
                <Link
                  className="resource-item"
                  href="https://numoen.gitbook.io/numoen"
                >
                  <ImGithub size={size} />
                  <p>Github</p>
                </Link>
                <Link
                  className="resource-item"
                  href="https://numoen.gitbook.io/numoen"
                >
                  <ImTwitter size={size} />
                  <p>Twitter</p>
                </Link>
                <Link
                  className="resource-item"
                  href="https://medium.com/numoen"
                >
                  <SiMedium size={size} />
                  <p>Blog</p>
                </Link>
              </div>
            }
          />
          <Disclosure
            button={
              <div className="flex w-48 items-center justify-between p-2">
                <p className="p2 text-white">Settings</p>
                <IoIosArrowDown className=" fill-white " />
              </div>
            }
            contents={
              <div className="grid p-1 px-2 gap-1">
                <SettingsInner />
              </div>
            }
          />
        </div>
      }
    />
  );
}
