export function isValidTemperature(value: string): boolean {
  if (!value.trim()) return false;
  const n = parseFloat(value);
  return !isNaN(n) && n >= 10 && n <= 35;
}

export function isValidHumidity(value: string): boolean {
  if (!value.trim()) return false;
  const n = parseFloat(value);
  return !isNaN(n) && n >= 0 && n <= 100;
}

export function isValidRainfall(value: string): boolean {
  if (!value.trim()) return false;
  const n = parseFloat(value);
  return !isNaN(n) && n >= 0 && n <= 500;
}
