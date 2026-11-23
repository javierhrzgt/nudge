export function nextPosition(positions: number[]): number {
  const max = Math.max(0, ...positions);
  return max + 1;
}
