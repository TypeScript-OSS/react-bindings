import { jest } from '@jest/globals';

import { BindingImpl } from '../binding-impl';

describe('BindingImpl', () => {
  describe('with default settings', () => {
    const changeListener = jest.fn();

    beforeEach(() => {
      changeListener.mockReset();
    });

    it('getting unmodified should return initial value', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      b.addChangeListener(changeListener);

      expect(b.get()).toEqual(0);

      expect(changeListener).not.toHaveBeenCalled();
    });

    it('getting after setting should return new value', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      b.addChangeListener(changeListener);

      b.set(1);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual(1);
    });

    it('setting after disconnecting change listener should not trigger the change listener', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      const removeChangeListener = b.addChangeListener(changeListener);

      b.set(1);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual(1);

      removeChangeListener();
      b.set(2);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual(2);
    });

    it('removing a change listener twice should work', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      const removeChangeListener = b.addChangeListener(changeListener);

      b.set(1);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual(1);

      removeChangeListener();
      removeChangeListener();
      b.set(2);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual(2);
    });

    it('setting unmodified should set modified state', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });
      b.addChangeListener(changeListener);

      expect(b.isModified()).toBeFalsy();
      b.set(1);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.isModified()).toBeTruthy();
    });

    it('manually setting the modified state should work', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });

      expect(b.isModified()).toBeFalsy();
      b.set(1);
      expect(b.isModified()).toBeTruthy();
      b.setIsModified(false);
      expect(b.isModified()).toBeFalsy();
    });

    it('manually setting the modified state to the same value it already is should do nothing', () => {
      const b = new BindingImpl(() => 0, { id: 'test' });

      expect(b.isModified()).toBeFalsy();
      b.set(1);
      expect(b.isModified()).toBeTruthy();
      b.setIsModified(false);
      expect(b.isModified()).toBeFalsy();
      b.setIsModified(false);
      expect(b.isModified()).toBeFalsy();
    });
  });
});
