import { motion } from "framer-motion";
import { cn, clamp } from "../../lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white/8", className)}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#9F2BFF] to-[#FF2D74]"
        initial={false}
        animate={{ width: `${clamp(value, 0, 100)}%` }}
        transition={{ type: "spring", stiffness: 150, damping: 22 }}
      />
    </div>
  );
}
