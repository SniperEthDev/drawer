import React from "react";

interface CountdownRingProps {
  remaining: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({
  remaining,
  total,
  size = 64,
  strokeWidth = 6
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.max(0, Math.min(remaining, total)) / total) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }} role="timer">
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-100 ease-linear"
        />
      </svg>
      {/* Centered remaining seconds */}
      <span className="absolute font-tech font-bold text-lg text-text-primary">
        {Math.ceil(remaining)}s
      </span>
    </div>
  );
};
export default CountdownRing;
