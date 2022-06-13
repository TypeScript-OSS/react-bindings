import { concatArrays } from '../array-like';

describe('concatArrays', () => {
  it('no parameters should return an empty array', () => {
    expect(concatArrays()).toMatchObject([]);
  });

  it('array first parameter only should return original array directly', () => {
    const array = ['hello', 'world'];
    expect(concatArrays(array)).toBe(array);
    expect(concatArrays(array)).toMatchObject(array);
  });

  it('undefined first parameter and array second parameter should return original array directly', () => {
    const array = ['hello', 'world'];
    expect(concatArrays(undefined, array)).toBe(array);
    expect(concatArrays(undefined, array)).toMatchObject(array);
  });

  it('two arrays should return new array with concatenated elements', () => {
    const array1 = ['hello', 'world'];
    const array2 = ['one', 'two'];
    expect(concatArrays(array1, array2)).toMatchObject(['hello', 'world', 'one', 'two']);
  });
});
