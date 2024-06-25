import { makeBinding } from '../make-binding.js';

describe('makeBinding', () => {
  it('basic use should work', () => {
    const b = makeBinding(() => 0, { id: 'test' });
    expect(b.get()).toBe(0);
  });

  it('added fields should work', () => {
    const b = makeBinding(() => 0, {
      id: 'test',
      addFields: (b) => ({
        isEven: () => b.get() % 2 === 0,
        isOdd: () => b.get() % 2 === 1
      })
    });
    expect(b.get()).toBe(0);
    expect(b.isEven()).toBeTruthy();
    expect(b.isOdd()).toBeFalsy();

    b.set(1);
    expect(b.isEven()).toBeFalsy();
    expect(b.isOdd()).toBeTruthy();
  });
});
