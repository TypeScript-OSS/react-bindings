import { normalizeAsOptionalArray } from '../array-like.js';

describe('normalizeAsOptionalArray', () => {
  it('undefined should return undefined', () => {
    expect(normalizeAsOptionalArray(undefined)).toBeUndefined();
  });

  it('a single value should return an array with that value', () => {
    expect(normalizeAsOptionalArray('hello')).toMatchObject(['hello']);
  });

  it('an array should be returned as-is', () => {
    const array = ['hello', 'world'];
    expect(normalizeAsOptionalArray(array)).toBe(array);
    expect(normalizeAsOptionalArray(array)).toMatchObject(array);
  });
});
