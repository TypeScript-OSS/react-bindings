import { makeBinding } from '../../binding/make-binding';
import { resolveTypeOrDeferredTypeOrBindingType } from '../utils';

describe('resolveTypeOrDeferredTypeOrBindingType', () => {
  it('number should return number', () => {
    expect(resolveTypeOrDeferredTypeOrBindingType(5)).toBe(5);
  });

  it('string should return string', () => {
    expect(resolveTypeOrDeferredTypeOrBindingType('hello')).toBe('hello');
  });

  it('array should return array', () => {
    expect(resolveTypeOrDeferredTypeOrBindingType(['hello', 'world'])).toMatchObject(['hello', 'world']);
  });

  it('binding should return binding value', () => {
    const b = makeBinding(() => 10, { id: 'b' });

    expect(resolveTypeOrDeferredTypeOrBindingType(b)).toBe(10);
  });

  it('function should function result', () => {
    expect(resolveTypeOrDeferredTypeOrBindingType(() => 20)).toBe(20);
  });
});
