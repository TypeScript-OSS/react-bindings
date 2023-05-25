import React from 'react';

import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { isBinding } from '../binding-utils/type-utils';
import { BindingsConsumer } from '../components/BindingsConsumer';
import { resolveTypeOrBindingType } from '../resolveable/utils';
import type { MakeBindableComponentOptions } from './types/make-bindable-component-options';
import type { UpgradeToBindingsProps } from './types/upgrade-to-binding-props';

/**
 * Take a functional component and creates a new functional component that takes binding props.  The non-bound types are also still
 * accepted.
 *
 * The component will be re-rendered any time binding props change.
 *
 * The bindings are resolved before calling the original component.
 *
 * Bindings can also be passed through by specifying key names in the `passThru` option.
 */
export function makeBindableComponent<PropsT extends Record<string, any>, PassThruKeyT extends keyof PropsT & string = never>(
  functionalComponent: (props: PropsT) => JSX.Element
): (props: UpgradeToBindingsProps<PropsT, PassThruKeyT>) => JSX.Element;
export function makeBindableComponent<PropsT extends Record<string, any>, PassThruKeyT extends keyof PropsT & string = never>(
  options: MakeBindableComponentOptions<PropsT, PassThruKeyT>,
  functionalComponent: (props: PropsT) => JSX.Element
): (props: UpgradeToBindingsProps<PropsT, PassThruKeyT>) => JSX.Element;
export function makeBindableComponent<PropsT extends Record<string, any>, PassThruKeyT extends keyof PropsT & string = never>(
  optionsOrFunctionalComponent: MakeBindableComponentOptions<PropsT, PassThruKeyT> | ((props: PropsT) => JSX.Element),
  theFunctionalComponent?: (props: PropsT) => JSX.Element
): (props: UpgradeToBindingsProps<PropsT, PassThruKeyT>) => JSX.Element {
  const { passThru, bindingsConsumerProps } =
    typeof optionsOrFunctionalComponent === 'function'
      ? ({} satisfies MakeBindableComponentOptions<PropsT, PassThruKeyT>)
      : optionsOrFunctionalComponent;
  const functionalComponent = (typeof optionsOrFunctionalComponent === 'function' ? optionsOrFunctionalComponent : theFunctionalComponent)!;

  const passThruSet = new Set(passThru ?? []);

  return (props: UpgradeToBindingsProps<PropsT, PassThruKeyT>) => {
    const bindings = getAllBindings(props, passThruSet);
    return bindings.length > 0 ? (
      <BindingsConsumer {...bindingsConsumerProps} bindings={bindings}>
        {() => functionalComponent(resolveBindings(props, passThruSet) as PropsT)}
      </BindingsConsumer>
    ) : (
      functionalComponent(props as PropsT)
    );
  };
}

// Helpers

const getAllBindings = (obj: Record<string, any>, passThru: Set<string>) => {
  const output: ReadonlyBinding[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (!passThru.has(key) && isBinding(value)) {
      output.push(value);
    }
  }

  return output;
};

const resolveBindings = <PropsT extends Record<string, any>>(props: PropsT, passThru: Set<string>): PropsT =>
  Object.entries(props).reduce((out, [key, value]) => {
    if (passThru.has(key)) {
      return out;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    out[key as keyof PropsT] = resolveTypeOrBindingType(value);

    return out;
  }, {} as Partial<PropsT>) as PropsT;
