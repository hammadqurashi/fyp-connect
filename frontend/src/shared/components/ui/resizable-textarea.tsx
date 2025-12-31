import * as React from "react";
import { cn } from "@/shared/utils";

export interface ResizableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ResizableTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ResizableTextareaProps
>(({ className, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // Maximum height in pixels
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    };

    adjustHeight();
    textarea.addEventListener("input", adjustHeight);

    return () => {
      textarea.removeEventListener("input", adjustHeight);
    };
  }, []);

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto",
        className
      )}
      {...props}
    />
  );
});

ResizableTextarea.displayName = "ResizableTextarea";

export { ResizableTextarea };

