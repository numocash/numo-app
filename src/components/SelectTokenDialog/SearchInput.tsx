import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface Props {
  searchQuery: string;
  onChange: (value: string) => void;
  onClear: () => void;
}
export const SearchInput: React.FC<Props> = ({
  searchQuery,
  onChange,
  onClear,
}) => {
  const showClear = searchQuery.length > 0;
  return (
    <div className="focus-within:(ring-black border-black) relative flex items-stretch rounded-xl border border-gray-200 bg-white">
      <input
        className="focus:(outline-none border-0) w-full flex-grow appearance-none overflow-hidden border-none  bg-transparent p-4 pr-0 text-lg font-medium text-default placeholder-gray-400 outline-none ring-0"
        autoComplete="off"
        placeholder={"Search name or token address"}
        type={"text"}
        value={searchQuery}
        onChange={(e) => onChange(e.target.value)}
      />
      {!showClear && (
        <div className="pointer-events-none absolute right-0 top-0 flex h-full items-center pr-4 text-lg text-secondary">
          <FontAwesomeIcon icon={faSearch} fixedWidth />
        </div>
      )}
      {showClear && (
        <button
          onClick={() => onClear()}
          type="button"
          className="z-10 flex appearance-none items-center px-4 text-xl text-gray-400"
        >
          <FontAwesomeIcon icon={faTimes} fixedWidth />
        </button>
      )}
    </div>
  );
};
