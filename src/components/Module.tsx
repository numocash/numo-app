import { clsx } from "clsx";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export const Module: React.FC<Props> = ({ children, className }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "w-full p-6 overflow-hidden bg-white shadow-2xl rounded-xl"
      )}
    >
      <ErrorBoundary
        fallback={
          <p className="text-red">
            An error occurred while loading this component.
          </p>
        }
      >
        {children}
      </ErrorBoundary>
    </div>
  );
};
