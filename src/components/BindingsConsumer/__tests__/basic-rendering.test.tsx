import React, { ComponentType } from 'react';

import { runInDom, sleep } from '../../../__test_dependency__';
import type { Binding } from '../../../binding/types/binding';
import { useBinding } from '../../../binding/use-binding';
import { BindingsConsumer } from '..';

describe('BindingsConsumer', () => {
  it('initial render should work', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => {
        const b = useBinding(() => 0, { id: 'test' });

        return <BindingsConsumer bindings={{ b }}>{({ b }) => <span>{b}</span>}</BindingsConsumer>;
      });

      onMount((rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        expect(rootElement.innerHTML).toBe('<span>0</span>');
      });

      return <MyComponent />;
    }));

  it('updating should rerender', () =>
    runInDom(({ onMount }) => {
      let b: Binding<number>;

      const consumerRenderer = jest.fn(({ b }: { b: number }) => <span>{b}</span>);

      const MyComponent: ComponentType = jest.fn(() => {
        b = useBinding(() => 0, { id: 'test' });

        return <BindingsConsumer bindings={{ b }}>{consumerRenderer}</BindingsConsumer>;
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<span>0</span>');

        await sleep(300); // giving time to render

        b.set(1);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);
        expect(rootElement.innerHTML).toBe('<span>1</span>');
      });

      return <MyComponent />;
    }));
});
