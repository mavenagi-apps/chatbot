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
        .map((child) => {
          return React.cloneElement(
            child as React.ReactElement<HTMLAttributes<HTMLButtonElement>>,
            {
              className: cn(
                "p-2 text-[#4f5a69] rounded-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-gray-200 data-[active]:bg-gray-200",
              ),
            },
          );
        })}
    </div>
  );
});
