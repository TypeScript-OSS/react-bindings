/* istanbul ignore file */

import { jest } from '@jest/globals';
import { render } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import React from 'react';

type OnMountHandler = (rootElement: HTMLElement) => void | Promise<void>;
type OnUnmountHandler = () => void | Promise<void>;

interface Props {
  onMount: (handler: OnMountHandler) => void;
  onUnmount: (handler: OnUnmountHandler) => void;
}

export const runInDom = async <T = ReactNode | void,>(useFunc: (props: Props) => T) => {
  const onMountHandlers: OnMountHandler[] = [];
  let registerOnMount: ((handler: OnMountHandler) => void) | undefined = (handler: OnMountHandler) => {
    onMountHandlers.push(handler);
  };

  const onUnmountHandlers: OnUnmountHandler[] = [];
  let registerOnUnmount: ((handler: OnUnmountHandler) => void) | undefined = (handler: OnUnmountHandler) => {
    onUnmountHandlers.push(handler);
  };

  const Component = jest.fn((props: Props) => useFunc(props) ?? null) as ComponentType<Props>;

  const root = render(<Component onMount={registerOnMount} onUnmount={registerOnUnmount} />);
  registerOnMount = undefined;
  registerOnUnmount = undefined;

  expect(Component).toHaveBeenCalled();

  for (const onMountHandler of onMountHandlers) {
    await onMountHandler(root.baseElement);
  }
  onMountHandlers.length = 0;

  root.unmount();

  for (const onUnmountHandler of onUnmountHandlers) {
    await onUnmountHandler();
  }
  onUnmountHandlers.length = 0;
};
