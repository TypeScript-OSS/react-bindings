import { jest } from '@jest/globals';

import { BindingImpl } from '../binding-impl.js';

describe('BindingImpl', () => {
  describe('with set value transformer', () => {
    const changeListener = jest.fn();

    beforeEach(() => {
      changeListener.mockReset();
    });

    it('getting after setting a new value should return the transformed new value', () => {
      const b = new BindingImpl(() => 'hello', { id: 'test', setValueTransformer: (v) => v.toLocaleLowerCase() });
      b.addChangeListener(changeListener);

      b.set('WORLD');
      expect(b.isModified()).toBeTruthy();
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual('world');
    });

    it('getting after setting a new value using setRaw should return the unmodified new value', () => {
      const b = new BindingImpl(() => 'hello', { id: 'test', setValueTransformer: (v) => v.toLocaleLowerCase() });
      b.addChangeListener(changeListener);

      b.setRaw('WORLD');
      expect(b.isModified()).toBeFalsy();
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual('WORLD');
    });

    it('setting locked using setRaw should do nothing until unlocked, after which it should update value without transformation', () => {
      const b = new BindingImpl(() => 'hello', { id: 'test', setValueTransformer: (v) => v.toLocaleLowerCase() });
      b.addChangeListener(changeListener);

      const unlock = b.lock();
      b.setRaw('WORLD');
      expect(changeListener).not.toHaveBeenCalled();
      expect(b.isModified()).toBeFalsy();
      expect(b.get()).toEqual('hello');
      unlock();
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.isModified()).toBeFalsy();
      expect(b.get()).toEqual('WORLD');
    });
  });
});
