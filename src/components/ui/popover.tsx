import * as PopoverPrimitive from "@radix-ui/react-popover";
import clsx from "clsx";
import React from "react";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = PopoverPrimitive.Content;

// New PopoverArrow component
export function PopoverArrow(
  props: React.ComponentProps<typeof PopoverPrimitive.Arrow>
) {
  return (
    <PopoverPrimitive.Arrow
      {...props}
      className={clsx("fill-popover stroke-border", props.className)}
    />
  );
}
