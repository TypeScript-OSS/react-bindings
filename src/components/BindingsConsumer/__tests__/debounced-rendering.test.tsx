import React, { ComponentType } from 'react';

import { runInDom, sleep } from '../../../__test_dependency__';
import type { Binding } from '../../../binding/types/binding';
import { useBinding } from '../../../binding/use-binding';
import { BindingsConsumer } from '..';

describe('BindingsConsumer', () => {
  it('updating multiple times should rerender but debounced', () =>
    runInDom(({ onMount }) => {
      let b: Binding<number>;

      const consumerRenderer = jest.fn(({ b }: { b: number }) => <span>{b}</span>);

      const MyComponent: ComponentType = jest.fn(() => {
        b = useBinding(() => 0, { id: 'test' });

        return (
          <BindingsConsumer bindings={{ b }} limitMSec={100}>
            {consumerRenderer}
          </BindingsConsumer>
        );
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<span>0</span>');

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<span>0</span>');

        for (let i = 1; i < 25; i += 1) {
          b.set(i);
          await sleep(10);

          expect(MyComponent).toHaveBeenCalledTimes(1);
          expect(consumerRenderer).toHaveBeenCalledTimes(1);
          expect(rootElement.innerHTML).toBe('<span>0</span>');
        }

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);
        expect(rootElement.innerHTML).toBe('<span>24</span>');
      });

      return <MyComponent />;
    }));
});
