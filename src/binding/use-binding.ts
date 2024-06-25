import type { DependencyList } from 'react';
import { useMemo } from 'react';

import type { EmptyObject } from '../types/empty';
import { makeBinding } from './make-binding.js';
import type { Binding } from './types/binding';
import type { UseBindingArgs } from './types/binding-args';
import type { BindingInitializer } from './types/binding-initializer';

const emptyDeps: DependencyList = Object.freeze([]);

/** Makes a binding memo'd using the specified dependencies */
export const useBinding = <GetType = any, ExtraFieldsT extends object = EmptyObject>(
  initialValue: BindingInitializer<GetType>,
  args: UseBindingArgs<GetType, ExtraFieldsT>
  // eslint-disable-next-line react-hooks/exhaustive-deps
): Binding<GetType> & ExtraFieldsT => useMemo(() => makeBinding<GetType, ExtraFieldsT>(initialValue, args), args.deps ?? emptyDeps);
