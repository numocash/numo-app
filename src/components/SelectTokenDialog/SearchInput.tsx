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
    <div className="flex items-stretch focus-within:(ring-black border-black) border border-gray-200 relative bg-white rounded-xl">
      <input
        className="bg-transparent border-none flex-grow focus:(outline-none ring-0 border-0) text-default  placeholder-gray-400 text-lg font-medium appearance-none w-full p-4 pr-0 outline-none overflow-hidden"
        autoComplete="off"
        placeholder={"Search name or token address"}
        type={"text"}
        value={searchQuery}
        onChange={(e) => onChange(e.target.value)}
      />
      {!showClear && (
        <div className="absolute top-0 right-0 flex items-center h-full pr-4 text-lg pointer-events-none text-secondary">
          <FontAwesomeIcon icon={faSearch} fixedWidth />
        </div>
      )}
      {showClear && (
        <button
          onClick={() => onClear()}
          type="button"
          className="z-10 flex items-center px-4 text-xl text-gray-400 appearance-none"
        >
          <FontAwesomeIcon icon={faTimes} fixedWidth />
        </button>
      )}
    </div>
  );
};
