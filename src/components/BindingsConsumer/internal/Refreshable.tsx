import type { MutableRefObject } from 'react';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import type { BindingDependencies } from '../../../binding/types/binding-dependencies';
import type { InferBindingValueTypes } from '../../../binding/types/infer-binding-value-types';
import { useIsMountedRef } from '../../../internal-hooks/use-is-mounted-ref.js';
import type { BindingsConsumerRenderCallback } from '../types/render-callback';

/** A component that returns a refresh method that can be used to manually rerender */
export const Refreshable = <DependenciesT extends BindingDependencies>({
  cancelLastPendingRefresh,
  getDependencies,
  getDependencyValues,
  refreshControls,
  render
}: {
  cancelLastPendingRefresh: () => void;
  getDependencies: () => DependenciesT;
  getDependencyValues: () => InferBindingValueTypes<DependenciesT>;
  refreshControls: MutableRefObject<{ refresh?: () => void }>;
  render: BindingsConsumerRenderCallback<DependenciesT>;
}) => {
  const isMounted = useIsMountedRef();

  const [refreshId, setRefreshId] = useState(0);

  // Immediately refreshes (using ReactDOM.unstable_batchedUpdates) if mounted
  refreshControls.current.refresh = () => {
    if (isMounted.current ?? false) {
      ReactDOM.unstable_batchedUpdates(() => setRefreshId(refreshId + 1));
    }
  };

  cancelLastPendingRefresh();

  return <>{render(getDependencyValues(), getDependencies())}</>;
};
