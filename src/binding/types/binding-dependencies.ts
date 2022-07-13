import type { ReadonlyBinding } from './readonly-binding';

export type BindingsArrayDependencies = Array<ReadonlyBinding | undefined> | [ReadonlyBinding];

export type NamedBindingDependencies = Record<string, ReadonlyBinding | undefined>;

export type BindingDependencies = ReadonlyBinding | BindingsArrayDependencies | NamedBindingDependencies;
