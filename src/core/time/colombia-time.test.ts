import {
  formatColombiaDateTime,
  getColombiaDateKey,
} from './colombia-time';

describe('colombia-time', () => {
  it('mantiene la fecha colombiana cuando UTC ya esta en el dia siguiente', () => {
    expect(getColombiaDateKey(new Date('2026-06-13T02:30:00.000Z'))).toBe(
      '2026-06-12',
    );
  });

  it('formatea el instante usando America/Bogota', () => {
    const formatted = formatColombiaDateTime('2026-06-12T18:30:00.000Z');

    expect(formatted).toContain('1:30');
    expect(formatted.toLowerCase()).toContain('p.');
  });
});
