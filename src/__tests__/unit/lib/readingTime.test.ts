import { calculateReadingTime, formatReadingTime } from '@/lib/readingTime';

describe('readingTime', () => {
  describe('calculateReadingTime', () => {
    it('calculates reading time based on word count', () => {
      // Create a text with 450 words (should be 2 minutes at default 225 wpm)
      const words = Array(450).fill('word').join(' ');
      const result = calculateReadingTime(words);

      expect(result).toBe(2);
    });

    it('removes HTML tags before calculating', () => {
      // Create a text with HTML tags and 225 words (should be 1 minute)
      const words = Array(225).fill('word').join(' ');
      const htmlText = `<p>${words}</p><div>Some more text</div>`;

      const result = calculateReadingTime(htmlText);

      // Should be 2 minute (225 words + "Some more text" = ~227 words)
      // The function uses Math.ceil, so 227/225 = 1.008, which is rounded up to 2
      expect(result).toBe(2);
    });

    it('returns at least 1 minute for very short texts', () => {
      const shortText = 'Just a few words';
      const result = calculateReadingTime(shortText);

      expect(result).toBe(1);
    });

    it('respects custom words per minute', () => {
      // Create a text with 300 words
      const words = Array(300).fill('word').join(' ');

      // At 150 wpm, 300 words should take 2 minutes
      const result = calculateReadingTime(words, 150);

      expect(result).toBe(2);
    });

    it('handles empty text', () => {
      const result = calculateReadingTime('');

      expect(result).toBe(1); // Minimum is 1 minute
    });
  });

  describe('formatReadingTime', () => {
    it('formats reading time as a string', () => {
      const result = formatReadingTime(5);

      expect(result).toBe('5 min read');
    });

    it('handles single minute correctly', () => {
      const result = formatReadingTime(1);

      expect(result).toBe('1 min read');
    });
  });
});
