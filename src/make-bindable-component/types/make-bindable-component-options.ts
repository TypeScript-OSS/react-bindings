import type { BindingsConsumerProps } from '../../components/BindingsConsumer';

export interface MakeBindableComponentOptions<PropsT extends Record<string, any>, PassThruKeyT extends keyof PropsT & string = never> {
  passThru?: PassThruKeyT[];
  bindingsConsumerProps?: Omit<BindingsConsumerProps<any>, 'bindings'>;
}
