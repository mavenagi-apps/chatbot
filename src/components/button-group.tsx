import React, { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function ButtonGroup({ children, className }, ref) {
  return (
    <div
      ref={ref}
      className={cn("inline-flex rounded-md", className)}
      role="group"
    >
      {React.Children.toArray(children)
        .filter((child) => React.isValidElement(child))
        .map((child, index, list) => {
          return React.cloneElement(
            child as React.ReactElement<HTMLAttributes<HTMLButtonElement>>,
            {
              className: cn(
                "border border-b border-t border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-gray-200 data-[active]:bg-gray-200",
                index === 0 && "rounded-s-lg",
                index !== 0 && "border-l-0",
                index === React.Children.count(list) - 1 && "rounded-e-lg",
              ),
            },
          );
        })}
    </div>
  );
});
