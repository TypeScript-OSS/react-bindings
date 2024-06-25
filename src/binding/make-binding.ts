import { getStatsHandler } from '../config/stats-handler.js';
import { getTypedKeys } from '../internal-utils/get-typed-keys.js';
import type { EmptyObject } from '../types/empty';
import { BindingImpl } from './internal/binding-impl.js';
import type { Binding } from './types/binding';
import type { MakeBindingArgs } from './types/binding-args';
import type { BindingInitializer } from './types/binding-initializer';

/** Makes a binding without using any React contexts. */
export const makeBinding = <GetType = any, ExtraFieldsT extends object = EmptyObject>(
  initialValue: BindingInitializer<GetType>,
  args: MakeBindingArgs<GetType, ExtraFieldsT>
): Binding<GetType> & ExtraFieldsT => {
  const output = new BindingImpl<GetType>(initialValue, args) as unknown as Binding<GetType> & ExtraFieldsT;
  const extraFields = args.addFields?.(output);
  if (extraFields !== undefined) {
    for (const key of getTypedKeys(extraFields)) {
      output[key] = extraFields[key] as (typeof output)[typeof key];
    }
  }

  getStatsHandler().trackDidMakeBinding?.({ binding: output });

  return output;
};
