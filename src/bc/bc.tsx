import React from 'react';

import type { BindingDependencies } from '../binding/types/binding-dependencies';
import type { BindingsConsumerRenderCallback } from '../components/BindingsConsumer';
import { BindingsConsumer } from '../components/BindingsConsumer';

/** Returns a BindingsConsumer JSX Element.  This is useful as a shorthand especially when passing BindingsConsumers as props of other
 * components */
export const BC = <DependenciesT extends BindingDependencies>(
  bindings: DependenciesT,
  children: BindingsConsumerRenderCallback<DependenciesT>
) => <BindingsConsumer bindings={bindings}>{children}</BindingsConsumer>;
