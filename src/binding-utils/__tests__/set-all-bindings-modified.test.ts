import { makeBinding } from '../../binding/make-binding.js';
import { setAllBindingsModified } from '../modified-utils.js';

describe('setAllBindingsModified', () => {
  it('should work with no bindings', () => {
    setAllBindingsModified([], true);
    setAllBindingsModified([undefined, undefined], true);
  });

  it('should work with bindings', () => {
    const b1 = makeBinding(() => 0, { id: 'test1' });
    const b2 = makeBinding(() => 0, { id: 'test2' });

    expect(b1.isModified()).toBeFalsy();
    expect(b2.isModified()).toBeFalsy();

    setAllBindingsModified([b1, b2], true);

    expect(b1.isModified()).toBeTruthy();
    expect(b2.isModified()).toBeTruthy();
  });
});
