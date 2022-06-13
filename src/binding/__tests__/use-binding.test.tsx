import React, { ComponentType, useState } from 'react';

import { runInDom, sleep } from '../../__test_dependency__';
import { useBinding } from '../use-binding';

describe('useBinding', () => {
  it('basic use should work', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => {
        const b = useBinding(() => 0, { id: 'test' });
        return <>{b.get()}</>;
      });

      onMount(() => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
      });

      return <MyComponent />;
    }));

  it('deps use should work', () =>
    runInDom(({ onMount }) => {
      let stateSetter: (value: number) => void;
      let instanceNumber = 0;

      const MyComponent: ComponentType = jest.fn(() => {
        const [state, setState] = useState(0);
        stateSetter = setState;

        const b = useBinding(() => instanceNumber++, { id: 'test', deps: [state] });
        return <>{b.get()}</>;
      });

      onMount(async () => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(instanceNumber).toBe(1);

        stateSetter(1);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(2);
        expect(instanceNumber).toBe(2);

        stateSetter(1); // same state value again

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(3);
        expect(instanceNumber).toBe(2);
      });

      return <MyComponent />;
    }));
});
