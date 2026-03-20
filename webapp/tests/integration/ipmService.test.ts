import { fetchIPMRecommendations } from '../../src/services/ipm.service';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '../../src/lib/supabase';

const mockRecommendations = [
  { id: '1', severity: 'Severe',   risk_level: 'High',   action_type: 'immediate', title_en: 'Apply fungicide', title_rw: '', description_en: '', description_rw: '', created_at: '2025-01-01' },
  { id: '2', severity: 'Moderate', risk_level: 'Medium', action_type: 'monitor',   title_en: 'Monitor weekly',  title_rw: '', description_en: '', description_rw: '', created_at: '2025-01-02' },
  { id: '3', severity: 'Early',    risk_level: 'Low',    action_type: 'preventive',title_en: 'Use clean seed',  title_rw: '', description_en: '', description_rw: '', created_at: '2025-01-03' },
];

function makeChain(data: unknown[], error: unknown = null) {
  const chain: Record<string, unknown> = {};
  chain['select'] = jest.fn().mockReturnValue(chain);
  chain['order']  = jest.fn().mockReturnValue(chain);
  chain['eq']     = jest.fn().mockReturnValue(chain);
  chain['then']   = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve({ data, error }).then(onFulfilled, onRejected);
  (supabase.from as jest.Mock).mockReturnValueOnce(chain);
  return chain;
}

afterEach(() => jest.clearAllMocks());

describe('fetchIPMRecommendations', () => {
  it('returns all recommendations when no filters are provided', async () => {
    makeChain(mockRecommendations);

    const result = await fetchIPMRecommendations();

    expect(result).toHaveLength(3);
    expect(supabase.from).toHaveBeenCalledWith('ipm_recommendations');
  });

  it('applies a severity filter when provided', async () => {
    const chain = makeChain([mockRecommendations[0]]);

    const result = await fetchIPMRecommendations({ severity: 'Severe' });

    expect(chain.eq).toHaveBeenCalledWith('severity', 'Severe');
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe('Severe');
  });

  it('applies both severity and risk_level filters when provided', async () => {
    const chain = makeChain([mockRecommendations[0]]);

    await fetchIPMRecommendations({ severity: 'Severe', risk_level: 'High' });

    expect(chain.eq).toHaveBeenCalledWith('severity', 'Severe');
    expect(chain.eq).toHaveBeenCalledWith('risk_level', 'High');
  });

  it('throws when Supabase returns an error', async () => {
    makeChain([], { message: 'Permission denied' });

    await expect(fetchIPMRecommendations()).rejects.toMatchObject({ message: 'Permission denied' });
  });
});
