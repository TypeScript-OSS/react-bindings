import { makeBinding } from '../../binding/make-binding';
import { areAnyBindingsLocked } from '../lock-utils';

describe('areAnyBindingsLocked', () => {
  it('should return false for no bindings specified', () => {
    expect(areAnyBindingsLocked([])).toBeFalsy();
    expect(areAnyBindingsLocked([undefined, undefined])).toBeFalsy();
  });

  it('should return false for for all unlocked bindings', () => {
    const b1 = makeBinding(() => 0, { id: 'test1' });
    const b2 = makeBinding(() => 0, { id: 'test2' });

    expect(areAnyBindingsLocked([b1, b2])).toBeFalsy();
  });

  it('should return true if one of two bindings are locked', () => {
    const b1 = makeBinding(() => 0, { id: 'test1' });
    const b2 = makeBinding(() => 0, { id: 'test2' });

    const unlock = b2.lock();

    expect(areAnyBindingsLocked([b1, b2])).toBeTruthy();

    unlock();
  });

  it('should return true if two of two bindings are locked', () => {
    const b1 = makeBinding(() => 0, { id: 'test1' });
    const b2 = makeBinding(() => 0, { id: 'test2' });

    const unlock1 = b1.lock();
    const unlock2 = b2.lock();

    expect(areAnyBindingsLocked([b1, b2])).toBeTruthy();

    unlock1();
    unlock2();
  });
});
