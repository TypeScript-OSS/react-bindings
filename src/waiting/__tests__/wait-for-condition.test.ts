import { makeBinding } from '../../binding/make-binding.js';
import { waitForCondition } from '../wait-for-condition.js';

const ONE_SEC_MSEC = 1000;

describe('waitForCondition', () => {
  it('immediate satisfaction should work', async () => {
    const a = makeBinding(() => 1, { id: 'a' });
    const res = await waitForCondition(a, { checkCondition: (a) => a >= 1, timeoutMSec: 30 * ONE_SEC_MSEC });
    expect(res).toBe('satisfied');
  });

  it('satisfaction after delay should work', async () => {
    const a = makeBinding(() => 0, { id: 'a' });
    setTimeout(() => a.set(a.get() + 1), 500);
    const res = await waitForCondition(a, { checkCondition: (a) => a >= 1, timeoutMSec: 30 * ONE_SEC_MSEC });
    expect(res).toBe('satisfied');
  });

  it('satisfaction after delay with intermediate non-satisfaction should work', async () => {
    const a = makeBinding(() => 0, { id: 'a' });
    setTimeout(() => a.set(a.get() + 1), 100);
    setTimeout(() => a.set(a.get() + 1), 200);
    setTimeout(() => a.set(a.get() + 1), 300);
    setTimeout(() => a.set(a.get() + 1), 400);
    setTimeout(() => a.set(a.get() + 1), 500);
    const res = await waitForCondition(a, { checkCondition: (a) => a >= 5, timeoutMSec: 30 * ONE_SEC_MSEC });
    expect(res).toBe('satisfied');
  });

  it('timeout should work', async () => {
    const a = makeBinding(() => 0, { id: 'a' });
    setTimeout(() => a.set(a.get() + 1), 100);
    const res = await waitForCondition(a, { checkCondition: (a) => a >= 5, timeoutMSec: ONE_SEC_MSEC });
    expect(res).toBe('timeout');
  });

  it('stopping should work', async () => {
    const a = makeBinding(() => 0, { id: 'a' });
    setTimeout(() => a.set(a.get() + 1), 100);
    setTimeout(() => a.set(a.get() + 1), 200);
    setTimeout(() => a.set(a.get() + 1), 300);
    setTimeout(() => a.set(a.get() + 1), 400);
    setTimeout(() => a.set(a.get() + 1), 500);
    const res = await waitForCondition(a, {
      checkCondition: (a) => (a >= 5 ? 'satisfied' : a === 3 ? 'stop' : 'continue'),
      timeoutMSec: 30 * ONE_SEC_MSEC
    });
    expect(res).toBe('stopped');
  });
});
