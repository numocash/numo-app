import React from "react";

import { LoadingSpinner } from "./LoadingSpinner";

interface Props {
  className?: string;
}

export const LoadingPage: React.FC<Props> = ({ className }: Props) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "90vh",
      }}
      className={className}
    >
      <LoadingSpinner className="w-20 h-20" />
    </div>
  );
};
