/**
 * Gets the keys of the specified value in the type that corresponds with that value.
 *
 * For example: `{a: 'one', b: 'two'}` returns `['a', 'b']` as `Array<'a' | 'b'>` rather than as `string[]`.
 */
export const getTypedKeys = <T>(value: T) => Object.keys(value) as Array<keyof T & string>;
