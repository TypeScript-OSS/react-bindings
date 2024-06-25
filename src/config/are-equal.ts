/* istanbul ignore file */

import { isEqual } from 'lodash-es';

let globalAreEqual = (a: any, b: any) => isEqual(a, b);

/** Uses the function registered with `setAreEqual` to determine if two values are equal */
export const areEqual = (a: any, b: any) => globalAreEqual(a, b);

/** Returns the current `areEqual` function, which can be used when overriding using `setAreEqual` to compose comparison checks */
export const getAreEqual = () => globalAreEqual;

/** Call to override the default `areEqual` function, which uses `_.isEqual` from Lodash */
export const setAreEqual = (newAreEqual: (a: any, b: any) => boolean) => {
  globalAreEqual = newAreEqual;
};
