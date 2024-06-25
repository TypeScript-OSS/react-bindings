import { jest } from '@jest/globals';

import { BindingImpl } from '../binding-impl.js';

describe('BindingImpl', () => {
  describe('with default settings', () => {
    const changeListener = jest.fn();

    beforeEach(() => {
      changeListener.mockReset();
    });

    it('setting locked should do nothing until unlocked, after which it should update value', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      b.addChangeListener(changeListener);

      const unlock = b.lock();
      b.set(1);
      expect(changeListener).not.toHaveBeenCalled();
      expect(b.isModified()).toBeFalsy();
      expect(b.get()).toEqual(0);
      unlock();
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.isModified()).toBeTruthy();
      expect(b.get()).toEqual(1);
    });

    it('setting locked twice should do nothing until unlocked, after which it should update with the most recent value', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      b.addChangeListener(changeListener);

      const unlock = b.lock();
      b.set(1);
      expect(changeListener).not.toHaveBeenCalled();
      expect(b.isModified()).toBeFalsy();
      expect(b.get()).toEqual(0);
      b.set(2);
      expect(changeListener).not.toHaveBeenCalled();
      expect(b.isModified()).toBeFalsy();
      expect(b.get()).toEqual(0);
      unlock();
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.isModified()).toBeTruthy();
      expect(b.get()).toEqual(2);
    });

    it('setting locked then resetting should do nothing until unlocked, after which it should reset', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      b.addChangeListener(changeListener);

      b.set(1);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.isModified()).toBeTruthy();
      expect(b.get()).toEqual(1);

      const unlock = b.lock();
      b.set(2);
      expect(changeListener).toHaveBeenCalledTimes(1);
      b.reset();
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual(1);
      unlock();
      expect(changeListener).toHaveBeenCalledTimes(2);
      expect(b.isModified()).toBeFalsy();
      expect(b.get()).toEqual(0);
    });

    it('setting locked then resetting then setting again should do nothing until unlocked, after which it should reset and then update the most recent value', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      b.addChangeListener(changeListener);

      b.set(1);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.isModified()).toBeTruthy();
      expect(b.get()).toEqual(1);

      const unlock = b.lock();
      b.set(2);
      expect(changeListener).toHaveBeenCalledTimes(1);
      b.reset();
      expect(changeListener).toHaveBeenCalledTimes(1);
      b.set(3);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual(1);
      unlock();
      expect(changeListener).toHaveBeenCalledTimes(3);
      expect(b.isModified()).toBeTruthy();
      expect(b.get()).toEqual(3);
    });

    it('unlocking the same lock twice should work', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      b.addChangeListener(changeListener);

      b.set(1);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.isModified()).toBeTruthy();
      expect(b.get()).toEqual(1);

      const unlock = b.lock();
      b.set(2);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual(1);
      unlock();
      unlock();
      expect(changeListener).toHaveBeenCalledTimes(2);
      expect(b.isModified()).toBeTruthy();
      expect(b.get()).toEqual(2);
    });
  });
});
