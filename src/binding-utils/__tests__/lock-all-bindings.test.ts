import { makeBinding } from '../../binding/make-binding.js';
import { lockAllBindings } from '../lock-utils.js';

describe('lockAllBindings', () => {
  it('should work with no bindings', () => {
    const unlock1 = lockAllBindings([]);
    const unlock2 = lockAllBindings([undefined, undefined]);

    unlock2();
    unlock1();
  });

  it('should work with bindings', () => {
    const b1 = makeBinding(() => 0, { id: 'test1' });
    const b2 = makeBinding(() => 0, { id: 'test2' });

    const unlock = lockAllBindings([b1, b2]);

    expect(b1.isLocked()).toBeTruthy();
    expect(b2.isLocked()).toBeTruthy();

    b1.set(1);
    b2.set(2);

    expect(b1.get()).toBe(0);
    expect(b2.get()).toBe(0);

    unlock();

    expect(b1.isLocked()).toBeFalsy();
    expect(b2.isLocked()).toBeFalsy();

    expect(b1.get()).toBe(1);
    expect(b2.get()).toBe(2);
  });
});
