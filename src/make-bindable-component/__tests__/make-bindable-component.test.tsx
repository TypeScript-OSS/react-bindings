import { waitFor } from '@testing-library/react';
import React from 'react';

import { runInDom } from '../../__test_dependency__/index.js';
import { useBinding } from '../../binding/use-binding.js';
import { makeBindableComponent } from '../make-bindable-component.js';

describe('makeBindableComponent', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const MyComponent = makeBindableComponent(({ value }: { value: string }) => <span>{value}</span>);

      const two = useBinding(() => 'two', { id: 'two', detectChanges: true });

      onMount(async (rootElement) => {
        expect(rootElement.innerHTML).toBe('<div><span>one</span><span>two</span></div>');

        two.set('three');

        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>one</span><span>three</span></div>'));
      });

      return (
        <>
          <MyComponent value="one" />
          <MyComponent value={two} />
        </>
      );
    }));
});
