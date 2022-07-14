import React, { ComponentType } from 'react';

import { runInDom } from '../../../__test_dependency__';
import { useBinding } from '../../../binding/use-binding';
import { BindingsConsumer } from '..';

describe('BindingsConsumer', () => {
  it('named values should be extracted by name', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => {
        const b = useBinding(() => 0, { id: 'test' });

        return <BindingsConsumer bindings={{ b }}>{({ b }) => <span>{b}</span>}</BindingsConsumer>;
      });

      onMount((rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');
      });

      return <MyComponent />;
    }));

  it('array values should be extracted by position', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => {
        const b1 = useBinding(() => 0, { id: 'test1' });
        const b2 = useBinding(() => 'hello', { id: 'test2' });

        return (
          <BindingsConsumer bindings={[b1, b2]}>
            {([b1, b2]: [number, string]) => (
              <span>
                {b1}-{b2}
              </span>
            )}
          </BindingsConsumer>
        );
      });

      onMount((rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        expect(rootElement.innerHTML).toBe('<div><span>0-hello</span></div>');
      });

      return <MyComponent />;
    }));

  it('single binding values should be extracted directly', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => {
        const b = useBinding(() => 0, { id: 'test' });

        return <BindingsConsumer bindings={b}>{(b) => <span>{b}</span>}</BindingsConsumer>;
      });

      onMount((rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');
      });

      return <MyComponent />;
    }));

  it('undefined / no-bindings should work', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => <BindingsConsumer>{() => <span>working</span>}</BindingsConsumer>);

      onMount((rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        expect(rootElement.innerHTML).toBe('<div><span>working</span></div>');
      });

      return <MyComponent />;
    }));
});
