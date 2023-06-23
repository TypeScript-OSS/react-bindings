import type { DependencyList } from 'react';

export interface MakeTransientDerivedBindingArgs {
  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id?: string;
}

export interface UseTransientDerivedBindingArgs extends MakeTransientDerivedBindingArgs {
  /** Hook dependencies */
  deps?: DependencyList;
}
