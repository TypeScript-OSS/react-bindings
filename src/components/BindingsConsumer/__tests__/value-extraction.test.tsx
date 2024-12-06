import { jest } from '@jest/globals';
import type { ComponentType } from 'react';
import React from 'react';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { useBinding } from '../../../binding/use-binding.js';
import { BindingsConsumer } from '../index.js';

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
