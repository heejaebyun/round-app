"use client";

import { useState, useEffect } from "react";

interface Props {
  target: number;
  duration?: number;
}

export default function AnimatedNumber({ target, duration = 520 }: Props) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{value}</span>;
}
