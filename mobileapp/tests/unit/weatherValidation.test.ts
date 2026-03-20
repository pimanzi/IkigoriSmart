import { isValidTemperature, isValidHumidity, isValidRainfall } from '../../src/utils/weatherValidation';

describe('isValidTemperature', () => {
  it('accepts values at and within the 10–35°C boundaries', () => {
    expect(isValidTemperature('10')).toBe(true);
    expect(isValidTemperature('22.5')).toBe(true);
    expect(isValidTemperature('35')).toBe(true);
  });

  it('rejects values outside the 10–35°C range', () => {
    expect(isValidTemperature('9')).toBe(false);
    expect(isValidTemperature('9.9')).toBe(false);
    expect(isValidTemperature('35.1')).toBe(false);
    expect(isValidTemperature('36')).toBe(false);
    expect(isValidTemperature('-5')).toBe(false);
  });

  it('rejects empty, whitespace-only, and non-numeric input', () => {
    expect(isValidTemperature('')).toBe(false);
    expect(isValidTemperature('   ')).toBe(false);
    expect(isValidTemperature('abc')).toBe(false);
  });
});

describe('isValidHumidity', () => {
  it('accepts values at and within the 0–100% boundaries', () => {
    expect(isValidHumidity('0')).toBe(true);
    expect(isValidHumidity('65')).toBe(true);
    expect(isValidHumidity('100')).toBe(true);
  });

  it('rejects values outside the 0–100% range', () => {
    expect(isValidHumidity('-1')).toBe(false);
    expect(isValidHumidity('100.1')).toBe(false);
    expect(isValidHumidity('101')).toBe(false);
  });

  it('rejects empty and non-numeric input', () => {
    expect(isValidHumidity('')).toBe(false);
    expect(isValidHumidity('high')).toBe(false);
  });
});

describe('isValidRainfall', () => {
  it('accepts values at and within the 0–500mm boundaries', () => {
    expect(isValidRainfall('0')).toBe(true);
    expect(isValidRainfall('120')).toBe(true);
    expect(isValidRainfall('500')).toBe(true);
  });

  it('rejects values outside the 0–500mm range', () => {
    expect(isValidRainfall('-1')).toBe(false);
    expect(isValidRainfall('500.1')).toBe(false);
    expect(isValidRainfall('501')).toBe(false);
  });

  it('rejects empty and non-numeric input', () => {
    expect(isValidRainfall('')).toBe(false);
    expect(isValidRainfall('heavy')).toBe(false);
  });
});
