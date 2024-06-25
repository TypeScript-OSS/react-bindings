import { jest } from '@jest/globals';

import { sleep } from '../../../__test_dependency__/sleep.js';
import { makeValueThenDo } from '../make-value-then-do.js';

describe('makeValueThenDo', () => {
  describe('synchronous makeValue functions', () => {
    it('should result in then function being called synchronously', () => {
      const thenFunc = jest.fn();
      makeValueThenDo(() => 1, thenFunc);
      expect(thenFunc).toHaveBeenLastCalledWith(1);
    });

    it('that throw should result in then function being called synchronously but without a value', () => {
      const thenFunc = jest.fn();
      expect(() => {
        makeValueThenDo(() => {
          throw new Error();
        }, thenFunc);
      }).toThrow();
      expect(thenFunc).toHaveBeenLastCalledWith();
    });
  });

  describe('asynchronous makeValue functions', () => {
    it('should result in then function being called asynchronously', async () => {
      const thenFunc = jest.fn();
      const promise = makeValueThenDo(async () => {
        await sleep(100);

        return 1;
      }, thenFunc);
      expect(thenFunc).not.toHaveBeenCalled();
      await promise;
      expect(thenFunc).toHaveBeenLastCalledWith(1);
    });

    it('that throw should result in then function being called asynchronously but without a value', async () => {
      const thenFunc = jest.fn();
      const promise = expect(
        makeValueThenDo(async (): Promise<void> => {
          await sleep(100);

          throw new Error();
        }, thenFunc)
      ).rejects.toThrow();
      expect(thenFunc).not.toHaveBeenCalled();
      await promise;
      expect(thenFunc).toHaveBeenLastCalledWith();
    });
  });
});
