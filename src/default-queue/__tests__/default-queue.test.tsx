import type { RunQueue } from 'client-run-queue';
import React from 'react';

import { runInDom } from '../../__test_dependency__/run-in-dom.js';
import { DefaultQueueProvider, useDefaultQueue } from '../default-queue-context.js';

describe('useDefaultQueue', () => {
  it('default should work', () =>
    runInDom(() => {
      expect(useDefaultQueue().id).toBe('default');
    }));

  it('override should work', () =>
    runInDom(({ onMount }) => {
      let defaultQueue: RunQueue | undefined;
      const MyComponent = () => {
        defaultQueue = useDefaultQueue();

        return <></>;
      };

      onMount(() => {
        expect(defaultQueue?.id).toBe('override:default');
      });

      return (
        <DefaultQueueProvider idPrefix="override">
          <MyComponent />
        </DefaultQueueProvider>
      );
    }));
});
