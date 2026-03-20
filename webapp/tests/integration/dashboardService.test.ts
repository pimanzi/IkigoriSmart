import { fetchDashboardStats } from '../../src/services/dashboard.service';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '../../src/lib/supabase';

const today = new Date().toISOString();

const fakePredictions = [
  { id: '1', severity: 'Healthy',  risk_level: 'Low',  district: 'Musanze', created_at: today, user_id: 'u1' },
  { id: '2', severity: 'Healthy',  risk_level: 'Low',  district: 'Nyabihu', created_at: today, user_id: 'u2' },
  { id: '3', severity: 'Moderate', risk_level: 'High', district: 'Musanze', created_at: today, user_id: 'u1' },
  { id: '4', severity: 'Severe',   risk_level: 'High', district: 'Nyabihu', created_at: today, user_id: 'u3' },
];

const fakeProfiles = [
  { id: 'u1', role: 'Farmer', first_name: 'Alice', last_name: 'K', avatar: null, district: 'Musanze' },
  { id: 'u2', role: 'Farmer', first_name: 'Bob',   last_name: 'N', avatar: null, district: 'Nyabihu' },
  { id: 'u3', role: 'Admin',  first_name: 'Carol', last_name: 'M', avatar: null, district: 'Musanze' },
];

function makeChain(data: unknown[]) {
  const chain: Record<string, unknown> = {};
  const resolve = () => Promise.resolve({ data, error: null });
  chain['select'] = jest.fn().mockReturnValue(chain);
  chain['order']  = jest.fn().mockReturnValue(chain);
  chain['limit']  = jest.fn().mockImplementation(resolve);
  chain['then']   = (onFulfilled: (v: unknown) => unknown) => resolve().then(onFulfilled);
  return chain;
}

beforeEach(() => {
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'predictions')        return makeChain(fakePredictions);
    if (table === 'profiles')           return makeChain(fakeProfiles);
    if (table === 'feedback')           return makeChain([]);
    if (table === 'ipm_recommendations') return makeChain([]);
    if (table === 'tutorials')          return makeChain([]);
    return makeChain([]);
  });
});

afterEach(() => jest.clearAllMocks());

describe('fetchDashboardStats', () => {
  it('counts total predictions correctly', async () => {
    const stats = await fetchDashboardStats();
    expect(stats.totalPredictions).toBe(4);
  });

  it('counts only Farmer-role profiles for totalUsers', async () => {
    const stats = await fetchDashboardStats();
    expect(stats.totalUsers).toBe(2);
  });

  it('computes severityBreakdown with correct counts', async () => {
    const stats = await fetchDashboardStats();
    expect(stats.severityBreakdown).toContainEqual({ severity: 'Healthy',  count: 2 });
    expect(stats.severityBreakdown).toContainEqual({ severity: 'Moderate', count: 1 });
    expect(stats.severityBreakdown).toContainEqual({ severity: 'Severe',   count: 1 });
    expect(stats.severityBreakdown).toContainEqual({ severity: 'Early',    count: 0 });
  });

  it('computes riskBreakdown with correct counts', async () => {
    const stats = await fetchDashboardStats();
    expect(stats.riskBreakdown).toContainEqual({ risk_level: 'Low',  count: 2 });
    expect(stats.riskBreakdown).toContainEqual({ risk_level: 'High', count: 2 });
  });
});
