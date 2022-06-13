import { makeBinding } from '../../binding/make-binding';
import { areAnyBindingsModified } from '../modified-utils';

describe('areAnyBindingsModified', () => {
  it('should return false for no bindings specified', () => {
    expect(areAnyBindingsModified([])).toBeFalsy();
    expect(areAnyBindingsModified([undefined, undefined])).toBeFalsy();
  });

  it('should return false for for all unmodified bindings', () => {
    const b1 = makeBinding(() => 0, { id: 'test1' });
    const b2 = makeBinding(() => 0, { id: 'test2' });

    expect(areAnyBindingsModified([b1, b2])).toBeFalsy();
  });

  it('should return true if one of two bindings are modified', () => {
    const b1 = makeBinding(() => 0, { id: 'test1' });
    const b2 = makeBinding(() => 0, { id: 'test2' });

    b2.set(1);

    expect(areAnyBindingsModified([b1, b2])).toBeTruthy();
  });

  it('should return true if two of two bindings are modified', () => {
    const b1 = makeBinding(() => 0, { id: 'test1' });
    const b2 = makeBinding(() => 0, { id: 'test2' });

    b1.set(1);
    b2.set(2);

    expect(areAnyBindingsModified([b1, b2])).toBeTruthy();
  });
});
