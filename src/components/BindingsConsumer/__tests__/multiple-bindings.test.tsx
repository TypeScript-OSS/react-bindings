import React, { ComponentType } from 'react';

import { runInDom, sleep } from '../../../__test_dependency__';
import { useBinding } from '../../../binding/use-binding';
import { BindingsConsumer } from '..';

describe('BindingsConsumer', () => {
  it('multiple bindings initial render should work', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => {
        const b1 = useBinding(() => 0, { id: 'test1' });
        const b2 = useBinding(() => 0, { id: 'test2' });

        return (
          <BindingsConsumer bindings={{ b1, b2 }}>
            {({ b1, b2 }) => (
              <span>
                {b1}-{b2}
              </span>
            )}
          </BindingsConsumer>
        );
      });

      onMount((rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        expect(rootElement.innerHTML).toBe('<span>0-0</span>');
      });

      return <MyComponent />;
    }));

  it('updating one should rerender', () =>
    runInDom(({ onMount }) => {
      const consumerRenderer = jest.fn(({ b1, b2 }: { b1: number; b2: number }) => (
        <span>
          {b1}-{b2}
        </span>
      ));

      const b1 = useBinding(() => 0, { id: 'test1' });
      const b2 = useBinding(() => 0, { id: 'test2' });

      const MyComponent: ComponentType = jest.fn(() => <BindingsConsumer bindings={{ b1, b2 }}>{consumerRenderer}</BindingsConsumer>);

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<span>0-0</span>');

        await sleep(300); // giving time to render

        b2.set(1);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);
        expect(rootElement.innerHTML).toBe('<span>0-1</span>');
      });

      return <MyComponent />;
    }));

  it('quickly updating both should rerender, but just once', () =>
    runInDom(({ onMount }) => {
      const consumerRenderer = jest.fn(({ b1, b2 }: { b1: number; b2: number }) => (
        <span>
          {b1}-{b2}
        </span>
      ));

      const b1 = useBinding(() => 0, { id: 'test1' });
      const b2 = useBinding(() => 0, { id: 'test2' });

      const MyComponent: ComponentType = jest.fn(() => <BindingsConsumer bindings={{ b1, b2 }}>{consumerRenderer}</BindingsConsumer>);

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<span>0-0</span>');

        await sleep(300); // giving time to render

        b1.set(1);
        b2.set(2);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);
        expect(rootElement.innerHTML).toBe('<span>1-2</span>');
      });

      return <MyComponent />;
    }));
});
