import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    expect(cn('p-4', { 'mt-2': true, 'mb-2': false })).toBe('p-4 mt-2');
  });
});
