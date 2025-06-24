import { cn } from "@/app/utils/classname.util";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";

export default function Input(
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) {
  return (
    <input
      {...props}
      className={cn(
        "rounded-sm border border-solid border-gray-300",
        props.className
      )}
    />
  );
}
