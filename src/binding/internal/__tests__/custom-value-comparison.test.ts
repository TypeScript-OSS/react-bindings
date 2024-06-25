import { jest } from '@jest/globals';

import { BindingImpl } from '../binding-impl.js';

describe('BindingImpl', () => {
  describe('with custom value comparison', () => {
    const changeListener = jest.fn();

    beforeEach(() => {
      changeListener.mockReset();
    });

    it('getting after setting a new value should return new value', () => {
      const b = new BindingImpl(() => 0, { id: 'test', detectChanges: true, areEqual: (a, b) => a % 2 === b % 2 });
      b.addChangeListener(changeListener);

      b.set(1);
      expect(changeListener).toHaveBeenCalledTimes(1);
      expect(b.get()).toEqual(1);
    });

    it('getting after setting a different but "equivalent" value should return the original value', () => {
      const b = new BindingImpl(() => 0, { id: 'test', detectChanges: true, areEqual: (a, b) => a % 2 === b % 2 });
      b.addChangeListener(changeListener);

      b.set(2);
      expect(changeListener).not.toHaveBeenCalled();
      expect(b.get()).toEqual(0);
    });
  });
});
