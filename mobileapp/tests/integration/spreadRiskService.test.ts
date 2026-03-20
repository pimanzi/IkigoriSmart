import { predictSpreadRisk, SpreadRiskError } from '../../src/services/spreadRisk.service';

const mockRequest = {
  severity: 'Moderate',
  temperature: 22,
  humidity: 75,
  rainfall: 120,
  district: 'Musanze',
};

const mockResponse = {
  risk_level: 'High',
  confidence: 0.91,
  probabilities: [
    { label: 'Low', probability: 0.05 },
    { label: 'Medium', probability: 0.04 },
    { label: 'High', probability: 0.91 },
  ],
  score_breakdown: {
    severity_score: 30,
    temperature_score: 8,
    humidity_score: 12,
    rainfall_score: 10,
    total_score: 60,
    max_possible: 70,
  },
  risk_level_int: 2,
  inference_time_ms: 45,
  model_version: '1.0',
};

beforeEach(() => {
  process.env.EXPO_PUBLIC_WEATHER_RISK_API_URL = 'http://test-api';
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('predictSpreadRisk', () => {
  it('returns a parsed SpreadRiskResponse on a successful 200 response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);

    const result = await predictSpreadRisk(mockRequest);

    expect(result.risk_level).toBe('High');
    expect(result.confidence).toBeCloseTo(0.91);
    expect(result.risk_level_int).toBe(2);
    expect(result.score_breakdown.total_score).toBe(60);
  });

  it('sends a POST to the correct endpoint with the request body', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);

    await predictSpreadRisk(mockRequest);

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('http://test-api/predict');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject(mockRequest);
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('throws SpreadRiskError with apiUnavailable key on a 503 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    await expect(predictSpreadRisk(mockRequest)).rejects.toThrow(SpreadRiskError);
    await expect(predictSpreadRisk(mockRequest)).rejects.toThrow('scan.api.apiUnavailable');
  });

  it('throws SpreadRiskError with predictionFailed key on other non-ok responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(predictSpreadRisk(mockRequest)).rejects.toThrow('scan.api.predictionFailed');
  });
});
