import React, { MutableRefObject, useState } from 'react';
import ReactDOM from 'react-dom';

import type { ExtractNamedBindingsValues } from '../../../binding/types/extract-named-binding-values';
import type { ReadonlyBinding } from '../../../binding/types/readonly-binding';
import { useIsMountedRef } from '../../../internal-hooks/use-is-mounted-ref';
import type { BindingsConsumerRenderCallback } from '../types/render-callback';

/** A component that returns a refresh method that can be used to manually rerender */
export const Refreshable = <NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>>({
  cancelLastPendingRefresh,
  getNamedBindings,
  getNamedBindingValues,
  refreshControls,
  render
}: {
  cancelLastPendingRefresh: () => void;
  getNamedBindings: () => NamedBindingsT;
  getNamedBindingValues: () => ExtractNamedBindingsValues<NamedBindingsT>;
  refreshControls: MutableRefObject<{ refresh?: () => void }>;
  render: BindingsConsumerRenderCallback<NamedBindingsT>;
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

  return <>{render(getNamedBindingValues(), getNamedBindings())}</>;
};
