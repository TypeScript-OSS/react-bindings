/* istanbul ignore file */

import React, { ComponentType, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { sleep } from './sleep';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type OnMountHandler = (rootElement: HTMLElement) => void | Promise<void>;
type OnUnmountHandler = () => void | Promise<void>;

interface Props {
  onMount: (handler: OnMountHandler) => void;
  onUnmount: (handler: OnUnmountHandler) => void;
}

export const runInDom = async <T = ReactNode | void,>(useFunc: (props: Props) => T) =>
  act(async () => {
    const div = document.createElement('div');

    const onMountHandlers: OnMountHandler[] = [];
    let registerOnMount: ((handler: OnMountHandler) => void) | undefined = (handler: OnMountHandler) => {
      onMountHandlers.push(handler);
    };

    const onUnmountHandlers: OnUnmountHandler[] = [];
    let registerOnUnmount: ((handler: OnUnmountHandler) => void) | undefined = (handler: OnUnmountHandler) => {
      onUnmountHandlers.push(handler);
    };

    const Component = ((props: Props) => useFunc(props) ?? null) as ComponentType<Props>;

    const root = createRoot(div);
    root.render(<Component onMount={registerOnMount} onUnmount={registerOnUnmount} />);
    registerOnMount = undefined;
    registerOnUnmount = undefined;

    // Need sleep otherwise mount will never get triggered
    await sleep(0);

    for (const onMountHandler of onMountHandlers) {
      await onMountHandler(div);
    }
    onMountHandlers.length = 0;

    root.unmount();

    for (const onUnmountHandler of onUnmountHandlers) {
      await onUnmountHandler();
    }
    onUnmountHandlers.length = 0;
  });
