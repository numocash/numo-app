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
      <LoadingSpinner className="h-20 w-20" />
    </div>
  );
};
