import { normalizeAsArray } from '../array-like.js';

describe('normalizeAsArray', () => {
  it('undefined should return an array with [undefined]', () => {
    expect(normalizeAsArray(undefined)).toMatchObject([undefined]);
  });

  it('a single value should return an array with that value', () => {
    expect(normalizeAsArray('hello')).toMatchObject(['hello']);
  });

  it('an array should be returned as-is', () => {
    const array = ['hello', 'world'];
    expect(normalizeAsArray(array)).toBe(array);
    expect(normalizeAsArray(array)).toMatchObject(array);
  });
});
