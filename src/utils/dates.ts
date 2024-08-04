export const getDateMax = (...dates: Date[]): Date => {
  return dates.reduce((max, current) => (current > max ? current : max));
}

export const getDateMin = (...dates: Date[]): Date => {
  return dates.reduce((min, current) => (current < min ? current : min));
}

export const asyncSleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}