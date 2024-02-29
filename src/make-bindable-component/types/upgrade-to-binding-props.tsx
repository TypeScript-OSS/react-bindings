/* eslint-disable prettier/prettier */
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';

export type UpgradeToBindingsProps<PropsT extends Record<string, any>, PassThruKeyT extends keyof PropsT & string = never> = {
  [KeyT in keyof PropsT]: KeyT extends PassThruKeyT
    ? PropsT[KeyT]
    : ReadonlyBinding extends PropsT[KeyT]
    ? never
    : undefined extends PropsT[KeyT]
    ? PropsT[KeyT] | ReadonlyBinding<PropsT[KeyT] | undefined>
    : PropsT[KeyT] | ReadonlyBinding<PropsT[KeyT]>;
};
