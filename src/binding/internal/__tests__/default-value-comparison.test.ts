import { jest } from '@jest/globals';

import { BindingImpl } from '../binding-impl.js';

describe('BindingImpl', () => {
  describe('with default value comparison', () => {
    const changeListener = jest.fn();

    beforeEach(() => {
      changeListener.mockReset();
    });

    describe('with simple types', () => {
      it('getting after setting a new value should return new value', () => {
        const b = new BindingImpl(() => 0, { id: 'test', detectChanges: true });
        b.addChangeListener(changeListener);

        b.set(1);
        expect(changeListener).toHaveBeenCalledTimes(1);
        expect(b.get()).toEqual(1);
      });

      it('getting after setting an equivalent value should return the original value', () => {
        const b = new BindingImpl(() => 0, { id: 'test', detectChanges: true });
        b.addChangeListener(changeListener);

        b.set(0);
        expect(changeListener).not.toHaveBeenCalled();
        expect(b.get()).toEqual(0);
      });
    });

    describe('with complex types', () => {
      it('getting after setting a new value should return new value', () => {
        const b = new BindingImpl(() => ({ x: 0 }), { id: 'test', detectChanges: true });
        b.addChangeListener(changeListener);

        b.set({ x: 1 });
        expect(changeListener).toHaveBeenCalledTimes(1);
        expect(b.get()).toMatchObject({ x: 1 });
      });

      it('getting after setting an equivalent value should return the original value', () => {
        const originalInstance = { x: 0 };
        const b = new BindingImpl(() => originalInstance, { id: 'test', detectChanges: true });
        b.addChangeListener(changeListener);

        b.set({ x: 0 });
        expect(changeListener).not.toHaveBeenCalled();
        expect(b.get()).toMatchObject({ x: 0 });
        expect(b.get()).toBe(originalInstance);
      });
    });
  });
});
