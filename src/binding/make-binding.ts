import { getStatsHandler } from '../config/stats-handler';
import { getTypedKeys } from '../internal-utils/get-typed-keys';
import type { EmptyObject } from '../types/empty';
import { BindingImpl } from './internal/binding-impl';
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      output[key] = extraFields[key] as any;
    }
  }

  getStatsHandler().trackDidMakeBinding?.({ binding: output });

  return output;
};
