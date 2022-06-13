import { makeBinding } from '../../binding/make-binding';
import { resolveTypeOrBindingType } from '../utils';

describe('resolveTypeOrBindingType', () => {
  it('number should return number', () => {
    expect(resolveTypeOrBindingType(5)).toBe(5);
  });

  it('string should return string', () => {
    expect(resolveTypeOrBindingType('hello')).toBe('hello');
  });

  it('array should return array', () => {
    expect(resolveTypeOrBindingType(['hello', 'world'])).toMatchObject(['hello', 'world']);
  });

  it('binding should return binding value', () => {
    const b = makeBinding(() => 10, { id: 'b' });

    expect(resolveTypeOrBindingType(b)).toBe(10);
  });
});
