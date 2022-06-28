import { ReactNode } from 'react';

import type { ExtractNamedBindingsValues } from '../../../binding/types/extract-named-binding-values';
import type { ReadonlyBinding } from '../../../binding/types/readonly-binding';

/**
 * Called to render the contents of a BindingsConsumer on the initial render and when the associated bindings changes.
 *
 * @param bindingValues - The extracted values of the associated named bindings.  If named bindings aren't used, this will be an empty
 * object.
 * @param bindings - The original named bindings if named bindings are used or an empty object otherwise.
 */
export type BindingsConsumerRenderCallback<NamedBindingsT extends Record<string, ReadonlyBinding | undefined>> = (
  bindingValues: ExtractNamedBindingsValues<NamedBindingsT>,
  bindings: NamedBindingsT
) => ReactNode;
