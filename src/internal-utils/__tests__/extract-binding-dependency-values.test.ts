import { makeConstBinding } from '../../specialized-bindings/const-binding';
import { extractBindingDependencyValues } from '../extract-binding-dependency-values';

describe('extractBindingDependencyValues', () => {
  it('undefined bindings should work', () => {
    expect(extractBindingDependencyValues({ bindings: undefined, namedBindingsKeys: undefined })).toBeUndefined();
  });

  it('single bindings should work', () => {
    expect(
      extractBindingDependencyValues({
        bindings: makeConstBinding(3, { id: 'test' }),
        namedBindingsKeys: undefined
      })
    ).toBe(3);
  });

  it('arrays of bindings should work', () => {
    const bindings = [makeConstBinding(3, { id: 'test1' }), makeConstBinding('hello', { id: 'test2' })];

    expect(
      extractBindingDependencyValues({
        bindings,
        namedBindingsKeys: undefined
      })
    ).toMatchObject([3, 'hello']);
  });

  it('undefined values in arrays of bindings should work', () => {
    const bindings = [makeConstBinding(3, { id: 'test1' }), undefined, makeConstBinding('hello', { id: 'test2' })];

    expect(
      extractBindingDependencyValues({
        bindings,
        namedBindingsKeys: undefined
      })
    ).toMatchObject([3, undefined, 'hello']);
  });

  it('binding tuples should work', () => {
    expect(
      extractBindingDependencyValues({
        bindings: [makeConstBinding(3, { id: 'test1' }), makeConstBinding('hello', { id: 'test2' })],
        namedBindingsKeys: undefined
      })
    ).toMatchObject([3, 'hello']);
  });

  it('named bindings should work', () => {
    expect(
      extractBindingDependencyValues({
        bindings: {
          one: makeConstBinding(3, { id: 'test1' }),
          two: makeConstBinding('hello', { id: 'test2' })
        },
        namedBindingsKeys: ['one', 'two']
      })
    ).toMatchObject({ one: 3, two: 'hello' });
  });

  it('undefined values in named bindings should work', () => {
    expect(
      extractBindingDependencyValues({
        bindings: {
          one: makeConstBinding(3, { id: 'test1' }),
          two: makeConstBinding('hello', { id: 'test2' }),
          three: undefined
        },
        namedBindingsKeys: ['one', 'two', 'three']
      })
    ).toMatchObject({ one: 3, two: 'hello', three: undefined });
  });
});
