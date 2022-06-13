import type { SingleOrArray } from '../types/array-like';

/** Normalizes a SingleOrArray value as an array */
export const normalizeAsArray = <T>(value: SingleOrArray<T>) => (Array.isArray(value) ? value : [value]);

/** Normalizes a SingleOrArray value as an array or undefined */
export const normalizeAsOptionalArray = <T>(value?: SingleOrArray<T>) =>
  value === undefined ? undefined : Array.isArray(value) ? value : [value];

/**
 * Returns an array by efficiently concatenating two potential arrays as needed.  If either array is unset / empty, the other array is
 * returned without copying.  If both arrays are unset / empty, a new empty array is returned.
 */
export const concatArrays = <T>(a?: Array<T>, b?: Array<T>): T[] => {
  const aLength = a?.length ?? 0;
  const bLength = b?.length ?? 0;
  if (aLength === 0 && bLength === 0) {
    return [];
  } else if (bLength === 0) {
    return a!;
  } else if (aLength === 0) {
    return b!;
  } else {
    return [...a!, ...b!];
  }
};
