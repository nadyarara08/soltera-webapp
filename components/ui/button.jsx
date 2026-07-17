import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-forest text-white hover:bg-forest-dark hover:shadow-[0_8px_20px_rgba(65,109,25,0.3)]",
        accent: "bg-leaf text-ink hover:bg-leaf/90 hover:shadow-[0_8px_20px_rgba(155,207,83,0.35)]",
        outline: "border border-forest/30 text-forest bg-transparent hover:bg-forest/5",
        ghost: "text-ink hover:bg-ink/5",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 text-[13px]",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { buttonVariants };
