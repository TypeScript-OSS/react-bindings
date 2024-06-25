import { resolveTypeOrDeferredType } from '../utils.js';

describe('resolveTypeOrDeferredType', () => {
  it('number should return number', () => {
    expect(resolveTypeOrDeferredType(5)).toBe(5);
  });

  it('string should return string', () => {
    expect(resolveTypeOrDeferredType('hello')).toBe('hello');
  });

  it('array should return array', () => {
    expect(resolveTypeOrDeferredType(['hello', 'world'])).toMatchObject(['hello', 'world']);
  });

  it('function should function result', () => {
    expect(resolveTypeOrDeferredType(() => 10)).toBe(10);
  });
});
