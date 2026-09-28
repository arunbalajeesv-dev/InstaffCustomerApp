/**
 * @format
 */

import { findOrCreateUserByPhone } from '../src/services/usersApi';

const mockMaybeSingle = jest.fn();
const mockInsertSingle = jest.fn();
const mockInsert = jest.fn((_payload: unknown) => ({
  select: () => ({ single: mockInsertSingle }),
}));

jest.mock('../src/services/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table !== 'users') {
        throw new Error(`Unexpected table: ${table}`);
      }
      return {
        select: () => ({
          eq: () => ({ maybeSingle: mockMaybeSingle }),
        }),
        insert: (payload: unknown) => mockInsert(payload),
      };
    },
  },
}));

beforeEach(() => {
  mockMaybeSingle.mockReset();
  mockInsertSingle.mockReset();
  mockInsert.mockClear();
});

test('returns the existing profile without inserting, when one is found', async () => {
  mockMaybeSingle.mockResolvedValue({
    data: { id: 'user-1', contactName: 'Existing Customer', phone: '+919876543210' },
    error: null,
  });

  const user = await findOrCreateUserByPhone('+919876543210');

  expect(user).toEqual({ id: 'user-1', contactName: 'Existing Customer', phone: '+919876543210' });
  expect(mockInsert).not.toHaveBeenCalled();
});

test('creates a new profile with a placeholder name when none is found', async () => {
  mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  mockInsertSingle.mockResolvedValue({
    data: { id: 'user-2', contactName: 'New Customer', phone: '+919876543211' },
    error: null,
  });

  const user = await findOrCreateUserByPhone('+919876543211');

  expect(mockInsert).toHaveBeenCalledWith({
    phone: '+919876543211',
    contact_name: 'New Customer',
  });
  expect(user).toEqual({ id: 'user-2', contactName: 'New Customer', phone: '+919876543211' });
});

test('throws if the lookup errors', async () => {
  mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'lookup failed' } });

  await expect(findOrCreateUserByPhone('+919876543212')).rejects.toThrow('lookup failed');
  expect(mockInsert).not.toHaveBeenCalled();
});

test('throws if creating the new profile fails', async () => {
  mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  mockInsertSingle.mockResolvedValue({ data: null, error: { message: 'insert failed' } });

  await expect(findOrCreateUserByPhone('+919876543213')).rejects.toThrow('insert failed');
});
