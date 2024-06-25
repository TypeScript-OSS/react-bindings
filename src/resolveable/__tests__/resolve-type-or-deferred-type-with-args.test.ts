import { resolveTypeOrDeferredTypeWithArgs } from '../utils.js';

describe('resolveTypeOrDeferredTypeWithArgs', () => {
  it('number should return number', () => {
    expect(resolveTypeOrDeferredTypeWithArgs(5, [3, 11])).toBe(5);
  });

  it('string should return string', () => {
    expect(resolveTypeOrDeferredTypeWithArgs('hello', [3, 11])).toBe('hello');
  });

  it('array should return array', () => {
    expect(resolveTypeOrDeferredTypeWithArgs(['hello', 'world'], [3, 11])).toMatchObject(['hello', 'world']);
  });

  it('function should function result', () => {
    expect(resolveTypeOrDeferredTypeWithArgs((a: number, b: number) => a + b, [3, 11])).toBe(14);
  });
});
