import { waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import React from 'react';

import { runInDom } from '../../../__test_dependency__';
import type { Binding } from '../../../binding/types/binding';
import { useBinding } from '../../../binding/use-binding';
import { BindingsConsumer } from '..';

describe('BindingsConsumer', () => {
  it('nested initial render should work', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => {
        const b1 = useBinding(() => 0, { id: 'test1' });
        const b2 = useBinding(() => 0, { id: 'test2' });

        return (
          <BindingsConsumer bindings={{ b1 }}>
            {({ b1 }) => (
              <BindingsConsumer bindings={{ b2 }}>
                {({ b2 }) => (
                  <span>
                    {b1}-{b2}
                  </span>
                )}
              </BindingsConsumer>
            )}
          </BindingsConsumer>
        );
      });

      onMount((rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        expect(rootElement.innerHTML).toBe('<div><span>0-0</span></div>');
      });

      return <MyComponent />;
    }));

  it('updating inner binding should rerender just inner', () =>
    runInDom(({ onMount }) => {
      let b1: Binding<number>;
      let b2: Binding<number>;

      const consumer2Renderer = jest.fn(({ b2 }: { b2: number }) => <span>{b2}</span>);
      const consumer1Renderer = jest.fn(({ b1: _b1 }: { b1: number }) => {
        return <BindingsConsumer bindings={{ b2 }}>{consumer2Renderer}</BindingsConsumer>;
      });

      const MyComponent: ComponentType = jest.fn(() => {
        b1 = useBinding(() => 0, { id: 'test1' });
        b2 = useBinding(() => 0, { id: 'test2' });

        return <BindingsConsumer bindings={{ b1 }}>{consumer1Renderer}</BindingsConsumer>;
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumer1Renderer).toHaveBeenCalledTimes(1);
        expect(consumer2Renderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');

        b2.set(1);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>1</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumer1Renderer).toHaveBeenCalledTimes(1);
        expect(consumer2Renderer).toHaveBeenCalledTimes(2);
      });

      return <MyComponent />;
    }));

  it('updating outer binding should rerender both outer and inner', () =>
    runInDom(({ onMount }) => {
      let b1: Binding<number>;
      let b2: Binding<number>;

      const consumer2Renderer = jest.fn(({ b2 }: { b2: number }) => <span>{b2}</span>);
      const consumer1Renderer = jest.fn(({ b1: _b1 }: { b1: number }) => {
        return <BindingsConsumer bindings={{ b2 }}>{consumer2Renderer}</BindingsConsumer>;
      });

      const MyComponent: ComponentType = jest.fn(() => {
        b1 = useBinding(() => 0, { id: 'test1' });
        b2 = useBinding(() => 0, { id: 'test2' });

        return <BindingsConsumer bindings={{ b1 }}>{consumer1Renderer}</BindingsConsumer>;
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumer1Renderer).toHaveBeenCalledTimes(1);
        expect(consumer2Renderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');

        b1.set(1);
        await waitFor(() => expect(consumer1Renderer).toHaveBeenCalledTimes(2));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumer2Renderer).toHaveBeenCalledTimes(2);
        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');
      });

      return <MyComponent />;
    }));

  it('quickly updating both inner and outer bindings should rerender both outer and inner, but just once', () =>
    runInDom(({ onMount }) => {
      let b1: Binding<number>;
      let b2: Binding<number>;

      const consumer2Renderer = jest.fn(({ b2 }: { b2: number }) => <span>{b2}</span>);
      const consumer1Renderer = jest.fn(({ b1: _b1 }: { b1: number }) => {
        return <BindingsConsumer bindings={{ b2 }}>{consumer2Renderer}</BindingsConsumer>;
      });

      const MyComponent: ComponentType = jest.fn(() => {
        b1 = useBinding(() => 0, { id: 'test1' });
        b2 = useBinding(() => 0, { id: 'test2' });

        return <BindingsConsumer bindings={{ b1 }}>{consumer1Renderer}</BindingsConsumer>;
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumer1Renderer).toHaveBeenCalledTimes(1);
        expect(consumer2Renderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');

        b1.set(1);
        b2.set(2);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>2</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumer1Renderer).toHaveBeenCalledTimes(2);
        expect(consumer2Renderer).toHaveBeenCalledTimes(2);
      });

      return <MyComponent />;
    }));
});
