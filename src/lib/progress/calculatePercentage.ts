interface CalculatePercentageParams {
  completed: number;
  total: number;
}

export const calculatePercentage = ({
  completed,
  total,
}: CalculatePercentageParams): number =>
  total === 0 ? 0 : (completed / total) * 100;
