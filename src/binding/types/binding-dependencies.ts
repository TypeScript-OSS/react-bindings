import type { ReadonlyBinding } from './readonly-binding';

export type BindingArrayDependencies = Array<ReadonlyBinding | undefined>;

export type NamedBindingDependencies = Record<string, ReadonlyBinding | undefined>;

export type BindingDependencies = ReadonlyBinding | BindingArrayDependencies | NamedBindingDependencies | undefined;
