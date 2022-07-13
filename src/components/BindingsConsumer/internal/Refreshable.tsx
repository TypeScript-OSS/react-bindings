import React, { MutableRefObject, useState } from 'react';
import ReactDOM from 'react-dom';

import type { BindingDependencies } from '../../../binding/types/binding-dependencies';
import type { ExtractBindingValueTypes } from '../../../binding/types/extract-binding-value-types';
import { useIsMountedRef } from '../../../internal-hooks/use-is-mounted-ref';
import type { BindingsConsumerRenderCallback } from '../types/render-callback';

/** A component that returns a refresh method that can be used to manually rerender */
export const Refreshable = <DependenciesT extends BindingDependencies = Record<string, never>>({
  cancelLastPendingRefresh,
  getDependencies,
  getDependencyValues,
  refreshControls,
  render
}: {
  cancelLastPendingRefresh: () => void;
  getDependencies: () => DependenciesT;
  getDependencyValues: () => ExtractBindingValueTypes<DependenciesT>;
  refreshControls: MutableRefObject<{ refresh?: () => void }>;
  render: BindingsConsumerRenderCallback<DependenciesT>;
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

  return <>{render(getDependencyValues(), getDependencies())}</>;
};
