import { motion } from "framer-motion";
import { clamp } from "../lib/utils";

export function ProgressRing({ value, size = 168 }: { value: number; size?: number }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamp(value, 0, 100) / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="transparent" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#clientos-progress)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
        />
        <defs>
          <linearGradient id="clientos-progress" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#9F2BFF" />
            <stop offset="1" stopColor="#FF2D74" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-extrabold">{value}%</p>
        <p className="text-xs font-medium text-white/45">today</p>
      </div>
    </div>
  );
}
