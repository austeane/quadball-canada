import { describe, it, expect } from 'vitest';
import { formatDate } from '../../src/utils/index';

describe('utils/index', () => {
  describe('formatDate', () => {
    // Use mid-day UTC times to avoid timezone boundary issues
    // (midnight UTC becomes previous day in western timezones)
    const testDate = '2025-03-14T12:00:00Z';

    describe('English locale', () => {
      it('formats date in English by default', () => {
        const result = formatDate(testDate);
        // en-CA format: "March 14, 2025"
        expect(result).toContain('March');
        expect(result).toContain('14');
        expect(result).toContain('2025');
      });

      it('formats date in English when locale is en', () => {
        const result = formatDate(testDate, 'en');
        expect(result).toContain('March');
        expect(result).toContain('14');
        expect(result).toContain('2025');
      });
    });

    describe('French locale', () => {
      it('formats date in French when locale is fr', () => {
        const result = formatDate(testDate, 'fr');
        // fr-CA format: "14 mars 2025"
        expect(result).toContain('mars');
        expect(result).toContain('14');
        expect(result).toContain('2025');
      });
    });

    describe('various date formats', () => {
      it('handles ISO date strings', () => {
        // Use mid-day to avoid timezone issues
        const result = formatDate('2024-12-25T12:00:00.000Z', 'en');
        expect(result).toContain('December');
        expect(result).toContain('25');
        expect(result).toContain('2024');
      });

      it('handles date-only strings', () => {
        // Date-only strings are parsed as local time, use mid-month to be safe
        const result = formatDate('2024-07-15', 'en');
        expect(result).toContain('July');
        expect(result).toContain('2024');
      });

      it('handles dates with timezone offset', () => {
        const result = formatDate('2025-01-15T12:30:00-05:00', 'en');
        expect(result).toContain('January');
        expect(result).toContain('15');
        expect(result).toContain('2025');
      });
    });

    describe('edge cases', () => {
      it('handles start of year', () => {
        // Use mid-day to avoid timezone boundary
        const resultEn = formatDate('2025-01-01T12:00:00Z', 'en');
        const resultFr = formatDate('2025-01-01T12:00:00Z', 'fr');

        expect(resultEn).toContain('January');
        expect(resultFr).toContain('janvier');
      });

      it('handles end of year', () => {
        // Use mid-day to avoid timezone boundary
        const resultEn = formatDate('2025-12-31T12:00:00Z', 'en');
        const resultFr = formatDate('2025-12-31T12:00:00Z', 'fr');

        expect(resultEn).toContain('December');
        expect(resultFr).toContain('décembre');
      });

      it('handles leap year date', () => {
        const result = formatDate('2024-02-29T12:00:00Z', 'en');
        expect(result).toContain('February');
        expect(result).toContain('29');
        expect(result).toContain('2024');
      });
    });
  });
});
