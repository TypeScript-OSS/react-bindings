import { waitFor } from '@testing-library/react';
import React, { ComponentType } from 'react';

import { runInDom } from '../../../__test_dependency__';
import type { Binding } from '../../../binding/types/binding';
import { useBinding } from '../../../binding/use-binding';
import { BindingsConsumer } from '..';

describe('BindingsConsumer', () => {
  it('with detectInputChanges=true should only rerender if the binding value really changes', () =>
    runInDom(({ onMount }) => {
      let b: Binding<number>;

      const consumerRenderer = jest.fn(({ b }: { b: number }) => <span>{b}</span>);

      const MyComponent: ComponentType = jest.fn(() => {
        b = useBinding(() => 0, { id: 'test' });

        return (
          <BindingsConsumer bindings={{ b }} detectInputChanges={true}>
            {consumerRenderer}
          </BindingsConsumer>
        );
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');

        b.set(1);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>1</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);

        b.set(1);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>1</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);

        b.set(2);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>2</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(3);
      });

      return <MyComponent />;
    }));

  it("with detectInputChanges=true and makeComparableInputValue=evenness checker should only rerender if the binding value's evenness changes", () =>
    runInDom(({ onMount }) => {
      let b: Binding<number>;

      const consumerRenderer = jest.fn(({ b }: { b: number }) => <span>{b}</span>);

      const MyComponent: ComponentType = jest.fn(() => {
        b = useBinding(() => 0, { id: 'test' });

        return (
          <BindingsConsumer bindings={{ b }} detectInputChanges={true} makeComparableInputValue={() => b.get() % 2 === 0}>
            {consumerRenderer}
          </BindingsConsumer>
        );
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');

        b.set(1);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>1</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);

        b.set(3);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>1</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);

        b.set(2);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>2</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(3);
      });

      return <MyComponent />;
    }));
});
