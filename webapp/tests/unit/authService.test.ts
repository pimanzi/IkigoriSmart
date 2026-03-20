import { logoutUser } from '../../src/services/auth.service';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

import { supabase } from '../../src/lib/supabase';

afterEach(() => jest.clearAllMocks());

describe('logoutUser', () => {
  it('resolves without error on a successful sign-out', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    await expect(logoutUser()).resolves.toBeUndefined();
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('throws when Supabase sign-out returns an error', async () => {
    const authError = { message: 'Session not found', status: 401 };
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: authError });

    await expect(logoutUser()).rejects.toMatchObject({ message: 'Session not found' });
  });
});
