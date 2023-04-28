import { clsx } from "clsx";
import { useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { ImBook, ImGithub, ImTwitter } from "react-icons/im";
import { IoIosArrowDown } from "react-icons/io";

import { Drop } from "../Drop";
import { Module } from "../Module";

const size = 20;

interface Props {
  className?: string;
}

export const MoreInfo: React.FC<Props> = ({ className }: Props) => {
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"bottom-start"}
      >
        <Module className="rounded-2xl bg-[#303030] p-2">
          <MoreInner />
        </Module>
      </Drop>
      <button
        onClick={() => setShow(true)}
        ref={setTargetRef}
        className={clsx(className, "items-center gap-2")}
      >
        <p className="text-white">More</p>
        <IoIosArrowDown className="text-white opacity-80" />
      </button>
    </>
  );
};

const InfoClass =
  "flex items-center gap-2 p-2 duration-300 ease-in-out transform rounded-lg text-white w-full hover:bg-[#4f4f4f]";

export const MoreInner: React.FC = () => (
  <>
    <a
      href="https://numoen.gitbook.io/numoen/"
      target="_blank"
      rel="noreferrer"
      className="w-full"
    >
      <div className={InfoClass}>
        <ImBook size={size} className="opacity-80" />
        Documentation
      </div>
    </a>
    <a
      href="https://discord.com/invite/6Dtc49Dt4W"
      target="_blank"
      rel="noreferrer"
      className="w-full"
    >
      <div className={InfoClass}>
        <FaDiscord size={size} className="opacity-80" />
        Discord
      </div>
    </a>
    <a
      href="https://github.com/Numoen"
      target="_blank"
      rel="noreferrer"
      className="w-full"
    >
      <div className={InfoClass}>
        <ImGithub size={size} className="opacity-80" />
        Github
      </div>
    </a>
    <a
      href="https://twitter.com/numoen"
      target="_blank"
      rel="noreferrer"
      className="w-full"
    >
      <div className={InfoClass}>
        <ImTwitter size={size} className="opacity-80" />
        Twitter
      </div>
    </a>
  </>
);
