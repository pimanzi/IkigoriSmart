import { savePrediction, PredictionError } from '../../src/services/prediction.service';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '../../src/lib/supabase';

const mockPayload = {
  user_id: 'profile-123',
  image_url: 'https://storage.example.com/leaf.jpg',
  severity: 'Moderate',
  temperature_c: 22,
  humidity_pct: 75,
  rainfall_mm: 120,
  district: 'Musanze',
  risk_level: 'High',
  weather_source: 'api',
};

function mockInsertChain(response: { data: unknown; error: unknown }) {
  return {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce(response),
  };
}

describe('savePrediction', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns the inserted row id on success', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce(
      mockInsertChain({ data: { id: 'pred-456' }, error: null })
    );

    const id = await savePrediction(mockPayload);

    expect(id).toBe('pred-456');
    expect(supabase.from).toHaveBeenCalledWith('predictions');
  });

  it('inserts into the predictions table with the full payload', async () => {
    const chain = mockInsertChain({ data: { id: 'pred-789' }, error: null });
    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    await savePrediction(mockPayload);

    expect(chain.insert).toHaveBeenCalledWith(mockPayload);
  });

  it('throws PredictionError when Supabase returns an error', async () => {
    const errorResponse = { data: null, error: { message: 'Row level security violation' } };
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(mockInsertChain(errorResponse))
      .mockReturnValueOnce(mockInsertChain(errorResponse));

    await expect(savePrediction(mockPayload)).rejects.toThrow(PredictionError);
    await expect(savePrediction(mockPayload)).rejects.toThrow('Row level security violation');
  });
});
