import React, { ComponentType } from 'react';

import { runInDom, sleep } from '../../../__test_dependency__';
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
        expect(rootElement.innerHTML).toBe('<span>0</span>');

        await sleep(300); // giving time to render

        b.set(1);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);
        expect(rootElement.innerHTML).toBe('<span>1</span>');

        b.set(1);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);
        expect(rootElement.innerHTML).toBe('<span>1</span>');

        b.set(2);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(3);
        expect(rootElement.innerHTML).toBe('<span>2</span>');
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
        expect(rootElement.innerHTML).toBe('<span>0</span>');

        await sleep(300); // giving time to render

        b.set(1);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);
        expect(rootElement.innerHTML).toBe('<span>1</span>');

        b.set(3);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);
        expect(rootElement.innerHTML).toBe('<span>1</span>');

        b.set(2);

        await sleep(300); // giving time to render

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(3);
        expect(rootElement.innerHTML).toBe('<span>2</span>');
      });

      return <MyComponent />;
    }));
});
