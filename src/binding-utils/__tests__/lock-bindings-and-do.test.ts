import { sleep } from '../../__test_dependency__';
import { makeBinding } from '../../binding/make-binding';
import { lockBindingsAndDo } from '../lock-utils';

describe('lockBindingsAndDo', () => {
  describe('with synchronous callback', () => {
    it('should work with no bindings', () => {
      const func = jest.fn();
      lockBindingsAndDo([undefined, undefined], func);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should work with bindings', () => {
      const b1 = makeBinding(() => 0, { id: 'test1' });
      const b2 = makeBinding(() => 0, { id: 'test2' });

      const func = jest.fn(() => {
        expect(b1.isLocked()).toBe(true);
        expect(b2.isLocked()).toBe(true);
      });
      lockBindingsAndDo([b1, b2], func);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('with asynchronous callback', () => {
    it('should work with no bindings', async () => {
      const func = jest.fn(async () => {});
      await lockBindingsAndDo([undefined, undefined], func);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should work with bindings', async () => {
      const b1 = makeBinding(() => 0, { id: 'test1' });
      const b2 = makeBinding(() => 0, { id: 'test2' });

      const func = jest.fn(async () => {
        expect(b1.isLocked()).toBe(true);
        expect(b2.isLocked()).toBe(true);

        await sleep(100);

        expect(b1.isLocked()).toBe(true);
        expect(b2.isLocked()).toBe(true);
      });
      await lockBindingsAndDo([b1, b2], func);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });
});
