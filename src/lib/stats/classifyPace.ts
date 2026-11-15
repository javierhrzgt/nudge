import type { PaceStatus } from "./types";

const margin = 0.05;
const lower = 1 - margin;
const upper = 1 + margin;

export function classifyPace(pace: number): PaceStatus {
  if (pace > upper) {
    return "slower";
  } else if (pace < lower) {
    return "faster";
  } else {
    return "on-track";
  }
}
