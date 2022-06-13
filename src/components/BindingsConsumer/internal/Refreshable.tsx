import React, { MutableRefObject, ReactNode, useState } from 'react';
import ReactDOM from 'react-dom';

import type { ReadonlyBinding } from '../../../binding/types/readonly-binding';
import { useIsMountedRef } from '../../../internal-hooks/use-is-mounted-ref';
import { ExtractNamedBindingsValues } from './types';

/** A component that returns a refresh method that can be used to manually rerender */
export const Refreshable = <NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>>({
  cancelLastPendingRefresh,
  getNamedBindingValues,
  refreshControls,
  render
}: {
  cancelLastPendingRefresh: () => void;
  getNamedBindingValues: () => ExtractNamedBindingsValues<NamedBindingsT>;
  refreshControls: MutableRefObject<{ refresh?: () => void }>;
  render: (bindingValues: ExtractNamedBindingsValues<NamedBindingsT>) => ReactNode;
}) => {
  const isMounted = useIsMountedRef();

  const [refreshId, setRefreshId] = useState(0);

  // Immediately refreshes (using ReactDOM.unstable_batchedUpdates) if mounted
  refreshControls.current.refresh = () => {
    if (isMounted.current) {
      ReactDOM.unstable_batchedUpdates(() => setRefreshId(refreshId + 1));
    }
  };

  cancelLastPendingRefresh();

  return <>{render(getNamedBindingValues())}</>;
};
