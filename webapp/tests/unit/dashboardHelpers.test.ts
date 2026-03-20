import {
  computeSeverityBreakdown,
  computeRiskBreakdown,
  computePredictionsOverTime,
  RawPrediction,
} from '../../src/utils/dashboardHelpers';

const makePrediction = (
  overrides: Partial<RawPrediction> & { severity: string; risk_level: string; district: string }
): RawPrediction => ({
  id: Math.random().toString(),
  created_at: new Date().toISOString(),
  ...overrides,
});

const predictions: RawPrediction[] = [
  makePrediction({ severity: 'Healthy',  risk_level: 'Low',    district: 'Musanze' }),
  makePrediction({ severity: 'Healthy',  risk_level: 'Low',    district: 'Nyabihu' }),
  makePrediction({ severity: 'Moderate', risk_level: 'High',   district: 'Musanze' }),
  makePrediction({ severity: 'Moderate', risk_level: 'High',   district: 'Musanze' }),
  makePrediction({ severity: 'Severe',   risk_level: 'High',   district: 'Nyabihu' }),
];

describe('computeSeverityBreakdown', () => {
  it('counts each severity label correctly', () => {
    const result = computeSeverityBreakdown(predictions);

    expect(result).toContainEqual({ severity: 'Healthy',  count: 2 });
    expect(result).toContainEqual({ severity: 'Moderate', count: 2 });
    expect(result).toContainEqual({ severity: 'Severe',   count: 1 });
    expect(result).toContainEqual({ severity: 'Early',    count: 0 });
  });

  it('returns all four severity labels even when count is zero', () => {
    const result = computeSeverityBreakdown([]);
    expect(result).toHaveLength(4);
    result.forEach(item => expect(item.count).toBe(0));
  });
});

describe('computeRiskBreakdown', () => {
  it('counts each risk level correctly', () => {
    const result = computeRiskBreakdown(predictions);

    expect(result).toContainEqual({ risk_level: 'Low',    count: 2 });
    expect(result).toContainEqual({ risk_level: 'High',   count: 3 });
    expect(result).toContainEqual({ risk_level: 'Medium', count: 0 });
  });
});

describe('computePredictionsOverTime', () => {
  it('groups predictions by date and splits by district', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = computePredictionsOverTime(predictions);

    const todayEntry = result.find(r => r.date === today);
    expect(todayEntry).toBeDefined();
    expect(todayEntry!.musanze).toBe(3);
    expect(todayEntry!.nyabihu).toBe(2);
  });

  it('excludes predictions older than the cutoff window', () => {
    const oldPrediction = makePrediction({
      severity: 'Early',
      risk_level: 'Medium',
      district: 'Musanze',
      created_at: '2000-01-01T00:00:00.000Z',
    });

    const result = computePredictionsOverTime([...predictions, oldPrediction], 30);
    const oldEntry = result.find(r => r.date === '2000-01-01');
    expect(oldEntry).toBeUndefined();
  });

  it('returns entries sorted ascending by date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const mixed: RawPrediction[] = [
      makePrediction({ severity: 'Early', risk_level: 'Low', district: 'Musanze' }),
      makePrediction({ severity: 'Early', risk_level: 'Low', district: 'Nyabihu', created_at: yesterday.toISOString() }),
    ];

    const result = computePredictionsOverTime(mixed);
    expect(result.length).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date >= result[i - 1].date).toBe(true);
    }
  });
});
